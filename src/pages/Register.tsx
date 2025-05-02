
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useRegisterForm } from "@/hooks/useRegisterForm";
import { RegisterForm } from "@/components/auth/register/RegisterForm";

const Register = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const typeParam = queryParams.get('type') || 'mentor';
  const emailParam = queryParams.get('email') || '';
  const userType = typeParam === 'client' ? 'client' : 'mentor';

  const [pageTitle, setPageTitle] = useState('Criar Conta');
  const [pageDescription, setPageDescription] = useState('Preencha os campos abaixo para criar sua conta');
  const [registerButtonText, setRegisterButtonText] = useState('Registrar');

  useEffect(() => {
    // Atualizar textos dinâmicos com base no tipo de usuário
    if (userType === 'client') {
      setRegisterButtonText('Registrar como Cliente');
      setPageTitle('Criar Conta de Cliente');
      setPageDescription('Preencha os campos abaixo para criar sua conta de cliente');
    } else {
      setRegisterButtonText('Registrar como Mentor');
      setPageTitle('Criar Conta de Mentor');
      setPageDescription('Preencha os campos abaixo para criar sua conta de mentor');
    }
  }, [userType]);

  const {
    formValues,
    formErrors,
    generalError,
    isSubmitting,
    isLoading,
    handleInputChange,
    handleSubmit,
    getFieldErrorClass,
  } = useRegisterForm(emailParam, userType);

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">{pageTitle}</CardTitle>
          <CardDescription className="text-center">
            {pageDescription}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm
            formValues={formValues}
            formErrors={formErrors}
            generalError={generalError}
            isSubmitting={isSubmitting}
            isLoading={isLoading}
            userType={userType}
            registerButtonText={registerButtonText}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            getFieldErrorClass={getFieldErrorClass}
          />
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-500">
            Já tem uma conta?{" "}
            <Link to="/client/login" className="text-blue-600 hover:underline">
              Faça login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Register;
