// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { SECRET_JWT_KEY } from '../../config';
import { AuthenticatedRequest, JwtUserPayload } from '../types/express.types';
import logger from '../utils/logger';

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  
  logger.info(`Verificando token para: ${req.originalUrl}`);
  
  // 1. Buscamos en la Cookie (para el navegador)
  let token = req.cookies?.access_token;

  // 2. Si no hay cookie, buscamos en el Header Authorization (para Yaak/Postman/Mobile)
  // El header suele venir como: "Bearer eyJhbGci..."
  if (!token) {
      const authHeader = req.headers['authorization'];
      if (authHeader && authHeader.startsWith('Bearer ')) {
          token = authHeader.split(' ')[1]; // Tomamos solo el código después de "Bearer"
      }
  }

  // Si después de buscar en los dos lados sigue vacío...
  if (!token) {
    logger.warn('No se encontró token en cookies ni headers.');
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_JWT_KEY) as JwtUserPayload;
    (req as AuthenticatedRequest).user = decoded;
    
    logger.info('Token verificado exitosamente.');
    next();
  
  } catch(err) {
    logger.error('Token inválido o expirado:', err);
    return res.status(403).json({ error: 'Invalid token.' });
  }
}

export default authenticateToken;