import { PostgrestError } from '@supabase/supabase-js';

interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
}

const defaultOptions: Required<RetryOptions> = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 5000,
  backoffFactor: 2,
};

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...defaultOptions, ...options };
  let lastError: Error | null = null;
  let delay = opts.initialDelay;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;

      if (error?.code === 'PGRST116' || error?.message?.includes('JSON object requested')) {
        throw error;
      }

      if (attempt === opts.maxAttempts) {
        throw lastError;
      }

      await new Promise(resolve => setTimeout(resolve, delay));
      delay = Math.min(delay * opts.backoffFactor, opts.maxDelay);
    }
  }

  throw lastError;
}

export function isNetworkError(error: any): boolean {
  return error instanceof TypeError && error.message === 'Failed to fetch';
}

export function isPostgrestError(error: any): error is PostgrestError {
  return error?.code !== undefined && typeof error.message === 'string';
}

export function getErrorMessage(error: any): string {
  if (isNetworkError(error)) {
    return 'Erro de conexão. Verifique sua internet e tente novamente.';
  }

  if (isPostgrestError(error)) {
    if (error.code === 'PGRST116') {
      return 'Registro não encontrado.';
    }
    return 'Erro ao acessar o banco de dados. Tente novamente.';
  }

  return 'Ocorreu um erro inesperado. Tente novamente.';
}