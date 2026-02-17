const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

const dns = require('dns');

// GET Route for browser testing
router.get('/email', async (req, res) => {
    // Wrap the POST logic or call it directly
    req.body.email = req.query.email || 'test_debug@example.com';
    // We'll duplicate logic for simplicity to ensure it works
    await handleDebugEmail(req, res);
});

router.post('/email', handleDebugEmail);

async function handleDebugEmail(req, res) {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const user = process.env.MAIL_USER;
    const pass = process.env.MAIL_PASS;

    // Diagnostic DNS Lookup
    let dnsInfo = { ipv4: [], ipv6: [] };
    try {
        const ipv4 = await dns.promises.resolve4('smtp.gmail.com').catch(e => e.message);
        const ipv6 = await dns.promises.resolve6('smtp.gmail.com').catch(e => e.message);
        dnsInfo = { ipv4, ipv6 };
    } catch (e) {
        dnsInfo.error = e.message;
    }

    const debugInfo = {
        userConfigured: !!user,
        passConfigured: !!pass,
        targetEmail: email,
        dns: dnsInfo
    };

    if (!user || !pass) {
        return res.status(500).json({
            success: false,
            message: 'Mail credentials missing',
            debug: debugInfo
        });
    }

    try {
        // Use dns.lookup to respect system checking which might work better on Render
        const { address, family } = await dns.promises.lookup('smtp.gmail.com', { family: 4 });
        debugInfo.resolvedIp = address;
        debugInfo.resolvedFamily = family;

        const transporter = nodemailer.createTransport({
            host: address, // Use the resolved IPv4 address
            port: 587,
            secure: false, // STARTTLS
            auth: {
                user: user,
                pass: pass
            },
            tls: {
                rejectUnauthorized: false, // Allow self-signed certs if any
                servername: 'smtp.gmail.com' // SNI is crucial when using IP
            },
            connectionTimeout: 60000,
            greetingTimeout: 30000,
            socketTimeout: 60000
        });

        const mailOptions = {
            from: user,
            to: email,
            subject: 'Question Bank System - Debug Email',
            text: `Debug email from Question Bank System.\n\nResolved IP: ${address}\nTimestamp: ${new Date().toISOString()}`,
        };

        const info = await transporter.sendMail(mailOptions);

        res.json({
            success: true,
            message: 'Email sent successfully',
            info: info,
            debug: debugInfo
        });

    } catch (error) {
        console.error('Debug Email Error:', error);
        res.status(500).json({
            success: false,
            message: error.message,
            error: error, // Return full error object
            debug: debugInfo
        });
    }
}

module.exports = router;
