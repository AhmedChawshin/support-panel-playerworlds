import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API);


const emailStyles = `
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Arial', sans-serif;
      background-color: #F7FAFC; /* Light gray background for email client compatibility */
      color: #2D3748; /* Dark gray text for readability */
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #FFFFFF; /* White card for contrast */
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    .header {
      background-color: #2D3748; /* Dark header */
      padding: 15px;
      text-align: center;
    }
    .header img {
      max-width: 180px;
      height: auto;
    }
    .content {
      padding: 25px;
    }
    .content p {
      font-size: 16px;
      line-height: 1.6;
      margin: 0 0 15px;
      color: #4A5568; /* Softer dark gray for body text */
    }
    .code-box {
      display: inline-block;
      background-color: #319795; /* Teal */
      color: #FFFFFF;
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 18px;
      font-weight: bold;
      letter-spacing: 1px;
      margin: 10px 0;
    }
    .button {
      display: inline-block;
      background-color: #319795;
      color: #FFFFFF;
      padding: 10px 20px;
      border-radius: 6px;
      text-decoration: none;
      font-size: 14px;
      font-weight: bold;
    }
    .button:hover {
      background-color: #2C7A7B;
    }
    .footer {
      background-color: #EDF2F7; /* Light gray footer */
      padding: 10px;
      text-align: center;
      font-size: 12px;
      color: #718096; /* Muted gray */
    }
    a {
      color: #319795;
      text-decoration: underline;
    }
    a:hover {
      color: #2C7A7B;
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
        <p>Your authentication code for the GraalOnline Support Panel is:</p>
        <div class="code-box">${code}</div>
        <p>This code expires in 15 minutes. Enter it on the login page to continue.</p>
        <p>If you didn’t request this, you can safely ignore this email.</p>
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} Graal Online Support. All rights reserved.</p>
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
        <p>Your ticket <strong>#${ticketId}</strong> has been updated by our support team.</p>
        <p>View the latest updates and reply if needed:</p>
        <a href="${dashboardUrl}" class="button">View Ticket</a>
        <p><a href="${dashboardUrl}">${dashboardUrl}</a></p>
        <p>Best regards,<br />GraalOnline Era Support</p>
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} Graal Online Support. All rights reserved.</p>
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