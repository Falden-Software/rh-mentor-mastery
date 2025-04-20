
import { inviteSchema, InviteCreateParams } from './types';
import { ErrorService } from '../errorService';

export const validateInviteData = (params: InviteCreateParams) => {
  if (!params.mentor?.id) {
    throw new Error('Mentor não autenticado');
  }
  
  return inviteSchema.parse({
    email: params.email,
    name: params.name,
    mentor_id: params.mentor.id
  });
};

export const handleValidationError = (error: unknown, params: InviteCreateParams) => {
  if (error instanceof Error) {
    ErrorService.logError('validation_error', error, {
      email: params.email,
      name: params.name,
      mentorId: params.mentor?.id
    });
    
    return {
      success: false,
      error: error.message
    };
  }
  return {
    success: false,
    error: 'Erro de validação desconhecido'
  };
};
