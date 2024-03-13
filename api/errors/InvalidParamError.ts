/**
 * O parâmetro passado não atende aos requerimentos exigidos.
 */
export class InvalidParamError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = 'InvalidParamError';
  }
}