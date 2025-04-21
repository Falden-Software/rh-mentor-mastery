
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InvitationService } from "@/services/invitations/invitationService";
import InviteSuccessAlert from "../leader/invitation/InviteSuccessAlert";
import InviteErrorAlert from "../leader/invitation/InviteErrorAlert";
import { useToast } from "@/components/ui/use-toast";

export function InviteClientForm({ onInviteSent }: { onInviteSent?: () => void }) {
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setResult(null);

    try {
      const result = await InvitationService.createInvitation(
        clientEmail,
        clientName,
        user
      );
      
      setResult(result);
      
      if (result.success) {
        toast({
          title: "Sucesso!",
          description: "Convite enviado com sucesso"
        });
        setClientName("");
        setClientEmail("");
        onInviteSent?.();
      } else {
        toast({
          title: "Erro",
          description: result.error || "Erro ao enviar convite",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message
      });
      
      toast({
        title: "Erro",
        description: "Falha ao processar convite",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 p-4">
      <h3 className="text-lg font-medium">Convidar Novo Cliente</h3>

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
          />
        </div>
        
        {result?.success && (
          <InviteSuccessAlert
            message={result.message}
            clientEmail={clientEmail}
            serviceName={result.service}
          />
        )}
        
        {!result?.success && result?.error && (
          <InviteErrorAlert
            error={result.error}
            errorDetails={result.errorDetails}
            isApiKeyError={result.isApiKeyError}
            isDomainError={result.isDomainError}
            isSmtpError={false}
          />
        )}
        
        <div className="pt-2 flex justify-end gap-2">
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? "Enviando..." : "Enviar Convite"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default InviteClientForm;
