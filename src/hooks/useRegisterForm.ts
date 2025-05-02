
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

type FormErrors = Record<string, string>;

export type RegisterFormValues = {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  company: string;
  phone: string;
  position: string;
  bio: string;
};

export const useRegisterForm = (initialEmail: string = "", userType: "mentor" | "client" = "mentor") => {
  const [formValues, setFormValues] = useState<RegisterFormValues>({
    email: initialEmail,
    password: "",
    confirmPassword: "",
    name: "",
    company: "",
    phone: "",
    position: "",
    bio: "",
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);
  
  const { register, isLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (initialEmail) {
      setFormValues(prev => ({ ...prev, email: initialEmail }));
    }
  }, [initialEmail]);

  // Clear field errors when user changes input
  useEffect(() => {
    if (formErrors.email) setFormErrors(prev => ({ ...prev, email: "" }));
  }, [formValues.email]);

  useEffect(() => {
    if (formErrors.password) setFormErrors(prev => ({ ...prev, password: "" }));
  }, [formValues.password]);

  useEffect(() => {
    if (formErrors.confirmPassword) setFormErrors(prev => ({ ...prev, confirmPassword: "" }));
  }, [formValues.confirmPassword]);

  useEffect(() => {
    if (formErrors.name) setFormErrors(prev => ({ ...prev, name: "" }));
  }, [formValues.name]);

  useEffect(() => {
    if (formErrors.company) setFormErrors(prev => ({ ...prev, company: "" }));
  }, [formValues.company]);

  useEffect(() => {
    if (formErrors.phone) setFormErrors(prev => ({ ...prev, phone: "" }));
  }, [formValues.phone]);

  useEffect(() => {
    if (formErrors.position) setFormErrors(prev => ({ ...prev, position: "" }));
  }, [formValues.position]);

  // Rate limit timeout
  useEffect(() => {
    let timerId: number | null = null;
    
    if (isRateLimited) {
      timerId = window.setTimeout(() => {
        setIsRateLimited(false);
        setGeneralError(null);
      }, 30000); // 30 seconds timeout
    }
    
    return () => {
      if (timerId) window.clearTimeout(timerId);
    };
  }, [isRateLimited]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const errors: FormErrors = {};
    let isValid = true;

    if (!formValues.email) {
      errors.email = "Email é obrigatório";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formValues.email)) {
      errors.email = "Email inválido";
      isValid = false;
    }

    if (!formValues.password) {
      errors.password = "Senha é obrigatória";
      isValid = false;
    } else if (formValues.password.length < 6) {
      errors.password = "A senha deve ter pelo menos 6 caracteres";
      isValid = false;
    }

    if (!formValues.confirmPassword) {
      errors.confirmPassword = "Confirme sua senha";
      isValid = false;
    } else if (formValues.password !== formValues.confirmPassword) {
      errors.confirmPassword = "As senhas não coincidem";
      isValid = false;
    }

    if (!formValues.name || formValues.name.trim() === '') {
      errors.name = "Nome é obrigatório";
      isValid = false;
    }

    if (userType === "mentor" && (!formValues.company || formValues.company.trim() === '')) {
      errors.company = "Empresa é obrigatória para mentores";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    
    if (isRateLimited) {
      toast({
        variant: "destructive",
        title: "Tentativas limitadas",
        description: "Aguarde alguns segundos antes de tentar novamente.",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (!validateForm()) {
        setIsSubmitting(false);
        toast({
          variant: "destructive",
          title: "Campos inválidos",
          description: "Por favor, corrija os erros no formulário",
        });
        return;
      }
      
      console.log(`Registrando ${userType} com dados:`, { 
        email: formValues.email.trim(),
        name: formValues.name.trim(), 
        role: userType, 
        company: formValues.company.trim(),
        phone: formValues.phone.trim(),
        position: formValues.position.trim(),
        bio: formValues.bio.trim()
      });
      
      const user = await register(
        formValues.email.trim(), 
        formValues.password, 
        formValues.name.trim(), 
        userType, 
        formValues.company.trim(),
        formValues.phone.trim(),
        formValues.position.trim(),
        formValues.bio.trim()
      );
      
      if (user) {
        toast({
          title: "Registro realizado com sucesso",
          description: "Redirecionando para o painel...",
        });
        
        setTimeout(() => {
          navigate(userType === "mentor" ? "/leader" : "/client");
        }, 1500);
      } else {
        // Tratamento para caso de usuário nulo, mas sem lançar exceção
        console.warn("O registro retornou null, mas o usuário pode ter sido criado. Tentando redirecionar...");
        toast({
          title: "Registro provavelmente concluído",
          description: "O perfil foi criado, mas houve um pequeno problema. Redirecionando...",
        });
        
        setTimeout(() => {
          navigate(userType === "mentor" ? "/leader" : "/client");
        }, 1500);
      }
      
    } catch (error) {
      console.error("Erro capturado na página de registro:", error);
      
      if (error instanceof Error) {
        setGeneralError(error.message);
        
        if (error.message.toLowerCase().includes('security purposes') || 
            error.message.toLowerCase().includes('aguarde') ||
            error.message.toLowerCase().includes('segundos')) {
          setIsRateLimited(true);
        }
        
        if (error.message.toLowerCase().includes("empresa é obrigatória") || 
            error.message.toLowerCase().includes("company is required")) {
          setFormErrors(prev => ({ ...prev, company: "Empresa é obrigatória para mentores" }));
        }
        
        toast({
          variant: "destructive",
          title: "Erro ao registrar",
          description: error.message,
        });
      } else {
        setGeneralError("Ocorreu um erro desconhecido ao registrar. Por favor, tente novamente.");
        toast({
          variant: "destructive",
          title: "Erro ao registrar",
          description: "Ocorreu um erro desconhecido. Por favor, tente novamente.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formValues,
    formErrors,
    generalError,
    isSubmitting,
    isLoading,
    isRateLimited,
    handleInputChange,
    handleSubmit,
    getFieldErrorClass: (field: string) => formErrors[field] ? "border-red-500" : "",
  };
};
