
import React from "react";
import { XCircle, AlertTriangle, Wifi } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface InviteErrorAlertProps {
  error?: string;
  errorDetails?: any;
  isApiKeyError?: boolean;
  isDomainError?: boolean;
  isSmtpError?: boolean;
  onRetry?: () => void;
}

const InviteErrorAlert: React.FC<InviteErrorAlertProps> = ({ 
  error, 
  errorDetails,
  isApiKeyError, 
  isDomainError,
  isSmtpError,
  onRetry
}) => {
  if (!error) return null;
  
  return (
    <Alert 
      className={`mt-4 ${isDomainError ? 'bg-amber-50 text-amber-800 border-amber-200' : 
                          isApiKeyError ? 'bg-yellow-50 text-yellow-800 border-yellow-200' : 
                          isSmtpError ? 'bg-orange-50 text-orange-800 border-orange-200' :
                          'bg-red-50 text-red-800 border-red-200'}`}
    >
      {isDomainError ? (
        <AlertTriangle className="h-4 w-4 mr-2" />
      ) : isApiKeyError ? (
        <AlertTriangle className="h-4 w-4 mr-2" />
      ) : isSmtpError ? (
        <Wifi className="h-4 w-4 mr-2" />
      ) : (
        <XCircle className="h-4 w-4 mr-2" />
      )}
      <AlertTitle>
        {isDomainError ? 'Domínio não verificado' : 
         isApiKeyError ? 'Chave de API não configurada' : 
         isSmtpError ? 'Erro de conexão' :
         'Erro ao enviar convite'}
      </AlertTitle>
      <AlertDescription className="space-y-4">
        {isDomainError ? (
          <>
            {error}
            <p className="mt-2 text-sm">
              Para enviar emails para qualquer destinatário, você precisa verificar um domínio no Resend:
            </p>
            <ol className="list-decimal list-inside mt-1 text-sm">
              <li>Acesse <a href="https://resend.com/domains" target="_blank" rel="noopener noreferrer" className="underline">https://resend.com/domains</a></li>
              <li>Adicione e verifique seu domínio</li>
              <li>Atualize a função Edge para usar seu domínio verificado</li>
            </ol>
          </>
        ) : isApiKeyError ? (
          <>
            {error}
            <p className="mt-2 text-sm">
              O administrador do sistema precisa configurar a chave RESEND_API_KEY nas funções do Supabase.
            </p>
          </>
        ) : isSmtpError ? (
          <>
            <p className="font-medium">
              Erro ao enviar email: Failed to send a request to the Edge Function
            </p>
            <p className="mt-2 text-sm">
              Ocorreu um erro na conexão com a API do Resend. Verifique se a chave de API está correta nas variáveis de ambiente do Supabase.
            </p>
            
            {onRetry && (
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onRetry}
                  className="bg-orange-100 hover:bg-orange-200 border-orange-300"
                >
                  Tentar novamente
                </Button>
              </div>
            )}
          </>
        ) : (
          error
        )}
        {errorDetails && (
          <details className="mt-2">
            <summary className="text-sm cursor-pointer">Ver detalhes técnicos</summary>
            <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
              {JSON.stringify(errorDetails, null, 2)}
            </pre>
          </details>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default InviteErrorAlert;
