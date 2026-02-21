const nodemailer = require('nodemailer');
const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

const sendOTPEmail = async (email, otp) => {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp-relay.brevo.com",
            port: 587,
            secure: false, // Brevo uses TLS/STARTTLS on 587
            auth: {
                user: process.env.BREVO_SMTP_USER,
                pass: process.env.BREVO_SMTP_PASS
            },
            connectionTimeout: 10000,
            greetingTimeout: 10000,
            socketTimeout: 10000
        });

        console.log("Sending OTP to:", email);

        const mailOptions = {
            from: process.env.BREVO_SMTP_USER,
            to: email,
            subject: 'Question Bank System - OTP Verification',
            text: `Your OTP for login is: ${otp}\n\nThis OTP is valid for 10 minutes.`,
            html: `<div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                    <h2 style="color: #4f46e5;">Question Bank System</h2>
                    <p>Your OTP for login is:</p>
                    <h1 style="background: #f3f4f6; padding: 10px; display: inline-block; border-radius: 5px; letter-spacing: 5px;">${otp}</h1>
                    <p>This OTP is valid for 10 minutes.</p>
                   </div>`
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("OTP sent successfully. Message ID:", info.messageId);
        return { success: true };
    } catch (error) {
        console.error('Failed to send OTP email:', error.message || error);
        return { success: false, error: 'Failed to send OTP email: ' + (error.message || 'Connection timeout or other error') };
    }
};

module.exports = { sendOTPEmail };
