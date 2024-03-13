/**
 * Dados informados para uma requisição no banco de dados são incompatíveis
 * ou inválidos.
 */
export class QueryError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = 'QueryError';
  }
}