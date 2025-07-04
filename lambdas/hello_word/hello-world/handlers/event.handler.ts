import { APIGatewayProxyResult, ScheduledEvent } from 'aws-lambda';

/**
 * @description: Detecta si el evento es el que se espera
 * @param event {ScheduledEvent} - Evento programado de EventBridge
 * @param name {string} - Nombre del evento
 * @returns {boolean} - Si el evento es el que se espera
 */
const detectEventName = (event: ScheduledEvent, name: string): boolean =>
    'source' in event &&
    event.source === 'aws.events' &&
    Array.isArray(event.resources) &&
    event.resources.some((r: string) => r.endsWith(name));

/**
 * @description: Handler para la función Lambda, que ejecuta un evento programado de EventBridge
 * @param event {ScheduledEvent} - Evento programado de EventBridge
 * @returns {Promise<APIGatewayProxyResult>} - Resultado de la función Lambda
 */
export const awsEventBridgeHandler = async (event: ScheduledEvent): Promise<APIGatewayProxyResult> => {
    // 📅 Validar si el evento es el que se espera
    console.log('⏰ Ejecutando evento programado de EventBridge');

    // Aquí se hace lo que se requiera, por ejemplo:
    // - Consultar usuarios inactivos
    // - Enviar correos de recordatorio
    // - Limpiar caché
    // - Crear backups

    // ? Validar si el evento es el que se espera
    if (detectEventName(event, 'daily-user-check-every-day')) {
        // Acciones ...

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Evento programado ejecutado con éxito',
                details: 'Este evento se ejecuta diariamente a las 5 AM',
                name: 'daily-user-check-every-day',
            }),
        };
    }

    // ? Validar si el evento es el que se espera
    if (detectEventName(event, 'daily-user-check-every-minute')) {
        // Acciones ...

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Evento programado ejecutado con éxito',
                details: 'Este evento se ejecuta cada minuto',
                name: 'daily-user-check-every-minute',
            }),
        };
    }

    // ? Si el evento es desconocido
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'Evento programado ejecutado con éxito',
            details: 'Este evento es desconocido',
        }),
    };
};
