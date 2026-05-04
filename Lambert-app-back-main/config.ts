// config.ts - Configuración centralizada con validación de variables de entorno

/**
 * Obtiene una variable de entorno string
 * @throws Error si la variable es requerida y no existe
 */
function getEnvVar(name: string, required: boolean = true): string {
  const value = process.env[name];
  if (required && !value) {
    throw new Error(`Variable de entorno requerida no definida: ${name}`);
  }
  return value || '';
}

/**
 * Obtiene una variable de entorno numérica
 * @throws Error si la variable es requerida y no existe o no es un número válido
 */
function getEnvVarNumber(name: string, defaultValue?: number): number {
  const value = process.env[name];
  if (!value && defaultValue !== undefined) return defaultValue;
  if (!value) throw new Error(`Variable de entorno requerida no definida: ${name}`);
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) throw new Error(`${name} debe ser un número válido`);
  return parsed;
}

// ============================================================================
// VARIABLES CRÍTICAS (sin defaults inseguros - DEBEN estar en .env)
// ============================================================================
export const SECRET_JWT_KEY = getEnvVar('SECRET_JWT_KEY');
export const DB_PASSWORD = getEnvVar('DB_PASSWORD');

// ============================================================================
// VARIABLES CON DEFAULTS SEGUROS
// ============================================================================
export const PORT = getEnvVarNumber('PORT', 3000);
export const SALT_ROUNDS = getEnvVarNumber('SALT_ROUNDS', 10);
export const DB_USER = getEnvVar('DB_USER', false) || 'postgres';
export const DB_HOST = getEnvVar('DB_HOST', false) || 'localhost';
export const DB_NAME = getEnvVar('DB_NAME', false) || 'lambert';
export const DB_PORT = getEnvVarNumber('DB_PORT', 5432);

// ============================================================================
// CORS - Soporta múltiples orígenes separados por coma
// ============================================================================
export const CORS_ORIGIN = getEnvVar('CORS_ORIGIN', false) || 'http://localhost:4200';
