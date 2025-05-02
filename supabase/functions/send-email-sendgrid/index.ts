
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequestBody {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  fromName?: string;
  replyTo?: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("SENDGRID_API_KEY");
    if (!apiKey) {
      console.error("SendGrid API key not configured");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "SendGrid API key not configured" 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Parse request body
    const { to, subject, html, text, from, fromName, replyTo } = await req.json() as EmailRequestBody;
    const senderEmail = from || "notifications@rhmaster.space";
    const senderName = fromName || "RH Mentor Mastery";

    console.log(`Sending email to ${to} with subject "${subject}"`);

    // Prepare the request to SendGrid's API
    const sendgridUrl = "https://api.sendgrid.com/v3/mail/send";
    const sendgridPayload = {
      personalizations: [
        {
          to: [{ email: to }],
        }
      ],
      from: {
        email: senderEmail,
        name: senderName,
      },
      subject: subject,
      content: [
        {
          type: "text/html",
          value: html,
        }
      ]
    };

    // Add plain text version if provided
    if (text) {
      sendgridPayload.content.push({
        type: "text/plain",
        value: text,
      });
    }

    // Add reply-to if provided
    if (replyTo) {
      sendgridPayload.reply_to = {
        email: replyTo,
        name: senderName,
      };
    }

    // Send the request to SendGrid
    const response = await fetch(sendgridUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sendgridPayload),
    });

    // Get the response from SendGrid
    if (response.status >= 200 && response.status < 300) {
      console.log("Email sent successfully");
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Email sent successfully", 
          service: "SendGrid" 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    } else {
      const errorText = await response.text();
      console.error(`SendGrid error: ${response.status} - ${errorText}`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `SendGrid error: ${response.status}`,
          details: errorText 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "Error sending email", 
        details: error.message || String(error) 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
