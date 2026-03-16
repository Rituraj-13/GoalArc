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
import AuthMiddleware from './Middlewares/AuthMiddleware.js';
import pomodoroRouter from './routes/pomodoro.js';
import profilePictureRoutes from './routes/profilePictureRoutes.js';
import { generatePresignedUrl } from './config/s3Config.js';
import Streak from "./models/Streak.js";
import leaderBoard from "./models/leaderBoard.js";
import leaderBoardRouter from './routes/leaderBoardRanking.js';
import { updateAllLeaderboardEntries, updateLeaderboardEntry } from "./services/leaderboardService.js";
import axios from 'axios';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors())
app.use(streakCheck);
app.use('/todos', router);
app.use('/pomodoro', pomodoroRouter);
app.use('/user', profilePictureRoutes);
app.use('/api', leaderBoardRouter);
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
    otpExpiry: Date,
    firstName: String,
    lastName: String,
    joinDate: {
        type: Date,
        default: Date.now
    },
    profilePicture: {
        type: String, // This will hold the profileImage url
        default: null
    }
})
const UserObject = new mongoose.model('userCreds', userSchema);
export default UserObject;

// First, create a temporary storage for pending registrations
const pendingRegistrations = new Map(); // This will store temporary user data


const fallbackQuotes = [
    "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    "The only way to do great work is to love what you do.",
    "Stay focused and never give up.",
    "Make each day your masterpiece."
];


const hashingPassword = async (passwordToHash) => {
    try {
        const hashedPassword = await bcrypt.hash(passwordToHash, 10);
        return hashedPassword;
    } catch (error) {
        throw new Error('Password hashing failed');
    }
}

app.get("/", (req, res) => {
    res.status(200).json({ message: "Welcome to GoalArc API" });
});

// ! Hit the backend early to prevent coldstart issue !
app.get('/hitBackend', async (req, res) => {
    return res.status(200).json({
        msg: "UP"
    })
})

app.post('/signup', async (req, res) => {
    const username = req.body.name;
    const password = req.body.pw;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;


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
            otpExpiry: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes expiry
            firstName,
            lastName
        });


        // Send verification email
        await sendVerificationEmail(username, otp, firstName, lastName);

        res.json({
            userCreated: false,
            userCheck: false,
            msg: "Please check your email for verification code.",
            firstName,
            lastName

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
            token,
            firstName: user.firstName
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
            return res.status(404).json({ msg: 'Verification session expired or not found' });
        }

        if (pendingUser.verificationOTP !== otp) {
            return res.status(400).json({ msg: 'Invalid OTP' });
        }

        if (pendingUser.otpExpiry < new Date()) {
            pendingRegistrations.delete(email);
            return res.status(400).json({ msg: 'OTP expired' });
        }

        // If this is an email update verification
        if (pendingUser.isEmailUpdate) {
            pendingRegistrations.delete(email);
            return res.json({
                msg: 'Email verified successfully'
            });
        }

        // Regular signup verification flow
        const newUser = new UserObject({
            username: pendingUser.username,
            password: pendingUser.password,
            firstName: pendingUser.firstName,
            lastName: pendingUser.lastName,
            isVerified: true
        });
        await newUser.save();

        // Create a new Streak for the new user
        const newStreak = new Streak({
            user: newUser._id,
            currentStreak: 0,
            highestStreak: 0
        });

        await newStreak.save();

        // Create a leaderboard entry for the new user
        const leaderBoardEntry = new leaderBoard({
            user: newUser._id,
            email: newUser.username,
            username: `${pendingUser.firstName} ${pendingUser.lastName}`.trim(),
            profilePicture: newUser.profilePicture || null,
            currentStreak: 0,
            highestStreak: 0,
            totalDuration: 0,
            score: 0
        })

        await leaderBoardEntry.save();

        pendingRegistrations.delete(email);

        res.json({
            msg: 'Email verified successfully',
            firstName: pendingUser.firstName,
            lastName: pendingUser.lastName
        });
    } catch (error) {
        res.status(500).json({ msg: 'Server error', error: error.message });
    }
});

app.post('/resend-otp', async (req, res) => {
    const { email } = req.body;

    try {
        // Check if email already exists in database
        const existingUser = await UserObject.findOne({ username: email });
        if (existingUser) {
            return res.status(400).json({ msg: 'Email already in use' });
        }

        // Generate new OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Store in pending registrations with existing user data
        pendingRegistrations.set(email, {
            username: email,
            verificationOTP: otp,
            otpExpiry: new Date(Date.now() + 10 * 60 * 1000),
            isEmailUpdate: true // Flag to indicate this is an email update
        });

        // Send verification email
        await sendVerificationEmail(email, otp);

        res.json({
            msg: 'OTP sent successfully'
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

        console.log(`Running daily streak check for ${streaks.length} users`);

        for (const streak of streaks) {
            if (!streak.lastCompletionDate) continue;

            const userNow = new Date(now.toLocaleString('en-US', { timeZone: streak.timezone }));
            const userLastDate = new Date(streak.lastCompletionDate.toLocaleString('en-US', { timeZone: streak.timezone }));

            const daysSinceLastCompletion = Math.floor(
                (userNow - userLastDate) / (1000 * 60 * 60 * 24)
            );

            if (daysSinceLastCompletion > 1) {
                console.log(`Resetting streak for user ${streak.user}`);
                streak.currentStreak = 0;
                streak.lastCompletionDate = null;
                await streak.save();

                // Update leaderboard when streak is reset
                await updateLeaderboardEntry(streak.user);
                console.log(`Leaderboard updated for user ${streak.user}`);
            }
        }
    } catch (error) {
        console.error('Daily streak check failed:', error);
    }
});

cron.schedule('0 0 * * *', async () => {
    console.log('Running the leaderboard update service');
    try {
        await updateAllLeaderboardEntries();
    } catch (error) {
        console.error("Error updating leaderboard", error);
    }
})

// Get user profile
app.get('/user/profile', AuthMiddleware, async (req, res) => {
    try {
        const user = await UserObject.findById(req.userId);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Generate presigned URL if user has a profile picture
        let profilePictureUrl = null;
        if (user.profilePicture) {
            profilePictureUrl = await generatePresignedUrl(user.profilePicture);
        }

        res.json({
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            joinDate: user.joinDate,
            profilePicture: profilePictureUrl
        });
    } catch (error) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// Update user profile
app.put('/user/profile', AuthMiddleware, async (req, res) => {
    try {
        const { firstName, lastName, username } = req.body;
        const user = await UserObject.findById(req.userId);

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Update fields if provided
        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (username) user.username = username;

        await user.save();

        // Update the leaderboard entry for this user
        await updateLeaderboardEntry(req.userId);

        res.json({ msg: 'Profile updated successfully' });
    } catch (error) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// Get Quotes
app.get('/quotes/random', AuthMiddleware, async (req, res) => {
    try {
        const response = await axios.get('https://zenquotes.io/api/random');
        const quote = response.data[0].q;

        if (quote.startsWith("Too") || !quote || quote.trim() === "") {
            const randomIndex = Math.floor(Math.random() * fallbackQuotes.length);
            return res.json({ quote: fallbackQuotes[randomIndex] });
        }

        res.json({ quote });
    } catch (error) {
        const randomIndex = Math.floor(Math.random() * fallbackQuotes.length);
        res.json({ quote: fallbackQuotes[randomIndex] });
    }
});

app.listen(port, () => {
    console.log(`Listening on port no ${port}`)
})