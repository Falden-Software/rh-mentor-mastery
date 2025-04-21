
export const buildInviteEmailHtml = (
  clientName: string | undefined, 
  mentorName: string, 
  mentorCompany: string,
  registerUrl?: string
) => {
  const clientNameText = clientName ? `Olá ${clientName},` : 'Olá,';
  const finalRegisterUrl = registerUrl || 'https://rhmaster.space/register?type=client';
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
      <h2 style="color: #4F46E5;">${clientNameText}</h2>
      
      <p>Você foi convidado(a) por <strong>${mentorName}</strong> da empresa <strong>${mentorCompany}</strong> para participar da plataforma RH Mentor Mastery.</p>
      
      <p>Para se registrar, clique no link abaixo:</p>
      
      <p style="text-align: center;">
        <a href="${finalRegisterUrl}" style="background-color: #4F46E5; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Registrar-se Agora</a>
      </p>
      
      <p><em>Este convite é válido por 7 dias.</em></p>
      
      <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
      
      <p style="font-size: 12px; color: #777;">
        Atenciosamente,<br>
        Equipe RH Mentor Mastery
      </p>
    </div>
  `;
};
