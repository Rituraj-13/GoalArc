// import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";

// const mailerSend = new MailerSend({
//     apiKey: process.env.MAILERSEND_API_KEY,
// });

// export const sendVerificationEmail = async (email, otp, firstName, lastName) => {
//     try {
//         const sentFrom = new Sender("MS_DWlSgd@trial-3z0vkloym6vg7qrx.mlsender.net", "GoalArc");
//         const recipient = new Recipient(email);

//         const emailParams = new EmailParams()
//             .setFrom(sentFrom)
//             .setTo([recipient])
//             .setSubject("Verify your GoalArc account")
//             .setHtml(`
//                 <!DOCTYPE html>
// <html>
// <head>
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <style>
//         * {
//             box-sizing: border-box;
//         }
//         body {
//             font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
//             line-height: 1.6;
//             margin: 0;
//             padding: 0;
//             background-color: #f0f2f4;
//         }
//         .container {
//             width: 100%;
//             max-width: 600px;
//             margin: 0 auto;
//             padding: 10px;
//         }
//         .header {
//             text-align: center;
//             padding: 15px 0;
//             background: linear-gradient(to right, #3b82f6, #4f46e5);
//             color: white;
//             border-radius: 8px 8px 0 0;
//         }
//         .header h1 {
//             margin: 0;
//             font-size: 24px;
//         }
//         .content {
//             padding: 20px;
//             background: #ffffff;
//             border-radius: 0 0 8px 8px;
//             border: 1px solid #e2e8f0;
//             box-shadow: 0 2px 4px rgba(0,0,0,0.1);
//         }
//         .otp {
//             text-align: center;
//             font-size: 28px;
//             font-weight: bold;
//             letter-spacing: 4px;
//             color: #3b82f6;
//             padding: 15px;
//             margin: 15px 0;
//             background: #f8fafc;
//             border-radius: 8px;
//             border: 2px dashed #3b82f6;
//             word-break: break-all;
//         }
//         .footer {
//             text-align: center;
//             margin-top: 15px;
//             color: #64748b;
//             font-size: 12px;
//         }
//         .warning {
//             color: #ef4444;
//             font-size: 13px;
//             margin-top: 15px;
//         }

//         @media screen and (max-width: 480px) {
//             .container {
//                 width: 95%;
//                 padding: 5px;
//             }
//             .header h1 {
//                 font-size: 20px;
//             }
//             .content {
//                 padding: 15px;
//             }
//             .otp {
//                 font-size: 24px;
//                 letter-spacing: 2px;
//                 padding: 10px;
//             }
//             p {
//                 font-size: 14px;
//             }
//         }
//     </style>
// </head>
// <body>
//     <div class="container">
//         <div class="header">
//             <h1>Email Verification</h1>
//         </div>
//         <div class="content">
//             <p>Hello, ${firstName} ${lastName}</p>
//             <p>Thank you for signing up with <strong>GoalArc</strong>! <br> Please use the One-Time Password (OTP) below to complete your verification process:</p>

//             <div class="otp">${otp}</div>

//             <p>Note - The OTP will expire in 10 minutes.</p>

//             <p class="warning">Note: For security reasons, please do not share this code with anyone.</p>

//             <div class="footer">

//                 <p>If you didn't request this verification, please ignore this email.</p>
//                 <p>&copy; 2025 GoalArc. All rights reserved.</p>
//             </div>
//         </div>
//     </div>
// </body>
// </html>
//             `);

//         await mailerSend.email.send(emailParams);
//         return true;
//     } catch (error) {
//         console.error('Email sending failed:', error);
//         throw error;
//     }
// };

import nodemailer from 'nodemailer';

// Create transporter
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: 'info@riturajdey.com',
        pass: process.env.EMAIL_APP_PASSWORD
    }
});

export const sendVerificationEmail = async (email, otp, firstName, lastName) => {
    try {
        const mailOptions = {
            from: '"GoalArc" <info@riturajdey.com>',
            to: email,
            subject: "Verify your GoalArc account",
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        * {
                            box-sizing: border-box;
                        }
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                            line-height: 1.6;
                            margin: 0;
                            padding: 0;
                            background-color: #f0f2f4;
                        }
                        .container {
                            width: 100%;
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 10px;
                        }
                        .header {
                            text-align: center;
                            padding: 15px 0;
                            background: linear-gradient(to right, #3b82f6, #4f46e5);
                            color: white;
                            border-radius: 8px 8px 0 0;
                        }
                        .header h1 {
                            margin: 0;
                            font-size: 24px;
                        }
                        .content {
                            padding: 20px;
                            background: #ffffff;
                            border-radius: 0 0 8px 8px;
                            border: 1px solid #e2e8f0;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                        }
                        .otp {
                            text-align: center;
                            font-size: 28px;
                            font-weight: bold;
                            letter-spacing: 4px;
                            color: #3b82f6;
                            padding: 15px;
                            margin: 15px 0;
                            background: #f8fafc;
                            border-radius: 8px;
                            border: 2px dashed #3b82f6;
                            word-break: break-all;
                        }
                        .footer {
                            text-align: center;
                            margin-top: 15px;
                            color: #64748b;
                            font-size: 12px;
                        }
                        .warning {
                            color: #ef4444;
                            font-size: 13px;
                            margin-top: 15px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Email Verification</h1>
                        </div>
                        <div class="content">
                            <p>Hello, ${firstName} ${lastName}</p>
                            <p>Thank you for signing up with <strong>GoalArc</strong>! <br> Please use the One-Time Password (OTP) below to complete your verification process:</p>
                            
                            <div class="otp">${otp}</div>
                            
                            <p>Note - The OTP will expire in 10 minutes.</p>
                            
                            <p class="warning">Note: For security reasons, please do not share this code with anyone.</p>
                            
                            <div class="footer">
                                <p>If you didn't request this verification, please ignore this email.</p>
                                <p>&copy; 2025 GoalArc. All rights reserved.</p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Email sending failed:', error);
        throw error;
    }
};