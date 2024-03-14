export class loginError extends Error {
    constructor(msg: string) {
      super(msg);
      this.name = 'loginError';
    }
  }