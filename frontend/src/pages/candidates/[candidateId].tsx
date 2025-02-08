import React, { useState, useEffect } from 'react';
import RootLayout from '@/app/layout';
import Header from '@/components/Header';
import { GetCandidate, GetMyProfile, UploadAvatarProfile } from '@/api/candidateService';
import { Avatar, Box, CircularProgress } from '@mui/material';
import { useSnackbar } from 'notistack';
import { MdEdit } from 'react-icons/md';
import router from 'next/router';
import { BiSolidEditAlt } from 'react-icons/bi';
import { toast } from 'react-toastify';

const MyProfile: React.FC = () => {
    const [profile, setProfile] = useState({
        name: '',
        avatar: '',
        phoneNumber: '',
        location: '',
        experience: '',
        industry: '',
        description: '',
    });
    const [loading, setLoading] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

    const fetchProfile = async () => {
        const candidateId = window.location.pathname.split('/')[2];
    if (!candidateId) {
      toast.error('Candidate ID is missing');
      return;
    }

        setLoading(true);
        try {  
            const response: any = await GetCandidate(candidateId);
            setProfile(response);
        } catch (error) {
            enqueueSnackbar('Error fetching profile', { variant: 'error' });
        } finally {
            setLoading(false);
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
   
    
    return (
        <RootLayout>
            <Header />
            <div className="bg-gray-50 min-h-screen pb-8">
                <div className="relative h-64 bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white">
                    <div className="absolute inset-0 bg-cover bg-center opacity-60"></div>
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="relative">
                            <Avatar
                                src={profile?.avatar || "/path/to/your/default-avatar.png"}
                                sx={{ width: 120, height: 120 }}
                                className="border-4 border-white shadow-lg"
                            />
                            
                        </div>
                        <h1 className="mt-4 text-2xl font-bold">{profile?.name}</h1> 
                        
                    </div>
                </div>

                {/* Profile Display Section */}
                <div className="w-full sm:w-2/3 md:w-1/2 mx-auto mt-10">
                    <div className="space-y-8 bg-white p-8 shadow-xl rounded-lg">
                        <div className="flex flex-col space-y-2">
                            <label className="text-xl font-semibold text-gray-700">Name</label>
                            <span className="text-lg text-gray-600">{profile.name}</span>
                        </div>

                        <div className="flex flex-col space-y-2">
                            <label className="text-xl font-semibold text-gray-700">Location</label>
                            <span className="text-lg text-gray-600">{profile.location ? profile.location : "None"}</span>
                        </div>

                        <div className="flex flex-col space-y-2">
                            <label className="text-xl font-semibold text-gray-700">Phone Number</label>
                            <span className="text-lg text-gray-600">{profile.phoneNumber ?  profile.phoneNumber : "None"}</span>
                        </div>

                        <div className="flex flex-col space-y-2">
                            <label className="text-xl font-semibold text-gray-700">Years of Experience</label>
                            <span className="text-lg text-gray-600">{profile.experience ? profile.experience : "None"}</span>
                        </div>

                        <div className="flex flex-col space-y-2">
                            <label className="text-xl font-semibold text-gray-700">Industry</label>
                            <span className="text-lg text-gray-600">{profile.industry  ? profile.industry : "None"}</span>
                        </div>

                        <div className="flex flex-col space-y-2">
                            <label className="text-xl font-semibold text-gray-700">Description</label>
                            <span className="text-lg text-gray-600">{profile.description  ? profile.description : "None"}</span>
                        </div>
                    </div>
                </div>
            </div>
        </RootLayout>
    );
};

export default MyProfile;
