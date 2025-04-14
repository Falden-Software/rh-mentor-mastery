
import { supabase } from "@/integrations/supabase/client";
import { AuthUser } from "@/lib/authTypes";
import { addDays } from "date-fns";

/**
 * Creates an invitation for a new client and sends an email
 */
export const createClientInvitation = async (
  clientEmail: string,
  clientName: string,
  mentor: AuthUser | null
) => {
  try {
    if (!mentor || !mentor.id) {
      throw new Error("Mentor não autenticado");
    }

    // Gerar convite
    const expirationDate = addDays(new Date(), 7).toISOString();
    
    // Verificar se já existe um convite para este email
    const { data: existingInvite, error: checkError } = await supabase
      .from('invitation_codes')
      .select('id')
      .eq('email', clientEmail)
      .eq('mentor_id', mentor.id)
      .maybeSingle();
      
    if (checkError) {
      console.error("Erro ao verificar convite existente:", checkError);
      return { success: false, error: "Erro ao verificar convite existente" };
    }
    
    let inviteId;
    
    // Atualizar convite existente ou criar novo
    if (existingInvite) {
      const { error: updateError } = await supabase
        .from('invitation_codes')
        .update({
          is_used: false,
          expires_at: expirationDate
        })
        .eq('id', existingInvite.id);
        
      if (updateError) {
        console.error("Erro ao atualizar convite:", updateError);
        return { success: false, error: "Erro ao atualizar convite" };
      }
      
      inviteId = existingInvite.id;
    } else {
      // Create new invitation with a generated code
      const code = Math.random().toString(36).substring(2, 10);
      const { data, error } = await supabase
        .from('invitation_codes')
        .insert({
          code,
          mentor_id: mentor.id,
          email: clientEmail,
          is_used: false,
          expires_at: expirationDate
        })
        .select('id')
        .single();
        
      if (error) {
        console.error("Erro ao criar convite:", error);
        return { success: false, error: "Erro ao criar convite" };
      }
      
      inviteId = data.id;
    }
    
    // Enviar email de convite
    const emailResult = await sendInviteEmail(clientEmail, clientName, mentor.name);
    
    if (!emailResult.success) {
      console.error("Erro ao enviar email:", emailResult.error);
      
      // Return a more specific error message about API keys if that's the issue
      if (emailResult.error && 
          (emailResult.error.includes('API key') || 
           emailResult.error.includes('Configuração de e-mail') || 
           emailResult.error.includes('ausente'))) {
        return { 
          success: false, 
          error: "Configuração de email ausente. Contate o administrador do sistema para configurar a chave de API do Resend.",
          isApiKeyError: true
        };
      }
      
      // Check if the error is related to domain verification
      if (emailResult.error && 
          (emailResult.error.includes('domain') || 
           emailResult.error.includes('verify') ||
           emailResult.error.includes('validation_error'))) {
        return { 
          success: false, 
          error: "É necessário verificar um domínio no Resend para enviar emails. Acesse https://resend.com/domains",
          isDomainError: true
        };
      }
      
      return { success: false, error: emailResult.error || "Erro ao enviar email" };
    }
    
    // Check if in test mode and actual recipient is different from intended
    if (emailResult.isTestMode && emailResult.actualRecipient !== clientEmail) {
      return { 
        success: true, 
        message: "Convite criado com sucesso, mas o email foi enviado para o proprietário da conta Resend (modo de teste)",
        isTestMode: true,
        actualRecipient: emailResult.actualRecipient,
        intendedRecipient: clientEmail
      };
    }
    
    return { 
      success: true, 
      message: "Convite enviado com sucesso" 
    };
    
  } catch (error) {
    console.error("Erro ao criar convite:", error);
    return { success: false, error: "Erro interno ao criar convite" };
  }
};

/**
 * Sends an invitation email to a client
 */
export const sendInviteEmail = async (
  clientEmail: string,
  clientName?: string,
  mentorName?: string
) => {
  try {
    // Chamar a Edge Function para enviar o email
    const { data, error } = await supabase.functions.invoke('send-invite-email', {
      body: {
        email: clientEmail,
        clientName: clientName || 'Cliente',
        mentorName: mentorName || 'Mentor',
        mentorCompany: 'RH Mentor Mastery'
      }
    });
    
    if (error) {
      console.error("Erro na edge function:", error);
      return { success: false, error: "Erro ao enviar email: " + error.message };
    }
    
    if (!data || !data.success) {
      const errorMsg = data?.error || "Resposta inválida do servidor";
      console.error("Erro detalhado:", data?.details || "Sem detalhes adicionais");
      
      // Check if the error is related to API keys
      if (errorMsg.includes('API key') || 
          errorMsg.includes('Configuração de e-mail ausente') || 
          errorMsg.includes('ausente')) {
        console.error("Erro de configuração de API:", errorMsg);
        return { 
          success: false, 
          error: "Configuração de email ausente. Contate o administrador do sistema para configurar a chave de API do Resend.",
          isApiKeyError: true
        };
      }
      
      // Check if the error is related to domain verification
      if (errorMsg.includes('domain') || 
          errorMsg.includes('verify') ||
          errorMsg.includes('validation_error')) {
        console.error("Erro de verificação de domínio:", errorMsg);
        return { 
          success: false, 
          error: "É necessário verificar um domínio no Resend para enviar emails.",
          isDomainError: true
        };
      }
      
      console.error("Erro do serviço de email:", errorMsg);
      return { success: false, error: errorMsg };
    }
    
    // Pass along the test mode information if it exists
    if (data.isTestMode) {
      return { 
        success: true,
        isTestMode: true,
        actualRecipient: data.actualRecipient,
        intendedRecipient: data.intendedRecipient
      };
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("Erro ao enviar email:", error);
    
    // Check if the error is related to API keys
    if (error.message && 
        (error.message.includes('API key') || 
         error.message.includes('Configuração de e-mail') ||
         error.message.includes('ausente'))) {
      return { 
        success: false, 
        error: "Configuração de email ausente. Contate o administrador do sistema para configurar a chave de API do Resend.",
        isApiKeyError: true
      };
    }
    
    // Check if the error is related to domain verification
    if (error.message && 
        (error.message.includes('domain') || 
         error.message.includes('verify') ||
         error.message.includes('validation_error'))) {
      return { 
        success: false, 
        error: "É necessário verificar um domínio no Resend para enviar emails.",
        isDomainError: true
      };
    }
    
    return { success: false, error: "Erro interno ao enviar email" };
  }
};
