
import { supabase } from "@/integrations/supabase/client";
import { InvitationResult } from "./types";

/**
 * Envia um email de convite para um cliente
 * @param email Email do cliente a ser convidado
 * @param clientName Nome do cliente (opcional)
 * @param mentorName Nome do mentor que está enviando o convite
 * @param inviteCode Código do convite
 * @returns Resultado da operação
 */
export const sendInviteEmail = async (
  email: string,
  clientName?: string | null,
  mentorName?: string | null,
  inviteCode?: string | null
): Promise<InvitationResult> => {
  try {
    if (!email) {
      return { success: false, error: "Email do destinatário não fornecido" };
    }

    const name = clientName || email.split('@')[0];
    const mentor = mentorName || "Seu mentor";
    
    // Base URL - verificar ambiente
    const baseUrl = window.location.origin;
    const registrationUrl = inviteCode 
      ? `${baseUrl}/client/register?token=${inviteCode}&email=${encodeURIComponent(email)}`
      : `${baseUrl}/client/register?email=${encodeURIComponent(email)}`;
    
    console.log(`Enviando email para ${email} com URL de registro: ${registrationUrl}`);

    const { data, error } = await supabase.functions.invoke('send-invite-email', {
      body: {
        to: email,
        name: name,
        mentor: mentor,
        registrationUrl: registrationUrl
      }
    });

    if (error) {
      console.error("Erro ao enviar email de convite:", error);
      return {
        success: false,
        error: `Erro ao enviar email: ${error.message}`
      };
    }

    if (!data || !data.success) {
      const errorMessage = data?.error || "Erro desconhecido ao enviar email";
      console.error("Falha no serviço de email:", errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    }

    return {
      success: true,
      message: `Email de convite enviado com sucesso para ${email}`
    };
  } catch (error: any) {
    console.error("Exceção ao enviar email:", error);
    return {
      success: false,
      error: error.message || "Erro desconhecido ao processar o envio"
    };
  }
};
