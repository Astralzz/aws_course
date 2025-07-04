import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

/**
 * @description: Handler para la función Lambda, que devuelve un mensaje de saludo
 * @param event {APIGatewayProxyEvent} - Evento de la función Lambda
 * @returns {Promise<APIGatewayProxyResult>} - Resultado de la función Lambda
 */
export const helloHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    return {
        statusCode: 200, // Código de estado HTTP
        body: JSON.stringify({ message: 'Hello from Lambda!' }), // Cuerpo de la respuesta
    };
};
