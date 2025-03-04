// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { toast } from 'react-hot-toast';
// import Sidebar from './Sidebar';
// import { Button } from './ui/button';
// import { cn } from '../lib/utils';
// import OTPVerification from './OTPVerification';
// import { UserCircle, Mail, User, Pencil, Calendar, SettingsIcon } from 'lucide-react';

// const Settings = ({ setIsAuthenticated }) => {
//     const [isCollapsed, setIsCollapsed] = useState(false);
//     const [firstName, setFirstName] = useState('');
//     const [lastName, setLastName] = useState('');ī
//     const [email, setEmail] = useState('');
//     const [newEmail, setNewEmail] = useState('');
//     const [isEmailVerification, setIsEmailVerification] = useState(false);
//     const [isLoading, setIsLoading] = useState(false);
//     const [isEditing, setIsEditing] = useState(false);
//     const [joinDate, setJoinDate] = useState('');

//     // Fetch current user data
//     useEffect(() => {
//         const fetchUserData = async () => {
//             try {
//                 const token = localStorage.getItem('todoToken');
//                 const response = await axios.get('http://localhost:3000/user/profile', {
//                     headers: {
//                         'Authorization': `Bearer ${token}`
//                     }
//                 });
//                 const { firstName, lastName, username, joinDate } = response.data;
//                 setFirstName(firstName);
//                 setLastName(lastName);
//                 setEmail(username);
//                 setJoinDate(joinDate);
//             } catch (error) {
//                 toast.error('Failed to load user data');
//             }
//         };
//         fetchUserData();
//     }, []);

//     const handleUpdateProfile = async (e) => {
//         e.preventDefault();
//         setIsLoading(true);

//         try {
//             const token = localStorage.getItem('todoToken');
//             const updateData = {
//                 firstName,
//                 lastName
//             };

//             // If email is being changed, send OTP first
//             if (newEmail && newEmail !== email) {
//                 try {
//                     await axios.post('http://localhost:3000/resend-otp', {
//                         email: newEmail
//                     });

//                     setIsEmailVerification(true);
//                     toast.success('Verification code sent to your new email');
//                     return;
//                 } catch (error) {
//                     toast.error('Failed to send verification code');
//                     setIsLoading(false);
//                     return;
//                 }
//             }

//             // If no email change, just update other fields
//             const response = await axios.put(
//                 'http://localhost:3000/user/profile',
//                 updateData,
//                 {
//                     headers: {
//                         'Authorization': `Bearer ${token}`
//                     }
//                 }
//             );

//             localStorage.setItem('firstName', firstName);
//             toast.success('Profile updated successfully');
//             setIsEditing(false);
//         } catch (error) {
//             toast.error('Failed to update profile');
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const handleEmailVerificationComplete = async () => {
//         try {
//             const token = localStorage.getItem('todoToken');
//             await axios.put(
//                 'http://localhost:3000/user/profile',
//                 {
//                     firstName,
//                     lastName,
//                     username: newEmail
//                 },
//                 {
//                     headers: {
//                         'Authorization': `Bearer ${token}`
//                     }
//                 }
//             );

//             setEmail(newEmail);
//             setNewEmail('');
//             setIsEmailVerification(false);
//             setIsEditing(false);
//             toast.success('Profile updated successfully');
//         } catch (error) {
//             toast.error('Failed to update profile');
//         }
//     };

//     if (isEmailVerification) {
//         return (
//             <OTPVerification
//                 email={newEmail}
//                 onVerificationComplete={handleEmailVerificationComplete}
//                 isProfileUpdate={true}
//             />
//         );
//     }

//     return (
//         <div className="flex h-screen flex-col md:flex-row">
//             <Sidebar
//                 setIsAuthenticated={setIsAuthenticated}
//                 isCollapsed={isCollapsed}
//                 setIsCollapsed={setIsCollapsed}
//             />
//             <div className="flex-1 p-4 md:p-8 bg-background overflow-y-auto">
//                 <div className="max-w-2xl mx-auto">
//                     <div className="flex items-center gap-3 mb-6 md:mb-8">
//                         <SettingsIcon size={32} className="text-foreground" />
//                         <h1 className="text-2xl md:text-3xl font-bold text-foreground mt-14 md:mt-0">Settings</h1>
//                     </div>

//                     {/* Show either Profile Card or Edit Form based on isEditing state */}
//                     {!isEditing ? (
//                         // Profile Card
//                         <div className="bg-card rounded-lg shadow-md p-4 md:p-6">
//                             <div className="flex flex-col items-center mb-6">
//                                 <div className="bg-primary/10 p-4 rounded-full mb-4">
//                                     <UserCircle className="w-16 h-16 text-primary" />
//                                 </div>
//                                 <div className="text-center">
//                                     <h2 className="text-xl font-semibold text-foreground mb-2">
//                                         {firstName} {lastName}
//                                     </h2>
//                                     <p className="text-muted-foreground break-all">{email}</p>
//                                 </div>
//                             </div>

//                             <div className="space-y-4 mb-6">
//                                 <div className="flex items-center gap-2">
//                                     <div className="flex items-center gap-2 text-muted-foreground min-w-[140px]">
//                                         <User className="w-5 h-5" />
//                                         <span>Full Name:</span>
//                                     </div>
//                                     <span className="text-foreground">{firstName} {lastName}</span>
//                                 </div>

//                                 <div className="flex items-center gap-2">
//                                     <div className="flex items-center gap-2 text-muted-foreground min-w-[140px]">
//                                         <Mail className="w-5 h-5" />
//                                         <span>Email:</span>
//                                     </div>
//                                     <span className="text-foreground break-all">{email}</span>
//                                 </div>

//                                 <div className="flex items-center gap-2">
//                                     <div className="flex items-center gap-2 text-muted-foreground min-w-[140px]">
//                                         <Calendar className="w-5 h-5" />
//                                         <span>Member since:</span>
//                                     </div>
//                                     <span className="text-foreground">
//                                         {new Date(joinDate).toLocaleDateString('en-US', {
//                                             year: 'numeric',
//                                             month: 'long',
//                                             day: 'numeric'
//                                         })}
//                                     </span>
//                                 </div>
//                             </div>

//                             <Button
//                                 variant="outline"
//                                 onClick={() => setIsEditing(true)}
//                                 className="w-full flex items-center justify-center gap-2"
//                             >
//                                 <Pencil className="w-4 h-4" />
//                                 Edit Profile
//                             </Button>
//                         </div>
//                     ) : (
//                         // Edit Form
//                         <div className="bg-card rounded-lg shadow-md p-4 md:p-6">
//                             <h3 className="text-xl font-semibold mb-6 text-foreground">Edit Profile</h3>
//                             <form onSubmit={handleUpdateProfile} className="space-y-6">
//                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                                     <div>
//                                         <label className="block text-sm font-medium mb-2 text-foreground">
//                                             First Name
//                                         </label>
//                                         <input
//                                             type="text"
//                                             value={firstName}
//                                             onChange={(e) => setFirstName(e.target.value)}
//                                             className="w-full p-2 rounded-md border bg-background text-foreground"
//                                             required
//                                         />
//                                     </div>

//                                     <div>
//                                         <label className="block text-sm font-medium mb-2 text-foreground">
//                                             Last Name
//                                         </label>
//                                         <input
//                                             type="text"
//                                             value={lastName}
//                                             onChange={(e) => setLastName(e.target.value)}
//                                             className="w-full p-2 rounded-md border bg-background text-foreground"
//                                             required
//                                         />
//                                     </div>
//                                 </div>

//                                 <div>
//                                     <label className="block text-sm font-medium mb-2 text-foreground">
//                                         Current Email
//                                     </label>
//                                     <input
//                                         type="email"
//                                         value={email}
//                                         className="w-full p-2 rounded-md border bg-muted text-muted-foreground break-all"
//                                         disabled
//                                     />
//                                 </div>

//                                 <div>
//                                     <label className="block text-sm font-medium mb-2 text-foreground">
//                                         New Email (Optional)
//                                     </label>
//                                     <input
//                                         type="email"
//                                         value={newEmail}
//                                         onChange={(e) => setNewEmail(e.target.value)}
//                                         className="w-full p-2 rounded-md border bg-background text-foreground"
//                                         placeholder="Enter new email"
//                                     />
//                                 </div>

//                                 <div className="flex flex-col md:flex-row gap-4">
//                                     <Button
//                                         type="submit"
//                                         disabled={isLoading}
//                                         className={cn(
//                                             "flex-1",
//                                             isLoading && "opacity-50 cursor-not-allowed"
//                                         )}
//                                     >
//                                         {isLoading ? "Updating..." : "Update Profile"}
//                                     </Button>
//                                     <Button
//                                         type="button"
//                                         variant="outline"
//                                         onClick={() => {
//                                             setIsEditing(false);
//                                             setNewEmail('');
//                                         }}
//                                         className="flex-1"
//                                     >
//                                         Cancel
//                                     </Button>
//                                 </div>
//                             </form>
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Settings;

import { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-hot-toast"
import Sidebar from "./Sidebar"
import { Button } from "./ui/button"
import { cn } from "../lib/utils"
import OTPVerification from "./OTPVerification"
import { UserCircle, SettingsIcon, Edit } from "lucide-react"

const Settings = ({ setIsAuthenticated }) => {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [email, setEmail] = useState("")
    const [newEmail, setNewEmail] = useState("")
    const [isEmailVerification, setIsEmailVerification] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [joinDate, setJoinDate] = useState("")
    const [editSection, setEditSection] = useState(null)

    // Fetch current user data
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem("todoToken")
                const response = await axios.get("http://localhost:3000/user/profile", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                const { firstName, lastName, username, joinDate } = response.data
                setFirstName(firstName)
                setLastName(lastName)
                setEmail(username)
                setJoinDate(joinDate)
            } catch (error) {
                toast.error("Failed to load user data")
            }
        }
        fetchUserData()
    }, [])

    const handleUpdateProfile = async (e) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const token = localStorage.getItem("todoToken")
            const updateData = {
                firstName,
                lastName,
            }

            // If email is being changed, send OTP first
            if (newEmail && newEmail !== email) {
                try {
                    await axios.post("http://localhost:3000/resend-otp", {
                        email: newEmail,
                    })

                    setIsEmailVerification(true)
                    toast.success("Verification code sent to your new email")
                    return
                } catch (error) {
                    toast.error("Failed to send verification code")
                    setIsLoading(false)
                    return
                }
            }

            // If no email change, just update other fields
            const response = await axios.put("http://localhost:3000/user/profile", updateData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            localStorage.setItem("firstName", firstName)
            toast.success("Profile updated successfully")
            setEditSection(null)
        } catch (error) {
            toast.error("Failed to update profile")
        } finally {
            setIsLoading(false)
        }
    }

    const handleEmailVerificationComplete = async () => {
        try {
            const token = localStorage.getItem("todoToken")
            await axios.put(
                "http://localhost:3000/user/profile",
                {
                    firstName,
                    lastName,
                    username: newEmail,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            )

            setEmail(newEmail)
            setNewEmail("")
            setIsEmailVerification(false)
            setEditSection(null)
            toast.success("Profile updated successfully")
        } catch (error) {
            toast.error("Failed to update profile")
        }
    }

    const handlePhotoUpload = (e) => {
        // This is a placeholder for photo upload functionality
        toast.success("Photo upload feature will be implemented soon")
    }

    if (isEmailVerification) {
        return (
            <OTPVerification
                email={newEmail}
                onVerificationComplete={handleEmailVerificationComplete}
                isProfileUpdate={true}
            />
        )
    }

    return (
        <div className="flex h-screen flex-col md:flex-row">
            <Sidebar setIsAuthenticated={setIsAuthenticated} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
            <div className="flex-1 p-4 md:p-8 bg-background overflow-y-auto">
                <div className="max-w-2xl mx-auto">
                    <div className="flex items-center gap-3 mb-6 md:mb-8 mt-14">
                        <SettingsIcon size={32} className="text-foreground" />
                        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Settings</h1>
                    </div>

                    {/* Profile Photo Card */}
                    <div className="bg-card rounded-lg shadow-md p-6 mb-6">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                            <div className="w-24 h-24 rounded-full bg-primary/10 overflow-hidden flex-shrink-0">
                                <UserCircle className="w-full h-full text-primary" />
                            </div>
                            <div className="flex flex-col items-center md:items-start gap-3 w-full">
                                {editSection === "personal" ? (
                                    <>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handlePhotoUpload}
                                            className="text-foreground hover:text-foreground hover:bg-accent"
                                        >
                                            Upload new photo
                                        </Button>
                                        <div className="text-sm text-muted-foreground text-center md:text-left">
                                            <p>At least 800×800 px recommended.</p>
                                            <p>JPG or PNG is allowed</p>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center md:text-left">
                                        <h2 className="text-xl font-semibold text-foreground mb-1">
                                            {firstName} {lastName}
                                        </h2>
                                        <p className="text-sm text-muted-foreground break-all">{email}</p>
                                    </div>
                                )}
                            </div>
                        </div>ī
                    </div>

                    {/* Personal Info Card */}
                    <div className="bg-card rounded-lg shadow-md p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-semibold text-foreground">Personal Info</h2>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-primary hover:bg-primary/10"
                                onClick={() => setEditSection(editSection ? null : "personal")}
                            >
                                <Edit className="w-4 h-4 mr-1" />
                                Edit
                            </Button>
                        </div>

                        {editSection === "personal" ? (
                            <form onSubmit={handleUpdateProfile} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-foreground">First Name</label>
                                        <input
                                            type="text"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            className="w-full p-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-foreground">Last Name</label>
                                        <input
                                            type="text"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            className="w-full p-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2 text-foreground">Current Email</label>
                                    <input
                                        type="email"
                                        value={email}
                                        className="w-full p-2 rounded-md border border-input bg-muted text-muted-foreground mb-4"
                                        disabled
                                    />

                                    <label className="block text-sm font-medium mb-2 text-foreground">New Email (Optional)</label>
                                    <input
                                        type="email"
                                        value={newEmail}
                                        onChange={(e) => setNewEmail(e.target.value)}
                                        className="w-full p-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        placeholder="Enter new email address"
                                    />
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className={cn("flex-1", isLoading && "opacity-50 cursor-not-allowed")}
                                    >
                                        {isLoading ? "Updating..." : "Save Changes"}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setEditSection(null)
                                            setNewEmail("")
                                        }}
                                        className="flex-1 hover:bg-accent"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-6">
                                <div className="border-b border-border pb-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
                                        <div className="sm:col-span-1">
                                            <p className="text-sm text-muted-foreground">Full Name</p>
                                        </div>
                                        <div className="sm:col-span-2">
                                            <p className="text-sm font-medium text-foreground">
                                                {firstName} {lastName}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-b border-border pb-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
                                        <div className="sm:col-span-1">
                                            <p className="text-sm text-muted-foreground">Email</p>
                                        </div>
                                        <div className="sm:col-span-2">
                                            <p className="text-sm font-medium text-foreground break-all">{email}</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
                                        <div className="sm:col-span-1">
                                            <p className="text-sm text-muted-foreground">Member since</p>
                                        </div>
                                        <div className="sm:col-span-2">
                                            <p className="text-sm font-medium text-foreground">
                                                {new Date(joinDate).toLocaleDateString("en-US", {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Settings;
