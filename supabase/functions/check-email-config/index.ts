
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function handleRequest(req: Request): Promise<Response> {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const isConfigured = Boolean(resendApiKey);
    
    console.log("Verificação de configuração de e-mail:", {
      hasResendApiKey: Boolean(resendApiKey),
      isConfigured
    });
    
    return new Response(
      JSON.stringify({
        success: true,
        configured: isConfigured,
        hasResendApiKey: Boolean(resendApiKey)
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      }
    );
  } catch (error) {
    console.error("Erro ao verificar configuração de e-mail:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: "Erro ao verificar configuração de e-mail",
        details: error.message
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      }
    );
  }
}

serve(handleRequest);
