import {NotAuthorizedError} from './NotAuthorizedError';

export class PermissionError extends NotAuthorizedError {
  constructor(msg: string) {
    super(msg);
    this.name = 'PermissionError';
  }
}