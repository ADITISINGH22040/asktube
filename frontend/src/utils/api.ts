import type {
  ImportVideoRequest,
  ImportVideoResponse,
  CreateDigestResponse,
  AskVideoRequest,
  AskVideoResponse
} from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

class ApiError extends Error {
  status?: number;
  details?: any;

  constructor(
    message: string,
    status?: number,
    details?: any
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      let errorDetails: any;
      try {
        errorDetails = await response.json();
      } catch {
        errorDetails = { message: 'Unknown error' };
      }

      throw new ApiError(
        errorDetails.message || `HTTP ${response.status}`,
        response.status,
        errorDetails
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiError('Network error. Please check your connection and ensure the backend server is running.');
    }
    
    throw new ApiError('An unexpected error occurred');
  }
}

export const api = {
  // Import YouTube video
  importVideo: (data: ImportVideoRequest): Promise<ImportVideoResponse> => {
    return apiRequest<ImportVideoResponse>('/videos/import', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Generate video digest
  createDigest: (videoId: number): Promise<CreateDigestResponse> => {
    return apiRequest<CreateDigestResponse>(`/videos/${videoId}/digest`, {
      method: 'POST',
    });
  },

  // Ask question about video
  askVideo: (videoId: number, data: AskVideoRequest): Promise<AskVideoResponse> => {
    return apiRequest<AskVideoResponse>(`/videos/${videoId}/ask`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

export { ApiError };
