
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { sendInviteEmail } from '@/services/invitations/emailService';
import { InviteFormFields } from "./InviteFormFields";
import { InviteErrorDisplay } from "./InviteErrorDisplay";
import { InviteSuccessAlert } from "./InviteSuccessAlert";

interface InviteFormProps {
  onInviteSent: () => void;
  onCancel: () => void;
}

export function InviteForm({ onInviteSent, onCancel }: InviteFormProps) {
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<"error" | "warning" | "info">("error");
  const [successInfo, setSuccessInfo] = useState<{
    service?: string;
    message?: string;
  } | null>(null);
  
  // State for domain verification error
  const [isDomainError, setIsDomainError] = useState(false);
  const [isApiKeyError, setIsApiKeyError] = useState(false);
  const [isSmtpError, setIsSmtpError] = useState(false);
  const [errorDetails, setErrorDetails] = useState<any>(null);
  
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clientName.trim()) {
      setErrorMessage("Nome do cliente é obrigatório.");
      setErrorType("error");
      return;
    }
    
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessInfo(null);
    setIsDomainError(false);
    setIsApiKeyError(false);
    setIsSmtpError(false);
    setErrorDetails(null);

    try {
      console.log(`Tentando enviar convite para cliente ${clientEmail} com nome ${clientName}`);
      
      // Use direct email sending to avoid RLS recursion
      const emailResult = await sendInviteEmail(
        clientEmail,
        clientName,
        user?.name || 'Mentor'
      );
      
      if (emailResult.success) {
        console.log("Convite de cliente enviado com sucesso:", emailResult);
        toast.success("Convite enviado com sucesso!");
        setClientEmail('');
        setClientName('');
        setSuccessInfo({
          service: emailResult.service || 'Sistema de Email',
          message: `Convite enviado para ${clientEmail}`
        });
        onInviteSent();
      } else {
        console.error("Erro no envio de convite:", emailResult);
        
        // Handle specific error types
        setIsDomainError(Boolean(emailResult.isDomainError));
        setIsApiKeyError(Boolean(emailResult.isApiKeyError));
        setIsSmtpError(Boolean(emailResult.isSmtpError));
        setErrorDetails(emailResult.errorDetails);
        
        if (emailResult.isDomainError) {
          setErrorType("warning");
          setErrorMessage("Domínio não verificado no Resend. Verifique um domínio em resend.com/domains.");
        } else if (emailResult.isApiKeyError) {
          setErrorType("warning");
          setErrorMessage("Chave de API não configurada. Por favor, contate o suporte.");
        } else if (emailResult.isSmtpError) {
          setErrorType("warning");
          setErrorMessage("Erro de conexão com o servidor de email. Por favor, tente novamente mais tarde.");
        } else {
          setErrorType("error");
          setErrorMessage(emailResult.error || 'Erro ao enviar convite');
        }
        toast.error("Erro ao enviar convite");
      }
    } catch (error: any) {
      console.error('Erro durante o envio do convite:', error);
      setErrorType("error");
      setErrorMessage('Erro interno ao processar convite');
      toast.error('Ocorreu um erro inesperado. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    handleSubmit(new Event('submit') as any);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Convidar Novo Cliente</h3>
      </div>

      <InviteErrorDisplay 
        errorMessage={errorMessage}
        errorType={errorType}
        isDomainError={isDomainError}
        isApiKeyError={isApiKeyError}
        isSmtpError={isSmtpError}
        errorDetails={errorDetails}
        onRetry={handleRetry}
      />

      {successInfo && (
        <InviteSuccessAlert
          clientEmail={clientEmail}
          message={successInfo.message}
          serviceName={successInfo.service}
        />
      )}

      <InviteFormFields
        clientName={clientName}
        setClientName={setClientName}
        clientEmail={clientEmail}
        setClientEmail={setClientEmail}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        onCancel={onCancel}
      />
    </div>
  );
}
