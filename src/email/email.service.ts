import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class EmailService {
    private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.USERNAME,
        pass: process.env.APP_PASSWORD,
      },
    });
  }

  async sendAccountVerificationMail(
    user: User,
    verificationCode: string,
  ) {
    const mailOptions: nodemailer.SendMailOptions = {
      from: 'nnamdidanielosuji@gmail.com',
      to: user.email,
      subject: 'VERIFY YOUR ACCOUNT',
      text: 'Account Verification',
      html: `<html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Verify Your Account</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
          }
          .container {
            width: 80%;
            margin: 20px auto;
            padding: 20px;
            background-color: #ffffff;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
            text-align: center;
          }
          h1 {
            color: #28a745;
            margin-bottom: 20px;
          }
          p {
            color: #555;
            margin-bottom: 10px;
          }
          .verification-code {
            color: #28a745;
            padding: 10px 15px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 2.5rem;
            margin: 20px 0;
          }
          .contact-info {
            margin-top: 20px;
          }
          .team-signature {
            margin-top: 20px;
            color: #888;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Verify Your Account</h1>
          <p>Hello ${user.firstName} ${user.lastName} ,</p>
          <p>Welcome to Airbnb-clone!, your one stop house rental management application. To complete your registration, please verify your email address by your one time password below:</p>
          <p>${verificationCode}</p>>
          <p>Please enter this code on the verification page to activate your account.</p>
          <p>If you did not sign up for this account, please ignore this email and contact our Support Team immediately.</p>
          <p class="contact-info">Best regards,<br>The Team</p>
          <p class="team-signature">Contact us at support@airbnb-clone.com</p>
        </div>
      </body>
      </html>`,
    };
    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Message sent: %s', info.messageId);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }
}
