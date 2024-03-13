/**
 * Token de uma requisição não é mais válida ou não existe. Não abrange erros
 * partidos de um JWT.
 */
export class TokenError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = 'TokenError';
  }
}