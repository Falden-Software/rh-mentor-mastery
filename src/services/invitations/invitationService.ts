
import { supabase } from "@/lib/supabase/client";
import { AuthUser } from '@/lib/authTypes';
import { v4 as uuidv4 } from 'uuid';

export class InvitationService {
  static async createInvitation(email: string, name: string, mentor: AuthUser | null) {
    try {
      if (!email || !name || !mentor?.id) {
        throw new Error("Email, nome e ID do mentor são obrigatórios");
      }
      
      // Check for existing pending invites
      const { data: existingInvites, error: checkError } = await supabase
        .from('invitation_codes')
        .select('*')
        .eq('email', email)
        .eq('mentor_id', mentor.id)
        .is('used_by', null);
        
      if (checkError) {
        console.error("Erro ao verificar convites existentes:", checkError);
        throw new Error("Erro ao verificar convites existentes");
      }
      
      if (existingInvites && existingInvites.length > 0) {
        throw new Error("Já existe um convite pendente para este email");
      }

      // Create new invitation with required code field
      const inviteCode = uuidv4();
      const { error: insertError } = await supabase
        .from('invitation_codes')
        .insert({
          id: inviteCode,
          code: inviteCode.substring(0, 8), // Generate a shorter code from the UUID
          email,
          mentor_id: mentor.id,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        });

      if (insertError) {
        console.error("Erro ao criar convite:", insertError);
        throw new Error("Erro ao criar convite no banco de dados");
      }

      // Send invitation email
      const { data: emailResult, error: emailError } = await supabase.functions.invoke(
        'send-invite-email',
        {
          body: {
            email,
            clientName: name,
            mentorName: mentor.name,
            mentorCompany: mentor.company || 'RH Mentor Mastery',
            registerUrl: `${window.location.origin}/register?type=client&email=${encodeURIComponent(email)}`
          }
        }
      );

      if (emailError || !emailResult?.success) {
        console.error("Erro ao enviar email:", emailError || emailResult?.error);
        throw new Error(emailResult?.error || "Erro ao enviar email de convite");
      }

      return {
        success: true,
        message: "Convite enviado com sucesso",
        service: emailResult.service,
        id: emailResult.id
      };
      
    } catch (error: any) {
      console.error("Erro no serviço de convites:", error);
      return {
        success: false,
        error: error.message,
        errorDetails: error,
        isDomainError: error.message?.includes('domain'),
        isApiKeyError: error.message?.includes('API key')
      };
    }
  }

  static async resendInvitation(inviteId: string, mentorId: string) {
    try {
      const { data: invite, error: fetchError } = await supabase
        .from('invitation_codes')
        .select('*, mentor:profiles!invitation_codes_mentor_id_fkey(*)')
        .eq('id', inviteId)
        .eq('mentor_id', mentorId)
        .single();

      if (fetchError || !invite) {
        throw new Error("Convite não encontrado");
      }

      // Update invitation expiry
      const { error: updateError } = await supabase
        .from('invitation_codes')
        .update({
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        })
        .eq('id', inviteId);

      if (updateError) {
        throw new Error("Erro ao atualizar convite");
      }

      // Resend email - using optional chaining for properties that might not exist
      const { data: emailResult, error: emailError } = await supabase.functions.invoke(
        'send-invite-email',
        {
          body: {
            email: invite.email,
            clientName: invite.email.split('@')[0], // Fallback if name doesn't exist
            mentorName: invite.mentor?.name || 'Mentor',
            mentorCompany: invite.mentor?.company || 'RH Mentor Mastery',
            registerUrl: `${window.location.origin}/register?type=client&email=${encodeURIComponent(invite.email)}`
          }
        }
      );

      if (emailError || !emailResult?.success) {
        throw new Error(emailResult?.error || "Erro ao reenviar email");
      }

      return {
        success: true,
        message: "Convite reenviado com sucesso",
        service: emailResult.service
      };
      
    } catch (error: any) {
      console.error("Erro ao reenviar convite:", error);
      return {
        success: false,
        error: error.message,
        errorDetails: error,
        isSmtpError: false,
        isDomainError: false
      };
    }
  }
}
