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
import ClientRegister from "./pages/ClientRegister"; 
import Register from "./pages/Register";
import AnimalProfileTestPage from "./pages/AnimalProfileTestPage";
import AnimalProfileResultsPage from "./pages/AnimalProfileResultsPage";
import EgogramaTestPage from "./pages/EgogramaTestPage";
import ProactivityTestPage from "./pages/ProactivityTestPage";
import TestResultPage from "./pages/TestResultPage";

const queryClient = new QueryClient();

function App() {
  return (
    <React.StrictMode>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <TooltipProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/client/login" element={<ClientLogin />} />
                
                {/* Client routes */}
                <Route path="/client/register" element={<ClientRegister />} />
                <Route path="/register" element={<Register />} />
                
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
                  path="/client/tests/animal-profile" 
                  element={
                    <ProtectedRoute requiredRole="client">
                      <AnimalProfileTestPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/client/tests/animal-profile/results/:resultId" 
                  element={
                    <ProtectedRoute requiredRole="client">
                      <AnimalProfileResultsPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/client/tests/egograma" 
                  element={
                    <ProtectedRoute requiredRole="client">
                      <EgogramaTestPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/client/tests/proactivity" 
                  element={
                    <ProtectedRoute requiredRole="client">
                      <ProactivityTestPage />
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
                  path="/client/results/:resultId" 
                  element={
                    <ProtectedRoute requiredRole="client">
                      <TestResultPage />
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
                
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
              <Sonner />
            </TooltipProvider>
          </AuthProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
}

export default App;
