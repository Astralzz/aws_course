import type { APIGatewayProxyEvent, APIGatewayProxyResult, ScheduledEvent, SQSEvent } from 'aws-lambda';
import { router } from './routes/router';
import { awsEventBridgeHandler } from './handlers/event.handler';
import { showEnvironment } from './utils/environment';

/**
 * Manejador principal de la función Lambda para AWS API Gateway.
 *
 * Esta función se ejecuta cuando API Gateway recibe una solicitud HTTP y la reenvía a Lambda.
 *
 * @param {APIGatewayProxyEvent} event - Objeto que representa la solicitud HTTP recibida por API Gateway. Contiene información como headers, parámetros, cuerpo, etc.
 * @returns {Promise<APIGatewayProxyResult>} - Objeto de respuesta que será devuelto a API Gateway, el cual lo enviará al cliente que hizo la solicitud.
 *
 * Documentación de eventos: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * Documentación de retorno: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 */
export const lambdaHandler = async (
    event: APIGatewayProxyEvent | ScheduledEvent | SQSEvent,
): Promise<APIGatewayProxyResult> => {
    try {
        // Mostrar variables de entorno
        showEnvironment();

        // 🔎 Detectar si el evento es de tipo API Gateway
        if ('httpMethod' in event && 'path' in event) {
            return await router(event as APIGatewayProxyEvent);
        }

        // 🔎 Detectar si el evento es de tipo EventBridge (Schedule)
        if ('source' in event && event.source === 'aws.events') {
            return await awsEventBridgeHandler(event as ScheduledEvent);
        }

        // 🔎 Detectar si el evento es de tipo SQS
        if ('Records' in event && event?.Records?.[0]?.eventSource === 'aws:sqs') {
            // 📦 Procesar mensajes de SQS
            for (const record of event?.Records) {
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
                    message: `Error interno en el servidor, ${error?.message ?? 'Error no identificado'}`,
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
