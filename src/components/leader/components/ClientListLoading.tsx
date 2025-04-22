
import React from "react";

export function ClientListLoading() {
  return (
    <div className="flex justify-center items-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      <span className="ml-2 text-gray-600">Carregando clientes...</span>
    </div>
  );
}
