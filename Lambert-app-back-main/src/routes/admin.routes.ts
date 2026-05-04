import { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import authenticateToken from '../middleware/auth';
import { AuthenticatedRequest } from '../types/express.types';

import { listarPedidos, actualizarPedido, obtenerPedido, eliminarPedido } from '../controllers/pedido.controller';
import { imprimirSimulacion } from '../controllers/print.controller';

type AsyncAuthHandler = (req: AuthenticatedRequest, res: Response) => Promise<unknown>;

const wrapAsync = (fn: AsyncAuthHandler): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req as AuthenticatedRequest, res)).catch(next);
  };

const router = Router();

// ... otras rutas de admin ...

// GET /api/admin/pedidos
router.get('/pedidos', authenticateToken, wrapAsync(listarPedidos));

// GET /api/admin/pedidos/:id
router.get('/pedidos/:id', authenticateToken, wrapAsync(obtenerPedido));

// PUT /api/admin/pedidos/:id
router.put('/pedidos/:id', authenticateToken, wrapAsync(actualizarPedido));

// GET /api/admin/pedidos/:id/imprimir
router.get('/pedidos/:id/imprimir', authenticateToken, wrapAsync(imprimirSimulacion));

// DELETE /api/admin/pedidos/:id
router.delete('/pedidos/:id', authenticateToken, wrapAsync(eliminarPedido));

export default router;