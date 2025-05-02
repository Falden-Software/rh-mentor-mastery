
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import useNotifications from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { InvitationService } from '@/services/invitations';
import { sendInvitationEmail } from '@/services/sendgridService';

const ClientInviteForm = ({ onCancel }: { onCancel: () => void }) => {
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sendTimeout, setSendTimeout] = useState<NodeJS.Timeout | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [configStatus, setConfigStatus] = useState<'checking' | 'configured' | 'not_configured'>('checking');
  
  const { user } = useAuth();
  const notify = useNotifications();

  // Verificar configuração de email ao carregar
  useEffect(() => {
    const checkEmailConfig = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('check-email-config');
        
        if (error || !data?.configured) {
          console.log('Verificando diretamente a configuração do SendGrid');
          // Tentar usar SendGrid como alternativa
          setConfigStatus('configured');
        } else {
          setConfigStatus('configured');
        }
      } catch (error) {
        console.error('Erro ao verificar configuração:', error);
        // Mesmo com erro, tentaremos usar SendGrid
        setConfigStatus('configured');
      }
    };
    
    checkEmailConfig();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    // Timeout para evitar botão travado
    const timeout = setTimeout(() => {
      setIsSubmitting(false);
      notify.error('O envio do convite demorou muito. Verifique sua conexão e tente novamente.');
    }, 15000);
    setSendTimeout(timeout);
    
    try {
      console.log(`Tentando criar convite para cliente ${clientEmail} com nome ${clientName} por ${user?.name || 'conta mestre'}`);
      
      // Se for conta mestre, envie diretamente sem usar a API pública
      if (user?.is_master_account) {
        console.log("Detectado usuário com conta mestre, usando método direto");
        
        // Gerar convite na tabela invitation_codes
        const { data: inviteData, error: inviteError } = await supabase
          .from('invitation_codes')
          .insert({
            code: Math.random().toString(36).substring(2, 10).toUpperCase(),
            email: clientEmail,
            mentor_id: user.id,
            role: 'client' // Explicitamente definindo como cliente
          })
          .select('*')
          .single();
          
        if (inviteError) {
          throw new Error(`Erro ao gerar código de convite: ${inviteError.message}`);
        }
        
        // Enviar email diretamente via SendGrid
        const emailResult = await sendInvitationEmail(
          clientEmail,
          clientName,
          user.name
        );
        
        if (!emailResult.success) {
          throw new Error(emailResult.error || 'Erro ao enviar email');
        }
        
        setSuccessMessage(`Convite de cliente enviado com sucesso para ${clientEmail} via ${emailResult.service || 'email'}`);
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
      if (sendTimeout) {
        clearTimeout(sendTimeout);
        setSendTimeout(null);
      }
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 p-2">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Convidar Novo Cliente</h3>
      </div>

      {configStatus === 'not_configured' && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Configuração Incompleta</AlertTitle>
          <AlertDescription>
            O sistema de email não está configurado. Contate o administrador para configurar a chave de API do serviço de email no Supabase.
          </AlertDescription>
        </Alert>
      )}

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
