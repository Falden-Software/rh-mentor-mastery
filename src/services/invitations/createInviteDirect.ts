
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { sendInvitationEmail } from '@/services/sendgridService';
import { InvitationResult } from './types';

/**
 * Creates a client invitation directly and sends an email
 * This avoids the recursion policy issue by directly inserting to the table
 */
export const createInviteDirect = async (
  email: string,
  name: string,
  mentorId: string
): Promise<InvitationResult> => {
  try {
    if (!email || !name || !mentorId) {
      console.error("Missing required params:", { email, name, mentorId });
      return { 
        success: false, 
        error: 'Email, nome e ID do mentor são obrigatórios' 
      };
    }

    console.log(`Creating client invitation for ${email} with mentor ID ${mentorId}`);
    
    // Generate a new invitation code
    const inviteId = uuidv4();
    const inviteCode = inviteId.substring(0, 8); // First 8 chars of UUID
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now
    
    // Insert the invitation code to the database - especificar role como 'client'
    const { data: invitationData, error: insertError } = await supabase
      .from('invitation_codes')
      .insert({
        id: inviteId,
        code: inviteCode,
        email: email,
        mentor_id: mentorId,
        is_used: false,
        expires_at: expiresAt.toISOString(),
        role: 'client' // Explicitamente definindo como cliente
      })
      .select('*')
      .single();
      
    if (insertError) {
      console.error("Error creating client invitation:", insertError);
      return { 
        success: false, 
        error: insertError.message || 'Erro ao criar convite' 
      };
    }
    
    // Try to get mentor name for the email
    const { data: mentorData } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', mentorId)
      .single();
    
    const mentorName = mentorData?.name || 'Mentor';
    
    // Send invitation email
    const emailResult = await sendInvitationEmail(email, name, mentorName);
    
    if (!emailResult.success) {
      console.error("Failed to send client invitation email:", emailResult);
      return {
        success: true, // Still successful since we created the invite
        message: 'Convite de cliente criado, mas houve um problema ao enviar o email',
        error: emailResult.error,
        id: inviteId
      };
    }
    
    return {
      success: true,
      message: 'Convite de cliente criado e email enviado com sucesso',
      service: emailResult.service,
      id: inviteId
    };
  } catch (error) {
    console.error("Error in createInviteDirect:", error);
    return {
      success: false,
      error: error.message || 'Erro desconhecido ao criar convite de cliente',
      errorDetails: error
    };
  }
};
