/**
 * @description: Mostrar variables de entorno
 *
 * @returns {void}
 */
export const showEnvironment = () => {
    // ? Variables de entorno
    const queueUrl = process?.env?.MY_QUEUE_URL;
    const stage = process?.env?.STAGE;
    const otherConfig = process?.env?.OTHER_CONFIG;

    // Mostrar variables de entorno
    console.group('Variables de entorno');
    console.log('URL de la cola:', queueUrl ?? 'No se encontró la URL de la cola');
    console.log('Entorno:', stage ?? 'No se encontró el entorno');
    console.log('Otra configuración:', otherConfig ?? 'No se encontró la otra configuración');
    console.groupEnd(); // Fin del grupo
};
