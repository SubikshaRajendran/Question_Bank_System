const sendOTPEmail = async (email, otp) => {
    try {
        console.log("Sending OTP to:", email);

        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                "accept": "application/json",
                "api-key": process.env.BREVO_API_KEY ? process.env.BREVO_API_KEY.trim() : "",
                "content-type": "application/json"
            },
            body: JSON.stringify({
                sender: {
                    name: "Question Bank System",
                    email: "questionbanksystems@gmail.com"
                },
                to: [
                    {
                        email: email
                    }
                ],
                subject: 'Question Bank System - OTP Verification',
                htmlContent: `<div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                    <h2 style="color: #4f46e5;">Question Bank System</h2>
                    <p>Your OTP for login is:</p>
                    <h1 style="background: #f3f4f6; padding: 10px; display: inline-block; border-radius: 5px; letter-spacing: 5px;">${otp}</h1>
                    <p>This OTP is valid for 10 minutes.</p>
                   </div>`,
                textContent: `Your OTP for login is: ${otp}\n\nThis OTP is valid for 10 minutes.`
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `API request failed with status: ${response.status}`);
        }

        const data = await response.json();
        console.log("OTP sent successfully. Message ID:", data.messageId);
        return { success: true };

    } catch (error) {
        console.error('Failed to send OTP email:', error.message || error);
        return { success: false, error: 'Failed to send OTP email: ' + (error.message || 'API request failed') };
    }
};

module.exports = { sendOTPEmail };
