import nodemailer from 'nodemailer';
import 'dotenv/config';

const mailTransporter = nodemailer.createTransport({
  service: 'hotmail',
  auth: {
    user: `${process.env.EMAIL_FROM}`,
    pass: `${process.env.EMAIL_PASS}`
  }
});

export { mailTransporter };