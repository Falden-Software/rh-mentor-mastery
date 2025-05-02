
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ClientRegisterForm, ClientRegistrationFormData } from "@/components/auth/client/ClientRegisterForm";
import { useInviteVerification } from "@/hooks/useInviteVerification";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ClientRegister() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { register } = useAuth();
  
  // Buscar parâmetros da URL
  const mentorId = searchParams.get("mentor_id");
  const clientEmail = searchParams.get("email");
  const token = searchParams.get("token"); // Token de convite
  
  // Verificar o token de convite
  const { isVerifying, isVerified, error: verificationError, mentorId: verifiedMentorId } = useInviteVerification({ 
    token, 
    email: clientEmail 
  });
  
  // Usar o mentorId verificado se disponível, senão usar o da URL
  const effectiveMentorId = verifiedMentorId || mentorId;

  const handleSubmit = async (values: ClientRegistrationFormData) => {
    setIsLoading(true);
    setFormError(null);
    
    try {
      if (!values.name?.trim()) {
        setFormError("O nome é obrigatório");
        setIsLoading(false);
        return;
      }

      if (!values.email?.trim()) {
        setFormError("O email é obrigatório");
        setIsLoading(false);
        return;
      }

      if (!values.password?.trim() || values.password.length < 6) {
        setFormError("A senha deve ter no mínimo 6 caracteres");
        setIsLoading(false);
        return;
      }
      
      // Verificar primeiro se temos um mentorId para usar
      let mentorIdToUse = effectiveMentorId;
      
      // Se não temos ainda, tenta encontrar um convite não utilizado para este email
      if (!mentorIdToUse) {
        console.log("Buscando mentor_id de convites para o email:", values.email);
        const { data: invitationData, error: inviteError } = await supabase
          .from('invitation_codes')
          .select('mentor_id')
          .eq('email', values.email)
          .eq('is_used', false)
          .gt('expires_at', new Date().toISOString())
          .order('created_at', { ascending: false })
          .maybeSingle();
          
        if (inviteError) {
          console.error("Erro ao buscar convites:", inviteError);
        } else if (invitationData) {
          mentorIdToUse = invitationData.mentor_id;
          console.log("Encontrado mentor_id de convite:", mentorIdToUse);
        }
      } else {
        console.log("Usando mentor_id já identificado:", mentorIdToUse);
      }

      if (!mentorIdToUse) {
        console.error("Não foi encontrado mentor_id válido para associação");
        toast({
          variant: "destructive",
          title: "Erro no registro",
          description: "Não foi possível encontrar um mentor válido para associar à sua conta.",
        });
        setFormError("Não foi possível encontrar um mentor válido para associar à sua conta.");
        setIsLoading(false);
        return;
      }
      
      console.log("Registrando cliente com mentor_id:", mentorIdToUse);
      const result = await register(
        values.email, 
        values.password, 
        values.name, 
        "client",
        undefined,
        values.phone,
        values.position,
        values.bio
      );
      
      if (result !== null) {
        // Marcar convites como utilizados - usando código do convite se disponível
        if (token) {
          const { error: updateError } = await supabase
            .from('invitation_codes')
            .update({ 
              is_used: true,
              used_by: result.id
            })
            .eq('code', token);
            
          if (updateError) {
            console.error("Erro ao atualizar código de convite pelo token:", updateError);
          } else {
            console.log("Convite marcado como utilizado pelo token");
          }
        } else {
          // Fallback para atualizar por email
          const { error: updateError } = await supabase
            .from('invitation_codes')
            .update({ 
              is_used: true,
              used_by: result.id
            })
            .eq('email', values.email)
            .eq('is_used', false);
          
          if (updateError) {
            console.error("Erro ao atualizar códigos de convite pelo email:", updateError);
          } else {
            console.log("Convite(s) marcado(s) como utilizado(s) pelo email");
          }
        }
        
        // Vincular cliente ao mentor
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ mentor_id: mentorIdToUse })
          .eq('id', result.id);
          
        if (profileError) {
          console.error("Erro ao vincular cliente ao mentor:", profileError);
        } else {
          console.log("Cliente vinculado com sucesso ao mentor:", mentorIdToUse);
        }
        
        toast({
          title: "Conta criada com sucesso",
          description: "Bem-vindo! Sua conta foi criada com sucesso.",
        });
        
        navigate("/client/login");
      }
    } catch (error) {
      console.error("Erro no registro:", error);
      setFormError(error instanceof Error ? error.message : "Ocorreu um erro durante o registro.");
      
      toast({
        variant: "destructive",
        title: "Erro no registro",
        description: error instanceof Error ? error.message : "Ocorreu um erro durante o registro.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Se estiver com erro de verificação e não estiver mais verificando
  if (verificationError && !isVerifying) {
    return (
      <div className="container flex h-screen w-screen flex-col items-center justify-center">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">Erro de Convite</CardTitle>
              <CardDescription className="text-center">
                Não foi possível verificar seu convite
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive" className="mb-4">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Erro no convite</AlertTitle>
                <AlertDescription>{verificationError}</AlertDescription>
              </Alert>
              <p className="text-center text-muted-foreground mt-4">
                O convite pode ter expirado ou já foi utilizado. Entre em contato com seu mentor para obter um novo convite.
              </p>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => navigate('/client/login')}
              >
                Ir para login
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Criar conta</CardTitle>
            <CardDescription className="text-center">
              Preencha os campos abaixo para criar sua conta
            </CardDescription>
          </CardHeader>
          <CardContent>
            {formError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erro no registro</AlertTitle>
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}
            
            <ClientRegisterForm 
              onSubmit={handleSubmit} 
              initialEmail={clientEmail || ""} 
              isLoading={isLoading || isVerifying} 
            />
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm text-muted-foreground">
              Já tem uma conta?{" "}
              <Link to="/client/login" className="text-primary underline">
                Faça login
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
