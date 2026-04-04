import { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-hot-toast"
import Sidebar from "./Sidebar"
import { Button } from "./ui/button"
import { cn } from "../lib/utils"
import OTPVerification from "./OTPVerification"
import { UserCircle, SettingsIcon, Edit, User2Icon, MailIcon, Calendar } from "lucide-react";
import ProfilePicture from './ProfilePicture';

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
    const [profilePicture, setProfilePicture] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [tempProfilePicture, setTempProfilePicture] = useState(null);

    const fetchUserData = async () => {
        try {
            const token = localStorage.getItem("todoToken")
            const response = await axios.get("https://goalarcservices.riturajdey.com/user/profile", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const { firstName, lastName, username, joinDate, profilePicture } = response.data;
            setFirstName(firstName);
            setLastName(lastName);
            setEmail(username);
            setJoinDate(joinDate);
            setProfilePicture(profilePicture);
        } catch (error) {
            toast.error("Failed to load user data")
        }
    };

    // Fetch current user data
    useEffect(() => {
        fetchUserData();
    }, []);

    const handlePhotoSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file');
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size should be less than 5MB');
            return;
        }

        // Create a temporary URL for preview
        const tempUrl = URL.createObjectURL(file);
        setTempProfilePicture(tempUrl);
        setSelectedFile(file);
    }

    const handleUpdateProfile = async (e) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const token = localStorage.getItem("todoToken")

            // Handle profile picture upload first if a new file is selected
            if (selectedFile) {
                const formData = new FormData();
                formData.append('profilePicture', selectedFile);

                try {
                    const uploadResponse = await axios.post(
                        'https://goalarcservices.riturajdey.com/user/upload',
                        formData,
                        {
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'multipart/form-data'
                            }
                        }
                    );
                    setProfilePicture(uploadResponse.data.profilePicture);
                } catch (error) {
                    toast.error('Failed to upload profile picture');
                    console.error('Upload error:', error);
                    setIsLoading(false);
                    return;
                }
            }

            const updateData = {
                firstName,
                lastName,
            }

            // If email is being changed, send OTP first
            if (newEmail && newEmail !== email) {
                try {
                    await axios.post("https://goalarcservices.riturajdey.com/resend-otp", {
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
            const response = await axios.put("https://goalarcservices.riturajdey.com/user/profile", updateData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            localStorage.setItem("firstName", firstName)
            toast.success("Profile updated successfully")
            setEditSection(null)
            setSelectedFile(null);
            setTempProfilePicture(null);

            // Refresh user data to ensure we have the latest data
            fetchUserData();
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
                "https://goalarcservices.riturajdey.com/user/profile",
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
                                <ProfilePicture
                                    profilePicture={editSection === "personal" ? (tempProfilePicture || profilePicture) : profilePicture}
                                    onUploadSuccess={(url) => {
                                        setProfilePicture(url);
                                        fetchUserData();
                                    }}
                                />
                            </div>
                            <div className="flex flex-col items-center md:items-start gap-3 w-full">
                                {editSection === "personal" ? (
                                    <>
                                        <div className="relative">
                                            <input
                                                type="file"
                                                id="profile-photo-input"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handlePhotoSelect}
                                            />
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-foreground hover:text-foreground hover:bg-accent"
                                                onClick={() => document.getElementById('profile-photo-input').click()}
                                            >
                                                Select new photo
                                            </Button>
                                        </div>
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
                        </div>
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

                                    <label className="block text-sm font-medium mb-2 text-foreground">New Email</label>
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
                                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                                                <User2Icon className="w-4 h-4" />
                                                Full Name
                                            </p>
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
                                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                                                <MailIcon className="w-4 h-4" />
                                                Email
                                            </p>
                                        </div>
                                        <div className="sm:col-span-2">
                                            <p className="text-sm font-medium text-foreground break-all">{email}</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
                                        <div className="sm:col-span-1">
                                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                Member since
                                            </p>
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
