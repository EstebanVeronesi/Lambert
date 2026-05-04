import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types/express.types';
import { ClientesRepository } from '../repositories/clientes.repository';
import logger from '../utils/logger';

export const getClientes = async (req: Request, res: Response) => {
  try {
    const clientes = await ClientesRepository.findAll();
    res.status(200).json(clientes);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    logger.error('Error al obtener clientes:', error);
    res.status(500).json({ error: message });
  }
};

export const crearCliente = async (req: Request, res: Response) => {
  try {
    const { cuit, razon_social } = req.body;

    if (!cuit || !razon_social) {
      return res.status(400).json({ error: 'CUIT y razón social son requeridos.' });
    }

    const cliente = await ClientesRepository.create(Number(cuit), razon_social);
    res.status(201).json(cliente);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    logger.error('Error al crear cliente:', error);
    res.status(500).json({ error: message });
  }
};

export const eliminarCliente = async (req: AuthenticatedRequest, res: Response) => {
  // Solo admin o ingeniero puede eliminar clientes
  if (req.user.rol !== 'admin' && req.user.rol !== 'ingeniero') {
    return res.status(403).json({ error: 'Solo un administrador puede eliminar clientes' });
  }

  try {
    const { cuit } = req.params;

    // Verificar si tiene pedidos asociados
    const tienePedidos = await ClientesRepository.tienePedidos(Number(cuit));
    if (tienePedidos) {
      return res.status(400).json({ error: 'No se puede eliminar: el cliente tiene pedidos asociados' });
    }

    await ClientesRepository.delete(Number(cuit));
    res.json({ message: 'Cliente eliminado correctamente' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    logger.error('Error al eliminar cliente:', error);
    res.status(500).json({ error: message });
  }
};
