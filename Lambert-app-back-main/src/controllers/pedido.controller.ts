import { Response } from 'express';
import { AuthenticatedRequest } from '../types/express.types';
import { ProyectoRepository } from '../repositories/proyecto.repository';
import logger from '../utils/logger';

// Listar Pedidos (Inteligente: Admin ve todo, Vendedor ve lo suyo)
export const listarPedidos = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // 1. Obtenemos el usuario del token
    const usuario = req.user; 
    
    // Debug: para que veas en consola quién está pidiendo los datos
    logger.info("Usuario solicitante:", usuario);

    let pedidos;

    // 2. Verificamos Rol
    if (usuario.rol === 'admin' || usuario.rol === 'ingeniero') {
      // Si es Jefe/Ingeniero, ve TODO
      pedidos = await ProyectoRepository.findAll();
    } else {
      // Si es Vendedor, filtramos usando su DNI (que está en usuario.id)
      if (!usuario.id) {
         return res.status(400).json({ error: "Token inválido: falta identificación de usuario." });
      }
      
      logger.info(`Filtrando pedidos para el vendedor DNI: ${usuario.id}`);
      pedidos = await ProyectoRepository.findByVendedor(String(usuario.id));
    }

    res.json(pedidos);

  } catch (error: unknown) {
    logger.error("Error en listarPedidos:", error);
    const message = error instanceof Error ? error.message : 'Error al obtener la lista de pedidos';
    res.status(500).json({ error: message });
  }
};

export const actualizarPedido = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    // El frontend debe enviar si es modificado o no para saber qué tabla tocar
    const { es_modificado, ...datosAActualizar } = req.body;

    if (es_modificado === undefined) {
      return res.status(400).json({ error: "Se requiere el campo 'es_modificado' (true/false)" });
    }

    const resultado = await ProyectoRepository.updatePedido(Number(id), es_modificado, datosAActualizar);
    res.json(resultado);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({ error: message });
  }
};

// --- NUEVO: Obtener un solo pedido por ID ---
export const obtenerPedido = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { es_modificado } = req.query; // Leemos el query param ?es_modificado=true/false
  
      if (es_modificado === undefined) {
        return res.status(400).json({ error: "Falta el parámetro query 'es_modificado' (true/false)" });
      }
  
      const isMod = String(es_modificado) === 'true';
      const pedido = await ProyectoRepository.findById(Number(id), isMod);
  
      if (!pedido) {
        return res.status(404).json({ error: 'Pedido no encontrado' });
      }
  
      res.json(pedido);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({ error: message });
    }
  };

export const eliminarPedido = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { es_modificado } = req.body;
    const usuario = req.user;

    if (es_modificado === undefined || es_modificado === null) {
      return res.status(400).json({ error: "Se requiere el campo 'es_modificado' (true/false)" });
    }

    // Si NO es admin ni ingeniero, verificar que el pedido le pertenece
    if (usuario.rol !== 'admin' && usuario.rol !== 'ingeniero') {
      const pedido = await ProyectoRepository.findById(Number(id), Boolean(es_modificado));
      if (!pedido) {
        return res.status(404).json({ error: 'Pedido no encontrado' });
      }
      const pedidosDelUsuario = await ProyectoRepository.findByVendedor(String(usuario.id));
      const esPropietario = pedidosDelUsuario.some((p: { id: number }) => p.id === Number(id));
      if (!esPropietario) {
        return res.status(403).json({ error: 'No tenés permiso para eliminar este pedido' });
      }
    }

    await ProyectoRepository.delete(Number(id), Boolean(es_modificado));
    res.json({ message: 'Pedido eliminado correctamente' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al eliminar';
    res.status(500).json({ error: message });
  }
};