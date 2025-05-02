
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

interface InviteFormFieldsProps {
  clientName: string;
  setClientName: (name: string) => void;
  clientEmail: string;
  setClientEmail: (email: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  isSubmitting: boolean;
  onCancel: () => void;
}

// Create a schema for client invitation
const formSchema = z.object({
  clientName: z.string().min(1, { message: "Nome é obrigatório" }).min(3, { message: "Nome deve ter pelo menos 3 caracteres" }),
  clientEmail: z.string().min(1, { message: "Email é obrigatório" }).email({ message: "Email inválido" }),
});

export function InviteFormFields({
  clientName,
  setClientName,
  clientEmail,
  setClientEmail,
  onSubmit,
  isSubmitting,
  onCancel
}: InviteFormFieldsProps) {
  // Setup form with react-hook-form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientName: clientName || "",
      clientEmail: clientEmail || ""
    },
    mode: "onChange"
  });

  // Update form values when props change
  useEffect(() => {
    form.setValue('clientName', clientName);
  }, [clientName, form]);
  
  useEffect(() => {
    form.setValue('clientEmail', clientEmail);
  }, [clientEmail, form]);

  // Handle the form submission
  const handleSubmit = form.handleSubmit((values) => {
    // Trim values before setting
    setClientName(values.clientName.trim());
    setClientEmail(values.clientEmail.trim());
    
    // Call the parent component's onSubmit
    onSubmit(new Event('submit') as any);
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          control={form.control}
          name="clientName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome completo</FormLabel>
              <FormControl>
                <Input
                  placeholder="Digite o nome do cliente"
                  disabled={isSubmitting}
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    setClientName(e.target.value);
                  }}
                  required
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="clientEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="cliente@empresa.com"
                  disabled={isSubmitting}
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    setClientEmail(e.target.value);
                  }}
                  required
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="pt-2 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting || !form.formState.isValid}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : "Enviar Convite"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
