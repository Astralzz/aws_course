# Curso Intensivo de AWS Serverless con SAM

## Servicios Cubiertos:

* AWS Lambda
* Amazon EventBridge
* Amazon SQS
* AWS Step Functions
* Amazon API Gateway

---

## Introducción

Este curso está orientado a desarrolladores que necesitan trabajar con arquitecturas serverless utilizando AWS SAM (Serverless Application Model), un marco para definir infraestructura como código.

---

## 1. AWS Lambda

### ¿Qué es?

Lambda permite ejecutar código sin administrar servidores. Ideal para microservicios y tareas event-driven.

### Estructura SAM:

```yaml
Resources:
  HelloFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: src/
      Handler: index.handler
      Runtime: nodejs18.x
      Events:
        Api:
          Type: Api
          Properties:
            Path: /hello
            Method: get
```

### Despliegue:

```bash
sam build
sam deploy --guided
```

---

## 2. Amazon EventBridge

### ¿Qué es?

Es un bus de eventos que permite la comunicación entre servicios AWS o eventos personalizados.

### Ejemplo SAM:

```yaml
Resources:
  EventFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: handler.event
      Runtime: nodejs18.x
      Events:
        FromEventBridge:
          Type: EventBridgeRule
          Properties:
            Pattern:
              source:
                - "custom.myapp"
```

### Emitir Evento:

```js
import { EventBridgeClient, PutEventsCommand } from "@aws-sdk/client-eventbridge";
const client = new EventBridgeClient({});
await client.send(new PutEventsCommand({
  Entries: [{
    Source: "custom.myapp",
    DetailType: "user.signup",
    Detail: JSON.stringify({ id: 1 }),
    EventBusName: "default"
  }]
}));
```

---

## 3. Amazon SQS

### ¿Qué es?

Una cola de mensajes que permite desacoplar componentes de una arquitectura.

### Ejemplo SAM:

```yaml
Resources:
  MyQueue:
    Type: AWS::SQS::Queue

  QueueConsumer:
    Type: AWS::Serverless::Function
    Properties:
      Handler: consumer.main
      Events:
        SQSTrigger:
          Type: SQS
          Properties:
            Queue: !GetAtt MyQueue.Arn
```

---

## 4. AWS Step Functions

### ¿Qué es?

Servicio para coordinar multiples servicios AWS en flujos de trabajo con lógica compleja (condicionales, retries, secuencias).

### SAM:

```yaml
Resources:
  MyStateMachine:
    Type: AWS::StepFunctions::StateMachine
    Properties:
      Definition:
        StartAt: TaskOne
        States:
          TaskOne:
            Type: Task
            Resource: arn:aws:lambda:REGION:ACCOUNT_ID:function:MyFunction
            End: true
```

---

## 5. Amazon API Gateway

### ¿Qué es?

Servicio para publicar, mantener y asegurar APIs REST o HTTP. Funciona como frontend para Lambda.

### SAM:

```yaml
Resources:
  MyApiFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: api.handler
      Runtime: nodejs18.x
      Events:
        MyApi:
          Type: Api
          Properties:
            Path: /api
            Method: get
            RestApiId: !Ref MyApi

  MyApi:
    Type: AWS::Serverless::Api
    Properties:
      StageName: prod
```

---

## Recomendaciones Finales

* Usa `sam validate` para verificar tu plantilla
* Agrega `Logs: True` en deploy para ver logs automáticos
* Usa variables de entorno (`Environment`) en tus funciones