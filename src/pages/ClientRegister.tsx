
import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useInviteVerification } from "@/hooks/useInviteVerification";
import { InvalidInviteError } from "@/components/auth/client/InvalidInviteError";
import { ClientRegisterFormWrapper } from "@/components/auth/client/ClientRegisterFormWrapper";
import { useClientRegistration } from "@/hooks/useClientRegistration";
import { toast } from "sonner";

export default function ClientRegister() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Buscar parâmetros da URL
  const clientEmail = searchParams.get("email");
  const token = searchParams.get("token") || searchParams.get("code"); // Aceitar ambos token e code como parâmetros
  
  console.log("ClientRegister: Parâmetros de URL recebidos:", { email: clientEmail, token, code: searchParams.get("code") });
  
  // Verificar o token de convite
  const { isVerifying, error: verificationError, mentorId: verifiedMentorId, isVerified } = useInviteVerification({ 
    token, 
    email: clientEmail 
  });
  
  // Usar o hook para gerenciar a lógica de registro
  const { handleSubmit, isLoading, formError } = useClientRegistration(verifiedMentorId, token);

  useEffect(() => {
    console.log("ClientRegister: Estado do convite:", { 
      isVerifying, 
      verificationError,
      verifiedMentorId, 
      isVerified 
    });

    // Mostrar toast de erro se houver problemas na verificação
    if (verificationError && !isVerifying) {
      toast.error(verificationError);
    }
  }, [isVerifying, verificationError, verifiedMentorId, isVerified]);

  // Se estiver com erro de verificação e não estiver mais verificando
  if (verificationError && !isVerifying) {
    return <InvalidInviteError error={verificationError} />;
  }

  return (
    <ClientRegisterFormWrapper
      onSubmit={handleSubmit}
      initialEmail={clientEmail || ""}
      isLoading={isLoading || isVerifying}
      formError={formError}
    />
  );
}
