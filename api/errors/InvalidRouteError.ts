/**
 * Caso uma rota inválida ou inapropriada esteja sendo acessada.
 */
export class InvalidRouteError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = 'InvalidRouteError';
  }
}
