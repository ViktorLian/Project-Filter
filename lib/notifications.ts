type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail(payload: EmailPayload) {
  // In production, integrate with your email provider (SendGrid, Resend, etc.)
  if (process.env.NODE_ENV !== 'production') {
    console.log('[EMAIL]', payload);
  }
  // TODO: Implement actual email sending
}

export async function notifyNewLead(to: string, leadId: string, companyName: string) {
  await sendEmail({
    to,
    subject: `New project inquiry - ${companyName}`,
    html: `
      <h2>New Project Lead</h2>
      <p>You have received a new project inquiry.</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/leads/${leadId}">View Lead</a></p>
    `,
  });
}
