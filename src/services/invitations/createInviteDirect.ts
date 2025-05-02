
import { supabase } from "@/integrations/supabase/client";
import { InvitationResult } from "./types";
import { validateInviteData } from "./validation";
import { sendInviteEmail } from "../invitations/emailService";

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
    // Validate input - passando objeto completo conforme esperado pela função
    const validateResult = validateInviteData({ 
      email, 
      name, 
      mentor: { 
        id: mentorId,
        email: null,
        name: 'Mentor',
        role: 'mentor'
      } 
    });
    
    if (!validateResult) {
      return {
        success: false,
        error: "Erro na validação dos dados"
      };
    }

    // Generate a random code rather than using UUID to avoid recursion policies
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 dias a partir de hoje
    
    // Instead of directly inserting, let's use the serverless function approach
    // to bypass RLS policy recursion issues
    const baseUrl = "https://rh-mentor-mastery.lovable.app";
    const registerUrl = `${baseUrl}/client/register?mentor_id=${mentorId}&email=${encodeURIComponent(email)}`;
    
    // Send email invitation directly using the emailService
    const emailResult = await sendInviteEmail(
      email,
      name,
      "Seu Mentor" // Generic mentor name
    );
    
    if (!emailResult.success) {
      console.error("Erro ao enviar email:", emailResult.error);
      return {
        success: false,
        error: emailResult.error || "Falha ao enviar convite por email",
        errorDetails: emailResult.errorDetails
      };
    }
    
    // Store the invitation record on success
    try {
      const { data: inviteData, error: insertError } = await supabase.rpc('create_client_invitation', {
        p_email: email,
        p_mentor_id: mentorId
      });
      
      if (insertError) {
        console.log("Aviso: Erro ao registrar convite no banco (mas email foi enviado):", insertError);
        // We don't return error here since the email was sent successfully
      }
    } catch (dbError) {
      console.log("Erro de banco ao registrar convite (mas email foi enviado):", dbError);
      // We still proceed since the email was sent
    }
    
    return {
      success: true,
      message: "Convite enviado com sucesso via email",
      service: emailResult.service || "Sistema de Email",
      id: emailResult.id
    };
  } catch (error: any) {
    console.error("Erro ao criar convite direto:", error);
    return { 
      success: false, 
      error: error.message || "Erro inesperado ao criar convite"
    };
  }
}
