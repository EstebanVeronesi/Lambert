import { Response } from 'express';
import { AuthenticatedRequest } from '../types/express.types';
import { ProyectoRepository } from '../repositories/proyecto.repository';

export const imprimirSimulacion = async (req: AuthenticatedRequest, res: Response): Promise<unknown> => {
  try {
    const { id } = req.params;
    const { es_modificado } = req.query;
    const isMod = String(es_modificado) === 'true';

    const pedido = await ProyectoRepository.findById(Number(id), isMod);
    if (!pedido) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    res.json(pedido);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error';
    res.status(500).json({ error: message });
  }
};
