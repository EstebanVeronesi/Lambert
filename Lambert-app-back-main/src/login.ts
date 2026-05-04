// src/login.ts
import express from 'express';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { UserRepository } from './repositories/user.repository';
import { SECRET_JWT_KEY } from '../config';
import authenticateToken from './middleware/auth';
import { AuthenticatedRequest } from './types/express.types';
import logger from './utils/logger';

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Demasiados intentos. Intenta de nuevo en 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { error: 'Demasiados registros. Intenta de nuevo en 1 hora.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// LOGIN
router.post('/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await UserRepository.login({ email, password });

    // Generamos el token
    // user.id ya contiene el DNI gracias al cambio en el repository
    const token = jwt.sign(
      { 
        id: user.id,      // Esto es el DNI
        dni: user.dni, 
        email: user.email,
        rol: user.rol     
      },
      SECRET_JWT_KEY,
      { expiresIn: '1h' }
    );

    res
      .cookie('access_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60,
      })
      .json({ 
        email: user.email, 
        rol: user.rol, 
        id: user.id  // El frontend recibe el DNI en este campo 'id'
      });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Login failed';
    logger.error('Error en login:', error);
    res.status(401).json({ error: message });
  }
});

// STATUS / IS LOGGED IN
router.get('/status', authenticateToken, (req, res) => {
  const user = (req as AuthenticatedRequest).user;
  res.json({ 
    loggedIn: true, 
    user: {
      id: user.id,   // DNI
      email: user.email,
      rol: user.rol,
      dni: user.dni
    }
  });
});

// REGISTER
router.post('/register', registerLimiter, async (req, res) => {
  const { dni, nombre, email, password, rol } = req.body;
  try {
    const userId = await UserRepository.create({ dni, nombre, email, password, rol });
    res.status(201).json({ message: 'Usuario creado', id: userId });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Registration failed';
    logger.error('Error en registro:', error);
    res.status(400).json({ error: message });
  }
});

// LOGOUT (Igual que antes)
router.post('/logout', (req, res) => {
  res.clearCookie('access_token').status(200).json({ message: 'Logged out' });
});

export default router;