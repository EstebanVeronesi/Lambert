import { Request } from 'express';

export interface JwtUserPayload {
  id: number;
  dni: number;
  nombre: string;
  email: string;
  rol: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Request {
  user: JwtUserPayload;
}
