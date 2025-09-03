import express from 'express';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.post('/api/contact', async (req, res) => {
  try {
    // Yahan se TypeScript types (ContactForm, Request, Response) hata diye hain
    const { firstName, lastName, email, phone, message } = req.body;

    if (!firstName || !lastName || !email || !message) {
      return res.status(400).json({ error: 'Please fill all required fields.' });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_EMAIL,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    // Owner ko bhejne wala email (koi change nahi)
    const ownerMailOptions = {
      from: `"${firstName} ${lastName}" <${process.env.GMAIL_EMAIL}>`,
      to: process.env.OWNER_EMAIL,
      subject: `📬 New Inquiry from ${firstName} ${lastName}`,
      replyTo: email,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 20px auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
          <div style="background-color: #004AAD; color: #ffffff; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">New Contact Form Submission</h1>
          </div>
          <div style="padding: 25px;">
            <h2 style="font-size: 20px; color: #004AAD; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px; margin-top: 0;">You've received a new message!</h2>
            <p>Here are the details from the Amsa Overseas website:</p>
            <div style="background-color: #f9f9f9; border-left: 4px solid #004AAD; padding: 15px; margin: 20px 0;">
              <p style="margin: 8px 0;"><strong>👤 Name:</strong> ${firstName} ${lastName}</p>
              <p style="margin: 8px 0;"><strong>✉️ Email:</strong> <a href="mailto:${email}" style="color: #007BFF; text-decoration: none;">${email}</a></p>
              <p style="margin: 8px 0;"><strong>📞 Phone:</strong> ${phone || 'Not Provided'}</p>
            </div>
            <h3 style="font-size: 18px; color: #333; margin-top: 30px;">Message:</h3>
            <div style="background-color: #ffffff; border: 1px solid #e9e9e9; border-radius: 8px; padding: 20px; margin-top: 10px;">
              <p style="margin: 0;">${message.replace(/\n/g, '<br>')}</p>
            </div>
          </div>
        </div>
      `,
    };

    // User ko bhejne wala email (koi change nahi)
    const userMailOptions = {
      from: `"Amsa Overseas" <${process.env.GMAIL_EMAIL}>`,
      to: email,
      subject: `🚀 We've Got Your Message, ${firstName}!`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 20px auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
          <div style="background-color: #4A90E2; color: #ffffff; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">Thank You For Reaching Out!</h1>
          </div>
          <div style="padding: 25px;">
            <h2 style="font-size: 20px; color: #4A90E2;">Hello ${firstName},</h2>
            <p>We have successfully received your message. Our team will get back to you within 24-48 hours.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-weight: bold;">Here's a copy of your submission:</p>
            <div style="background-color: #f9f9f9; border-left: 4px solid #4A90E2; padding: 15px; margin-top: 15px;">
              <p style="margin: 0;">${message.replace(/\n/g, '<br>')}</p>
            </div>
          </div>
        </div>
      `,
    };

    await Promise.all([
      transporter.sendMail(ownerMailOptions),
      transporter.sendMail(userMailOptions),
    ]);

    return res.status(200).json({ message: 'Email sent successfully!' });

  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ error: 'Something went wrong on the server.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running smoothly on http://localhost:${PORT}`);
});

