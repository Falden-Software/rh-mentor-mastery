
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import useNotifications from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { InvitationService } from '@/services/invitations';

const ClientInviteForm = ({ onCancel }: { onCancel: () => void }) => {
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const { user } = useAuth();
  const notify = useNotifications();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      console.log(`Tentando criar convite para cliente ${clientEmail} com nome ${clientName} por ${user?.name || 'conta mestre'}`);
      
      // Se for conta mestre, envie diretamente sem usar a API pública
      if (user?.is_master_account) {
        console.log("Detectado usuário com conta mestre, usando método direto");
        
        // Gerar convite na tabela invitation_codes
        const inviteId = crypto.randomUUID();
        const inviteCode = inviteId.substring(0, 8).toUpperCase();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 dias a partir de hoje
        
        const { data: inviteData, error: inviteError } = await supabase
          .from('invitation_codes')
          .insert({
            id: inviteId,
            code: inviteCode,
            email: clientEmail,
            mentor_id: user.id,
            is_used: false,
            expires_at: expiresAt.toISOString(),
            role: 'client'
          })
          .select('*')
          .single();
          
        if (inviteError) {
          throw new Error(`Erro ao gerar código de convite: ${inviteError.message}`);
        }
        
        // Enviar email via Supabase Edge Function
        const baseUrl = window.location.origin;
        const registerUrl = `${baseUrl}/register?type=client&email=${encodeURIComponent(clientEmail)}`;
        
        const { data: emailResult, error: emailError } = await supabase.functions.invoke('send-invite-email', {
          body: {
            email: clientEmail,
            clientName: clientName,
            mentorName: user.name || 'Mentor',
            mentorCompany: 'RH Mentor Mastery',
            registerUrl: registerUrl
          }
        });
        
        if (emailError) {
          console.error("Erro ao invocar a edge function:", emailError);
          throw new Error(`Erro ao enviar email: ${emailError.message}`);
        }
        
        console.log("Resultado do envio de email:", emailResult);
        
        setSuccessMessage(`Convite de cliente enviado com sucesso para ${clientEmail} via ${emailResult?.service || 'Supabase'}`);
        notify.success('Convite enviado com sucesso!');
        setClientEmail('');
        setClientName('');
      } else {
        // Para usuários normais, use o serviço padrão
        const result = await InvitationService.createInvitation(
          clientEmail, 
          clientName, 
          user
        );
        
        if (result.success) {
          setSuccessMessage(result.message || 'Convite de cliente enviado com sucesso!');
          notify.success('Convite enviado com sucesso!');
          setClientEmail('');
          setClientName('');
        } else {
          setErrorMessage(result.error || 'Erro ao enviar convite de cliente');
          notify.error(result.error || 'Falha ao enviar convite de cliente');
        }
      }
    } catch (error: any) {
      console.error('Erro ao criar convite de cliente:', error);
      setErrorMessage('Erro interno ao processar convite de cliente: ' + error.message);
      notify.error('Ocorreu um erro inesperado. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 p-2">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Convidar Novo Cliente</h3>
      </div>

      {successMessage && (
        <Alert className="mb-4 bg-green-50 border-green-300 text-green-800">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertTitle>Convite Enviado</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {errorMessage && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
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
          />
        </div>
        
        <div className="pt-2 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin inline-block align-middle">🔄</span>
                Enviando...
              </>
            ) : "Enviar Convite"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ClientInviteForm;
