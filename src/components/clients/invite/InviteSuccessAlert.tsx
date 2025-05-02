
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface InviteSuccessAlertProps {
  clientEmail: string;
  message?: string;
  serviceName?: string;
}

export function InviteSuccessAlert({ clientEmail, message, serviceName }: InviteSuccessAlertProps) {
  return (
    <Alert className="mb-4 bg-green-50 border-green-200">
      <div className="flex items-center">
        <div className="h-4 w-4 mr-2 text-green-600">✓</div>
        <div>
          <AlertTitle className="text-green-800">Convite enviado com sucesso</AlertTitle>
          <AlertDescription className="text-green-700">
            {message || `Email enviado para ${clientEmail}`}
            {serviceName && (
              <span className="text-xs ml-1 bg-green-100 px-2 py-1 rounded text-green-800">
                via {serviceName}
              </span>
            )}
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
}
