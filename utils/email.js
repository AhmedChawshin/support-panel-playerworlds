import { Resend } from 'resend';
import nodemailer from 'nodemailer';

// Initialize Resend client with error checking
const resend = process.env.RESEND_API ? new Resend(process.env.RESEND_API) : null;
if (!process.env.RESEND_API) {
  console.error('RESEND_API environment variable is not set, falling back to Gmail');
}

// Gmail transporter setup (used as fallback)
const gmailTransporter = nodemailer.createTransport({
  Service: "Gmail",
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
  console.error('Gmail configuration incomplete:', {
    hasUser: !!process.env.GMAIL_USER,
    hasPass: !!process.env.GMAIL_PASS,
  });
}

const emailStyles = `
  <style>
    body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #F7FAFC; color: #2D3748; }
    table { border-collapse: collapse; }
    .container { max-width: 600px; margin: 20px auto; background: #FFF; border: 1px solid #E2E8F0; border-radius: 8px; }
    .header { background: #2D3748; padding: 15px; text-align: center; }
    .header img { max-width: 180px; height: auto; display: block; margin: 0 auto; }
    .content { padding: 20px; }
    .content p { font-size: 16px; line-height: 1.5; margin: 0 0 12px; color: #4A5568; }
    .code-box { background: #319795; color: #FFF; padding: 8px 16px; border-radius: 6px; font-size: 18px; font-weight: bold; display: inline-block; margin: 8px 0; }
    .button { background: #319795; color: #FFF; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: bold; display: inline-block; }
    .footer { background: #EDF2F7; padding: 12px; text-align: center; font-size: 12px; color: #2D3748; border-top: 1px solid #E2E8F0; }
    a { color: #319795; text-decoration: underline; }
  </style>
`;

// Send authentication code email
export const sendCodeEmail = async (email, code) => {
  const baseUrl = `${process.env.WEBPAGE_URL || 'http://localhost:3000'}`;
  
  const authEmailContent = `
  <!DOCTYPE html>
  <html>
  <head>
    ${emailStyles}
  </head>
  <body>
    <table class="container" width="100%" style="max-width: 600px; margin: 20px auto; background: #FFF; border: 1px solid #E2E8F0; border-radius: 8px;">
      <tr>
        <td class="header" style="background: #2D3748; padding: 15px; text-align: center;">
          <img src="${baseUrl}/images/logograalonline.png" alt="Graal Online" style="max-width: 180px; height: auto; display: block; margin: 0 auto;" />
        </td>
      </tr>
      <tr>
        <td class="content" style="padding: 20px;">
          <p style="font-size: 16px; line-height: 1.5; margin: 0 0 12px; color: #4A5568;">Hello ${email},</p>
          <p style="font-size: 16px; line-height: 1.5; margin: 0 0 12px; color: #4A5568;">Your authentication code is:</p>
          <div class="code-box" style="background: #319795; color: #FFF; padding: 8px 16px; border-radius: 6px; font-size: 18px; font-weight: bold; display: inline-block; margin: 8px 0;">${code}</div>
          <p style="font-size: 16px; line-height: 1.5; margin: 0 0 12px; color: #4A5568;">Valid for 15 minutes. Enter it on the login page.</p>
          <p style="font-size: 16px; line-height: 1.5; margin: 0 0 12px; color: #4A5568;">Ignore if you didn’t request this.</p>
        </td>
      </tr>
      <tr>
        <td class="footer" style="background: #EDF2F7; padding: 12px; text-align: center; font-size: 12px; color: #2D3748; border-top: 1px solid #E2E8F0;">
          © ${new Date().getFullYear()} Graal Online Support. All rights reserved.
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
  try {
    if (resend) {
      const response = await resend.emails.send({
        from: 'GraalOnline Support <onboarding@resend.dev>',
        to: email,
        subject: 'Your Authentication Code',
        html: authEmailContent,
      });
      console.log('Resend response:', response);
    } else {
      if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
        console.error('Cannot send email via Gmail: Missing credentials', {
          email,
          hasUser: !!process.env.GMAIL_USER,
          hasPass: !!process.env.GMAIL_PASS,
        });
        return null;
      }

      const mailOptions = {
        from: `GraalOnline Support <${process.env.GMAIL_USER}>`,
        to: email,
        subject: 'Your Authentication Code',
        html: authEmailContent,
      };

      try {
        const info = await gmailTransporter.sendMail(mailOptions);
        console.log('Gmail response:', info);
      } catch (gmailError) {
        console.error('Gmail sending failed:', {
          error: gmailError.message,
          code: gmailError.code,
          response: gmailError.response,
          email,
        });
      }
    }
  } catch (error) {
    console.error('Email sending failed:', {
      error: error.message,
      method: resend ? 'Resend' : 'Gmail',
      email,
    });
  }

  return null;
};

// Send ticket update email
export const sendTicketUpdateEmail = async (email, ticketId) => {
  const dashboardUrl = `${process.env.WEBPAGE_URL || 'http://localhost:3000'}/dashboard/tickets`;
  const baseUrl = `${process.env.WEBPAGE_URL || 'http://localhost:3000'}`;

 const ticketUpdateEmailContent = `
    <!DOCTYPE html>
    <html>
    <head>
      ${emailStyles}
    </head>
    <body>
      <table class="container" width="100%" style="max-width: 600px; margin: 20px auto; background: #FFF; border: 1px solid #E2E8F0; border-radius: 8px;">
        <tr>
          <td class="header" style="background: #2D3748; padding: 15px; text-align: center;">
            <img src="${baseUrl}/images/logograalonline.png" alt="Graal Online" style="max-width: 180px; height: auto; display: block; margin: 0 auto;" />
          </td>
        </tr>
        <tr>
          <td class="content" style="padding: 20px;">
            <p style="font-size: 16px; line-height: 1.5; margin: 0 0 12px; color: #4A5568;">Hello,</p>
            <p style="font-size: 16px; line-height: 1.5; margin: 0 0 12px; color: #4A5568;">Your ticket <strong>#${ticketId}</strong> has been updated.</p>
            <p style="font-size: 16px; line-height: 1.5; margin: 0 0 12px; color: #4A5568;">View updates or reply:</p>
            <a href="${dashboardUrl}" class="button" style="background: #319795; color: #FFF; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: bold; display: inline-block;">View Ticket</a>
            <p style="font-size: 16px; line-height: 1.5; margin: 0 0 12px; color: #4A5568;"><a href="${dashboardUrl}" style="color: #319795; text-decoration: underline;">${dashboardUrl}</a></p>
            <p style="font-size: 16px; line-height: 1.5; margin: 0 0 12px; color: #4A5568;">Best regards,<br>GraalOnline Era Support</p>
          </td>
        </tr>
        <tr>
          <td class="footer" style="background: #EDF2F7; padding: 12px; text-align: center; font-size: 12px; color: #2D3748; border-top: 1px solid #E2E8F0;">
            © ${new Date().getFullYear()} Graal Online Support. All rights reserved.
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;
  try {
    if (resend) {
      const response = await resend.emails.send({
        from: 'GraalOnline Support <onboarding@resend.dev>',
        to: email,
        subject: `New response for ticket #${ticketId}`,
        html: ticketUpdateEmailContent,
      });
      console.log('Resend response:', response);
    } else {
      if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
        console.error('Cannot send ticket update via Gmail: Missing credentials', {
          email,
          ticketId,
          hasUser: !!process.env.GMAIL_USER,
          hasPass: !!process.env.GMAIL_PASS,
        });
        return null;
      }

      const mailOptions = {
        from: `GraalOnline Support <${process.env.GMAIL_USER}>`,
        to: email,
        subject: `New response for ticket #${ticketId}`,
        html: ticketUpdateEmailContent,
      };

      try {
        const info = await gmailTransporter.sendMail(mailOptions);
        console.log('Gmail response:', info);
      } catch (gmailError) {
        console.error('Gmail ticket update sending failed:', {
          error: gmailError.message,
          code: gmailError.code,
          response: gmailError.response,
          email,
          ticketId,
        });
      }
    }
  } catch (error) {
    console.error('Ticket update email sending failed:', {
      error: error.message,
      method: resend ? 'Resend' : 'Gmail',
      email,
      ticketId,
    });
  }

  return null;
};