import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const OTPVerification = ({ email, onVerificationComplete, isProfileUpdate = false }) => {
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
                if (isProfileUpdate) {
                    // For profile updates, just complete the verification
                    onVerificationComplete();
                } else {
                    // Existing login flow
                    const password = localStorage.getItem('tempSignupPassword');
                    const loginResponse = await axios.post('http://localhost:3000/signin', {
                        name: email,
                        pw: password
                    });

                    if (loginResponse.data.token) {
                        localStorage.setItem('todoToken', loginResponse.data.token);
                        localStorage.setItem('firstName', verifyResponse.data.firstName);
                        localStorage.removeItem('tempSignupPassword');
                        toast.success('Verification successful!', { duration: 3000 });
                        onVerificationComplete();
                    }
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.msg || 'Invalid OTP', { duration: 3000 });
        } finally {
            setLoading(false);
        }
    };

    const resendOTP = async () => {
        try {
            await axios.post('http://localhost:3000/resend-otp', { email });
            toast.success('OTP sent!', { duration: 2000 });
            startTimer();
        } catch (error) {
            toast.error('Failed to send OTP', { duration: 3000 });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-6 sm:p-8 rounded-lg shadow-md">
                <div className="text-center">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Email Verification</h2>
                    <p className="text-sm sm:text-base text-gray-600 mb-2">
                        Please enter the OTP sent to <span className="font-medium">{email}</span>
                    </p>
                    <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded-md mb-4">
                        ⚠️ If you don't see the email in your inbox, please check your spam folder
                    </div>
                </div>

                <form onSubmit={verifyOTP} className="mt-8 space-y-6">
                    <div>
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="Enter 6-digit OTP"
                            className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm text-center tracking-widest"
                            maxLength={6}
                            required
                        />
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading || otp.length !== 6}
                            className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${loading || otp.length !== 6
                                ? 'bg-indigo-400 cursor-not-allowed'
                                : 'bg-indigo-600 hover:bg-indigo-700'
                                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200`}
                        >
                            {loading ? 'Verifying...' : 'Verify OTP'}
                        </button>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <button
                            type="button"
                            onClick={resendOTP}
                            disabled={isResendDisabled}
                            className={`text-indigo-600 hover:text-indigo-500 ${isResendDisabled ? 'opacity-50 cursor-not-allowed' : ''
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
                </form>
            </div>
        </div>
    );
};

export default OTPVerification;