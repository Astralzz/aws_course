# Curso Rápido: AWS con SAM para Desarrollar Lambdas

## 📄 Requisitos previos

- Node.js instalado (preferente LTS)
- Docker (para pruebas locales)
- AWS CLI configurado
- SAM CLI instalado

---

## 🔹 Glosario de conceptos clave

| Término            | Descripción                                                                             |
| ------------------ | --------------------------------------------------------------------------------------- |
| **Lambda**         | Funciones sin servidor que se ejecutan bajo demanda. Es el "controlador" de AWS.        |
| **SAM**            | AWS Serverless Application Model. Permite definir tu infraestructura con archivos YAML. |
| **API Gateway**    | Servicio para exponer funciones Lambda vía HTTP (como tus rutas REST).                  |
| **SQS**            | Amazon Simple Queue Service. Colas para ejecutar tareas asincrónicas.                   |
| **EventBridge**    | Sistema de eventos que activa funciones Lambda basado en eventos o reglas.              |
| **Step Functions** | Define flujos de ejecución entre funciones Lambda (tipo orquestador).                   |
| **DynamoDB**       | Base de datos NoSQL administrada por AWS. Ideal para sistemas sin servidor.             |
| **template.yaml**  | Archivo central que define todos tus recursos de AWS usando SAM.                        |
| **CodeUri**        | Directorio donde vive el código de tu función Lambda.                                   |

---

## ✨ Tecnologías involucradas

- **AWS Lambda**
- **AWS SAM (Serverless Application Model)**
- **API Gateway**
- **EventBridge** (Eventos)
- **SQS** (Colas)
- **Step Functions** (Flujos de trabajo)
- **DynamoDB** (opcional, almacenamiento)

---

## ✨ Instalación de SAM

```bash
# Mac
brew install aws-sam-cli

# Windows
# Descargar instalador desde:
https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html
```

Verifica:

```bash
sam --version
```

---

## ✍️ Crear proyecto SAM

```bash
sam init
```

Selecciona:

- **Hello World Example**
- **Node.js 18.x**
- **TypeScript**
- **npm**

---

## 🔧 Estructura del Proyecto SAM

```
lambda-app/
├── template.yaml             # Infraestructura como código (IaC)
├── hello-world/              # Carpeta de Lambda
│   ├── app.ts                # Código principal
│   └── package.json
└── tsconfig.json
```

Ejemplo

```
PS C:\Users\........\AWS> sam init

        SAM CLI now collects telemetry to better understand customer needs.

        You can OPT OUT and disable telemetry collection by setting the
        environment variable SAM_CLI_TELEMETRY=0 in your shell.
        Thanks for your help!

        Learn More: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-telemetry.html


You can preselect a particular runtime or package type when using the `sam init` experience.
Call `sam init --help` to learn more.

Which template source would you like to use?
        1 - AWS Quick Start Templates
        2 - Custom Template Location

Choice: 1

Choose an AWS Quick Start application template
        1 - Hello World Example
        2 - Data processing
        3 - Hello World Example with Powertools for AWS Lambda
        4 - Multi-step workflow
        5 - Scheduled task
        6 - Standalone function
        7 - Serverless API
        8 - Infrastructure event management
        9 - Lambda Response Streaming
        10 - GraphQLApi Hello World Example
        11 - Full Stack
        12 - Lambda EFS example
        13 - Serverless Connector Hello World Example
        14 - Multi-step workflow with Connectors
        15 - DynamoDB Example
        16 - Machine Learning

Template: 1

Use the most popular runtime and package type? (python3.13 and zip) [y/N]: N

Which runtime would you like to use?
        1 - dotnet8
        ......
        10 - java8.al2
        11 - nodejs22.x
        12 - nodejs20.x
        13 - nodejs18.x
        14 - python3.9
        15 - python3.13
        .........

Runtime: 13

What package type would you like to use?
        1 - Zip
        2 - Image
Package type: 1

Based on your selections, the only dependency manager available is npm.
We will proceed copying the template using npm.

Select your starter template
        1 - Hello World Example
        2 - Hello World Example TypeScript
Template: 2

Would you like to enable X-Ray tracing on the function(s) in your application?  [y/N]: N

Would you like to enable monitoring using CloudWatch Application Insights?
For more info, please view https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/cloudwatch-application-insights.html [y/N]: N

Would you like to set Structured Logging in JSON format on your Lambda functions?  [y/N]: N

Project name [sam-app]: hello_word

Cloning from https://github.com/aws/aws-sam-cli-app-templates (process may take a moment)

    -----------------------
    Generating application:
    -----------------------
    Name: hello_word
    Runtime: nodejs18.x
    Architectures: x86_64
    Dependency Manager: npm
    Application Template: hello-world-typescript
    Output Directory: .
    Configuration file: hello_word\samconfig.toml

    Next steps can be found in the README file at hello_word\README.md


Commands you can use next
=========================
[*] Create pipeline: cd hello_word && sam pipeline init --bootstrap
[*] Validate SAM template: cd hello_word && sam validate
[*] Test Function in the Cloud: cd hello_word && sam sync --stack-name {stack-name} --watch
```

---

## Correr proyecto

### Lcalmente

1. Instalar 'esbuild' y 'nodemon' globalmente [1 ves]

   ```cmd
   npm install -g esbuild & npm install -g nodemon
   ```

  | Herramienta | ¿Para qué sirve?                                                                                                 |
  | ----------- | ---------------------------------------------------------------------------------------------------------------- |
  | `esbuild`   | 🔧 Para **empacar y compilar** tu código (como `webpack`, pero más rápido). Lo usa SAM para construir la Lambda. |
  | `nodemon`   | 🔁 Para **monitorear archivos** y reiniciar procesos automáticamente cuando detecta cambios.                     |

2. Iniciar docker destock

3. Hacer un build

   ```cmd
   sam build
   ```

   Salida:

   ```cmd
   Build Succeeded

   Built Artifacts  : .aws-sam\build
   Built Template   : .aws-sam\build\template.yaml

   Commands you can use next
   =========================
   [*] Validate SAM template: sam validate
   [*] Invoke Function: sam local invoke
   [*] Test Function in the Cloud: sam sync --stack-name {{stack-name}} --watch
   [*] Deploy: sam deploy --guided
   ```

4. Correr proyecto

   ```cmd
   sam local start-api
   ```

   Salida:

   ```cmd
   No current session found, using default AWS::AccountId
   Initializing the lambda functions containers.
   Local image is up-to-date
   Using local image: public.ecr.aws/lambda/nodejs:18-rapid-x86_64.

   Mounting C:\Users\dayin\OneDrive\Documentos\1_Proyectos\9_CarConnect\AWS\hello_word\.aws-sam\build\HelloWorldFunction as
   /var/task:ro,delegated, inside runtime container
   Containers Initialization is done.
   Mounting HelloWorldFunction at http://127.0.0.1:3000/hello [GET]
   ```

   Tambien puedes crear un scrip personalizado en 'package.json':

   ```json
    "scripts": {
        "dev": "sam build --template-file ../template.yaml --build-dir ../.aws-sam/build && sam local start-api --template ../.aws-sam/build/template.yaml",
        "dev-nodemon": "nodemon --watch hello-world --exec \"sam build --template-file ../template.yaml --build-dir ../.aws-sam/build && sam local start-api --template ../.aws-sam/build/template.yaml\""
    },
   ```

### Producion

#### ✅ Requisitos previos

1. **Tener una cuenta de AWS**
2. **Instalar AWS CLI:**
   [https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html)
3. **Configurar tus credenciales AWS** con:

```bash
aws configure
```

Te pedirá:

- **AWS Access Key ID**
- **AWS Secret Access Key**
- **Region** (ej. `us-east-1`)
- **output format** (puedes dejar `json`)

> Estos datos los puedes obtener desde la consola de AWS → IAM → Tu usuario → “Security credentials”.

#### 🚀 Primer deploy con `sam deploy --guided`

Desde la raíz del proyecto (`template.yaml`), corre:

```bash
sam deploy --guided
```

Te preguntará cosas como:

| Pregunta                         | Ejemplo            | Explicación                                |
| -------------------------------- | ------------------ | ------------------------------------------ |
| Stack Name                       | `hello-word-stack` | Nombre lógico del stack en CloudFormation  |
| AWS Region                       | `us-east-1`        | Región donde desplegarás                   |
| Confirm changes before deploy    | `y`                | Recomendado `y` para revisar               |
| Allow SAM CLI IAM role creation  | `y`                | Deja que cree los roles necesarios         |
| Save arguments to samconfig.toml | `y`                | Guarda para que la próxima vez no pregunte |

---

#### ✨ Resultado esperado

Verás algo como:

```
Successfully created/updated stack - hello-word-stack in us-east-1
```

Y en los outputs algo como:

```
Outputs:
    HelloWorldApi = https://xyz123.execute-api.us-east-1.amazonaws.com/Prod/hello/
```

🎯 **¡Esa URL es la pública de tu Lambda en producción!**

Puedes abrir esa URL en tu navegador y ver:

```json
{
  "message": "hello world"
}
```

---

#### 📂 Tu estructura tras deploy

- SAM genera/usa internamente CloudFormation.
- Crea funciones Lambda, un API Gateway, roles IAM, etc.
- Si te metes a la consola de AWS (Lambda, API Gateway), verás todo creado con el nombre de tu stack.

## 🎮 Comandos SAM más usados

| Comando                | Descripción                |
| ---------------------- | -------------------------- |
| `sam init`             | Crear nuevo proyecto       |
| `sam build`            | Compilar proyecto          |
| `sam local invoke`     | Ejecutar Lambda localmente |
| `sam local start-api`  | Simular API Gateway local  |
| `sam deploy --guided`  | Desplegar a AWS            |
| `sam logs -n <Lambda>` | Ver logs de ejecución      |

---

## 🌌 Lambda básica en TypeScript

`hello-world/app.ts`

```ts
import { APIGatewayProxyHandler } from 'aws-lambda';

export const handler: APIGatewayProxyHandler = async (event) => {
  const name = event.queryStringParameters?.name || 'Mundo';
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: `Hola, ${name}`,
    }),
  };
};
```

---

## 📥 Despliegue a AWS

```bash
sam build
sam deploy --guided
```

Sigue las instrucciones y guarda la config para futuras ejecuciones:

```bash
sam deploy
```

---

## 🌐 API Gateway (ruta pública REST)

`template.yaml`

```yaml
Resources:
  HelloWorldFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: app.handler
      Runtime: nodejs18.x
      CodeUri: hello-world/
      Events:
        HelloApi:
          Type: Api
          Properties:
            Path: /hello
            Method: get
```

---

## ✨ Integración con Next.js

1. Usar API Gateway como backend:

   - `POST /api/login` (desde Next.js) redirecciona a una Lambda

2. Configurar variables en `.env` de Next.js:

```env
NEXT_PUBLIC_API_URL=https://xxxxx.execute-api.us-east-1.amazonaws.com/Prod
```

3. Llamar desde frontend:

```ts
const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hello`);
const data = await res.json();
```

---

## 🚀 Siguientes pasos

- Crear Lambdas conectadas a **SQS** (colas)
- Crear **reglas de EventBridge** para eventos programados
- Crear flujos con **Step Functions**
- Usar **DynamoDB** para persistencia

---

## 📊 Buenas prácticas

- Evita funciones gigantes: cada Lambda debe tener una sola responsabilidad.
- Usa logs (`console.log`) para debug y monitoreo.
- Usa variables de entorno (`Environment:` en `template.yaml`).
- Controla errores con `try/catch` y respuestas HTTP coherentes.

---
