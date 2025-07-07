import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getUserById, createUser, getUsers } from '../services/user.service';

/**
 * @description: Handler para la función Lambda, que maneja las operaciones de usuario
 * @param event {APIGatewayProxyEvent} - Evento de la función Lambda
 * @returns {Promise<APIGatewayProxyResult>} - Resultado de la función Lambda
 */
export const userHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        // Obtener el método HTTP
        const { path, httpMethod, pathParameters, queryStringParameters, body } = event;

        // ? Es users
        if (httpMethod === 'GET' && path === '/users') {
            // Pagina
            const page = Number(queryStringParameters?.page) || 1;

            // Obtener todos los usuarios
            const users = await getUsers(page);
            // Devolver los usuarios
            return {
                statusCode: 200,
                body: JSON.stringify(users),
            };
        }

        // ? Es get y tiene un id
        if (httpMethod === 'GET' && pathParameters?.id) {
            // ? Validar que el id sea un numero usando una regex y que sea mayor a 0
            if (!/^[0-9]+$/.test(pathParameters.id) || Number(pathParameters.id) < 1) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ message: 'Bad Request - El id debe ser un numero mayor a 0' }),
                };
            }

            // Obtener el usuario por su ID
            const user = await getUserById(Number(pathParameters.id));
            // Devolver el usuario
            return {
                statusCode: 200,
                body: JSON.stringify(user),
            };
        }

        // ? Es post y tiene un body
        if (httpMethod === 'POST' && body) {
            // Obtener los datos del usuario
            const data = JSON.parse(body);
            // Crear el usuario
            const newUser = await createUser(data);
            // Devolver el usuario creado
            return {
                statusCode: 201,
                body: JSON.stringify(newUser),
            };
        }

        // Otra ruta diferente
        console.group('Solicitud no procesada - Detalles de la peticion');
        console.log('Path:', path);
        console.log('HttpMethod:', httpMethod);
        console.log('PathParameters:', pathParameters);
        console.log('QueryStringParameters:', queryStringParameters);
        console.log('Body:', body);
        console.groupEnd();

        // ? Si no es get o post, devolver un error
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'Bad Request - No se pudo procesar la solicitud' }),
        };

        // ! Error - Si no es get o post, devolver un error
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Server Error - Error al procesar la solicitud' }),
        };
    }
};
