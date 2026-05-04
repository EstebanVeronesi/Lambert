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
    origin: (origin, callback) => {
      // Permitir requests sin origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Origen no permitido por CORS'));
    },
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

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
