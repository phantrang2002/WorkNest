import React, { useEffect, useState } from 'react';
import RootLayout from '../../app/layout';
import { Avatar, Button, TextField } from '@mui/material';
import Header from '@/components/Header';
import { GetMyEmployerProfile, UploadAvatarProfile } from '@/api/employerService';
import { MdEdit, MdOutlineGroups2 } from 'react-icons/md';
import { FaEdit, FaMapMarkerAlt } from 'react-icons/fa';
import Image from 'next/image';
import router from 'next/router';
import { Pagination } from '@mui/material';
import { IoLocationOutline } from 'react-icons/io5';
import { MdAccessTime } from 'react-icons/md';
import dynamic from 'next/dynamic';
import { FaMap } from "react-icons/fa";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { FiCopy } from "react-icons/fi"; // Import icon copy từ react-ic
import { BiSolidEditAlt } from "react-icons/bi";
import Loading from '@/components/Loading'; 
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'react-toastify';

// Dynamically import react-leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false });



interface Employer {
  employerID: string;
  employerName: string;
  avatar: string;
  industry: string;
  location: string;
  size: string;
  description: string;
  jobPostings: Job[];
  lat?: number;
  lng?: number;
}

interface Job {
  jobPostingID: string;
  companyLogo: string;
  companyName: string;
  title: string;
  position: string;
  location: string;
  timeRemaining: string;
}

const CompanyProfile: React.FC = () => { 

  const [employerUrl, setEmployerUrl] = useState<string | string[]>('');
 
  // This useEffect ensures that window is only accessed on the client-side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const employerID = localStorage.getItem('userId');
  
    const urlToCopy = `http://localhost:3000/employers/${employerID}`;
        setEmployerUrl(urlToCopy);  // Set the current URL on the client-side
    }
  }, []); 
    
  const handleCopyURL = () => {
    // Lấy phần URL chứa employerID
    const employerID = localStorage.getItem('userId');
  
    const urlToCopy = `http://localhost:3000/employers/${employerID}`;
    
    // Sao chép URL vào clipboard
    navigator.clipboard.writeText(urlToCopy)
      .then(() => {
        toast.success("URL copied to clipboard!");
      })
      .catch((error) => {
        toast.error("Failed to copy URL!");
      });
  };
  

  const [profileData, setProfileData] = useState<Employer | null>(null); 
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [locationCoords, setLocationCoords] = useState<{ lat: number, lng: number } | null>(null);

  const fetchProfile = async () => { 
    setLoading(true);
    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        setError('No token found.');
        return;
      }
      const response: any = await GetMyEmployerProfile(token);
      setProfileData(response);

      // Call Geocoding API to get lat, lng from location string
      const location = response.location;
      const geocodeResponse = await fetch(`https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(location)}`);
      const geocodeData = await geocodeResponse.json();

      if (geocodeData && geocodeData.length > 0) {
        const { lat, lon } = geocodeData[0];
        setLocationCoords({ lat: parseFloat(lat), lng: parseFloat(lon) });
      }
      setLoading(false);
    } catch (error) {
      setError('Error fetching profile.');
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);


  const handleApply = (jobPostingID: string) => { 
    router.push(`/jobs/${jobPostingID}`);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

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
    {loading && (
      <div className="absolute inset-0 flex items-center justify-center bg-white-color z-50">
        <Loading /> {/* Hoặc sử dụng một component loading nào đó */}
      </div>
    )}
    <Header />
  <div className="bg-gray-100 min-h-screen w-full">
    <div className="relative h-64 bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white">
      <div className="absolute inset-0 bg-cover bg-center opacity-60"></div>
      <div className="relative z-10 flex flex-col items-center w-full">
        <div className="relative">
          <Avatar
            src={profileData?.avatar || "/path/to/your/default-avatar.png"}
            sx={{ width: 80, height: 80 }}
            className="bg-white border border-gray-200"
          />
          <button
            onClick={() => document.getElementById('file-input')?.click()}
            className="absolute bottom-[-12px] right-[-10px] p-2 bg-white rounded-full border-2 border-gray-200 shadow-md"
          >
            <MdEdit className="text-gray-600" />
          </button>
          <input
            id="file-input"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarUpload}
          />
        </div>
        <h1 className="mt-4 text-2xl font-bold">{profileData?.employerName}</h1>
        <div className="flex items-center mt-2 space-x-6">
          <div className="flex items-center">
            <MdOutlineGroups2 className="mr-2" />
            <span className="text-white-color">
              Size: {profileData?.size ? `${profileData.size} employees` : '-'}
            </span>
          </div>
        </div>

        <button onClick={() => router.push('/my-company-profile/edit')} 
                className="flex items-center gap-2 rounded-md px-5 mt-2 py-2 
                           text-white-color bg-darker-color
                          hover:bg-yellow-color "
                ><BiSolidEditAlt />Edit my profile</button>
      </div>
    </div>

    {/* Main Content Section */}
    <div className="container mx-auto py-8 px-4 grid grid-cols-10 gap-8 w-full">
      {/* Left Section - Location and Description */}
      <div className="col-span-10 sm:col-span-4 space-y-8 w-full"> {/* Make col-span-10 to ensure it takes up 100% width */}
        {/* Description */}
        <div className="bg-white p-6 rounded-lg shadow-md h-fit">
          <div className="bg-darker-color p-2 rounded-t-lg -mx-6 -mt-8">
            <h2 className="text-lg font-semibold text-white-color ml-4">Description</h2>
          </div>
          <div>
            <p className="mt-4 text-gray-700">{profileData?.description}</p>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white p-6 rounded-lg shadow-md h-fit">
          <div className="bg-darker-color p-2 rounded-t-lg -mx-6 -mt-8">
            <h2 className="text-lg font-semibold text-white-color ml-4">Location</h2>
          </div>

          <div className="flex items-center mt-4">
            <FaMapMarkerAlt className="mr-2 text-darker-color" />
            <span className="text-gray-700">Address: {profileData?.location}</span>
          </div>

          <div className="flex items-center mt-2 mb-4">
            <FaMap className="mr-2 text-darker-color" />
            <span className="text-gray-700">Map: </span>
          </div>

          {/* Map */}
          {locationCoords && (
            <div style={{ height: '300px', width: '100%' }}>
              <MapContainer
                center={[locationCoords.lat, locationCoords.lng]} 
                zoom={50}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={[locationCoords.lat, locationCoords.lng]}>
                  <Popup>
                    {profileData?.location}
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          )}
        </div>

        {/* Share */}
        <div className="bg-white p-6 rounded-lg shadow-md h-fit">
          <div className="bg-darker-color p-2 rounded-t-lg -mx-6 -mt-8">
            <h2 className="text-lg font-semibold text-white-color ml-4">Sharing</h2>
          </div>
          <div className="flex justify-center mt-8">
            <QRCodeSVG value={employerUrl} size={128} />
          </div>
          <div className="mt-4 flex justify-center">
            <button
              onClick={handleCopyURL}
              className="text-white bg-primary-color px-4 py-2 rounded-md mt-4 hover:bg-primary-color-dark transition duration-200 ease-in-out"
            >
              Copy URL
            </button>
          </div>
        </div>
      </div>

      {/* Right Section - Hiring */}
      <div className="col-span-10 sm:col-span-6 bg-white p-6 rounded-lg shadow-md">
        <div className="bg-darker-color p-2 rounded-t-lg -mx-6 -mt-8">
          <h2 className="text-lg font-semibold text-white-color ml-4">Hiring</h2>
        </div>

        <div className="mt-4">
          <TextField
            label="Search for jobs"
            variant="outlined"
            fullWidth
            value={searchTerm}
            onChange={handleSearchChange}
            className="mb-4"
          />
        </div>

        <div className="mt-4 space-y-4">
          {profileData?.jobPostings
            ?.filter((job: Job) =>
              job.title.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((job: Job) => (
              <JobCard key={job.jobPostingID} job={job} onApply={() => handleApply(job.jobPostingID)} />
            ))}
        </div>
      </div>
    </div>
  </div>
</RootLayout>
);

};
const JobCard = ({ job, onApply }: { job: Job; onApply: () => void }) => {
  return (
    <div className="flex sm:flex-row flex-col sm:items-center items-start bg-white p-6 rounded-lg shadow-md transform transition-transform hover:scale-103 hover:shadow-lg">
      {/* Company Logo */}
      <div className="w-16 h-16 flex-shrink-0">
        {job.companyLogo ? (
          <Image
            src={job.companyLogo}
            alt={job.title}
            width={64}
            height={64}
            className="object-contain rounded-full"
          />
        ) : (
          <div className="bg-gray-200 w-full h-full rounded-lg" />
        )}
      </div>

      {/* Job Details */}
      <div className="flex flex-col ml-4 flex-grow">
        <h2 className="text-xl font-bold text-black-color mb-2">{job.title}</h2>
        <p className="text-gray-600">{job.companyName}</p>

        {/* Location and Time Remaining */}
        <div className="flex sm:items-center items-start sm:space-x-2 text-sm sm:flex-row flex-col sm:gap-0 gap-2">
          <div className="flex items-center bg-gray-200 px-2 py-1 rounded-md text-gray-700">
            <IoLocationOutline className="text-primary-color mr-1" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center bg-gray-200 px-2 py-1 rounded-md text-gray-700">
            <MdAccessTime className="text-primary-color mr-1" />
            <span className="font-bold mr-1">{job.timeRemaining}</span>
            <span>left to apply</span>
          </div>
        </div>
      </div>

      {/* Apply Button */}
      <div className="flex flex-col items-end justify-center mt-4 sm:mt-0 sm:ml-0 ml-4">
        <button
          onClick={onApply}
          className="bg-brighter-color text-white px-4 py-2 rounded-md hover:bg-primary-color sm:ml-0 ml-4 sm:w-fit w-full"
        >
          View details
        </button>
      </div>
    </div>
  );
};


export default CompanyProfile;
