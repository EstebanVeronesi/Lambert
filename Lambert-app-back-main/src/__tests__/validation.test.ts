import { describe, it, expect } from 'vitest';

class Validation {
  static dni(dni: string) {
    if (typeof dni !== 'string' || dni.trim().length < 7) throw new Error('Invalid DNI');
  }

  static nombre(nombre: string) {
    if (typeof nombre !== 'string' || nombre.trim().length < 2) throw new Error('Invalid name');
  }

  static email(email: string) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) throw new Error('Invalid email');
  }

  static password(password: string) {
    if (typeof password !== 'string' || password.length < 6) throw new Error('Invalid password');
  }
}

describe('Validation', () => {
  describe('dni', () => {
    it('rechaza DNI vacio', () => {
      expect(() => Validation.dni('')).toThrow('Invalid DNI');
    });

    it('rechaza DNI menor a 7 caracteres', () => {
      expect(() => Validation.dni('123456')).toThrow('Invalid DNI');
    });

    it('acepta DNI valido de 7 digitos', () => {
      expect(() => Validation.dni('12345678')).not.toThrow();
    });

    it('rechaza DNI que no es string', () => {
      expect(() => Validation.dni(12345678 as unknown as string)).toThrow('Invalid DNI');
    });
  });

  describe('nombre', () => {
    it('rechaza nombre de 1 caracter', () => {
      expect(() => Validation.nombre('A')).toThrow('Invalid name');
    });

    it('acepta nombre valido', () => {
      expect(() => Validation.nombre('Juan')).not.toThrow();
    });

    it('rechaza nombre vacio', () => {
      expect(() => Validation.nombre('')).toThrow('Invalid name');
    });
  });

  describe('email', () => {
    it('rechaza email sin arroba', () => {
      expect(() => Validation.email('invalid')).toThrow('Invalid email');
    });

    it('rechaza email sin dominio', () => {
      expect(() => Validation.email('user@')).toThrow('Invalid email');
    });

    it('acepta email valido', () => {
      expect(() => Validation.email('user@dominio.com')).not.toThrow();
    });
  });

  describe('password', () => {
    it('rechaza password menor a 6 caracteres', () => {
      expect(() => Validation.password('12345')).toThrow('Invalid password');
    });

    it('acepta password valido', () => {
      expect(() => Validation.password('secreto123')).not.toThrow();
    });

    it('rechaza password que no es string', () => {
      expect(() => Validation.password(123456 as unknown as string)).toThrow('Invalid password');
    });
  });
});
