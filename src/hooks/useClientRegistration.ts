
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ClientRegistrationFormData } from "@/components/auth/client/ClientRegisterForm";

export const useClientRegistration = (effectiveMentorId: string | null | undefined, token?: string | null) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { register } = useAuth();

  const handleSubmit = async (values: ClientRegistrationFormData) => {
    setIsLoading(true);
    setFormError(null);
    
    try {
      // Validações adicionais no lado do cliente
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
      
      console.log("Iniciando registro com dados validados:", { 
        email: values.email, 
        name: values.name,
        hasPassword: !!values.password,
        passwordLength: values.password.length
      });
      
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
          toast({
            variant: "destructive",
            title: "Aviso",
            description: "Conta criada, mas houve um problema ao vincular ao mentor. Entre em contato com suporte.",
          });
        } else {
          console.log("Cliente vinculado com sucesso ao mentor:", mentorIdToUse);
          toast({
            title: "Conta criada com sucesso",
            description: "Bem-vindo! Sua conta foi criada com sucesso.",
          });
        }
        
        navigate("/client/login");
      }
    } catch (error) {
      console.error("Erro no registro:", error);
      
      // Melhor tratamento de erros específicos do Supabase
      if (error instanceof Error) {
        // Tratamento de erros específicos
        if (error.message.includes("User already registered")) {
          setFormError("Este email já está registrado. Por favor, tente fazer login.");
        } else if (error.message.includes("Password")) {
          setFormError("Problema com a senha: " + error.message);
        } else {
          setFormError(error.message);
        }
      } else {
        setFormError("Ocorreu um erro durante o registro.");
      }
      
      toast({
        variant: "destructive",
        title: "Erro no registro",
        description: formError || "Ocorreu um erro durante o registro.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleSubmit,
    isLoading,
    formError,
    setFormError
  };
};
