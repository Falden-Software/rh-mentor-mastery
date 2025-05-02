
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UseInviteVerificationProps {
  token?: string | null;
}

export function useInviteVerification({ token }: UseInviteVerificationProps) {
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) return;
      
      setIsVerifying(true);
      try {
        // Verificar se o token é válido usando a API do Supabase
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'invite'
        });

        if (error) {
          console.error("Erro ao verificar token de convite:", error);
          toast({
            variant: "destructive",
            title: "Convite inválido",
            description: "O link de convite é inválido ou expirou.",
          });
          setIsVerified(false);
        } else {
          console.log("Token de convite válido:", data);
          setIsVerified(true);
        }
      } catch (error) {
        console.error("Erro ao processar token:", error);
        setIsVerified(false);
      } finally {
        setIsVerifying(false);
      }
    };

    if (token) {
      verifyToken();
    }
  }, [token, toast]);

  return {
    isVerifying,
    isVerified
  };
}
