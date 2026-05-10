export abstract class CustomHttpError extends Error {
  statusCode: number = 500;
  message: string = 'Internal Server Error';
  errorData?: any;

  protected constructor() {
    super();
  }
}
