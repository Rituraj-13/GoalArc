import React, { useState } from 'react';
import axios from "axios";
import toast, { Toaster } from 'react-hot-toast';
const AuthForm = () => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const endpoint = isSignUp ? "signup" : "signin";
        const backendUrl = `http://localhost:3000/${endpoint}`;
        try {
            const response = await axios.post(backendUrl,
                {
                    name: email,
                    pw: password
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            if (response.data.token) {
                // Store token in the local storage
                localStorage.setItem('todoToken', response.data.token);
                toast.success(response.data.msg);
            } else if (response.data.userCheck === "true") {
                toast.error(response.data.msg);
            }

        } catch (error) {
            const errorMessage = error.response?.data?.msg || 'An error occurred during signup';
            toast.error(errorMessage);
            console.error('Error during signup:', error.response?.data || error.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <Toaster position="top-center" />
            <div className="max-w-md w-full space-y-8">
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <div className="px-6 py-8">
                        <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-6">
                            {isSignUp ? 'Create your account' : 'Sign in to your account'}
                        </h2>
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="email-address" className="block text-sm font-medium text-gray-700">
                                    Email address
                                </label>
                                <input
                                    id="email-address"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="Email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            <div>
                                <button
                                    type="submit"
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    {isSignUp ? 'Sign Up' : 'Sign In'}
                                </button>
                            </div>
                        </form>
                    </div>
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                        <button
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="w-full text-center font-medium text-indigo-600 hover:text-indigo-500"
                        >
                            {isSignUp
                                ? 'Already have an account? Sign In'
                                : "Don't have an account? Sign Up"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthForm;

