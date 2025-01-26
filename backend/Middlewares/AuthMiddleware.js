//
// 1 -  Create a middleware that checks if the route request is coming with a JWT Token or not.
// 2 - If a JWT Token found, then verify it with the secret key to find its authenticity.
import jwt from "jsonwebtoken"
import dotenv from 'dotenv';
dotenv.config();

export default function AuthMiddleware (req, res, next) {
    try {
        const JWT_SECRET = process.env.JWT_SECRET;
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                msg: "No Token Provided !"
            })
        }
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({
            msg:"Invaild Token !"
        })
    }
}
