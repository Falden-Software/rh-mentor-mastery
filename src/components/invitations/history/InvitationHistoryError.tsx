
import React from 'react';
import { Button } from '@/components/ui/button';

interface InvitationHistoryErrorProps {
  error: Error | unknown;
  onRetry: () => void;
}

export const InvitationHistoryError: React.FC<InvitationHistoryErrorProps> = ({
  error,
  onRetry
}) => {
  return (
    <div className="space-y-4">
      <div className="text-red-500 p-4 border border-red-200 rounded-md bg-red-50">
        <h3 className="font-medium">Erro ao carregar histórico</h3>
        <p>{(error as Error)?.message || "Erro ao buscar histórico de convites"}</p>
        <Button onClick={onRetry} variant="outline" size="sm" className="mt-2">
          Tentar Novamente
        </Button>
      </div>
    </div>
  );
};
