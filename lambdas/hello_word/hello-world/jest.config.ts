/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */

export default {
    // Configuración de transformación de archivos TypeScript
    transform: {
        '^.+\\.ts?$': 'ts-jest',
    },
    // Configuración de cobertura de código
    collectCoverage: true, // Recopilar cobertura de código
    coverageDirectory: 'coverage', // Directorio donde se guardará la cobertura
    coverageProvider: 'v8', // Proveedor de cobertura de código
    testMatch: ['**/tests/unit/*.test.ts'], // Patrón de archivos de prueba
};
