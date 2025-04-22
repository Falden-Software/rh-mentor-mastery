
// Define error types that can be logged by the system
export type ErrorType = 
  | 'auth_error' 
  | 'database_error' 
  | 'function_error'
  | 'invitation_error'
  | 'invitation_resend_error'  // Add this new error type
  | 'email_error'
  | 'api_error'
  | 'validation_error'
  | 'unknown_error';

export class ErrorService {
  static logError(type: ErrorType, error: any, metadata?: any) {
    console.error(`[${type}] Error:`, error);
    if (metadata) {
      console.error('Error metadata:', metadata);
    }
    
    // Here we could implement more sophisticated error logging
    // such as sending to a logging service
  }
}
