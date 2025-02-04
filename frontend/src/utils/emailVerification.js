import emailjs from '@emailjs/browser';

export const sendVerificationEmail = async (email, otp) => {
    try {
        const templateParams = {
            to_email: email,
            otp: otp,
            app_name: 'GoalArc'
        };

        const response = await emailjs.send(
            // Create service ID from EmailJS dashboard
            // Create email template ID
            templateParams,
              // Your EmailJS public key
        );

        return { success: true };
    } catch (error) {
        console.error('Email sending failed:', error);
        return { success: false, error };
    }
};

export const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};