
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyInvite = async () => {
      if (!token && !email) return;
      
      setIsVerifying(true);
      setError(null);
      
      try {
        console.log("Verificando convite com:", { token, email });
        
        // Se temos um token/código, verificamos ele primeiro
        if (token) {
          console.log("Verificando token de convite:", token);
          
          const { data: inviteData, error: inviteError } = await supabase
            .from('invitation_codes')
            .select('*')
            .eq('code', token)
            .eq('is_used', false)
            .gt('expires_at', new Date().toISOString())
            .limit(1);
            
          if (inviteError) {
            console.error("Erro ao verificar token de convite:", inviteError);
            setError("Não foi possível verificar o token de convite");
          } else if (inviteData && inviteData.length > 0) {
            console.log("Convite válido encontrado pelo token:", inviteData[0]);
            setIsVerified(true);
            setMentorId(inviteData[0].mentor_id);
            return;
          } else {
            console.log("Nenhum convite válido encontrado para o token:", token);
          }
        }
        
        // Se temos um email ou se a verificação por token falhou, tentamos pelo email
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
            console.error("Erro ao verificar convite por email:", inviteError);
            setError("Não foi possível verificar o convite por email");
          } else if (inviteData && inviteData.length > 0) {
            console.log("Encontrado convite válido pelo email:", inviteData[0]);
            setIsVerified(true);
            setMentorId(inviteData[0].mentor_id);
            return;
          } else {
            console.log("Nenhum convite válido encontrado para o email:", email);
          }
        }
        
        if (!isVerified) {
          setError("Não foi possível encontrar um convite válido");
        }
      } catch (error: any) {
        console.error("Erro ao processar convite:", error);
        setIsVerified(false);
        setError(error.message || "Ocorreu um erro ao processar seu convite");
      } finally {
        setIsVerifying(false);
      }
    };

    verifyInvite();
  }, [token, email]);

  return {
    isVerifying,
    isVerified,
    error,
    mentorId
  };
}
