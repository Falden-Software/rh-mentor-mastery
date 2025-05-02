
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

interface UseInviteVerificationProps {
  token?: string | null;
  email?: string | null;
}

export function useInviteVerification({ token, email }: UseInviteVerificationProps) {
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
        
        // Verificar por token usando a função RPC para evitar recursão
        if (token) {
          console.log("Verificando token de convite:", token);
          
          const { data: inviteData, error: inviteError } = await supabase.rpc(
            'verify_invitation_code',
            { p_code: token }
          );
            
          if (inviteError) {
            console.error("Erro ao verificar token de convite via RPC:", inviteError);
            setError("Não foi possível verificar o token de convite");
          } else if (inviteData && inviteData.length > 0) {
            console.log("Convite válido encontrado via RPC:", inviteData[0]);
            setIsVerified(true);
            setMentorId(inviteData[0].mentor_id);
            setIsVerifying(false);
            return;
          } else {
            console.log("Nenhum convite válido encontrado para o token via RPC");
            setError("Convite expirado ou já utilizado");
          }
        }
        
        // Verificar por email se não encontrou por token
        if (email && !isVerified) {
          console.log("Verificando convite por email:", email);
          
          // Usando query direta com RLS (menos problemas de recursão em queries simples)
          const { data: inviteDataByEmail, error: emailError } = await supabase
            .from('invitation_codes')
            .select('*')
            .eq('email', email)
            .eq('is_used', false)
            .gt('expires_at', new Date().toISOString())
            .order('created_at', { ascending: false })
            .limit(1);
          
          if (emailError) {
            console.error("Erro ao verificar convite por email:", emailError);
            setError("Não foi possível verificar o convite por email");
          } else if (inviteDataByEmail && inviteDataByEmail.length > 0) {
            console.log("Encontrado convite válido pelo email:", inviteDataByEmail[0]);
            setIsVerified(true);
            setMentorId(inviteDataByEmail[0].mentor_id);
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
  }, [token, email, isVerified]);

  return {
    isVerifying,
    isVerified,
    error,
    mentorId
  };
}
