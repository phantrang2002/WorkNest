import React, { useState, useEffect } from 'react';
import RootLayout from '@/app/layout';
import Header from '@/components/Header';
import { EditMyEmployerProfile, GetMyEmployerProfile, UploadAvatarProfile } from '@/api/employerService';
import { Avatar } from '@mui/material';

const CompanyProfileEdit: React.FC = () => {
    const [companyProfile, setCompanyProfile] = useState({
        employerName: '',
        avatar: '',
        location: '',
        industry: '',
        sizeFrom: '',
        sizeTo: '',
        description: '',
    });
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

    const fetchCompanyProfile = async () => {
        try {
            const token = localStorage.getItem('userToken');
            if (!token) {
                setError('No token found.');
                return;
            }
            const response: any = await GetMyEmployerProfile(token);
            setCompanyProfile(response);

            const size = response.size;
            const [sizeFrom, sizeTo] = size ? size.split(' - ').map(Number) : ['', ''];

            setCompanyProfile(prev => ({
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
        fetchCompanyProfile();
    }, []);

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files ? e.target.files[0] : null;
        if (file) {
            const token = localStorage.getItem('userToken');
            if (token) {
                try {
                    await UploadAvatarProfile(token, file);
                    fetchCompanyProfile();
                } catch (error) {
                    console.error("Error uploading avatar:", error);
                }
            }
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLElement>) => {
        const { name, value } = e.target as HTMLInputElement | HTMLTextAreaElement;
        setCompanyProfile(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleFormSubmit = async (e: React.FormEvent) => {


        e.preventDefault();
        setLoading(true);

        if (Number(companyProfile.sizeFrom) >= Number(companyProfile.sizeTo)) {
            setError('Size From must be less than Size To');
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('EmployerName', companyProfile.employerName);
        formData.append('Location', companyProfile.location);
        formData.append('Industry', companyProfile.industry);
        formData.append('Size', `${companyProfile.sizeFrom} - ${companyProfile.sizeTo}`);
        formData.append('Description', companyProfile.description);

        try {
            const token = localStorage.getItem('userToken');
            if (!token) {
                setError('No token found.');
                return;
            }

            const response: any = await EditMyEmployerProfile(token, formData);
            console.log(response);
            if (response.message) {
                setLoading(false);
                setSuccessMessage("Employer profile updated successfully!");
                setError("");
            } else {
                setError("An unexpected error occurred. Please try again.");
                setSuccessMessage("");
            }
            setLoading(false);
        } catch (error: any) {
            if (error.response && error.response.data) {
                if (error.response.data.errors) {
                    const errorMessages = Object.values(error.response.data.errors)
                        .flat()
                        .join(", ");
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
            <div className="flex flex-wrap justify-center mt-8 mb-8 sm:mb-0 px-4 h-fit sm:h-[800px] items-start">
                {/* Avatar Section */}
                <div className="w-full sm:w-1/3 md:w-1/4 flex justify-center flex-col items-center gap-10 mb-6 sm:mb-0">

                    <Avatar
                        src={companyProfile.avatar || '/path/to/your/default-avatar.png'}

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
                            <label htmlFor="employerName" className="text-black-color font-semibold">Company Name</label>
                            <input
                                id="employerName"
                                name="employerName"
                                value={companyProfile.employerName}
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
                                value={companyProfile.location}
                                onChange={handleInputChange}
                                className="border border-gray-300 p-2 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                                type="text"
                            />
                        </div>

                        {/* Industry, SizeFrom, and SizeTo on the same row */}
                        <div className="flex sm:space-x-4 space-y-6 sm:space-y-0 sm:flex-row flex-col">
                            <div className="flex flex-col w-full sm:w-1/2">
                                <label htmlFor="industry" className="text-black-color font-semibold">Industry</label>
                                <select
                                    id="industry"
                                    name="industry"
                                    value={companyProfile.industry || ''}
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
                                <label htmlFor="sizeFrom" className="text-black-color font-semibold">Size From</label>
                                <input
                                    id="sizeFrom"
                                    name="sizeFrom"
                                    value={companyProfile.sizeFrom}
                                    onChange={handleInputChange}
                                    className="border border-gray-300 p-2 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    type="number"
                                />
                            </div>

                            <div className="flex flex-col w-full sm:w-1/4">
                                <label htmlFor="sizeTo" className="text-black-color font-semibold">Size To</label>
                                <input
                                    id="sizeTo"
                                    name="sizeTo"
                                    value={companyProfile.sizeTo}
                                    onChange={handleInputChange}
                                    className="border border-gray-300 p-2 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    type="number"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col">
                            <label htmlFor="description" className="text-black-color font-semibold">Description</label>
                            <textarea
                                id="description"
                                name="description"
                                value={companyProfile.description}
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

export default CompanyProfileEdit;
