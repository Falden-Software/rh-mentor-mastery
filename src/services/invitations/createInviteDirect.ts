
import { supabase } from "@/integrations/supabase/client";
import { InvitationResult } from "./types";
import { validateInviteData } from "./validation";

/**
 * Creates an invitation directly via the Supabase Auth API
 * This method bypasses the regular flow to avoid RLS recursion issues
 */
export async function createInviteDirect(
  email: string,
  name: string,
  mentorId: string
): Promise<InvitationResult> {
  try {
    // Validate input
    const validateResult = validateInviteData({ email, name, mentor: { id: mentorId } });
    if (!validateResult) {
      return {
        success: false,
        error: "Erro na validação dos dados"
      };
    }

    // Create invitation code in the database
    const inviteId = crypto.randomUUID();
    const inviteCode = inviteId.substring(0, 8).toUpperCase();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 dias a partir de hoje
    
    const { data: inviteData, error: inviteError } = await supabase
      .from('invitation_codes')
      .insert({
        id: inviteId,
        code: inviteCode,
        email: email,
        mentor_id: mentorId,
        is_used: false,
        expires_at: expiresAt.toISOString(),
        role: 'client'
      })
      .select('*')
      .single();
      
    if (inviteError) {
      console.error("Erro ao criar código de convite:", inviteError);
      return {
        success: false,
        error: `Erro ao gerar código de convite: ${inviteError.message}`
      };
    }

    // Generate the client registration URL with mentor_id and email params
    const baseUrl = window.location.origin;
    const registerUrl = `${baseUrl}/client/register?mentor_id=${mentorId}&email=${encodeURIComponent(email)}`;
    
    // Use Supabase Auth invite user API
    const { data: authData, error: authError } = await supabase.auth.admin.inviteUserByEmail(email, {
      redirectTo: registerUrl,
      data: {
        name: name,
        invited_by: mentorId,
        role: 'client'
      }
    });

    if (authError) {
      console.error("Erro ao enviar convite através do Supabase Auth:", authError);
      
      // Usando função edge para envio de email como fallback
      const { data: emailResult, error: emailError } = await supabase.functions.invoke('send-invite-email', {
        body: {
          email: email,
          clientName: name,
          mentorName: 'Seu Mentor', // Aqui idealmente buscaríamos o nome do mentor
          registerUrl: registerUrl
        }
      });
      
      if (emailError) {
        console.error("Erro no fallback de envio de email:", emailError);
        return {
          success: false, 
          error: `Falha ao enviar convite: ${authError.message}`
        };
      }
      
      console.log("Convite enviado via edge function como fallback:", emailResult);
      
      return {
        success: true,
        message: "Convite enviado com sucesso (via método alternativo)",
        service: emailResult?.service || "Edge Function",
        id: inviteData?.id
      };
    }
    
    console.log("Convite enviado com sucesso via Supabase Auth:", authData);
    
    return {
      success: true,
      message: "Convite enviado com sucesso",
      service: "Supabase Auth",
      id: inviteData?.id
    };
  } catch (error: any) {
    console.error("Erro ao criar convite direto:", error);
    return { 
      success: false, 
      error: error.message || "Erro inesperado ao criar convite"
    };
  }
}
