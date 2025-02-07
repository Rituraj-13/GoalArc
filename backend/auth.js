import express from "express";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import mongoose from "mongoose";
import cors from "cors";
import router from "./routes/todo.js"
import dotenv from 'dotenv';
import streakCheck from "./Middlewares/StreakCheck.js";
import { sendVerificationEmail } from './services/emailService.js';
import cron from 'node-cron';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors())
app.use(streakCheck);
app.use('/todos', router);
const port = 3000;
const JWT_SECRET = process.env.JWT_SECRET
const DB_URL = process.env.MONGO_URL
mongoose.connect(DB_URL);

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationOTP: String,
    otpExpiry: Date
})
const UserObject = new mongoose.model('userCreds', userSchema);

// First, create a temporary storage for pending registrations
const pendingRegistrations = new Map(); // This will store temporary user data

const hashingPassword = async (passwordToHash) => {
    try {
        const hashedPassword = await bcrypt.hash(passwordToHash, 10);
        return hashedPassword;
    } catch (error) {
        throw new Error('Password hashing failed');
    }
}

// ! Hit the backend early to prevent coldstart issue !
app.get('/hitBackend', async (req, res) => {
    return res.status(200).json({
        msg: "UP"
    })
})

app.post('/signup', async (req, res) => {
    const username = req.body.name;
    const password = req.body.pw;

    try {
        const usernameCheck = await UserObject.findOne({ username });
        if (usernameCheck) {
            return res.status(400).json({
                userCheck: "true",
                userCreated: "false",
                msg: "Username already exists !",
            });
        }

        const hashPw = await hashingPassword(password);
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Store the user data temporarily instead of saving to database
        pendingRegistrations.set(username, {
            username,
            password: hashPw,
            verificationOTP: otp,
            otpExpiry: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes expiry
        });

        // Send verification email
        await sendVerificationEmail(username, otp);

        res.json({
            userCreated: false,
            userCheck: false,
            msg: "Please check your email for verification code.",
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({
            error: "Something is up with our Server !!",
            details: error.message
        });
    }
});

app.post('/signin', async (req, res) => {
    const username = req.body.name;
    const password = req.body.pw;

    try {
        const user = await UserObject.findOne({ username });
        if (!user) {
            return res.status(400).json({
                msg: `No username found as ${username}`,
                signIn: false
            });
        }

        // Password Checking logic
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(400).json({
                msg: "Invalid Password !",
                signIn: false
            });
        }
        // Generate the JWT token
        const token = jwt.sign(
            { userId: user._id }, JWT_SECRET
        );
        return res.json({
            msg: "Successfully signed In !!",
            signIn: true,
            token
        })

    } catch (error) {
        return res.status(500).json({
            msg: "Something is up with our server !",
            signIn: false,
            details: error.message
        });
    }

})

app.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;

    try {
        const pendingUser = pendingRegistrations.get(email);

        if (!pendingUser) {
            return res.status(404).json({ msg: 'Registration session expired or not found' });
        }

        if (pendingUser.verificationOTP !== otp) {
            return res.status(400).json({ msg: 'Invalid OTP' });
        }

        if (pendingUser.otpExpiry < new Date()) {
            // Clean up expired registration
            pendingRegistrations.delete(email);
            return res.status(400).json({ msg: 'OTP expired' });
        }

        // Create and save the verified user
        const newUser = new UserObject({
            username: pendingUser.username,
            password: pendingUser.password,
            isVerified: true
        });
        await newUser.save();

        // Clean up the pending registration
        pendingRegistrations.delete(email);

        res.json({ msg: 'Email verified successfully' });
    } catch (error) {
        res.status(500).json({ msg: 'Server error', error: error.message });
    }
});

app.post('/resend-otp', async (req, res) => {
    const { email } = req.body;

    try {
        const pendingUser = pendingRegistrations.get(email);
        if (!pendingUser) {
            return res.status(404).json({ msg: 'Registration session expired or not found' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Update the pending registration with new OTP
        pendingUser.verificationOTP = otp;
        pendingUser.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
        pendingRegistrations.set(email, pendingUser);

        // Send new verification email
        await sendVerificationEmail(email, otp);

        res.json({
            msg: 'OTP resent successfully'
        });
    } catch (error) {
        res.status(500).json({ msg: 'Server error', error: error.message });
    }
});

// Run daily at midnight
cron.schedule('0 0 * * *', async () => {
    try {
        const streaks = await Streak.find({});
        const now = new Date();

        for (const streak of streaks) {
            if (!streak.lastCompletionDate) continue;

            const userNow = new Date(now.toLocaleString('en-US', { timeZone: streak.timezone }));
            const userLastDate = new Date(streak.lastCompletionDate.toLocaleString('en-US', { timeZone: streak.timezone }));

            const daysSinceLastCompletion = Math.floor(
                (userNow - userLastDate) / (1000 * 60 * 60 * 24)
            );

            if (daysSinceLastCompletion > 1) {
                streak.currentStreak = 0;
                streak.lastCompletionDate = null;
                await streak.save();
            }
        }
    } catch (error) {
        console.error('Daily streak check failed:', error);
    }
});

app.listen(port, () => {
    console.log(`Listening on port no ${port}`)
})