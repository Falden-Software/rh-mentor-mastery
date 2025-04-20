
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, MailWarning } from "lucide-react";
import { InvitationService } from "@/services/invitationService";
import { checkEmailConfig } from "@/services/emailConfigService";

interface InviteClientFormProps {
  onInviteSent: () => void;
}

export function InviteClientForm({ onInviteSent }: InviteClientFormProps) {
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [configStatus, setConfigStatus] = useState<'checking' | 'configured' | 'not_configured'>('checking');
  const [devModeEnabled, setDevModeEnabled] = useState(false);
  
  const { toast } = useToast();
  const { user, isDevMode, toggleDevMode } = useAuth();
  
  // Verificar configuração de email e status de dev mode
  useEffect(() => {
    // Checar se o modo de desenvolvimento já está salvo no localStorage
    const savedDevMode = localStorage.getItem("devMode");
    if (savedDevMode === "true") {
      setDevModeEnabled(true);
    }
    
    // Ativar automaticamente o dev mode para todos os usuários não mestres
    if (user && !user.is_master_account && !devModeEnabled && !isDevMode) {
      console.log("Ativando dev mode automaticamente para usuário regular");
      toggleDevMode();
      setDevModeEnabled(true);
    }
    
    const verifyEmailConfig = async () => {
      try {
        const { configured, error: configError } = await checkEmailConfig();
        if (configured) {
          setConfigStatus('configured');
        } else {
          console.log("Email não configurado:", configError);
          setConfigStatus('not_configured');
          setError("O sistema de email não está configurado. " + 
                  (configError ? configError : "Verifique as variáveis de ambiente SMTP."));
        }
      } catch (err) {
        console.error("Erro ao verificar configuração de email:", err);
        setConfigStatus('not_configured');
        setError("Erro ao verificar configuração de email");
      }
    };
    
    verifyEmailConfig();
    
    // Se estamos em modo de desenvolvimento, ativar o modo de desenvolvimento para o formulário
    if (isDevMode) {
      setDevModeEnabled(true);
    }
  }, [isDevMode, toggleDevMode, user, devModeEnabled]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      if (!user) {
        throw new Error("Usuário não autenticado");
      }
      
      let result;
      
      if (devModeEnabled) {
        console.log("Enviando convite em modo de desenvolvimento");
        // Em modo de desenvolvimento, simulamos sucesso sem enviar email real
        result = {
          success: true,
          message: "Convite criado com sucesso (modo de desenvolvimento)",
          isTestMode: true
        };
      } else {
        result = await InvitationService.createInvitation(clientEmail, clientName, user);
      }
      
      if (result.success) {
        toast({
          title: "Convite enviado",
          description: result.message || "Convite enviado com sucesso!",
        });
        
        setClientName("");
        setClientEmail("");
        onInviteSent();
      } else {
        setError(result.error || "Ocorreu um erro ao enviar o convite");
        toast({
          variant: "destructive",
          title: "Erro ao enviar convite",
          description: result.error || "Tente novamente mais tarde",
        });
      }
    } catch (error: any) {
      console.error("Erro ao enviar convite:", error);
      setError(error.message || "Ocorreu um erro ao enviar o convite");
      toast({
        variant: "destructive",
        title: "Erro ao enviar convite",
        description: "Tente novamente mais tarde",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleEnableDevMode = () => {
    toggleDevMode();
    setDevModeEnabled(true);
  };
  
  return (
    <div id="invite-client" className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">Convidar Cliente</h3>
      
      {configStatus === 'not_configured' && !devModeEnabled && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Configuração Incompleta</AlertTitle>
          <AlertDescription>
            <p>O sistema de email não está configurado. Verifique as variáveis de ambiente SMTP.</p>
            <Button 
              onClick={handleEnableDevMode} 
              variant="outline" 
              size="sm" 
              className="mt-2"
            >
              <MailWarning className="mr-2 h-4 w-4" />
              Ativar modo de desenvolvimento
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      {devModeEnabled && (
        <Alert className="mb-4">
          <AlertTitle>Modo de Desenvolvimento Ativo</AlertTitle>
          <AlertDescription>
            Os emails não serão enviados, mas você pode testar a funcionalidade.
          </AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="clientName">Nome do cliente</Label>
          <Input
            id="clientName"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Digite o nome do cliente"
            required
            disabled={isSubmitting || (configStatus === 'not_configured' && !devModeEnabled)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="clientEmail">Email</Label>
          <Input
            id="clientEmail"
            type="email"
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
            placeholder="cliente@empresa.com"
            required
            disabled={isSubmitting || (configStatus === 'not_configured' && !devModeEnabled)}
          />
        </div>
        
        {error && <p className="text-sm text-red-500">{error}</p>}
        
        <Button 
          type="submit" 
          className="w-full"
          disabled={isSubmitting || (configStatus === 'not_configured' && !devModeEnabled)}
        >
          {isSubmitting ? "Enviando..." : "Enviar Convite"}
        </Button>
      </form>
    </div>
  );
}
