
import React from 'react';
import { Loader2 } from 'lucide-react';

export const InvitationHistoryLoading: React.FC = () => {
  return (
    <div className="flex justify-center items-center py-8">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <span className="ml-2">Carregando histórico de convites...</span>
    </div>
  );
};
