
import React from "react";
import { useSearchParams } from "react-router-dom";
import { useInviteVerification } from "@/hooks/useInviteVerification";
import { InvalidInviteError } from "@/components/auth/client/InvalidInviteError";
import { ClientRegisterFormWrapper } from "@/components/auth/client/ClientRegisterFormWrapper";
import { useClientRegistration } from "@/hooks/useClientRegistration";

export default function ClientRegister() {
  const [searchParams] = useSearchParams();
  
  // Buscar parâmetros da URL
  const clientEmail = searchParams.get("email");
  const token = searchParams.get("token"); // Token de convite
  
  // Verificar o token de convite
  const { isVerifying, error: verificationError, mentorId: verifiedMentorId } = useInviteVerification({ 
    token, 
    email: clientEmail 
  });
  
  // Usar o hook para gerenciar a lógica de registro
  const { handleSubmit, isLoading, formError } = useClientRegistration(verifiedMentorId, token);
  
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
