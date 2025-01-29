import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmail(email: string, resetToken: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${resetToken}`;

  try {
    const { data, error } = await resend.emails.send({
      from: 'MentorConnect <onboarding@resend.dev>',
      to: email,
      subject: 'Reset your password',
      html: `
        <div>
          <h1>Reset Your Password</h1>
          <p>You have requested to reset your password. Click the link below to set a new password:</p>
          <p><a href="${resetUrl}">Reset Password</a></p>
          <p>If you didn't request this, you can safely ignore this email.</p>
          <p>This link will expire in 1 hour.</p>
        </div>
      `,
    });

    if (error) {
      console.error('Failed to send reset email:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error sending reset email:', error);
    throw error;
  }
} 