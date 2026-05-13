// index.ts - Punto de entrada del servidor Express
import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { PORT, CORS_ORIGIN } from './config';
import loginRoutes from './src/login';
import proyectosRoutes from './src/routes/proyectos.routes';
import camionRoutes from './src/routes/camion.routes';
import adminRoutes from './src/routes/admin.routes';
import usersRoutes from './src/routes/users.routes';
import clientesRoutes from './src/routes/clientes.routes';

const app = express();

// Parsear múltiples orígenes CORS si están separados por coma
const allowedOrigins = CORS_ORIGIN.split(',').map((origin) => origin.trim());

// Middlewares globales
app.use(
  cors({
    origin: process.env.NODE_ENV === 'production' ? true : allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Rutas de la API
app.use('/api', loginRoutes);
app.use('/api/proyectos', proyectosRoutes);
app.use('/api/camiones', camionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/usuarios', usersRoutes);
app.use('/api/clientes', clientesRoutes);

// Endpoint de diagnóstico (solo para debug)
app.get('/api/health', async (_req, res) => {
  try {
    const { pool } = await import('./db');
    const result = await pool.query('SELECT COUNT(*) FROM users');
    res.json({ status: 'ok', users: result.rows[0].count, db: 'connected' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ status: 'error', message, db: 'disconnected' });
  }
});

// Iniciar el servidor (solo en entornos tradicionales, no en Vercel serverless)
if (!process.env.VERCEL) {
  const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';
  app.listen(PORT, HOST, () => {
    console.log(`Servidor corriendo en http://${HOST}:${PORT}`);
  });
}

export default app;
