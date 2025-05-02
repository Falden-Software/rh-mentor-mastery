
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UseInviteVerificationProps {
  token?: string | null;
  email?: string | null;
}

export function useInviteVerification({ token, email }: UseInviteVerificationProps) {
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [mentorId, setMentorId] = useState<string | null>(null);

  useEffect(() => {
    const verifyInvite = async () => {
      if (!token && !email) return;
      
      setIsVerifying(true);
      try {
        // If we have an email, check for any valid invitations
        if (email) {
          const { data: inviteData, error: inviteError } = await supabase
            .from('invitation_codes')
            .select('*')
            .eq('email', email)
            .eq('is_used', false)
            .gt('expires_at', new Date().toISOString())
            .order('created_at', { ascending: false })
            .limit(1);
          
          if (inviteError) {
            console.error("Erro ao verificar convite:", inviteError);
            toast({
              variant: "destructive",
              title: "Erro",
              description: "Não foi possível verificar o seu convite. Por favor, tente novamente mais tarde."
            });
          } else if (inviteData && inviteData.length > 0) {
            setIsVerified(true);
            setMentorId(inviteData[0].mentor_id);
            return;
          }
        }

        // If we have a token, verify it
        if (token) {
          // This is a placeholder - the actual token verification would be implemented here
          // This would typically involve a Supabase function call or API check
          console.log("Token de convite fornecido:", token);
          
          const { data: inviteData, error: inviteError } = await supabase
            .from('invitation_codes')
            .select('*')
            .eq('code', token)
            .eq('is_used', false)
            .gt('expires_at', new Date().toISOString())
            .order('created_at', { ascending: false })
            .limit(1);
            
          if (inviteError) {
            console.error("Erro ao verificar token de convite:", inviteError);
            toast({
              variant: "destructive",
              title: "Erro",
              description: "Não foi possível verificar o seu token de convite. Por favor, tente novamente mais tarde."
            });
          } else if (inviteData && inviteData.length > 0) {
            setIsVerified(true);
            setMentorId(inviteData[0].mentor_id);
          } else {
            setIsVerified(false);
            toast({
              variant: "destructive",
              title: "Token inválido",
              description: "O token de convite fornecido é inválido ou expirou."
            });
          }
        }
      } catch (error) {
        console.error("Erro ao processar convite:", error);
        setIsVerified(false);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Ocorreu um erro ao processar seu convite. Por favor, tente novamente mais tarde."
        });
      } finally {
        setIsVerifying(false);
      }
    };

    verifyInvite();
  }, [token, email, toast]);

  return {
    isVerifying,
    isVerified,
    mentorId
  };
}
