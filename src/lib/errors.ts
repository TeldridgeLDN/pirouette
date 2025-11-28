/**
 * Error Handling Utilities
 * 
 * Centralised error handling for API routes and client-side operations.
 * Provides consistent error responses and logging.
 */

import { NextResponse } from 'next/server';

// ============================================================================
// Error Types
// ============================================================================

/**
 * Application Error - Base class for all app errors
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    
    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace(this, this.constructor);
    
    // Set prototype explicitly for instanceof to work
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Validation Error - 400 Bad Request
 */
export class ValidationError extends AppError {
  public readonly fields?: Record<string, string>;
  
  constructor(message: string, fields?: Record<string, string>) {
    super(message, 400, 'VALIDATION_ERROR');
    this.fields = fields;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Authentication Error - 401 Unauthorized
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

/**
 * Authorization Error - 403 Forbidden
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'You do not have permission to perform this action') {
    super(message, 403, 'AUTHORIZATION_ERROR');
    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}

/**
 * Not Found Error - 404
 */
export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * Rate Limit Error - 429 Too Many Requests
 */
export class RateLimitError extends AppError {
  public readonly resetAt?: Date;
  
  constructor(message: string = 'Rate limit exceeded', resetAt?: Date) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
    this.resetAt = resetAt;
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

/**
 * External Service Error - 502 Bad Gateway
 */
export class ExternalServiceError extends AppError {
  public readonly service: string;
  
  constructor(service: string, message?: string) {
    super(
      message || `External service error: ${service}`,
      502,
      'EXTERNAL_SERVICE_ERROR'
    );
    this.service = service;
    Object.setPrototypeOf(this, ExternalServiceError.prototype);
  }
}

// ============================================================================
// API Response Helpers
// ============================================================================

/**
 * Standard API Response Interface
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
    fields?: Record<string, string>;
    resetAt?: string;
  };
}

/**
 * Create a success response
 */
export function successResponse<T>(data: T, status: number = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    { success: true, data },
    { status }
  );
}

/**
 * Create an error response from an Error object
 */
export function errorResponse(error: unknown): NextResponse<ApiResponse> {
  // Handle known error types
  if (error instanceof AppError) {
    const response: ApiResponse = {
      success: false,
      error: {
        message: error.message,
        code: error.code,
      },
    };
    
    // Add validation fields if present
    if (error instanceof ValidationError && error.fields) {
      response.error!.fields = error.fields;
    }
    
    // Add rate limit reset time if present
    if (error instanceof RateLimitError && error.resetAt) {
      response.error!.resetAt = error.resetAt.toISOString();
    }
    
    return NextResponse.json(response, { status: error.statusCode });
  }
  
  // Handle standard Error objects
  if (error instanceof Error) {
    // Log unexpected errors
    console.error('Unexpected error:', error);
    
    // Don't expose error details in production
    const message = process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : error.message;
    
    return NextResponse.json(
      {
        success: false,
        error: {
          message,
          code: 'INTERNAL_ERROR',
        },
      },
      { status: 500 }
    );
  }
  
  // Handle unknown error types
  console.error('Unknown error type:', error);
  
  return NextResponse.json(
    {
      success: false,
      error: {
        message: 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR',
      },
    },
    { status: 500 }
  );
}

// ============================================================================
// Error Logging
// ============================================================================

/**
 * Log error with context
 */
export function logError(
  error: unknown,
  context?: {
    userId?: string;
    route?: string;
    action?: string;
    metadata?: Record<string, unknown>;
  }
): void {
  const timestamp = new Date().toISOString();
  
  const logEntry = {
    timestamp,
    ...context,
    error: error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...(error instanceof AppError && {
        code: error.code,
        statusCode: error.statusCode,
        isOperational: error.isOperational,
      }),
    } : {
      value: String(error),
    },
  };
  
  // In development, log to console
  if (process.env.NODE_ENV === 'development') {
    console.error('[Error]', JSON.stringify(logEntry, null, 2));
  } else {
    // In production, log JSON for structured logging
    console.error(JSON.stringify(logEntry));
    
    // TODO: Send to error tracking service (Sentry, etc.)
    // sendToErrorTracker(logEntry);
  }
}

// ============================================================================
// Error Handling Wrapper
// ============================================================================

/**
 * Wrap an async route handler with error handling
 */
export function withErrorHandling<T extends unknown[], R>(
  handler: (...args: T) => Promise<NextResponse<R>>
) {
  return async (...args: T): Promise<NextResponse<R | ApiResponse>> => {
    try {
      return await handler(...args);
    } catch (error) {
      logError(error);
      return errorResponse(error) as NextResponse<ApiResponse>;
    }
  };
}

// ============================================================================
// Client-Side Error Helpers
// ============================================================================

/**
 * Check if an error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError) {
    return error.message.includes('fetch') || error.message.includes('network');
  }
  return false;
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }
  
  if (isNetworkError(error)) {
    return 'Network error. Please check your connection and try again.';
  }
  
  if (error instanceof Error) {
    // Don't expose technical errors to users
    return 'Something went wrong. Please try again.';
  }
  
  return 'An unexpected error occurred.';
}

/**
 * Parse API error response
 */
export async function parseApiError(response: Response): Promise<string> {
  try {
    const data = await response.json();
    return data.error?.message || `Request failed with status ${response.status}`;
  } catch {
    return `Request failed with status ${response.status}`;
  }
}

