import {CustomHttpError} from '../../../common/errors/custom.error';

export class TranscriptNotFoundError extends CustomHttpError {
  constructor(videoId: string) {
    super();
    this.message = `No transcript available for video ${videoId}. The video may not have captions enabled.`;
    this.statusCode = 422;
  }
}
