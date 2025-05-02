
import { corsHeaders, InviteEmailData } from './types.ts';
import { sendWithGoDaddy } from './emailServices.ts';
import { buildInviteEmailHtml } from './emailBuilder.ts';
import { createErrorResponse } from './errorHandler.ts';
import { createSuccessResponse } from './responseFormatter.ts';

export const handleInviteEmailRequest = async (req: Request): Promise<Response> => {
  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ success: false, error: 'Método não permitido' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const rawData = await req.json();
    console.log("Dados brutos recebidos:", JSON.stringify(rawData));
    
    // Extract email from multiple possible fields and trim whitespace
    const email = (rawData.email || rawData.to || '').trim();
    
    const data: InviteEmailData = {
      email: email,
      clientName: rawData.clientName || rawData.client_name || '',
      mentorName: rawData.mentorName || rawData.mentor_name || 'Seu mentor',
      mentorCompany: rawData.mentorCompany || rawData.mentor_company || 'RH Mentor Mastery'
    };
    
    console.log("Dados normalizados:", JSON.stringify(data));
    
    if (!data.email) {
      const errorMsg = 'Email address is required but missing';
      console.error(errorMsg, { dados_recebidos: rawData });
      return createErrorResponse(errorMsg, rawData);
    }

    // Verificar as credenciais SMTP
    const smtpUsername = Deno.env.get('SMTP_USERNAME');
    const smtpPassword = Deno.env.get('SMTP_PASSWORD');
    
    console.log("Verificação de credenciais SMTP:", {
      usernameExiste: Boolean(smtpUsername),
      passwordExiste: Boolean(smtpPassword),
      usernameLength: smtpUsername ? smtpUsername.length : 0,
      passwordLength: smtpPassword ? smtpPassword.length : 0
    });
    
    if (!smtpUsername || !smtpPassword) {
      console.error('Credenciais SMTP não configuradas nas variáveis de ambiente');
      return createErrorResponse(
        'Configuração de e-mail ausente. Contate o administrador do sistema.',
        { smtpMissing: !smtpUsername ? 'username' : 'password' },
        true
      );
    }
    
    const htmlContent = buildInviteEmailHtml(data.clientName, data.mentorName, data.mentorCompany);
    
    console.log(`Enviando e-mail para ${data.email}`);
    
    try {
      console.log("Iniciando envio via GoDaddy SMTP");
      const emailResult = await sendWithGoDaddy(
        data.email, 
        `Convite para RH Mentor Mastery de ${data.mentorCompany}`,
        htmlContent,
        smtpUsername,
        smtpPassword
      );
      
      console.log("Resultado do envio de email:", JSON.stringify({
        success: emailResult.success,
        id: emailResult.id || '',
        error: emailResult.error ? JSON.stringify(emailResult.error) : undefined
      }));
      
      if (emailResult.success) {
        return createSuccessResponse('GoDaddy', emailResult.id || '');
      } else {
        console.error("Detalhes do erro de envio:", emailResult.error);
        return createErrorResponse(
          'Falha ao enviar e-mail.',
          emailResult.error,
          emailResult.isSmtpError
        );
      }
    } catch (emailError) {
      console.error('Erro ao tentar enviar email:', emailError);
      console.error('Detalhes do erro SMTP:', JSON.stringify(emailError));
      return createErrorResponse(
        'Erro ao processar envio de email',
        emailError.message || 'Erro desconhecido',
        true
      );
    }
  } catch (error) {
    console.error('Erro ao processar requisição:', error);
    return createErrorResponse(
      'Falha ao processar solicitação de envio de e-mail',
      error.message
    );
  }
};
