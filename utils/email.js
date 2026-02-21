const nodemailer = require('nodemailer');

const sendOTPEmail = async (email, otp) => {
    // Ensure environment variables are used for production
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: user,
                pass: pass
            }
        });

        // Verify connection configuration before sending
        await transporter.verify();
        console.log("SMTP Server is ready to take our messages");

        const mailOptions = {
            from: user,
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
        console.log(`OTP sent successfully to ${email}. Message ID: ${info.messageId}`);
        return { success: true };
    } catch (error) {
        console.error('Failed to send OTP email:', error.message || error);
        return { success: false, error: 'Failed to send OTP email: ' + (error.message || 'Connection timeout or other error') };
    }
};

module.exports = { sendOTPEmail };
