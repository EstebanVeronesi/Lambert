import { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import { getClientes, crearCliente, eliminarCliente } from '../controllers/clientes.controller';
import authenticateToken from '../middleware/auth';
import { AuthenticatedRequest } from '../types/express.types';

type AsyncAuthHandler = (req: AuthenticatedRequest, res: Response) => Promise<unknown>;

const wrapAsync = (fn: AsyncAuthHandler): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req as AuthenticatedRequest, res)).catch(next);
  };

const router = Router();

router.get('/', authenticateToken, getClientes);
router.post('/', authenticateToken, crearCliente);
router.delete('/:cuit', authenticateToken, wrapAsync(eliminarCliente));

export default router;
