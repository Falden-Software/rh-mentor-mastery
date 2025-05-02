
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { InvitationService } from '@/services/invitations';
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
    
    // Validate email (trim to remove whitespace)
    const trimmedEmail = clientEmail ? clientEmail.trim() : "";
    if (!trimmedEmail) {
      setErrorMessage("Email do cliente é obrigatório.");
      setErrorType("error");
      return;
    }
    
    // Validate name (trim to remove whitespace)
    const trimmedName = clientName ? clientName.trim() : "";
    if (!trimmedName) {
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
      console.log(`Tentando criar convite para ${trimmedEmail} com nome ${trimmedName}`);
      
      // Use service to create invite with trimmed values
      const result = await InvitationService.createInvite(
        trimmedEmail, 
        trimmedName, 
        user
      );
      
      if (result.success) {
        console.log("Convite criado com sucesso:", result);
        toast.success("Convite enviado com sucesso!");
        setClientEmail('');
        setClientName('');
        setSuccessInfo({
          service: result.service || 'Sistema de Email',
          message: `Convite enviado para ${trimmedEmail}`
        });
        onInviteSent();
      } else {
        console.error("Erro no envio de convite:", result);
        
        // Handle specific error types
        setIsDomainError(Boolean(result.isDomainError));
        setIsApiKeyError(Boolean(result.isApiKeyError));
        setIsSmtpError(Boolean(result.isSmtpError));
        setErrorDetails(result.errorDetails);
        
        if (result.isDomainError) {
          setErrorType("warning");
          setErrorMessage("Domínio não verificado no Resend. Verifique um domínio em resend.com/domains.");
        } else if (result.isApiKeyError) {
          setErrorType("warning");
          setErrorMessage("Chave de API não configurada. Por favor, contate o suporte.");
        } else if (result.isSmtpError) {
          setErrorType("warning");
          setErrorMessage("Erro de conexão com o servidor de email. Por favor, tente novamente mais tarde.");
        } else {
          setErrorType("error");
          setErrorMessage(result.error || 'Erro ao enviar convite');
        }
        toast.error("Erro ao enviar convite");
      }
    } catch (error: any) {
      console.error('Erro durante o envio do convite:', error);
      setErrorType("error");
      setErrorMessage('Erro interno ao processar convite: ' + (error.message || 'Erro desconhecido'));
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
