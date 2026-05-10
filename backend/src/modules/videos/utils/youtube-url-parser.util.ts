export class YouTubeUrlParser {
  private static readonly YOUTUBE_URL_PATTERNS = [
    // Standard YouTube URLs
    /^https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /^https?:\/\/(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /^https?:\/\/(?:www\.)?youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
    /^https?:\/\/youtu\.be\/([a-zA-Z0-9_-]{11})/,
    // Short URLs
    /^https?:\/\/(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    // Mobile URLs
    /^https?:\/\/m\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    // TV URLs
    /^https?:\/\/(?:www\.)?youtube\.com\/tv\/#\/watch\?v=([a-zA-Z0-9_-]{11})/,
    // Additional patterns
    /^https?:\/\/(?:www\.)?youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
  ];

  static extractYoutubeId(url: string): string {
    // Handle direct video ID input
    if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) {
      return url.trim();
    }

    // Try to match against all URL patterns
    for (const pattern of this.YOUTUBE_URL_PATTERNS) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    // Try to extract from URL parameters as fallback
    try {
      const urlObj = new URL(url);
      const videoId = urlObj.searchParams.get('v');
      if (videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
        return videoId;
      }
    } catch {
      // Invalid URL format
    }

    throw new Error(`Unable to extract YouTube video ID from URL: ${url}`);
  }

  static isValidYouTubeUrl(url: string): boolean {
    try {
      this.extractYoutubeId(url);
      return true;
    } catch {
      return false;
    }
  }
}
