
import { supabase } from "@/lib/supabase/client";
import { InvitationResult } from "./types";
import { sendInviteEmail } from "./emailService";
import { v4 as uuidv4 } from 'uuid';

/**
 * Creates an invitation directly via the database
 * This method bypasses the regular flow to avoid RLS recursion issues
 */
export async function createInviteDirect(
  email: string,
  name: string,
  mentorId: string
): Promise<InvitationResult> {
  try {
    // Validate inputs
    if (!email?.trim()) {
      return {
        success: false,
        error: "Email é obrigatório"
      };
    }

    if (!name?.trim()) {
      return {
        success: false,
        error: "Nome é obrigatório"
      };
    }

    if (!mentorId) {
      return {
        success: false,
        error: "ID do mentor é obrigatório"
      };
    }

    const trimmedEmail = email.trim();
    const trimmedName = name.trim();
    
    // Generate a unique code for the invitation
    const inviteId = uuidv4();
    const inviteCode = inviteId.substring(0, 8).toUpperCase();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from today
    
    // Check for existing active invites for this email and mentor
    const { data: existingInvites, error: checkError } = await supabase
      .from('invitation_codes')
      .select('id')
      .eq('email', trimmedEmail)
      .eq('mentor_id', mentorId)
      .eq('is_used', false)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();
      
    if (checkError) {
      console.error("Error checking for existing invites:", checkError);
      // Continue with invite creation despite error
    }
    
    let finalInviteId = inviteId;
    
    if (existingInvites?.id) {
      // If there's an existing invite, update its expiry date
      console.log("Found existing invite, updating expiry:", existingInvites.id);
      finalInviteId = existingInvites.id;
      
      const { error: updateError } = await supabase
        .from('invitation_codes')
        .update({
          expires_at: expiresAt.toISOString()
        })
        .eq('id', finalInviteId);
        
      if (updateError) {
        console.error("Error updating existing invite:", updateError);
        // Continue with email sending despite error
      }
    } else {
      // Create a new invite record
      const { data: newInvite, error: insertError } = await supabase
        .from('invitation_codes')
        .insert({
          id: inviteId,
          code: inviteCode,
          email: trimmedEmail,
          mentor_id: mentorId,
          is_used: false,
          role: 'client',
          expires_at: expiresAt.toISOString()
        })
        .select('id')
        .single();
        
      if (insertError) {
        console.error("Error creating new invite:", insertError);
        // Try a more direct approach with RPC if insert fails
        try {
          const { data: rpcResult, error: rpcError } = await supabase.rpc(
            'create_client_invitation',
            {
              p_email: trimmedEmail,
              p_mentor_id: mentorId
            }
          );
          
          if (rpcError) {
            console.error("Error with RPC fallback:", rpcError);
            // Continue with email sending despite error
          } else if (rpcResult) {
            finalInviteId = rpcResult;
          }
        } catch (rpcFailure) {
          console.error("RPC fallback failed:", rpcFailure);
        }
      } else if (newInvite) {
        finalInviteId = newInvite.id;
      }
    }

    // Send invitation email
    console.log("Sending invitation email directly to:", trimmedEmail);
    const emailResult = await sendInviteEmail(
      trimmedEmail,
      trimmedName,
      "Seu Mentor" // Generic mentor name used to avoid another profile query
    );
    
    if (emailResult.success) {
      return {
        success: true,
        message: `Convite enviado com sucesso para ${trimmedEmail}`,
        id: finalInviteId,
        service: emailResult.service || "Email"
      };
    } else {
      return {
        success: false,
        error: emailResult.error || "Erro ao enviar email de convite",
        id: finalInviteId,
        isDomainError: emailResult.isDomainError,
        isApiKeyError: emailResult.isApiKeyError,
        isSmtpError: emailResult.isSmtpError,
        errorDetails: emailResult.errorDetails
      };
    }
  } catch (error: any) {
    console.error("Error in direct invitation creation:", error);
    return { 
      success: false, 
      error: error.message || "Erro inesperado ao criar convite"
    };
  }
}
