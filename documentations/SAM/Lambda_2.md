# AWS SAM - 2 - EventBridge, SQS, Step Functions, API Gateway

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

---

## 🧩 - Step Functions

### 📖 Definición

**Step Functions** es un orquestador de estados: puedes hacer que una Lambda llame a otra, esperar respuestas, tomar decisiones (`if/else`) y hacer retries.

---

### ✅ Ejemplo: Crear un flujo que llama dos Lambdas en secuencia

**SAM Template:**

```yaml
Resources:
  MyStateMachine:
    Type: AWS::Serverless::StateMachine
    Properties:
      DefinitionUri: statemachine/definition.asl.json
      Role: !GetAtt MyStateMachineRole.Arn
      DefinitionSubstitutions:
        FirstLambdaArn: !GetAtt FirstFunction.Arn
        SecondLambdaArn: !GetAtt SecondFunction.Arn

  FirstFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: step/first/
      Handler: app.lambdaHandler
      Runtime: nodejs18.x

  SecondFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: step/second/
      Handler: app.lambdaHandler
      Runtime: nodejs18.x

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

**Uso real:** workflows como: validar usuario → guardar en BD → enviar correo.

---

## 🌐 - API Gateway

### 📖 Definición

**API Gateway** expone tus Lambdas como si fueran endpoints HTTP (`GET /user`, `POST /login`, etc). Es el equivalente a tus rutas en Laravel o Express.

Ya lo estás usando así:

```ts
export const lambdaHandler = async (event) => {
  return await router(event);
};
```

Pero puedes hacerlo **más avanzado**:

---

### ✅ Ejemplo: Proxy dinámico `/api/{proxy+}`

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

Esto significa que _todas las rutas tipo `/api/...`_ van a una sola Lambda, como un controlador general (como ya estás haciendo con `router.ts`).

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
