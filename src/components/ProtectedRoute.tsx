
import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { hasAccess } from "@/lib/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: "mentor" | "client" | "any";
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { isAuthenticated, user, isLoading, isDevMode } = useAuth();
  const location = useLocation();
  const [isVerifying, setIsVerifying] = useState(true);

  // Aguardar um curto período para garantir que o estado de autenticação
  // foi completamente carregado e estabilizado
  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        setIsVerifying(false);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // Mostrar estado de carregamento se ainda estiver verificando autenticação
  if (isLoading || isVerifying) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        <span className="ml-3">Carregando...</span>
      </div>
    );
  }

  // Verificação simples de desenvolvimento
  if (isDevMode) {
    console.log("DEV MODE: Bypassing access check for", requiredRole);
    return <>{children}</>;
  }

  // Não autenticado - redirecionar para login
  if (!isAuthenticated || !user) {
    console.log("Redirecionando para login: usuário não autenticado", { isAuthenticated, userId: user?.id });
    return <Navigate to="/client/login" state={{ from: location }} replace />;
  }

  // Verificar acesso baseado em função
  if (!hasAccess(user, requiredRole)) {
    console.log("Acesso negado para função:", requiredRole, "usuário tem função:", user.role);
    
    // Redirecionar para dashboard apropriado baseado na função
    if (user.role === "mentor") {
      return <Navigate to="/leader" replace />;
    } else {
      return <Navigate to="/client" replace />;
    }
  }

  // Renderizar filhos se todas as verificações passarem
  console.log("Acesso permitido para", user.name, "com função", user.role);
  return <>{children}</>;
};

export default ProtectedRoute;
