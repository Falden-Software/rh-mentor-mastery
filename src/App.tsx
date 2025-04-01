
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LeaderDashboard from "./pages/LeaderDashboard";
import LeaderClients from "./pages/LeaderClients";
import LeaderResults from "./pages/LeaderResults";
import LeaderRankings from "./pages/LeaderRankings";
import LeaderReports from "./pages/LeaderReports";
import LeaderSubscription from "./pages/LeaderSubscription";
import LeaderSettings from "./pages/LeaderSettings";
import ClientDashboard from "./pages/ClientDashboard";
import ClientTests from "./pages/ClientTests";
import ClientResults from "./pages/ClientResults";
import ClientProfile from "./pages/ClientProfile";
import ClientAccount from "./pages/ClientAccount";
import ClientLogin from "./pages/ClientLogin";
import Register from "./pages/Register";

const queryClient = new QueryClient();

const App = () => {
  return (
    <React.StrictMode>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/client/login" element={<ClientLogin />} />
                <Route path="/register" element={<Register />} />
                
                {/* Leader (Mentor) Routes - Protected */}
                <Route 
                  path="/leader" 
                  element={
                    <ProtectedRoute requiredRole="mentor">
                      <LeaderDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/leader/clients" 
                  element={
                    <ProtectedRoute requiredRole="mentor">
                      <LeaderClients />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/leader/results" 
                  element={
                    <ProtectedRoute requiredRole="mentor">
                      <LeaderResults />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/leader/rankings" 
                  element={
                    <ProtectedRoute requiredRole="mentor">
                      <LeaderRankings />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/leader/reports" 
                  element={
                    <ProtectedRoute requiredRole="mentor">
                      <LeaderReports />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/leader/subscription" 
                  element={
                    <ProtectedRoute requiredRole="mentor">
                      <LeaderSubscription />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/leader/settings" 
                  element={
                    <ProtectedRoute requiredRole="mentor">
                      <LeaderSettings />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Client Routes - Protected */}
                <Route 
                  path="/client" 
                  element={
                    <ProtectedRoute requiredRole="client">
                      <ClientDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/client/tests" 
                  element={
                    <ProtectedRoute requiredRole="client">
                      <ClientTests />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/client/results" 
                  element={
                    <ProtectedRoute requiredRole="client">
                      <ClientResults />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/client/profile" 
                  element={
                    <ProtectedRoute requiredRole="client">
                      <ClientProfile />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/client/account" 
                  element={
                    <ProtectedRoute requiredRole="client">
                      <ClientAccount />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Catch-all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </TooltipProvider>
          </AuthProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
};

export default App;
