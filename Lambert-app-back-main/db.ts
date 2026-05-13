// db.ts - Conexión a PostgreSQL
import pkg from 'pg';
import { DB_USER, DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT } from './config';

const { Pool } = pkg;

export const pool = new Pool({
  user: DB_USER,
  host: DB_HOST,
  database: DB_NAME,
  password: DB_PASSWORD,
  port: DB_PORT,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 10000,
});
