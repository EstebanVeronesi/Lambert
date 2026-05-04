// src/controllers/camion.controller.ts
import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types/express.types';
// ¡Asegúrate de que esta importación esté aquí!
import { CamionRepository } from '../repositories/camion.repository';
import logger from '../utils/logger';

// Controlador para GET /api/camiones
export const getCamionesVerificados = async (req: Request, res: Response) => {
  try {
    const camiones = await CamionRepository.findVerificados();
    res.status(200).json(camiones);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    logger.error('Error al obtener camiones verificados:', error);
    res.status(500).json({ error: message });
  }
};

// Controlador para GET /api/camiones/:id
export const getCamionPorId = async (req: Request, res: Response) => {
  try {
    const camionId = parseInt(req.params.id, 10);
    if (isNaN(camionId)) {
      return res.status(400).json({ error: 'ID de camión inválido.' });
    }

    const camion = await CamionRepository.findById(camionId);

    if (!camion) {
      return res.status(404).json({ error: 'Camión no encontrado.' });
    }

    res.status(200).json(camion);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    logger.error('Error al obtener camión por ID:', error);
    res.status(500).json({ error: message });
  }
};

// Controlador para POST /api/camiones
export const crearCamion = async (req: Request, res: Response) => {
  try {
    const datosCamion = req.body;
    // Aquí podrías validar que vengan todos los campos necesarios

    const resultado = await CamionRepository.create(datosCamion);
    res.status(201).json(resultado);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    logger.error('Error al crear camión:', error);
    res.status(500).json({ error: message });
  }
};

// Controlador para GET /api/camiones/configuracion/:id
export const getConfiguracionPorCamionId = async (req: Request, res: Response) => {
  try {
    const camionId = parseInt(req.params.id, 10);
    if (isNaN(camionId)) {
      return res.status(400).json({ error: 'ID de camión inválido.' });
    }

    const configuracion = await CamionRepository.findConfiguracionByCamionId(camionId);

    if (!configuracion) {
      return res.status(404).json({ error: 'No se encontró una configuración verificada para este camión.' });
    }

    res.status(200).json(configuracion);

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    logger.error('Error al obtener configuración de camión:', error);
    res.status(500).json({ error: message });
  }
};

export const eliminarCamion = async (req: AuthenticatedRequest, res: Response) => {
  // Solo admin o ingeniero puede eliminar camiones
  if (req.user.rol !== 'admin' && req.user.rol !== 'ingeniero') {
    return res.status(403).json({ error: 'Solo un administrador puede eliminar camiones' });
  }

  try {
    const { id } = req.params;

    // Verificar si tiene pedidos asociados
    const tienePedidos = await CamionRepository.tienePedidos(Number(id));
    if (tienePedidos) {
      return res.status(400).json({ error: 'No se puede eliminar: el camión tiene pedidos asociados' });
    }

    await CamionRepository.delete(Number(id));
    res.json({ message: 'Camión eliminado correctamente' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    logger.error('Error al eliminar camión:', error);
    res.status(500).json({ error: message });
  }
};