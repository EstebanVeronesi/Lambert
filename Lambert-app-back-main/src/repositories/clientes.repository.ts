import { pool } from '../../db';
import logger from '../utils/logger';

export interface ClienteRow {
  cuit: number;
  razon_social: string;
}

export class ClientesRepository {
  static async findAll(): Promise<ClienteRow[]> {
    try {
      const query = `
        SELECT cuit, razon_social
        FROM cliente
        ORDER BY razon_social;
      `;
      const result = await pool.query(query);
      return result.rows;
    } catch (error: unknown) {
      logger.error("Error al buscar clientes:", error);
      throw new Error("No se pudo obtener la lista de clientes.");
    }
  }

  static async tienePedidos(cuit: number): Promise<boolean> {
    try {
      const result = await pool.query(
        `SELECT EXISTS(
          SELECT 1 FROM pedido WHERE fk_id_cliente = $1
          UNION ALL
          SELECT 1 FROM proyecto_modificado WHERE fk_id_cliente = $1
        )`,
        [cuit]
      );
      return result.rows[0].exists;
    } catch (error: unknown) {
      logger.error(`Error al verificar pedidos del cliente CUIT ${cuit}:`, error);
      throw new Error('No se pudo verificar los pedidos del cliente');
    }
  }

  static async delete(cuit: number): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('DELETE FROM cliente WHERE cuit = $1', [cuit]);
    } catch (error: unknown) {
      logger.error(`Error al eliminar cliente CUIT ${cuit}:`, error);
      throw new Error('No se pudo eliminar el cliente');
    } finally {
      client.release();
    }
  }

  static async create(cuit: number, razon_social: string): Promise<ClienteRow> {
    try {
      const query = `
        INSERT INTO cliente (cuit, razon_social)
        VALUES ($1, $2)
        ON CONFLICT (cuit) DO UPDATE SET razon_social = EXCLUDED.razon_social
        RETURNING cuit, razon_social;
      `;
      const result = await pool.query(query, [cuit, razon_social]);
      return result.rows[0];
    } catch (error: unknown) {
      logger.error("Error al crear cliente:", error);
      throw new Error("No se pudo crear el cliente.");
    }
  }
}
