
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { Loader2 } from "lucide-react";
import { RegisterFormValues } from "@/hooks/useRegisterForm";

interface RegisterFormProps {
  formValues: RegisterFormValues;
  formErrors: Record<string, string>;
  generalError: string | null;
  isSubmitting: boolean;
  isLoading: boolean;
  userType: "mentor" | "client";
  registerButtonText: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  getFieldErrorClass: (field: string) => string;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  formValues,
  formErrors,
  generalError,
  isSubmitting,
  isLoading,
  userType,
  registerButtonText,
  handleInputChange,
  handleSubmit,
  getFieldErrorClass
}) => {
  return (
    <>
      {generalError && (
        <Alert variant="destructive" className="mb-4">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertDescription>{generalError}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Nome</Label>
          <Input
            id="name"
            name="name"
            placeholder="Seu nome completo"
            value={formValues.name}
            onChange={handleInputChange}
            className={getFieldErrorClass("name")}
          />
          {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="seu@email.com"
            value={formValues.email}
            onChange={handleInputChange}
            className={getFieldErrorClass("email")}
          />
          {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
        </div>

        <div>
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="******"
            value={formValues.password}
            onChange={handleInputChange}
            className={getFieldErrorClass("password")}
          />
          {formErrors.password && <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>}
        </div>

        <div>
          <Label htmlFor="confirmPassword">Confirmar senha</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="******"
            value={formValues.confirmPassword}
            onChange={handleInputChange}
            className={getFieldErrorClass("confirmPassword")}
          />
          {formErrors.confirmPassword && <p className="text-red-500 text-sm mt-1">{formErrors.confirmPassword}</p>}
        </div>

        {userType === "mentor" && (
          <div>
            <Label htmlFor="company">Empresa</Label>
            <Input
              id="company"
              name="company"
              placeholder="Nome da sua empresa"
              value={formValues.company}
              onChange={handleInputChange}
              className={getFieldErrorClass("company")}
            />
            {formErrors.company && <p className="text-red-500 text-sm mt-1">{formErrors.company}</p>}
          </div>
        )}

        <div>
          <Label htmlFor="phone">Telefone (opcional)</Label>
          <Input
            id="phone"
            name="phone"
            placeholder="(XX) XXXXX-XXXX"
            value={formValues.phone}
            onChange={handleInputChange}
            className={getFieldErrorClass("phone")}
          />
          {formErrors.phone && <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>}
        </div>

        <div>
          <Label htmlFor="position">Cargo (opcional)</Label>
          <Input
            id="position"
            name="position"
            placeholder="Seu cargo atual"
            value={formValues.position}
            onChange={handleInputChange}
            className={getFieldErrorClass("position")}
          />
          {formErrors.position && <p className="text-red-500 text-sm mt-1">{formErrors.position}</p>}
        </div>

        <div>
          <Label htmlFor="bio">Biografia (opcional)</Label>
          <Textarea
            id="bio"
            name="bio"
            placeholder="Conte um pouco sobre você"
            rows={3}
            value={formValues.bio}
            onChange={handleInputChange}
            className={getFieldErrorClass("bio")}
          />
          {formErrors.bio && <p className="text-red-500 text-sm mt-1">{formErrors.bio}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading || isSubmitting}>
          {(isLoading || isSubmitting) ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Registrando...
            </>
          ) : (
            registerButtonText
          )}
        </Button>
      </form>
    </>
  );
};
