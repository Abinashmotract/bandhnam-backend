// utils/sendEmail.js
import nodemailer from 'nodemailer';

// Create a reusable transporter using environment variables
const createTransporter = () => {
    const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS } = process.env;

    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
        throw new Error('SMTP configuration is missing in environment variables.');
    }

    return nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT),
        secure: SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS,
        },
    });
};

// Generic sendEmail function
const sendEmail = async (to, subject, html) => {
    const transporter = createTransporter();

    try {
        const info = await transporter.sendMail({
            from: `"Bandhan Nammatch" <${process.env.SMTP_USER}>`, // sender address
            to, // receiver
            subject, // Subject line
            html, // html body
        });
        console.log('Email sent:', info.messageId);
        return info;
    } catch (error) {
        console.error('Email sending error:', error);
        throw error;
    }
};

export default sendEmail;
