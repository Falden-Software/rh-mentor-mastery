
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ClientRegisterForm, ClientRegistrationFormData } from "@/components/auth/client/ClientRegisterForm";
import { useInviteVerification } from "@/hooks/useInviteVerification";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function ClientRegister() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { register } = useAuth();
  
  // Buscar o mentor_id e email do URL search params
  const searchParams = new URLSearchParams(window.location.search);
  const mentorId = searchParams.get("mentor_id");
  const clientEmail = searchParams.get("email");
  const token = searchParams.get("token"); // Token de convite do Supabase
  
  // Verificar o token de convite
  const { isVerifying } = useInviteVerification({ token });

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
      
      // Tenta encontrar um convite não utilizado para este email
      const { data: invitationData } = await supabase
        .from('invitation_codes')
        .select('mentor_id')
        .eq('email', values.email)
        .eq('is_used', false)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // Determina o mentor_id para vincular ao cliente
      const mentorIdToUse = mentorId || (invitationData?.mentor_id as string | null);

      if (!mentorIdToUse) {
        toast({
          variant: "destructive",
          title: "Erro no registro",
          description: "Não foi possível encontrar um mentor válido para associar à sua conta.",
        });
        setIsLoading(false);
        return;
      }
      
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
        // Marcar convites como utilizados
        const { error: updateError } = await supabase
          .from('invitation_codes')
          .update({ 
            is_used: true,
            used_by: result.id
          })
          .eq('email', values.email)
          .eq('is_used', false);
        
        if (updateError) {
          console.error("Erro ao atualizar códigos de convite:", updateError);
        }
        
        // Vincular cliente ao mentor
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ mentor_id: mentorIdToUse })
          .eq('id', result.id);
          
        if (profileError) {
          console.error("Erro ao vincular cliente ao mentor:", profileError);
        }
      }
      
      toast({
        title: "Conta criada com sucesso",
        description: "Bem-vindo! Sua conta foi criada com sucesso.",
      });
      
      navigate("/client/login");
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

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
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
