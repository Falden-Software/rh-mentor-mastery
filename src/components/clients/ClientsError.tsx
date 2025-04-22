
import { RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ClientsErrorProps {
  error: string;
  onRetry: () => void;
}

export function ClientsError({ error, onRetry }: ClientsErrorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Seus Clientes</CardTitle>
      </CardHeader>
      <CardContent>
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro ao carregar clientes</AlertTitle>
          <AlertDescription>
            <p>{error}</p>
            <Button 
              onClick={onRetry} 
              variant="outline" 
              size="sm" 
              className="mt-2"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Tentar novamente
            </Button>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
