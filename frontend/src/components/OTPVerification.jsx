import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { sendVerificationEmail } from '../utils/emailVerification';

const OTPVerification = ({ email, onVerificationComplete }) => {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(60); // 60 seconds timer
    const [isResendDisabled, setIsResendDisabled] = useState(true);

    useEffect(() => {
        // Start initial timer
        startTimer();
    }, []);

    const startTimer = () => {
        setIsResendDisabled(true);
        setTimer(60);
        const interval = setInterval(() => {
            setTimer((prevTimer) => {
                if (prevTimer <= 1) {
                    clearInterval(interval);
                    setIsResendDisabled(false);
                    return 0;
                }
                return prevTimer - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    };

    const verifyOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // First verify the OTP
            const verifyResponse = await axios.post('http://localhost:3000/verify-otp', {
                email,
                otp
            });

            if (verifyResponse.data.msg === 'Email verified successfully') {
                // Get the stored password from localStorage
                const password = localStorage.getItem('tempSignupPassword');
                
                // Attempt to sign in
                const loginResponse = await axios.post('http://localhost:3000/signin', {
                    name: email,
                    pw: password
                });

                if (loginResponse.data.token) {
                    localStorage.setItem('todoToken', loginResponse.data.token);
                    // Remove the temporary password
                    localStorage.removeItem('tempSignupPassword');
                    toast.success('Email verified and signed in successfully!');
                    onVerificationComplete();
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.msg || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    const resendOTP = async () => {
        try {
            const response = await axios.post('http://localhost:3000/resend-otp', { email });
            
            // Send the new OTP via email
            await sendVerificationEmail(email, response.data.otp);
            
            toast.success('New OTP sent successfully');
            startTimer(); // Restart timer after resend
        } catch (error) {
            toast.error('Failed to resend OTP');
        }
    };

    return (
        <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Email Verification</h2>
            <p className="mb-4">Please enter the OTP sent to {email}</p>
            <form onSubmit={verifyOTP} className="space-y-4">
                <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter OTP"
                    className="w-full px-3 py-2 border rounded-md"
                    maxLength={6}
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
            </form>
            <div className="mt-4 flex items-center justify-between">
                <button
                    onClick={resendOTP}
                    disabled={isResendDisabled}
                    className={`text-blue-600 hover:text-blue-800 ${
                        isResendDisabled ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                >
                    Resend OTP
                </button>
                {isResendDisabled && (
                    <span className="text-gray-500">
                        Resend in {timer}s
                    </span>
                )}
            </div>
        </div>
    );
};

export default OTPVerification;