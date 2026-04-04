// import React, { useState } from 'react';
// import axios from "axios";
// import { toast } from 'react-hot-toast';
// import OTPVerification from './OTPVerification';
// import goalArcLogo from '../assets/goalArcLogo.png';

// const AuthForm = ({ setIsAuthenticated }) => {
//     const [isSignUp, setIsSignUp] = useState(false);
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const [confirmPassword, setConfirmPassword] = useState('');
//     const [passwordsMatch, setPasswordsMatch] = useState(true);
//     const [showOTPVerification, setShowOTPVerification] = useState(false);
//     const [registeredEmail, setRegisteredEmail] = useState('');
//     const [firstName, setFirstName] = useState('');
//     const [lastName, setLastName] = useState('');

//     const confirmPasswordCheck = () => {
//         const match = password === confirmPassword;
//         setPasswordsMatch(match);
//         if (!match) {
//             toast.error("Passwords do not match!");
//             return false;
//         }
//         return true;
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         if (isSignUp && !confirmPasswordCheck()) {
//             return;
//         }

//         const endpoint = isSignUp ? "signup" : "signin";
//         const backendUrl = `https://goalarcservices.riturajdey.com/${endpoint}`;
//         const loadingToastId = toast.loading(isSignUp ? 'Creating account...' : 'Signing in...');

//         try {
//             const response = await axios.post(backendUrl,
//                 {
//                     name: email,
//                     pw: password,
//                     firstName: firstName,
//                     lastName: lastName
//                 }
//             );


//             toast.dismiss(loadingToastId);

//             if (isSignUp) {
//                 localStorage.setItem('tempSignupPassword', password);
//                 setRegisteredEmail(email);
//                 setShowOTPVerification(true);
//                 toast.success('Check your email', { duration: 3000 });
//             } else if (response.data.token) {
//                 localStorage.setItem('todoToken', response.data.token);
//                 localStorage.setItem('firstName', response.data.firstName);
//                 setIsAuthenticated(true);
//                 toast.success('Welcome back!', { duration: 2000 });
//             }
//         } catch (error) {
//             toast.dismiss(loadingToastId);
//             toast.error(error.response?.data?.msg || 'Something went wrong', { duration: 3000 });
//         }
//     };

//     return (
//         <>
//             {showOTPVerification ? (
//                 <OTPVerification
//                     email={registeredEmail}
//                     onVerificationComplete={() => {
//                         setShowOTPVerification(false);
//                         setIsAuthenticated(true);
//                     }}
//                 />
//             ) : (
//                 <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
//                     <div className="max-w-md w-full space-y-8">
//                         <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
//                             <div className="px-8 py-10">
//                                 <div className="flex justify-center mb-6">
//                                     <img
//                                         src={goalArcLogo}
//                                         alt="GoalArc Logo"
//                                         className="h-20 w-auto"
//                                     />
//                                 </div>

//                                 <h2 className="text-center text-3xl font-bold text-gray-800 mb-8">
//                                     {isSignUp ? 'Join GoalArc Today' : 'Welcome Back'}
//                                 </h2>

//                                 <p className="text-center text-gray-500 mb-8">
//                                     {isSignUp
//                                         ? 'Create an account to start achieving your goals'
//                                         : 'Sign in to continue your journey'}
//                                 </p>

//                                 <form className="space-y-6" onSubmit={handleSubmit}>
//                                     {isSignUp && (
//                                         <div className="flex flex-row gap-4">
//                                             <div>
//                                                 <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
//                                                     First Name
//                                                 </label>
//                                                 <input
//                                                     id="firstName"
//                                                     name="firstName"
//                                                     type="text"
//                                                     autoComplete="given-name"
//                                                     required
//                                                     className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black transition duration-150"
//                                                     placeholder="First Name"
//                                                     value={firstName}
//                                                     onChange={(e) => setFirstName(e.target.value)}
//                                                 />
//                                             </div>
//                                             <div>
//                                                 <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
//                                                     Last Name
//                                                 </label>
//                                                 <input
//                                                     id="lastName"
//                                                     name="lastName"
//                                                     type="text"
//                                                     autoComplete="family-name"
//                                                     required
//                                                     className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black transition duration-150"
//                                                     placeholder="Last Name"
//                                                     value={lastName}
//                                                     onChange={(e) => setLastName(e.target.value)}
//                                                 />
//                                             </div>
//                                         </div>
//                                     )}

//                                     <div>
//                                         <label htmlFor="email-address" className="block text-sm font-medium text-gray-700">
//                                             Email address
//                                         </label>
//                                         <input
//                                             id="email-address"
//                                             name="email"
//                                             type="email"
//                                             autoComplete="email"
//                                             required
//                                             className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black transition duration-150"
//                                             placeholder="Email address"
//                                             value={email}
//                                             onChange={(e) => setEmail(e.target.value)}
//                                         />
//                                     </div>

//                                     <div>
//                                         <label htmlFor="password" className="block text-sm font-medium text-gray-700">
//                                             Password
//                                         </label>
//                                         <input
//                                             id="password"
//                                             name="password"
//                                             type="password"
//                                             autoComplete="current-password"
//                                             required
//                                             className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black transition duration-150"
//                                             placeholder="Password"
//                                             value={password}
//                                             onChange={(e) => setPassword(e.target.value)}
//                                         />
//                                     </div>

//                                     {isSignUp && (
//                                         <div>
//                                             <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
//                                                 Confirm Password
//                                             </label>
//                                             <input
//                                                 id="confirmPassword"
//                                                 name="confirmPassword"
//                                                 type="password"
//                                                 required
//                                                 className={`mt-1 block w-full px-4 py-3 border ${!passwordsMatch ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black transition duration-150`}
//                                                 placeholder="Retype Password"
//                                                 value={confirmPassword}
//                                                 onChange={(e) => setConfirmPassword(e.target.value)}
//                                             />
//                                             {!passwordsMatch && (
//                                                 <p className="mt-1 text-sm text-red-500">Passwords do not match</p>
//                                             )}
//                                         </div>
//                                     )}

//                                     <div className="pt-4">
//                                         <button
//                                             type="submit"
//                                             className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150"
//                                         >
//                                             {isSignUp ? 'Create Account' : 'Sign In'}
//                                         </button>
//                                     </div>
//                                 </form>
//                             </div>

//                             <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex justify-center">
//                                 <button
//                                     onClick={() => setIsSignUp(!isSignUp)}
//                                     className="text-center font-medium text-blue-600 hover:text-blue-500 transition duration-150"
//                                 >
//                                     {isSignUp
//                                         ? 'Already have an account? Sign In'
//                                         : "Don't have an account? Sign Up"}
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </>
//     );
// };

// export default AuthForm;


import { useState } from "react"
import axios from "axios"
import { toast } from "react-hot-toast"
import OTPVerification from "./OTPVerification"
import { Eye, EyeOff } from "lucide-react"
import goalArcLogo from "../assets/goalArcLogo.png"
import authImage from "../assets/authImage.png"
import authImg2 from "../assets/authImg2.png"

const AuthForm = ({ setIsAuthenticated }) => {
    const [isSignUp, setIsSignUp] = useState(false)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [passwordsMatch, setPasswordsMatch] = useState(true)
    const [showOTPVerification, setShowOTPVerification] = useState(false)
    const [registeredEmail, setRegisteredEmail] = useState("")
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const confirmPasswordCheck = () => {
        const match = password === confirmPassword
        setPasswordsMatch(match)
        if (!match) {
            toast.error("Passwords do not match!")
            return false
        }
        return true
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (isSignUp && !confirmPasswordCheck()) {
            return
        }

        const endpoint = isSignUp ? "signup" : "signin"
        const backendUrl = `https://goalarcservices.riturajdey.com/${endpoint}`
        setIsLoading(true)
        const loadingToastId = toast.loading(isSignUp ? "Creating account..." : "Signing in...")

        try {
            const response = await axios.post(backendUrl, {
                name: email,
                pw: password,
                firstName: firstName,
                lastName: lastName,
            })

            toast.dismiss(loadingToastId)

            if (isSignUp) {
                localStorage.setItem("tempSignupPassword", password)
                setRegisteredEmail(email)
                setShowOTPVerification(true)
                toast.success("Check your email", { duration: 3000 })
            } else if (response.data.token) {
                localStorage.setItem("todoToken", response.data.token)
                localStorage.setItem("firstName", response.data.firstName)
                setIsAuthenticated(true)
                toast.success("Welcome back!", { duration: 2000 })
            }
        } catch (error) {
            toast.dismiss(loadingToastId)
            toast.error(error.response?.data?.msg || "Something went wrong", { duration: 3000 })
        } finally {
            setIsLoading(false)
        }
    }

    const toggleAuthMode = () => {
        setIsSignUp(!isSignUp)
        setPasswordsMatch(true)
        setEmail("")
        setPassword("")
        setConfirmPassword("")
        setFirstName("")
        setLastName("")
    }

    return (
        <>
            {showOTPVerification ? (
                <OTPVerification
                    email={registeredEmail}
                    onVerificationComplete={() => {
                        setShowOTPVerification(false)
                        setIsAuthenticated(true)
                    }}
                />
            ) : (
                <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-white">
                    <div className="w-full max-w-6xl flex gap-6 rounded-2xl overflow-hidden shadow-lg">
                        {/* Left Side - Hero Image */}
                        <div className="hidden lg:block lg:w-2/5 relative overflow-hidden rounded-l-2xl">
                            <img
                                src={isSignUp ? authImg2 : authImage}
                                alt="Scenic landscape with spacecraft"
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                        </div>

                        {/* Right Side - Auth Form */}
                        <div className="w-full lg:w-3/5 flex items-center justify-center p-8 bg-white rounded-r-2xl">
                            <div className="w-full max-w-md space-y-8">
                                {/* Logo and Welcome Text */}
                                <div className="text-center">
                                    <div className="flex justify-center mb-4">
                                        <img src={goalArcLogo || "/placeholder.svg"} alt="GoalArc Logo" className="h-16 w-auto" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-blue-900">{isSignUp ? "Welcome to GoalArc" : "Welcome back"}</h2>
                                    <p className="mt-2 text-sm text-blue-600">
                                        {isSignUp ? "Create an account to kickstart your journey" : "Sign in to continue your journey"}
                                    </p>
                                </div>

                                {/* Auth Form */}
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {isSignUp && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                                                    First Name
                                                </label>
                                                <div className="mt-1 relative">
                                                    <input
                                                        id="firstName"
                                                        name="firstName"
                                                        type="text"
                                                        required
                                                        className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                                                        value={firstName}
                                                        onChange={(e) => setFirstName(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                                                    Last Name
                                                </label>
                                                <div className="mt-1 relative">
                                                    <input
                                                        id="lastName"
                                                        name="lastName"
                                                        type="text"
                                                        required
                                                        className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                                                        value={lastName}
                                                        onChange={(e) => setLastName(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                            Email
                                        </label>
                                        <div className="mt-1">
                                            <input
                                                id="email"
                                                name="email"
                                                type="email"
                                                autoComplete="email"
                                                required
                                                className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                            Password
                                        </label>
                                        <div className="mt-1 relative">
                                            <input
                                                id="password"
                                                name="password"
                                                type={showPassword ? "text" : "password"}
                                                required
                                                className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-5 w-5 text-gray-400" />
                                                ) : (
                                                    <Eye className="h-5 w-5 text-gray-400" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {isSignUp && (
                                        <div>
                                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                                Confirm Password
                                            </label>
                                            <div className="mt-1 relative">
                                                <input
                                                    id="confirmPassword"
                                                    name="confirmPassword"
                                                    type="password"
                                                    required
                                                    className={`appearance-none block w-full px-3 py-3 border rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black ${!passwordsMatch ? "border-red-500" : "border-gray-300"
                                                        }`}
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                />
                                                {!passwordsMatch && <p className="mt-1 text-sm text-red-500">Passwords do not match</p>}
                                            </div>

                                            <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                                                <div className="flex items-start">
                                                    <div className="flex-shrink-0">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                    <div className="ml-3">
                                                        <p className="text-sm text-blue-800 font-medium">Important Password Information</p>
                                                        <p className="text-xs text-blue-700 mt-1">
                                                            For security, we encrypt passwords, so we <span className="font-semibold">cannot recover or reset </span>forgotten ones. Please store it securely.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                                    >
                                        {isLoading ? (
                                            <svg
                                                className="animate-spin h-5 w-5 text-white"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                ></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                ></path>
                                            </svg>
                                        ) : (
                                            isSignUp ? "Create Account" : "Sign In"
                                        )}
                                    </button>

                                </form>

                                {/* Sign up link */}
                                <p className="text-center text-sm text-gray-600">
                                    {isSignUp ? "Already have an account? " : "Don't have an account? "}
                                    <button onClick={toggleAuthMode} className="font-medium text-blue-600 hover:text-blue-700">
                                        {isSignUp ? "Sign in" : "Create Here"}
                                    </button>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default AuthForm

