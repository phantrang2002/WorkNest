import React, { useEffect, useState } from 'react';
import RootLayout from '../../app/layout';
import { Avatar, TextField } from '@mui/material';
import Header from '@/components/Header';
import { GetEmployerProfile, UploadAvatarProfile } from '@/api/employerService';
import { MdAccessTime, MdEdit, MdOutlineGroups2 } from 'react-icons/md';
import { FaMapMarkerAlt } from 'react-icons/fa';
import Loading from '@/components/Loading';
import dynamic from 'next/dynamic';
import { IoLocationOutline } from 'react-icons/io5';
import router from 'next/router';
import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'react-toastify';
// Dynamically load map components to avoid SSR issues
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

const EmployerProfilePage: React.FC = () => {
  const [profileData, setProfileData] = useState<Employer | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [locationCoords, setLocationCoords] = useState<{ lat: number, lng: number } | null>(null);
  const [employerUrl, setEmployerUrl] = useState<string | string[]>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setEmployerUrl(window.location.href);
    }
  }, []);

  const handleCopyURL = () => {
    navigator.clipboard.writeText(window.location.toString())
    toast.success("URL copied to clipboard!");
  }

  const fetchProfile = async () => {
    const employerid = window.location.pathname.split('/')[2];
    if (!employerid) {
      setError('Employer ID is missing');
      return;
    }

    setLoading(true);
    try {
      const response: any = await GetEmployerProfile(employerid);
      setProfileData(response);

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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleViewDetail = (employerId: string) => {
    router.push(`/employers/${employerId}`);
  };

  return (
    <RootLayout>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white z-50">
          <Loading />
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
          </div>
        </div>

        {/* Main Content Section */}
        <div className="container mx-auto py-8 px-4 grid grid-cols-10 gap-8 w-full">
          {/* Left Section - Location and Description */}
          <div className="col-span-10 sm:col-span-4 space-y-8">
            {/* Description */}
            <div className="bg-white p-6 rounded-lg shadow-md h-fit">
              <div className="bg-darker-color p-2 rounded-t-lg -mx-6 -mt-8">
                <h2 className="text-lg font-semibold text-white-color ml-4">Description</h2>
              </div>
              <p className="mt-4 text-gray-700">{profileData?.description}</p>
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
                      <Popup>{profileData?.location}</Popup>
                    </Marker>
                  </MapContainer>
                </div>
              )}
            </div>

            {/* Sharing */}
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
                  <JobCard key={job.jobPostingID} job={job} onApply={() => handleViewDetail(job.jobPostingID)} />
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
      <div className="w-16 h-16 flex-shrink-0 ml-6 sm:ml-0">
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


export default EmployerProfilePage;
