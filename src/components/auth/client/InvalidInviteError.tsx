
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

interface InvalidInviteErrorProps {
  error: string;
}

export const InvalidInviteError: React.FC<InvalidInviteErrorProps> = ({ error }) => {
  const navigate = useNavigate();
  
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
              <AlertDescription>{error}</AlertDescription>
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
};
