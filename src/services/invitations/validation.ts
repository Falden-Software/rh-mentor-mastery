
import { AuthUser } from '@/lib/authTypes';
import { InviteCreateParams } from './types';
import { ErrorService } from '../errorService';

export const validateInviteData = (params: InviteCreateParams) => {
  // Check if email is valid
  if (!params.email || typeof params.email !== 'string' || !params.email.trim()) {
    throw new Error('Email é obrigatório');
  }
  
  // Check if name is valid
  if (!params.name || typeof params.name !== 'string' || !params.name.trim()) {
    throw new Error('Nome é obrigatório');
  }
  
  // Check if mentor is valid
  if (!params.mentor || !params.mentor.id) {
    throw new Error('Mentor não autenticado');
  }
  
  return {
    email: params.email.trim(),
    name: params.name.trim(),
    mentor_id: params.mentor.id
  };
};

export const handleValidationError = (error: unknown, params: any) => {
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
