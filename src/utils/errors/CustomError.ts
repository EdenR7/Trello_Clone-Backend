export class CustomError extends Error {
  constructor(public name: string, message: string) {
    super(message);
    this.name = name;
    Error.captureStackTrace(this, this.constructor);
  }
}
