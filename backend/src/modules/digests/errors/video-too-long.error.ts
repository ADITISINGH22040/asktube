import {HttpException, HttpStatus} from '@nestjs/common';

export class VideoTooLongError extends HttpException {
  constructor(maxVideoLengthMinutes: number) {
    super(
      {
        error: 'VideoTooLongError',
        message: `v1 supports short/medium videos only. Videos longer than ${maxVideoLengthMinutes} minutes are not supported.`,
        maxVideoLengthMinutes
      },
      HttpStatus.BAD_REQUEST
    );
  }
}
