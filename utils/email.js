const nodemailer = require('nodemailer');

const dns = require('dns');

const sendOTPEmail = async (email, otp) => {
    // Check if credentials exist
    const user = process.env.MAIL_USER;
    const pass = process.env.MAIL_PASS;

    if (!user || !pass) {
        console.log('==================================================');
        console.log(`[DEV MODE] OTP for ${email}: ${otp}`);
        console.log('==================================================');
        return { success: true };
    }

    try {
        // Resolve hostname to IPv4 manually to prevent IPv6 issues
        const addresses = await dns.promises.resolve4('smtp.gmail.com');
        const host = addresses[0]; // Use the first IPv4 address
        console.log(`Resolved smtp.gmail.com to IPv4: ${host}`);

        const transporter = nodemailer.createTransport({
            host: host,
            port: 465,
            secure: true, // true for 465, false for other ports
            auth: {
                user: user,
                pass: pass
            },
            tls: {
                rejectUnauthorized: false,
                servername: 'smtp.gmail.com' // Required when using IP address
            },
            connectionTimeout: 10000, // 10 seconds
            greetingTimeout: 5000,
            socketTimeout: 10000,
            // family: 4 // Already doing manual resolution
        });

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

        await transporter.sendMail(mailOptions);
        console.log(`OTP sent to ${email}`);
        return { success: true };
    } catch (error) {
        console.error('Error sending OTP email:', error);
        return { success: false, error: error.message || error };
    }
};

module.exports = { sendOTPEmail };
