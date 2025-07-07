# AWS SAM - 2 - Environment, EventBridge, SQS, Step Functions, API Gateway

## Environment

### 🧠 ¿Qué son?

Son valores clave/valor que puedes definir en tu Lambda y usar dentro de tu código como si fueran `process.env.MI_VARIABLE`.

✅ Sirven para:

- Guardar rutas, claves, configuraciones, etc.
- Evitar hardcodear valores en el código fuente.
- Usar una Lambda genérica con distintos entornos (dev, prod, etc).

### 🛠️ ¿Cómo se definen?

#### 👇 Dentro del recurso Lambda en tu `template.yaml`:

```yaml
Resources:
  MyQueue:
    Type: AWS::SQS::Queue

  MyLambda:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: src/
      Handler: app.lambdaHandler
      Runtime: nodejs18.x
      Environment:
        Variables:
          MY_QUEUE_URL: !Ref MyQueue
          STAGE: dev
          OTHER_CONFIG: value123
```

### 🧪 ¿Cómo se usan en el código?

#### En Node.js:

```ts
const queueUrl = process.env.MY_QUEUE_URL;
const stage = process.env.STAGE;
console.log('URL de la cola:', queueUrl);
```

### ✅ Notas importantes

| 🧾 Elemento       | Detalle                                                |
| ----------------- | ------------------------------------------------------ |
| `!Ref MyQueue`    | Obtiene la **URL** de la cola SQS automáticamente      |
| `process.env.XYZ` | Así accedes a la variable desde el código              |
| Máx. 4 KB         | Límite total para todas las variables de entorno       |
| Secrets           | Para valores sensibles, mejor usar AWS Secrets Manager |

### 🔐 ¿Cómo agregar secretos?

Aunque puedes usar variables de entorno para cosas como API keys, lo ideal es usar **AWS Secrets Manager** y leerlos desde ahí para mayor seguridad.

### 📁 Alternativa: con `Parameters` en SAM

Puedes usar parámetros para enviar valores externos (ideal para entornos `dev`, `staging`, `prod`):

```yaml
Parameters:
  AppStage:
    Type: String
    Default: dev

Resources:
  MyLambda:
    Type: AWS::Serverless::Function
    Properties:
      Environment:
        Variables:
          STAGE: !Ref AppStage
```

Luego despliegas con:

```bash
sam deploy --parameter-overrides AppStage=prod
```

---

## 🧠 - EventBridge

### 📖 Definición

**EventBridge** es un _bus de eventos_ que te permite conectar eventos entre servicios. Puedes usarlo para disparar una Lambda por un cron job (como un `setInterval`) o cuando ocurre un evento en otro servicio (como un `S3:ObjectCreated`, `DynamoDB`, etc.).

---

### ✅ Ejemplo 1: Disparar tu Lambda cada día a las 5 AM

**SAM Template:**

```yaml
Resources:
  DailyUserCheckFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: daily-check/
      Handler: app.lambdaHandler
      Runtime: nodejs18.x
      Events:
        DailySchedule:
          Type: Schedule
          Properties:
            Schedule: cron(0 5 * * ? *) # todos los días a las 5:00 AM
```

**Lambda ejemplo (`app.ts`):**

```ts
export const lambdaHandler = async (): Promise<void> => {
  console.log('Se ejecuta todos los días a las 5 AM');
  // Aquí puedes hacer limpieza, envío de correos, reportes, etc.
};
```

---

## 📬 - SQS

### 📖 Definición

**Simple Queue Service (SQS)** es un sistema de colas donde se **envían mensajes** y otra Lambda los **consume**. Ideal para sistemas desacoplados. Piensa en una cola de espera.

✅ ¿Para qué sirve?

- Enviar mensajes de una parte de tu sistema a otra, de forma asíncrona.
- Permitir que componentes funcionen independientemente, incluso si uno está lento o fuera de servicio
- Guardar mensajes hasta que el consumidor (por ejemplo, una Lambda) los procese.

🔄 ¿Cómo funciona?

- Un servicio (como una API, Lambda, o cualquier otro) envía un mensaje a la cola SQS.
- El mensaje se guarda temporalmente en la cola.
- Una Lambda (u otro servicio consumidor) lee los mensajes desde la cola y los procesa.

📦 Tipos de colas
| Tipo | Características |
| ------------ | -------------------------------------------------------------------------------- |
| **Standard** | Alta disponibilidad, mensajes en orden aleatorio, puede duplicarse un mensaje. |
| **FIFO** | Orden exacto (primero en entrar, primero en salir), sin duplicación de mensajes. |

🧠 Resumen visual:

```lua
API / Lambda / Servicio ---> SQS (cola) ---> Lambda procesa mensajes (batch)
```

```lua
[API POST /user]
    |
    |---> Envia mensaje a SQS ({"userId": 1, "action": "process"})
              |
              ↓
       [📬 SQS Cola]
              |
              ↓
   [Lambda UserProcessorFunction]
        -> Procesa el usuario
```

---

### ✅ Ejemplo: Enviar trabajo a una cola para procesar usuarios luego

**SAM Template:**

```yaml
Resources:
  MyQueue:
    Type: AWS::SQS::Queue

  UserProcessorFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: user-processor/
      Handler: app.lambdaHandler
      Runtime: nodejs18.x
      Events:
        SqsEvent:
          Type: SQS
          Properties:
            Queue: !GetAtt MyQueue.Arn
```

**Lambda que consume (`user-processor/app.ts`):**

```ts
export const lambdaHandler = async (event: any) => {
  for (const record of event.Records) {
    const message = JSON.parse(record.body);
    console.log('Procesando usuario:', message);
  }
};
```

```ts
/**
 * Manejador principal de la función Lambda para AWS API Gateway.
 *
 * Esta función se ejecuta cuando API Gateway recibe una solicitud HTTP y la reenvía a Lambda.
 *
 * @param {APIGatewayProxyEvent} event - Objeto que representa la solicitud HTTP recibida por API Gateway. Contiene información como headers, parámetros, cuerpo, etc.
 * @returns {Promise<APIGatewayProxyResult>} - Objeto de respuesta que será devuelto a API Gateway, el cual lo enviará al cliente que hizo la solicitud.
 */
export const lambdaHandler = async (
  event: APIGatewayProxyEvent | ScheduledEvent | SQSEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    // 🔎 Detectar si el evento es de tipo API Gateway
    if ('httpMethod' in event && 'path' in event) {
      return await router(event as APIGatewayProxyEvent);
    }

    // 🔎 Detectar si el evento es de tipo EventBridge (Schedule)
    if ('source' in event && event.source === 'aws.events') {
      return await awsEventBridgeHandler(event as ScheduledEvent);
    }

    // 🔎 Detectar si el evento es de tipo SQS
    if ('Records' in event && event.Records[0].eventSource === 'aws:sqs') {
      // 📦 Procesar mensajes de SQS
      for (const record of event.Records) {
        // 📦 Procesar cada mensaje
        const body = JSON.parse(record.body);
        console.log('📥 Mensaje desde SQS:', body);

        // Logica para ese mensaje
        // ...............
      }

      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Mensajes de SQS procesados' }),
      };
    }

    // ⚠️ Evento desconocido
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Tipo de evento no soportado',
      }),
    };

    // ! Error - Si ocurre un error, lo muestra en consola y retorna un mensaje de error con código 500
  } catch (error: unknown) {
    console.error('Error en el router:', error);

    // ? Si el error es una instancia de Error
    if (error instanceof Error) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: `Error interno en el servidor, ${
            error?.message ?? 'Error no identificado'
          }`,
        }),
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error interno en el servidor',
      }),
    };
  }
};
```

### 🧪 ¿Cómo enviar mensajes a la cola?

Puedes enviar mensajes desde otra Lambda, desde Postman usando la API de AWS, o con el SDK:

**Enviar mensaje desde otra Lambda (por ejemplo desde tu `/user` POST):**

```ts
import { SQS } from 'aws-sdk';

const sqs = new SQS();

await sqs
  .sendMessage({
    QueueUrl: process.env.MY_QUEUE_URL!,
    MessageBody: JSON.stringify({ userId: 1, action: 'process' }),
  })
  .promise();
```

**Con AWS SDK en Node.js:**

```ts
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

const client = new SQSClient({ region: 'us-east-1' });

const command = new SendMessageCommand({
  QueueUrl: 'https://sqs.us-east-1.amazonaws.com/tu-cuenta/my-sqs-queue',
  MessageBody: JSON.stringify({ name: 'Edain', accion: 'Procesar' }),
});

await client.send(command);
```

### Como probarlo

#### ✅ Probar **localmente** con SAM CLI

##### 🧰 Requisitos

- Tener `AWS SAM CLI` instalado
- Tener Docker activo (SAM usa contenedores)

---

##### 🔁 Paso 1: Generar un evento SQS

SAM CLI tiene un comando que te genera un evento de prueba de tipo SQS:

```bash
sam local generate-event sqs receive-message > event-sqs.json
```

Esto crea un archivo `event-sqs.json` con un cuerpo de prueba que se parece a un mensaje real de SQS.

Puedes editar el contenido:

```json
{
  "Records": [
    {
      "messageId": "1",
      "body": "{\"userId\": 1, \"action\": \"process\"}",
      "eventSource": "aws:sqs"
    }
  ]
}
```

---

##### 🔧 Paso 2: Ejecuta tu Lambda localmente

```bash
sam local invoke UserProcessorFunction --event event-sqs.json
```

Esto simula que SQS llama a tu función Lambda con un lote de mensajes. Verás en la consola los `console.log(...)` de tu función, como:

```bash
📥 Mensaje desde SQS: { userId: 1, action: 'process' }
```

---

#### ✅ Probar en **AWS (real)**

Si ya desplegaste la función y la cola con `sam deploy`, puedes probar así:

---

##### 📦 Paso 1: Encuentra la URL de la cola

Puedes obtenerla desde la consola de AWS o usando CLI:

```bash
aws sqs get-queue-url --queue-name my-sqs-queue
```

---

##### 📤 Paso 2: Envía un mensaje a la cola

Usa AWS CLI o SDK:

```bash
aws sqs send-message \
  --queue-url https://sqs.us-east-1.amazonaws.com/123456789012/my-sqs-queue \
  --message-body '{"userId": 99, "action": "process"}'
```

---

##### 📄 Paso 3: Verifica que Lambda procesó el mensaje

Ve a:

- **AWS Console > Lambda > \[Tu función] > Monitorización**
- O usa CloudWatch Logs para ver el log con:

```bash
aws logs describe-log-groups
aws logs describe-log-streams --log-group-name /aws/lambda/UserProcessorFunction
aws logs get-log-events --log-group-name /aws/lambda/UserProcessorFunction --log-stream-name <nombre-stream>
```

---

#### 🧪 Prueba desde Postman o tu Frontend

Si tu Lambda de API Gateway (por ejemplo `POST /user`) **envía un mensaje a SQS**, entonces puedes probar todo el flujo:

```bash
POST https://your-api-id.execute-api.us-east-1.amazonaws.com/dev/user

{
  "userId": 42,
  "name": "Edain"
}
```

➡️ Esto debe enviar el mensaje a la cola
➡️ Lo consume la Lambda ligada a SQS
➡️ Procesas el mensaje en backend

---

## 🧩 - Step Functions

### 📖 ¿Qué son las AWS Step Functions?

AWS Step Functions es un servicio de orquestación serverless que permite coordinar múltiples servicios de AWS (principalmente Lambdas) en flujos de trabajo (state machines). Los pasos pueden ser secuenciales, paralelos, condicionales, o incluso con retry automático ante errores.

> 🧠 Casos típicos: Workflows de backend como:

- Procesar una orden → Validar pago → Actualizar BD → Enviar correo
- Validar un token → Consultar API externa → Almacenar logs

Diagrama conceptual

```lua
Client → API Gateway → Step Function → Lambda1 → Lambda2 → Respuesta final
```

### ✅ Ejemplo: Orquestar dos Lambdas en secuencia

**SAM Template:**

```yaml
Resources:
  # Máquina de estado
  MyStateMachine:
    Type: AWS::Serverless::StateMachine
    Properties:
      DefinitionUri: statemachine/definition.asl.json
      Role: !GetAtt MyStateMachineRole.Arn
      DefinitionSubstitutions:
        FirstLambdaArn: !GetAtt FirstFunction.Arn
        SecondLambdaArn: !GetAtt SecondFunction.Arn

  # Primera Lambda
  FirstFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: step/first/
      Handler: app.lambdaHandler
      Runtime: nodejs18.x

  # Segunda Lambda
  SecondFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: step/second/
      Handler: app.lambdaHandler
      Runtime: nodejs18.x

  # Rol IAM para Step Functions
  MyStateMachineRole:
    Type: AWS::IAM::Role
    Properties:
      AssumeRolePolicyDocument:
        Version: '2012-10-17'
        Statement:
          - Effect: Allow
            Principal:
              Service: states.amazonaws.com
            Action: sts:AssumeRole
      Policies:
        - PolicyName: AllowLambdaInvoke
          PolicyDocument:
            Version: '2012-10-17'
            Statement:
              - Effect: Allow
                Action: lambda:InvokeFunction
                Resource: '*'

```

**Archivo `definition.asl.json`:**

```json
{
  "StartAt": "Paso1",
  "States": {
    "Paso1": {
      "Type": "Task",
      "Resource": "${FirstLambdaArn}",
      "Next": "Paso2"
    },
    "Paso2": {
      "Type": "Task",
      "Resource": "${SecondLambdaArn}",
      "End": true
    }
  }
}
```

### 🧪 Casos de uso reales

Algunos ejemplos aplicables directamente con tu arquitectura actual:

- Procesamiento de usuarios:

    Validar → Guardar en BD → Enviar correo de bienvenida

- Ingreso a eventos:

    Escanear QR → Verificar en BD → Registrar asistencia → Notificar

- Auditorías diarias:

    Programación diaria (Schedule) → Verificación → Reporte final

---

## 🌐 - API Gateway

### 📖 ¿Qué es API Gateway?

Amazon API Gateway es un servicio que te permite exponer funciones Lambda como endpoints HTTP, tal como lo harías con rutas en Laravel o Express.js.

- GET /user → obtiene usuario
- POST /login → inicia sesión
- DELETE /product/123 → elimina producto

> 🔁 En la Lambda, puedes capturar el evento HTTP con objetos como APIGatewayProxyEvent para procesar rutas, headers, body, etc.

### 📦 Ejemplo de uso

```ts
// app.ts
export const lambdaHandler = async (event) => {
  return await router(event); // aquí enrutas según método y path
};

// router.ts
/**
 * @description: Router para las rutas de la API
 * @param event {APIGatewayProxyEvent} - Evento de la API Gateway
 * @returns {Promise<APIGatewayProxyResult>} - Resultado de la API Gateway
 */
export const router = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Desestructuración del evento
    const { path, httpMethod } = event;

    // ? Ruta de saludo
    if (httpMethod === 'GET' && path === '/hello') {
        return helloHandler(event);
    }

    // ? Ruta de usuarios
    if (path.includes('/user') || path.includes('/users')) {
        return userHandler(event);
    }

    // ! Error - Ruta no encontrada
    return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Ruta no encontrada' }),
    };
};
```

Esto actúa como un controlador centralizado, similar a:

- Laravel: routes/web.php
- Express.js: app.use('/api', router)

### Configuración avanzada: Proxy dinámico

✅ Habilita rutas tipo /api/* con SAM

```yaml
Resources:
  ProxyFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: backend/
      Handler: app.lambdaHandler
      Runtime: nodejs18.x
      Events:
        ProxyApi:
          Type: Api
          Properties:
            Path: /api/{proxy+}
            Method: ANY
```

Esto captura todos los métodos y rutas que empiecen con /api/ (como /api/user/1, /api/posts/99/comments, etc), enviándolos a una sola Lambda.

> 🔄 Así, puedes controlar el ruteo dentro de esa Lambda con un router.ts.

### 🧪 Cómo probarlo

#### 📍 Local (SAM CLI)

1. Define un evento api-event.json

```json
{
  "httpMethod": "GET",
  "path": "/api/user/123",
  "headers": {
    "Content-Type": "application/json"
  },
  "queryStringParameters": {
    "verbose": "true"
  }
}
```

2. Ejecuta la función localmente

```bash
sam local invoke ProxyFunction --event events/api-event.json
```

✅ Resultado: la función lambdaHandler será ejecutada con ese evento como si viniera de API Gateway.

#### 🚀 Producción (en AWS real)

1. Haz el deploy

```bash
sam build
sam deploy --guided
```

2. Obtén la URL base del endpoint
Después del deploy, SAM te muestra algo como:

```arduino
https://xxxxx.execute-api.us-east-1.amazonaws.com/Prod
```

3. Prueba con cURL o Postman

```bash
curl https://xxxxx.execute-api.us-east-1.amazonaws.com/Prod/api/user/123
```

✅ Resultado: si tu router está bien implementado, responderá con la información del usuario 123.

---

## 🧪 ¿Cómo lo aplicaría?

Tú ya tienes algo así:

```ts
// router.ts
if (path.includes('/user') || path.includes('/users')) {
  return userHandler(event);
}
```

Esto se puede combinar con:

- **SQS:** Cuando alguien crea un usuario (`POST /user`), lo metes a una cola para que otra Lambda lo procese.
- **EventBridge:** Puedes disparar un evento diario que actualice o elimine usuarios inactivos.
- **Step Functions:** Cuando se crea un usuario, puedes hacer 3 pasos secuenciales:

  1. Guardar el usuario.
  2. Validar el correo.
  3. Enviar confirmación.

- **API Gateway avanzado:** Puedes poner headers personalizados, CORS, o usar una sola Lambda para todo `/api`.

---
