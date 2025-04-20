
import { Resend } from "npm:resend@2.0.0";
import { EmailResult } from "./types.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

export async function sendWithResend(
  to: string,
  subject: string,
  htmlContent: string
): Promise<EmailResult> {
  try {
    const { data, error } = await resend.emails.send({
      from: "RH Mentor Mastery <onboarding@resend.dev>",
      to: [to],
      subject: subject,
      html: htmlContent
    });

    if (error) {
      console.error("Resend Error:", error);
      return {
        success: false,
        service: "Resend",
        errorCode: error.statusCode?.toString() || "UNKNOWN",
        errorMessage: error.message || "Erro desconhecido ao enviar email"
      };
    }

    return {
      success: true,
      service: "Resend",
      id: data?.id
    };
  } catch (error) {
    console.error("Resend Error:", error);
    
    return {
      success: false,
      service: "Resend",
      errorCode: "UNKNOWN",
      errorMessage: error.message || "Erro desconhecido ao enviar email"
    };
  }
}
