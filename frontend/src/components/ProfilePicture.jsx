import { useState, useEffect } from 'react';
import { UserCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const ProfilePicture = ({ profilePicture, onUploadSuccess }) => {
    const [imageUrl, setImageUrl] = useState(profilePicture);

    // Update imageUrl when profilePicture prop changes
    useEffect(() => {
        setImageUrl(profilePicture);
    }, [profilePicture]);

    return (
        <div className="w-24 h-24">
            {imageUrl ? (
                <img
                    src={imageUrl}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                />
            ) : (
                <UserCircle className="w-full h-full text-primary" />
            )}
        </div>
    );
};

export default ProfilePicture;