
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Wifi } from "lucide-react";
import { StatusAlert } from '@/components/ui/status-alert';
import { sendInviteEmail } from '@/services/invitations/emailService';
import InviteErrorAlert from '@/components/leader/invitation/InviteErrorAlert';

interface ClientInviteFormProps {
  onInviteSent: () => void;
  onCancel: () => void;
}

export function ClientInviteForm({ onInviteSent, onCancel }: ClientInviteFormProps) {
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

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(clientEmail)) {
      setErrorMessage("Email inválido. Por favor, verifique o endereço de email.");
      setErrorType("error");
      return;
    }
    
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

      {/* Error display with custom component for domain verification issues */}
      {(isDomainError || isApiKeyError || isSmtpError) && (
        <InviteErrorAlert
          error={errorMessage || ""}
          errorDetails={errorDetails}
          isApiKeyError={isApiKeyError}
          isDomainError={isDomainError}
          isSmtpError={isSmtpError}
          onRetry={handleRetry}
        />
      )}

      {/* Regular error display */}
      {errorMessage && !isDomainError && !isApiKeyError && !isSmtpError && (
        errorType === "error" ? (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro no convite</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        ) : (
          <StatusAlert 
            title="Problema no sistema" 
            description={errorMessage} 
            status={errorType}
          />
        )
      )}

      {successInfo && (
        <Alert className="mb-4 bg-green-50 border-green-200">
          <div className="flex items-center">
            <div className="h-4 w-4 mr-2 text-green-600">✓</div>
            <div>
              <AlertTitle className="text-green-800">Convite enviado com sucesso</AlertTitle>
              <AlertDescription className="text-green-700">
                {successInfo.message || `Email enviado para ${clientEmail}`}
                {successInfo.service && (
                  <span className="text-xs ml-1 bg-green-100 px-2 py-1 rounded text-green-800">
                    via {successInfo.service}
                  </span>
                )}
              </AlertDescription>
            </div>
          </div>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="clientName">Nome completo</Label>
          <FormControl>
            <Input
              id="clientName"
              placeholder="Digite o nome do cliente"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </FormControl>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="clientEmail">Email</Label>
          <FormControl>
            <Input
              id="clientEmail"
              type="email"
              placeholder="cliente@empresa.com"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              required
              disabled={isSubmitting}
              className={!validateEmail(clientEmail) && clientEmail ? "border-red-500" : ""}
            />
          </FormControl>
          {!validateEmail(clientEmail) && clientEmail && (
            <p className="text-red-500 text-sm mt-1">Email inválido</p>
          )}
        </div>
        
        <div className="pt-2 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting || !clientName || !clientEmail || !validateEmail(clientEmail)}
          >
            {isSubmitting ? "Enviando..." : "Enviar Convite"}
          </Button>
        </div>
      </form>
    </div>
  );
}

// Add missing FormControl component
const FormControl = ({ children }: { children: React.ReactNode }) => {
  return <div className="mt-1">{children}</div>;
};
