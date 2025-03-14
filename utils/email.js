import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API);


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

  const baseUrl = `${process.env.WEBPAGE_URL || 'http://localhost:3000'}`; // Adjust base URL as needed

  
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

  resend.emails.send({
    from: 'GraalOnline Support <support@graalonline.com>',
    to: email,
    subject: 'Your Authentication Code',
    html: authEmailContent
  });

  return;
};

// Send ticket update email
export const sendTicketUpdateEmail = async (email, ticketId) => {
  const dashboardUrl = `${process.env.WEBPAGE_URL || 'http://localhost:3000'}/dashboard/tickets`; // Adjust base URL as needed
  const baseUrl = `${process.env.WEBPAGE_URL || 'http://localhost:3000'}`; // Adjust base URL as needed

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
  resend.emails.send({
    from: 'GraalOnline Support <support@graalonline.com>',
    to: email,
    subject: `New response for ticket #${ticketId} `,
    html: ticketUpdateEmailContent
  });

  return;
};