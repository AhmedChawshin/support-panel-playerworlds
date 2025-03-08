import nodemailer from 'nodemailer';

let transporter;

async function initializeTransporter() {
  // Use Ethereal's test account for development
  const testAccount = await nodemailer.createTestAccount();
  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user, // Ethereal test user
      pass: testAccount.pass, // Ethereal test password
    },
  });
  console.log('Ethereal credentials:', { user: testAccount.user, pass: testAccount.pass });
  return transporter;
}

// Ensure transporter is initialized only once
if (!transporter) {
  initializeTransporter();
}

export async function sendCodeEmail(email, code) {
  if (!transporter) {
    await initializeTransporter();
  }
  try {
    const info = await transporter.sendMail({
      from: '"Support Panel" <noreply@supportpanel.test>',
      to: email,
      subject: 'Your Authentication Code',
      text: `Your code is: ${code}`,
      html: `<p>Your code is: <strong>${code}</strong></p>`,
    });
    console.log(`Code email sent to ${email}. Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

export async function sendTicketUpdateEmail(email, ticketId) {
  if (!transporter) {
    await initializeTransporter();
  }
  try {
    const info = await transporter.sendMail({
      from: '"Support Panel" <noreply@supportpanel.test>',
      to: email,
      subject: 'Ticket Update',
      text: `Your ticket #${ticketId} has been updated.`,
      html: `<p>Your ticket #${ticketId} has been updated.</p>`,
    });
    console.log(`Ticket update email sent to ${email}. Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}