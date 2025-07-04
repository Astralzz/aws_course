import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { userHandler } from '../handlers/user.handler';
import { helloHandler } from '../handlers/hello.handler';

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
