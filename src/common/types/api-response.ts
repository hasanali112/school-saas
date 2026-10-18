export interface PageMeta {
  total: number;
  page: number;
  limit: number;
}

export interface ApiError {
  code: string;
  message: string;
  /** Per-field messages from validation; absent for other errors. */
  details?: string[];
}

/** One envelope for every response, success or failure. */
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: ApiError | null;
  meta?: PageMeta;
}
