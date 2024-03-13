/**
 * Caso um usuário tente realizar uma ação proíbida, como acessar uma
 * determinada rota ou modificar um valor, devido a não ter uma função que
 * esteja autorizada para tal ação.
 */
export class NotAuthorizedError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = 'NotAuthorizedError';
  }
}