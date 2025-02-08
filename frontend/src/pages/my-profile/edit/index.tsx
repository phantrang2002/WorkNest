import React, { useState, useEffect } from 'react';
import RootLayout from '@/app/layout';
import Header from '@/components/Header';
import { Alert, Avatar } from '@mui/material';
import { EditMyProfile, GetMyProfile, UploadAvatarProfile } from '@/api/candidateService';

const ProfileEdit: React.FC = () => {
    const [profile, setProfile] = useState({
        name: '',
        avatar: '',
        phoneNumber: '',
        location: '',
        experience: '',
        industry: '',
        description: '',
    });
    const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState("");
    const industries = [
        'Advertising and marketing',
        'Aerospace',
        'Agriculture',
        'Computer and technology',
        'Construction',
        'Education',
        'Energy',
        'Entertainment',
        'Fashion',
        'Finance and economic',
        'Food and beverage',
        'Healthcare',
        'Hospitality',
        'Manufacturing',
        'Media and news',
        'Mining',
        'Pharmaceutical',
        'Telecommunication',
        'Transportation',
    ];

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('userToken');
            if (!token) {
                setError('No token found.');
                return;
            }
            const response: any = await GetMyProfile(token);
            setProfile(response);

            const size = response.size;
            const [sizeFrom, sizeTo] = size ? size.split(' - ').map(Number) : ['', ''];

            setProfile(prev => ({
                ...prev,
                ...response,
                sizeFrom: sizeFrom.toString(),
                sizeTo: sizeTo.toString(),
            }));
        } catch (error) {
            setError('Error fetching profile');
            console.error('Error fetching profile:', error);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files ? e.target.files[0] : null;
        if (file) {
            const token = localStorage.getItem('userToken');
            if (token) {
                try {
                    await UploadAvatarProfile(token, file);
                    fetchProfile();
                } catch (error) {
                    console.error("Error uploading avatar:", error);
                }
            }
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLElement>) => {
        const { name, value } = e.target as HTMLInputElement | HTMLTextAreaElement;
        setProfile(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleFormSubmit = async (e: React.FormEvent) => { 
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append('Name', profile.name);
        formData.append('PhoneNumber', profile.phoneNumber);

        formData.append('Location', profile.location);
        formData.append('Experience', profile.experience);

        formData.append('Industry', profile.industry);
        formData.append('Description', profile.description);

        try {
            const token = localStorage.getItem('userToken');
            if (!token) {
                setError('No token found.');
                return;
            }

            // Sending form data to the server
            const response: any = await EditMyProfile(token, formData);
            // Check if response status is 200 (OK) and handle success
            console.log(response);
            if (response.message) {
                setLoading(false);
                setSuccessMessage("Profile updated successfully!");
                setError("");
            } else {
                // Handle unexpected status codes or any other errors
                setError("An unexpected error occurred. Please try again.");
                setSuccessMessage("");
            }
            setLoading(false);
        } catch (error: any) {
            if (error.response && error.response.data) {
                // If there are validation errors, display them
                if (error.response.data.errors) {
                    const errorMessages = Object.values(error.response.data.errors)
                        .flat()
                        .join(", ");  // Flatten the array of errors and join them into a single string
                    setError(`Validation errors: ${errorMessages}`);
                    setSuccessMessage("");
                } else if (error.response.data.error) {
                    setError(error.response.data.error);
                    setSuccessMessage("");
                } else {
                    setError("An unexpected error occurred. Please try again.");
                    setSuccessMessage("");
                }
            } else {
                setError("An unexpected error occurred. Please try again.");
                setSuccessMessage("");
            }
            setLoading(false);
        }


    };

    return (
        <RootLayout>
            <Header />
            <div className="flex flex-wrap justify-center mt-8 px-4 sm:mb-0 mb-8 sm:h-[800px] items-start">
                {/* Avatar Section */}
                <div className="w-full sm:w-1/3 md:w-1/4 flex justify-center flex-col items-center gap-10 mb-6 sm:mb-0">

                    <Avatar
                        src={profile.avatar || '/path/to/your/default-avatar.png'}

                        className="w-[300px] h-[300px] rounded-full border-2 border-gray-200 shadow-md object-cover"
                    />

                    <button
                        onClick={() => document.getElementById('file-input')?.click()}
                        className="w-[150px] p-2 bg-primary-color text-white rounded-md border-2 border-gray-300 shadow-lg"
                    >
                        Edit photo
                    </button>
                    <input
                        id="file-input"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                    />

                </div>

                {/* Profile Form Section */}
                <div className="w-full sm:w-2/3 md:w-1/2">
                    <form onSubmit={handleFormSubmit} className="space-y-6 bg-white p-6 shadow-md rounded-lg">
                        <div className="flex flex-col">
                            <label htmlFor="name" className="text-black-color font-semibold">Name</label>
                            <input
                                id="name"
                                name="name"
                                value={profile.name}
                                onChange={handleInputChange}
                                className="border border-gray-300 p-2 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                                type="text"
                            />
                        </div>

                        <div className="flex flex-col">
                            <label htmlFor="location" className="text-black-color font-semibold">Location</label>
                            <input
                                id="location"
                                name="location"
                                value={profile.location}
                                onChange={handleInputChange}
                                className="border border-gray-300 p-2 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                                type="text"
                            />
                        </div>

                        {/* Industry, SizeFrom, and SizeTo on the same row */}
                        <div className="flex sm:flex-row flex-col sm:gap-0 gap-4 sm:space-x-4">
                            <div className="flex flex-col w-full sm:w-1/2">
                                <label htmlFor="industry" className="text-black-color font-semibold">Industry</label>
                                <select
                                    id="industry"
                                    name="industry"
                                    value={profile.industry || ''}  // Default to empty string if not set
                                    onChange={handleInputChange}
                                    className="border border-gray-300 p-2.5 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Please select</option> {/* Default option */}
                                    {industries.map((industry, index) => (
                                        <option key={index} value={industry}>
                                            {industry}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex flex-col w-full sm:w-1/4">
                                <label htmlFor="experience" className="text-black-color font-semibold">Years of Experience</label>
                                <input
                                    id="experience"
                                    name="experience"
                                    value={profile.experience}
                                    onChange={handleInputChange}
                                    className="border border-gray-300 p-2 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    type="number"
                                />
                            </div>

                            <div className="flex flex-col w-full sm:w-1/4">
                                <label htmlFor="phoneNumber" className="text-black-color font-semibold">Phone Number</label>
                                <input
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    value={profile.phoneNumber}
                                    onChange={handleInputChange}
                                    className="border border-gray-300 p-2 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500"                                     
                                />
                            </div>
                        </div>

                        <div className="flex flex-col">
                            <label htmlFor="description" className="text-black-color font-semibold">Description</label>
                            <textarea
                                id="description"
                                name="description"
                                value={profile.description}
                                onChange={handleInputChange}
                                className="border min-h-60 border-gray-300 p-2 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <button
                            type="submit"
                            className="bg-primary-color text-white p-3 rounded-lg w-full hover:bg-blue-600 transition"
                            disabled={loading}
                        >
                            {loading ? 'Updating...' : 'Update Profile'}
                        </button>

                        {error && <p className="text-red-500 text-center mt-4">{error}</p>}
                        {successMessage && <p className="text-green-500 text-center mt-4">{successMessage}</p>}

                    </form>
                </div>
            </div>
        </RootLayout>
    );
};

export default ProfileEdit;
