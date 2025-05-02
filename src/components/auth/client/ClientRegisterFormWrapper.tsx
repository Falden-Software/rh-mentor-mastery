
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { ClientRegisterForm, ClientRegistrationFormData } from "@/components/auth/client/ClientRegisterForm";

interface ClientRegisterFormWrapperProps {
  onSubmit: (values: ClientRegistrationFormData) => Promise<void>;
  initialEmail: string;
  isLoading: boolean;
  formError: string | null;
}

export const ClientRegisterFormWrapper: React.FC<ClientRegisterFormWrapperProps> = ({
  onSubmit,
  initialEmail,
  isLoading,
  formError
}) => {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
        <Card className="shadow-lg border-muted">
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
              onSubmit={onSubmit} 
              initialEmail={initialEmail || ""} 
              isLoading={isLoading} 
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
};
