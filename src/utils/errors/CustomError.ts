export class CustomError extends Error {
  public customStatusCode: number;

  constructor(
    public message: string,
    customStatusCode: number,
    name: string = "App Error",
  ) {
    super(message);
    this.customStatusCode = customStatusCode;
    this.name = name;
    Error.captureStackTrace(this, this.constructor);
  }
}
