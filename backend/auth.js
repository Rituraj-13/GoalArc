import express from "express";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import mongoose from "mongoose";
import cors from "cors";
import router from "./routes/todo.js"
import dotenv from 'dotenv';
import streakCheck from "./Middlewares/StreakCheck.js";

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
        msg : "UP"
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

        const signedUpUser = await new UserObject({
            username: username,
            password: hashPw,
            verificationOTP: otp,
            otpExpiry: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes expiry
        });
        await signedUpUser.save();

        // Return OTP with response for email sending
        res.json({
            userCreated: true,
            userCheck: false,
            msg: "User Created Successfully!",
            otp: otp
        });
    } catch (error) {
        console.error('Signup error:', error);  // Add error logging
        res.status(500).json({
            error: "Something is up with our Server !!",
            details: error.message
        });
    }
})

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
        const user = await UserObject.findOne({ username: email });
        
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ msg: 'Email already verified' });
        }

        if (user.verificationOTP !== otp) {
            return res.status(400).json({ msg: 'Invalid OTP' });
        }

        if (user.otpExpiry < new Date()) {
            return res.status(400).json({ msg: 'OTP expired' });
        }

        user.isVerified = true;
        user.verificationOTP = null;
        user.otpExpiry = null;
        await user.save();

        res.json({ msg: 'Email verified successfully' });
    } catch (error) {
        res.status(500).json({ msg: 'Server error', error: error.message });
    }
});

app.post('/resend-otp', async (req, res) => {
    const { email } = req.body;
    
    try {
        const user = await UserObject.findOne({ username: email });
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.verificationOTP = otp;
        user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
        await user.save();

        res.json({ 
            msg: 'OTP resent successfully',
            otp: otp // Add this to send OTP back
        });
    } catch (error) {
        res.status(500).json({ msg: 'Server error', error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Listening on port no ${port}`)
})