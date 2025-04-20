
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { Loader2 } from "lucide-react";
import MasterLogin from "@/components/auth/MasterLogin";

const ClientLogin = () => {
  // Login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  const { login, isLoading, error, isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user && !isRedirecting) {
      console.log("Login: usuário autenticado, redirecionando", { role: user.role, id: user.id });
      setIsRedirecting(true);
      
      // Pequeno atraso para evitar loops de redirecionamento
      setTimeout(() => {
        // Redirect based on user role
        if (user.role === "mentor") {
          navigate("/leader", { replace: true });
        } else {
          navigate("/client", { replace: true });
        }
      }, 300);
    }
  }, [isAuthenticated, user, navigate, isRedirecting]);

  // Limpa os erros específicos do campo quando o usuário começa a digitar
  useEffect(() => {
    if (formErrors.email) setFormErrors(prev => ({ ...prev, email: "" }));
  }, [email]);

  useEffect(() => {
    if (formErrors.password) setFormErrors(prev => ({ ...prev, password: "" }));
  }, [password]);
  
  // Função para preencher o campo de email com o email da conta mestre
  const handleMasterLogin = (masterEmail: string) => {
    setEmail(masterEmail);
    toast({
      title: "Email preenchido",
      description: "Agora digite a senha correspondente",
    });
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    let isValid = true;

    if (!email) {
      errors.email = "Email é obrigatório";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Email inválido";
      isValid = false;
    }

    if (!password) {
      errors.password = "Senha é obrigatória";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (!validateForm()) {
      setIsSubmitting(false);
      toast({
        variant: "destructive",
        title: "Campos inválidos",
        description: "Por favor, corrija os erros no formulário",
      });
      return;
    }
    
    try {
      console.log("Tentando fazer login com:", { email });
      await login(email, password);
    } catch (error) {
      // O erro já é tratado no contexto de autenticação
      console.error("Erro no login (capturado em ClientLogin):", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldErrorClass = (field: string) => {
    return formErrors[field] ? "border-red-500" : "";
  };

  // Se já estamos redirecionando, mostrar um indicador de loading
  if (isRedirecting) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mb-4" />
          <p className="text-xl">Redirecionando para o dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
          <CardDescription className="text-center">
            Entre com suas credenciais para acessar a plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <ExclamationTriangleIcon className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Digite seu email"
                className={getFieldErrorClass("email")}
              />
              {formErrors.email && (
                <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                className={getFieldErrorClass("password")}
              />
              {formErrors.password && (
                <p className="text-xs text-red-500 mt-1">{formErrors.password}</p>
              )}
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading || isSubmitting}>
              {isLoading || isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>
          
          {/* Componente de login mestre */}
          <MasterLogin onMasterLogin={handleMasterLogin} />
        </CardContent>
        <CardFooter className="flex justify-center space-x-4">
          <div className="text-center text-sm text-muted-foreground">
            Não tem conta?{" "}
            <Link
              to="/client/register"
              className="underline underline-offset-4 hover:text-primary"
            >
              Registre-se
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ClientLogin;
