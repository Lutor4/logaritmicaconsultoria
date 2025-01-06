import { AUTH_ERRORS } from './constants';

export function getAuthErrorMessage(error: any): string {
  if (!error) return '';
  
  const message = error.message?.toLowerCase() || '';
  
  if (message.includes('invalid login credentials')) {
    return AUTH_ERRORS.INVALID_CREDENTIALS;
  }
  
  if (message.includes('network') || message.includes('fetch')) {
    return AUTH_ERRORS.NETWORK_ERROR;
  }

  if (message.includes('password')) {
    return AUTH_ERRORS.PASSWORD_TOO_SHORT;
  }

  if (message.includes('email')) {
    return AUTH_ERRORS.INVALID_EMAIL;
  }
  
  return AUTH_ERRORS.DEFAULT;
}