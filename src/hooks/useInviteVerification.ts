
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UseInviteVerificationProps {
  token?: string | null;
  email?: string | null;
}

export function useInviteVerification({ token, email }: UseInviteVerificationProps) {
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(true); // Começa como verdadeiro para mostrar estado de carregamento
  const [isVerified, setIsVerified] = useState(false);
  const [mentorId, setMentorId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyInvite = async () => {
      if (!token && !email) {
        setIsVerifying(false);
        setError("Nenhum token ou email fornecido para verificação");
        return;
      }
      
      setIsVerifying(true);
      setError(null);
      
      try {
        console.log("Verificando convite com:", { token, email });
        
        // Se temos um token/código, verificamos ele primeiro
        if (token) {
          console.log("Verificando token de convite:", token);
          
          const { data: inviteData, error: inviteError } = await supabase.rpc(
            'verify_invitation_code',
            { p_code: token }
          );
            
          if (inviteError) {
            console.error("Erro ao verificar token de convite via RPC:", inviteError);
            // Fallback para query direta se a RPC falhar
            const { data: directData, error: directError } = await supabase
              .from('invitation_codes')
              .select('*')
              .eq('code', token)
              .eq('is_used', false)
              .gt('expires_at', new Date().toISOString())
              .maybeSingle();
              
            if (directError) {
              console.error("Erro ao verificar token diretamente:", directError);
              setError("Não foi possível verificar o token de convite");
            } else if (directData) {
              console.log("Convite válido encontrado pelo token:", directData);
              setIsVerified(true);
              setMentorId(directData.mentor_id);
              setIsVerifying(false);
              return;
            } else {
              console.log("Nenhum convite válido encontrado para o token:", token);
              setError("Convite expirado ou já utilizado");
            }
          } else if (inviteData) {
            console.log("Convite válido encontrado via RPC:", inviteData);
            setIsVerified(true);
            setMentorId(inviteData.mentor_id);
            setIsVerifying(false);
            return;
          } else {
            console.log("Nenhum convite válido encontrado para o token via RPC");
            setError("Convite expirado ou já utilizado");
          }
        }
        
        // Se temos um email ou se a verificação por token falhou, tentamos pelo email
        if (email) {
          console.log("Verificando convite por email:", email);
          const { data: inviteData, error: inviteError } = await supabase
            .from('invitation_codes')
            .select('*')
            .eq('email', email)
            .eq('is_used', false)
            .gt('expires_at', new Date().toISOString())
            .order('created_at', { ascending: false })
            .maybeSingle();
          
          if (inviteError) {
            console.error("Erro ao verificar convite por email:", inviteError);
            setError("Não foi possível verificar o convite por email");
          } else if (inviteData) {
            console.log("Encontrado convite válido pelo email:", inviteData);
            setIsVerified(true);
            setMentorId(inviteData.mentor_id);
            setIsVerifying(false);
            return;
          } else {
            console.log("Nenhum convite válido encontrado para o email:", email);
            setError("Não existe um convite válido para este email");
          }
        }
        
        if (!isVerified) {
          console.log("Nenhum convite válido encontrado por token ou email");
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
