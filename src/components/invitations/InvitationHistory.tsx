
import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { getMentorInvitations, resendInvite } from '@/services/invitations';
import InviteErrorAlert from '@/components/leader/invitation/InviteErrorAlert';
import { InvitationHistoryTable } from './history/InvitationHistoryTable';
import { InvitationHistoryLoading } from './history/InvitationHistoryLoading';
import { InvitationHistoryError } from './history/InvitationHistoryError';

const InvitationHistory = () => {
  const { user } = useAuth();
  const [sendingEmails, setSendingEmails] = useState<Record<string, boolean>>({});
  const [resendError, setResendError] = useState<any>(null);
  
  const { 
    data: invitations, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['invitation-history'],
    queryFn: async () => {
      if (!user?.id) return [];
      
      try {
        return await getMentorInvitations(user.id);
      } catch (error) {
        console.error("Erro ao buscar convites:", error);
        throw error;
      }
    },
    enabled: !!user?.id,
  });
  
  // Mutation para reenviar convite
  const resendMutation = useMutation({
    mutationFn: async (inviteId: string) => {
      if (!user?.id) throw new Error("Usuário não autenticado");
      setSendingEmails(prev => ({ ...prev, [inviteId]: true }));
      setResendError(null);
      
      try {
        const result = await resendInvite(inviteId, user.id);
        if (!result.success) {
          throw new Error(result.error || "Erro ao reenviar convite");
        }
        return result;
      } catch (error) {
        console.error("Erro capturado no reenvio:", error);
        throw error;
      }
    },
    onSuccess: (data, inviteId) => {
      toast.success(data.message || "Convite reenviado com sucesso!");
      setSendingEmails(prev => ({ ...prev, [inviteId]: false }));
      refetch();
    },
    onError: (error: any, inviteId) => {
      console.error("Erro ao reenviar convite:", error);
      toast.error("Falha ao reenviar convite");
      setSendingEmails(prev => ({ ...prev, [inviteId]: false }));
      setResendError(error);
    }
  });
  
  const handleRetry = () => {
    refetch();
  };

  const handleResendInvite = (inviteId: string) => {
    resendMutation.mutate(inviteId);
  };

  if (isLoading) {
    return <InvitationHistoryLoading />;
  }

  if (error) {
    return <InvitationHistoryError error={error} onRetry={handleRetry} />;
  }
  
  return (
    <div className="space-y-4">
      {resendError && (
        <InviteErrorAlert 
          error={(resendError as Error).message} 
          isApiKeyError={resendError.isApiKeyError}
          isDomainError={resendError.isDomainError}
          isSmtpError={resendError.isSmtpError}
          onRetry={handleRetry}
        />
      )}
      
      <InvitationHistoryTable 
        invitations={invitations || []} 
        sendingEmails={sendingEmails} 
        onResend={handleResendInvite} 
      />
    </div>
  );
};

export default InvitationHistory;
