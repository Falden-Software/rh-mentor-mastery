
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { InvitationService } from '@/services/invitationService';

interface ClientInviteFormProps {
  onInviteSent: () => void;
  onCancel: () => void;
}

export function ClientInviteForm({ onInviteSent, onCancel }: ClientInviteFormProps) {
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const { user } = useAuth();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(clientEmail)) {
      setErrorMessage("Email inválido. Por favor, verifique o endereço de email.");
      return;
    }
    
    if (!clientName.trim()) {
      setErrorMessage("Nome do cliente é obrigatório.");
      return;
    }
    
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      console.log(`Tentando criar convite para ${clientEmail} com nome ${clientName}`);
      
      const result = await InvitationService.createInvitation(
        clientEmail, 
        clientName, 
        user
      );
      
      if (result.success) {
        console.log("Convite enviado com sucesso:", result);
        toast.success("Convite enviado com sucesso!");
        setClientEmail('');
        setClientName('');
        onInviteSent();
      } else {
        console.error("Erro no resultado do convite:", result);
        // Verificar se é um erro de recursão RLS para mostrar mensagem mais amigável
        const errorMsg = result.error || 'Erro ao enviar convite';
        setErrorMessage(
          errorMsg.includes('recursion') 
            ? "Erro de configuração no sistema. Por favor, contacte o administrador."
            : errorMsg
        );
        toast.error(result.error || 'Erro ao enviar convite');
      }
    } catch (error: any) {
      console.error('Erro durante a submissão do convite:', error);
      setErrorMessage('Erro interno ao processar convite');
      toast.error('Ocorreu um erro inesperado. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Convidar Novo Cliente</h3>
      </div>

      {errorMessage && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro no convite</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="clientName">Nome completo</Label>
          <Input
            id="clientName"
            placeholder="Digite o nome do cliente"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="clientEmail">Email</Label>
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

export default ClientInviteForm;
