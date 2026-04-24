// Generic API response interface
export interface ApiResponse<T = any> {
  message: string;
  data?: T;
}

// Generic error response interface
export interface ApiErrorResponse {
  message: string;
  data?: {
    error?: string[];
    trace?: string;
    method?: string;
    path?: string;
  };
}

// Pagination interface
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Paginated response interface
export interface ApiPaginatedResponse<T> {
  message: string;
  data: T[];
  meta: PaginationMeta;
}

// Validation error interface
export interface ApiValidationError {
  field: string;
  message: string;
}

// Validation error response
export interface ApiValidationErrorResponse {
  message: string;
  data: {
    error: ApiValidationError[];
  };
}
