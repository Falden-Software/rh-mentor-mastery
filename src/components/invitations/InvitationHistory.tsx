import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Mail, Loader2, CheckCircle, Clock, XCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/context/AuthContext';
import useNotifications from '@/hooks/useNotifications';
import { InvitationCode } from '@/types/models';
import { InvitationService } from '@/services/invitations/index';

const InvitationHistory = () => {
  const { user } = useAuth();
  const notify = useNotifications();
  const [sendingEmails, setSendingEmails] = useState<Record<string, boolean>>({});
  
  const { data: invitations, isLoading, error, refetch } = useQuery({
    queryKey: ['invitation-history'],
    queryFn: async () => {
      if (!user?.id) return [];
      
      try {
        const data = await InvitationService.getMentorInvitations(user.id);
        return data || [];
      } catch (error) {
        console.error("Error fetching invitation history:", error);
        notify.error("Error loading invitation history");
        throw error;
      }
    },
    enabled: !!user?.id,
  });
  
  if (error) {
    console.error("Error in invitation query:", error);
  }

  const resendMutation = useMutation({
    mutationFn: async (inviteId: string) => {
      setSendingEmails(prev => ({ ...prev, [inviteId]: true }));
      
      try {
        const result = await InvitationService.resendInvitation(inviteId, user?.id || '');
        
        if (!result.success) {
          throw new Error(result.error || "Unknown error");
        }
        
        return result;
      } catch (error: any) {
        throw error;
      }
    },
    onSuccess: (data, inviteId) => {
      notify.success(data.message || "Invitation resent successfully!");
      setSendingEmails(prev => ({ ...prev, [inviteId]: false }));
      refetch();
    },
    onError: (error: any, inviteId) => {
      console.error("Error resending invitation:", error);
      notify.error("Failed to resend invitation. Please try again later.");
      setSendingEmails(prev => ({ ...prev, [inviteId]: false }));
    }
  });
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch (e) {
      return "Invalid date";
    }
  };

  const getStatusBadge = (invite: InvitationCode) => {
    if (invite.is_used) {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-200 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" /> Utilizado
        </Badge>
      );
    }
    
    const expiresAt = new Date(invite.expires_at);
    if (expiresAt < new Date()) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <XCircle className="h-3 w-3" /> Expirado
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-200 flex items-center gap-1">
        <Clock className="h-3 w-3" /> Pendente
      </Badge>
    );
  };

  const isInviteExpired = (invite: InvitationCode): boolean => {
    const expiresAt = new Date(invite.expires_at);
    return expiresAt < new Date();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead className="hidden md:table-cell">Sent date</TableHead>
            <TableHead className="hidden md:table-cell">Expires on</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invitations && invitations.length > 0 ? (
            invitations.map((invitation: InvitationCode) => (
              <TableRow key={invitation.id}>
                <TableCell>
                  {invitation.email}
                  <div className="md:hidden text-xs text-gray-500 mt-1">
                    Sent: {formatDate(invitation.created_at)}
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">{formatDate(invitation.created_at)}</TableCell>
                <TableCell className="hidden md:table-cell">{formatDate(invitation.expires_at)}</TableCell>
                <TableCell>
                  {getStatusBadge(invitation)}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => resendMutation.mutate(invitation.id)}
                    disabled={sendingEmails[invitation.id] || invitation.is_used}
                    className={invitation.is_used ? "opacity-50 cursor-not-allowed" : ""}
                  >
                    {sendingEmails[invitation.id] ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Mail className="h-4 w-4 mr-1" />
                        Resend
                      </>
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                No invitations sent yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default InvitationHistory;
