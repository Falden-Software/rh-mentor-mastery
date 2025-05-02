
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { StatusAlert } from '@/components/ui/status-alert';
import InviteErrorAlert from '@/components/leader/invitation/InviteErrorAlert';

interface InviteErrorDisplayProps {
  errorMessage: string | null;
  errorType: "error" | "warning" | "info";
  isDomainError: boolean;
  isApiKeyError: boolean;
  isSmtpError: boolean;
  errorDetails: any;
  onRetry: () => void;
}

export function InviteErrorDisplay({
  errorMessage,
  errorType,
  isDomainError,
  isApiKeyError,
  isSmtpError,
  errorDetails,
  onRetry
}: InviteErrorDisplayProps) {
  if (!errorMessage) return null;
  
  // Domain verification issue using the specialized component
  if (isDomainError || isApiKeyError || isSmtpError) {
    return (
      <InviteErrorAlert
        error={errorMessage}
        errorDetails={errorDetails}
        isApiKeyError={isApiKeyError}
        isDomainError={isDomainError}
        isSmtpError={isSmtpError}
        onRetry={onRetry}
      />
    );
  }

  // Regular error display
  if (errorType === "error") {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erro no convite</AlertTitle>
        <AlertDescription>{errorMessage}</AlertDescription>
      </Alert>
    );
  }
  
  return (
    <StatusAlert 
      title="Problema no sistema" 
      description={errorMessage} 
      status={errorType}
    />
  );
}
