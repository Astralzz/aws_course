/**
 * @description: Interfaz para el usuario
 * @property {string} id - ID del usuario
 * @property {string} name - Nombre del usuario
 */
interface User {
    id: number;
    name?: string;
}

/**
 * @description: Base de datos mock
 * @type {User[]} - Array de usuarios
 */
const mockDB: User[] = [];

/**
 * @description: Obtiene todos los usuarios
 * @param {number} page - Página de usuarios
 * @returns {Promise<User[]>} - Array de usuarios
 */
export const getUsers = async (page?: number): Promise<User[]> => {
    return [
        {
            id: 1,
            name: `User 1 y llego el parametro page: ${page ?? 'N/A'}`,
        },
        {
            id: 2,
            name: 'User 2',
        },
        {
            id: 3,
            name: 'User 3',
        },
    ];
    // return mockDB.slice(0, page ?? mockDB.length);
};

/**
 * @description: Obtiene un usuario por su ID
 * @param {number} id - ID del usuario
 * @returns {Promise<User | null>} - Usuario encontrado o null si no existe
 */
export const getUserById = async (id: number): Promise<User | null> => {
    return mockDB.find((user) => user.id === id) ?? null;
};

/**
 * @description: Crea un nuevo usuario
 * @param {any} data - Datos del usuario
 * @returns {Promise<User>} - Usuario creado
 */
export const createUser = async (data?: User): Promise<User> => {
    // ? Validar que se proporcionaron datos
    if (!data) {
        throw new Error('No se proporcionaron datos del usuario');
    }

    // ? Validar que se proporciono un nombre
    if (!data.name) {
        throw new Error('No se proporciono un nombre');
    }

    // Crear el nuevo usuario
    const newUser: User = {
        id: mockDB.length + 1,
        name: data.name,
    };

    // Agregar el nuevo usuario a la base de datos
    mockDB.push(newUser);

    // Devolver el nuevo usuario
    return newUser;
};
