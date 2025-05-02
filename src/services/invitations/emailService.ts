
import { supabase } from "@/integrations/supabase/client";
import { InvitationResult } from "./types";

/**
 * Envia um email de convite para um cliente
 * @param email Email do cliente
 * @param clientName Nome do cliente (opcional)
 * @param mentorName Nome do mentor
 * @param inviteCode Código do convite (opcional)
 * @returns Resultado da operação
 */
export const sendInviteEmail = async (
  email: string,
  clientName?: string,
  mentorName?: string,
  inviteCode?: string
): Promise<InvitationResult> => {
  try {
    console.log(`Enviando email para: ${email}`, { clientName, mentorName, inviteCode });
    
    if (!email) {
      return {
        success: false,
        error: "Email do cliente é obrigatório"
      };
    }

    // Preparar os dados para a função de edge
    const payload = {
      email,
      clientName: clientName || email.split('@')[0], // Usar parte do email como nome se não fornecido
      mentorName: mentorName || "Seu Mentor",
      inviteCode: inviteCode || undefined
    };

    // Chamar a função edge para enviar o email
    const { data, error } = await supabase.functions.invoke('send-invite-email', {
      body: payload
    });
    
    if (error || !data?.success) {
      console.error("Erro ao enviar email:", error || data?.error);
      return {
        success: false,
        error: data?.error || error?.message || "Erro desconhecido ao enviar email"
      };
    }
    
    console.log("Email enviado com sucesso:", data);
    return {
      success: true,
      message: "Email enviado com sucesso"
    };
    
  } catch (error: any) {
    console.error("Erro ao enviar email:", error);
    return {
      success: false,
      error: error.message || "Erro desconhecido ao enviar email"
    };
  }
};
