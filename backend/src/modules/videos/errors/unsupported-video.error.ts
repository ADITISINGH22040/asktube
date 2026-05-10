import {CustomHttpError} from '../../../common/errors/custom.error';

export class UnsupportedVideoError extends CustomHttpError {
  constructor(url: string) {
    super();
    this.message = `Unsupported video format or invalid URL: ${url}`;
    this.statusCode = 400;
  }
}
