import asyncHandler from 'express-async-handler';
import nodemailer from 'nodemailer';

// @desc    Handle contact form submissions and send email
// @route   POST /api/contact
// @access  Public
const sendContactMessage = asyncHandler(async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    res.status(400);
    throw new Error('Name, email, and message are required');
  }

  if (message.trim().length < 10) {
    res.status(400);
    throw new Error('Message should be at least 10 characters long');
  }

  // If SMTP_HOST is not set, default to Gmail service for convenience
  const transporterConfig = process.env.SMTP_HOST
    ? {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      }
    : {
        service: 'gmail',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      };

  const transporter = nodemailer.createTransport(transporterConfig);

  const mailOptions = {
    from: process.env.CONTACT_FROM || process.env.SMTP_USER,
    to: process.env.CONTACT_TO || '23bca021@vtcbcsr.edu.in',
    subject: `Ignite Contact - Message from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Message sent successfully' });
  } catch (err) {
    console.error('Error sending contact email:', err);
    res.status(500);
    // Include original error message to make debugging easier
    throw new Error(err.message || 'Failed to send message. Please try again later.');
  }
});

export { sendContactMessage };
