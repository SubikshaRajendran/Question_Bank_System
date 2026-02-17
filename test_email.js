require('dotenv').config();
const nodemailer = require('nodemailer');

const testEmail = async () => {
    const user = process.env.MAIL_USER;
    const pass = process.env.MAIL_PASS;
    const service = process.env.MAIL_SERVICE || 'gmail';

    console.log('--- Email Configuration Check ---');
    console.log(`MAIL_USER: ${user ? 'Set' : 'Missing'}`);
    console.log(`MAIL_PASS: ${pass ? 'Set' : 'Missing'}`);
    console.log(`MAIL_SERVICE: ${service}`);

    if (!user || !pass) {
        console.error('Error: MAIL_USER or MAIL_PASS is missing in .env');
        return;
    }

    try {
        const transporter = nodemailer.createTransport({
            service: service,
            auth: {
                user: user,
                pass: pass
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        console.log('Attempting to send test email...');
        const info = await transporter.sendMail({
            from: user,
            to: user, // Send to self
            subject: 'Test Email from Question Bank System',
            text: 'If you receive this, email sending is working correctly.'
        });

        console.log('Email sent successfully!');
        console.log('Message ID:', info.messageId);
    } catch (error) {
        console.error('Email sending failed!');
        console.error('Error Code:', error.code);
        console.error('Error Message:', error.message);
        if (error.response) {
            console.error('Server Response:', error.response);
        }
    }
};

testEmail();
