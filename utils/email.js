import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API);

// Common email template styles
const emailStyles = `
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Arial', sans-serif;
      background-color: #1A202C;
      color: #FFFFFF;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #1A202C;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }
    .header {
      background-color: #2D3748;
      padding: 20px;
      text-align: center;
    }
    .header img {
      max-width: 200px;
    }
    .content {
      padding: 30px;
    }
    .content p {
      font-size: 16px;
      line-height: 1.5;
      margin: 0 0 20px;
    }
    .code-box {
      display: inline-block;
      background-color: #319795;
      color: #FFFFFF;
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 20px;
      font-weight: bold;
      letter-spacing: 2px;
      margin: 10px 0;
    }
    .button {
      display: inline-block;
      background-color: #319795;
      color: #FFFFFF;
      padding: 12px 24px;
      border-radius: 8px;
      text-decoration: none;
      font-size: 16px;
      font-weight: bold;
    }
    .button:hover {
      background-color: #2C7A7B;
    }
    .footer {
      background-color: #2D3748;
      padding: 15px;
      text-align: center;
      font-size: 12px;
      color: #A0AEC0;
    }
  </style>
`;


// Send authentication code email
export const sendCodeEmail = async (email, code) => {

  const baseUrl = `${process.env.WEBPAGE_URL || 'http://localhost:3000'}`; // Adjust base URL as needed

  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      ${emailStyles}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${baseUrl}/images/logograalonline.png" alt="Graal Online Logo" />
        </div>
        <div class="content">
          <p>Hello ${email},</p>
          <p>Here's your authentication code to log in to the GraalOnline Support Panel:</p>
          <div class="code-box">${code}</div>
          <p>This code is valid for 15 minutes. Please enter it on the login page to proceed.</p>
          <p>If you didn’t request this, feel free to ignore this email.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Graal Online Support. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  resend.emails.send({
    from: 'graal-noreply@resend.dev',
    to: email,
    subject: 'Your Authentication Code',
    html: htmlContent
  });

  return;
};

// Send ticket update email
export const sendTicketUpdateEmail = async (email, ticketId) => {
  const dashboardUrl = `${process.env.WEBPAGE_URL || 'http://localhost:3000'}/dashboard/tickets`; // Adjust base URL as needed
  const baseUrl = `${process.env.WEBPAGE_URL || 'http://localhost:3000'}`; // Adjust base URL as needed

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      ${emailStyles}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${baseUrl}/images/logograalonline.png" alt="Graal Online Logo" />
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>Your ticket <b>#${ticketId}</b> has been updated by our support team.</p>
          <p>Check the latest updates and respond if needed:</p>
          <a href="${dashboardUrl}" class="button">View Ticket</a>
          <p><a href="${dashboardUrl}">${dashboardUrl}</a></p>
          <br />
          <p>Best regards,</p>
          <p>GraalOnline Era Support<p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Graal Online Support. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  resend.emails.send({
    from: 'graal-noreply@resend.dev',
    to: email,
    subject: 'Ticket Update',
    html: htmlContent
  });

  return;
};