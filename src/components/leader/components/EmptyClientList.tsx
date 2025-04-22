
import { UserX } from "lucide-react";

export function EmptyClientList() {
  return (
    <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg">
      <UserX className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-medium text-gray-900">Sem clientes</h3>
      <p className="mt-1 text-sm text-gray-500">
        Você ainda não tem clientes registrados. Convide novos clientes para começar.
      </p>
    </div>
  );
}
