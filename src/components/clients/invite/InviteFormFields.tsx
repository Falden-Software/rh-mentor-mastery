
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormControl } from "@/components/ui/form";

interface InviteFormFieldsProps {
  clientName: string;
  setClientName: (name: string) => void;
  clientEmail: string;
  setClientEmail: (email: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  isSubmitting: boolean;
  onCancel: () => void;
}

export function InviteFormFields({
  clientName,
  setClientName,
  clientEmail,
  setClientEmail,
  onSubmit,
  isSubmitting,
  onCancel
}: InviteFormFieldsProps) {
  // Email validation function
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isEmailValid = clientEmail.length === 0 || validateEmail(clientEmail);

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="clientName">Nome completo</Label>
        <FormControl>
          <Input
            id="clientName"
            placeholder="Digite o nome do cliente"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </FormControl>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="clientEmail">Email</Label>
        <FormControl>
          <Input
            id="clientEmail"
            type="email"
            placeholder="cliente@empresa.com"
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
            required
            disabled={isSubmitting}
            className={!isEmailValid ? "border-red-500" : ""}
          />
        </FormControl>
        {!isEmailValid && (
          <p className="text-red-500 text-sm mt-1">Email inválido</p>
        )}
      </div>
      
      <div className="pt-2 flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting || !clientName || !clientEmail || !validateEmail(clientEmail)}
        >
          {isSubmitting ? "Enviando..." : "Enviar Convite"}
        </Button>
      </div>
    </form>
  );
}
