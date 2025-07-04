# Curso de AWS [AMAZON WEB SERVICES]

## Índice

1. Introducción a AWS
2. Glosario de Términos Comunes
3. IAM (Identity and Access Management)
4. Amazon S3
5. Amazon EC2
6. AWS Lambda
7. API Gateway
8. AWS CloudFront
9. Amazon RDS y DynamoDB
10. AWS Amplify
11. AWS CLI y SDK para JavaScript
12. CICD con AWS (CodePipeline + GitHub + Amplify)
13. Mejores Prácticas de Seguridad
14. Costos y Monitoreo
15. Recursos Adicionales

---

## 1. Introducción a AWS

Amazon Web Services (AWS) es una plataforma de servicios en la nube que ofrece computación, almacenamiento, bases de datos, redes, inteligencia artificial y más. Es la núcleo de muchas arquitecturas modernas basadas en la nube.

### ¿Por qué usar AWS?

* Escalabilidad automática
* Despliegue global
* Integraciones listas con CDN (CloudFront), almacenamiento (S3) y funciones serverless (Lambda)
* Amplify acelera el despliegue frontend/backend

---

## 2. Glosario de Términos Comunes

| Término     | Descripción                                              |
| ----------- | -------------------------------------------------------- |
| IAM         | Servicio de control de acceso y permisos                 |
| EC2         | Servidores virtuales en la nube                          |
| S3          | Almacenamiento de objetos                                |
| Lambda      | Funciones serverless que ejecutan código sin servidores  |
| API Gateway | Puerta de enlace para APIs REST o HTTP                   |
| CloudFront  | CDN global para distribuir contenido rápido              |
| RDS         | Servicio de base de datos relacional                     |
| DynamoDB    | Base de datos NoSQL altamente escalable                  |
| Amplify     | Framework para apps web y móviles con backend gestionado |

---

## 3. IAM (Identity and Access Management)

### Conceptos:

* **Usuarios**: Cuentas individuales dentro de tu organización
* **Grupos**: Agrupan permisos comunes
* **Roles**: Asignación temporal de permisos
* **Políticas**: Documento JSON con reglas de acceso

### Ejemplo de política:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:ListBucket"],
      "Resource": ["arn:aws:s3:::mi-bucket"]
    }
  ]
}
```

---

## 4. Amazon S3

### Usos:

* Almacenar assets estáticos (imágenes, videos, archivos JS)
* Almacenar contenido de usuarios

### Comandos últiles (CLI):

```bash
aws s3 cp archivo.txt s3://mi-bucket/
aws s3 sync ./public s3://mi-bucket/public
```

### Permisos recomendados:

* Solo lectura para contenido público
* Escrita limitada para usuarios autenticados

---

## 5. Amazon EC2

### Características:

* Servidores virtuales configurables
* Ideal para apps Next.js con SSR si no usas serverless

### Ejemplo:

* Lanzar instancia Ubuntu
* Instalar Node.js y PM2
* Deployar app Next.js

---

## 6. AWS Lambda

### Características:

* Ejecuta funciones bajo demanda
* Escalado automático
* Pagas solo por uso

### Ejemplo con Node.js:

```js
exports.handler = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ mensaje: "Hola desde Lambda" })
  };
};
```

### Integración:

* Directamente con API Gateway para endpoints HTTP
* Puede usarse para tareas backend de Next.js (APIs)

---

## 7. API Gateway

### Características:

* Crea APIs REST/HTTP
* Se conecta con Lambda
* Controla versiones y autorización

### Ejemplo:

* Crear una API HTTP
* Conectar con Lambda de backend de Next.js

---

## 8. AWS CloudFront

### Uso:

* CDN para acelerar contenido estático
* Cachea peticiones HTTP

### Integración con S3:

* Crear distribución apuntando a bucket S3
* Permitir acceso solo por CloudFront (Signed URLs o OAI)

---

## 9. Bases de Datos

### Amazon RDS

* Soporta PostgreSQL, MySQL, MariaDB, etc.
* Ideal para apps con datos relacionales

### DynamoDB

* NoSQL, super rápido
* Ideal para almacenamiento flexible y con lecturas frecuentes

---

## 10. AWS Amplify

### Características:

* Hosting frontend
* Backend con GraphQL/REST
* Autenticación, almacenamiento, funciones y más

### Ejemplo:

```bash
npm install -g @aws-amplify/cli
amplify init
amplify add hosting
amplify publish
```

---

## 11. AWS CLI y SDK para JavaScript

### CLI:

```bash
aws configure
aws s3 ls
```

### SDK JS:

```js
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
const client = new S3Client({ region: "us-east-1" });
await client.send(new PutObjectCommand({
  Bucket: "mi-bucket",
  Key: "archivo.txt",
  Body: "Contenido del archivo"
}));
```

---

## 12. CICD con AWS

### Amplify + GitHub:

* Conecta repo GitHub
* Despliegue automático por rama
* Hosting y preview URLs

### CodePipeline:

* Pipeline con CodeCommit + Lambda + S3

---

## 13. Mejores Prácticas de Seguridad

* No expongas tus access keys (usa roles/IAM)
* Usa HTTPS en todo
* Configura bucket S3 con permisos restrictivos
* Revisa logs con CloudTrail

---

## 14. Costos y Monitoreo

### Costos:

* Usa la calculadora de precios de AWS
* Revisa el panel de Cost Explorer

### Monitoreo:

* CloudWatch para logs y métricas
* Alarms para funciones Lambda o CPU EC2

---

## 15. Recursos Adicionales

* [Documentación oficial de AWS](https://docs.aws.amazon.com/)
* [Curso gratuito de AWS por Amazon](https://explore.skillbuilder.aws/)
* [Guía de Amplify + Next.js](https://docs.amplify.aws/start/getting-started/setup/q/integration/next)
* [Guía de serverless Next.js](https://serverless-nextjs.com/)