import { useState } from 'react';
import { UserCircle, Edit } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const ProfilePicture = ({ profilePicture, onUploadSuccess }) => {
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = async (e) => {
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

        const formData = new FormData();
        formData.append('profilePicture', file);

        setIsUploading(true);
        try {
            const token = localStorage.getItem('todoToken');
            const response = await axios.post(
                'http://localhost:3000/user/upload', 
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            onUploadSuccess(response.data.profilePicture);
            toast.success('Profile picture updated successfully');
        } catch (error) {
            toast.error('Failed to upload profile picture');
            console.error('Upload error:', error);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="relative w-24 h-24">
            {profilePicture ? (
                <img
                    src={profilePicture}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                />
            ) : (
                <UserCircle className="w-full h-full text-primary" />
            )}

            <label
                className="absolute bottom-0 right-0 bg-primary hover:bg-primary/90 text-white rounded-full p-1 cursor-pointer"
                htmlFor="profile-picture-input"
            >
                <input
                    type="file"
                    id="profile-picture-input"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={isUploading}
                />
                {isUploading ? (
                    <span className="loading loading-spinner loading-sm"></span>
                ) : (
                    <Edit className="w-4 h-4" />
                )}
            </label>
        </div>
    );
};

export default ProfilePicture;