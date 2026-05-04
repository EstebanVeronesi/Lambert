// src/routes/camion.routes.ts
import { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import { getCamionesVerificados, getCamionPorId, getConfiguracionPorCamionId, crearCamion, eliminarCamion } from '../controllers/camion.controller';
import authenticateToken from '../middleware/auth'; // Importamos el middleware
import { AuthenticatedRequest } from '../types/express.types';

type AsyncAuthHandler = (req: AuthenticatedRequest, res: Response) => Promise<unknown>;

const wrapAsync = (fn: AsyncAuthHandler): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req as AuthenticatedRequest, res)).catch(next);
  };

const router = Router();

// GET /api/camiones
// Devuelve la lista de camiones verificados para los dropdowns
router.get('/', authenticateToken, getCamionesVerificados);

// GET /api/camiones/:id
// Devuelve un camión por su ID
router.get('/:id', authenticateToken, getCamionPorId);

// --- ¡NUEVA RUTA AÑADIDA! ---
// GET /api/camiones/configuracion/1
// Devuelve la última configuración verificada para el camión con ID 1
router.get('/configuracion/:id', authenticateToken, getConfiguracionPorCamionId);

// POST /api/camiones (Crear nuevo camión y su configuración)
router.post('/', authenticateToken, crearCamion);

// DELETE /api/camiones/:id
router.delete('/:id', authenticateToken, wrapAsync(eliminarCamion));

export default router;