import { useEffect, useRef, useState } from 'react';
import router, { useRouter } from 'next/router';
import { GetJobPostingById, LockAJob } from '@/api/jobService';
import Header from '../../components/Header';
import RootLayout from '../../app/layout';
import { FaClock, FaIndustry, FaMapMarkerAlt, FaUser } from 'react-icons/fa';
import { MdOutlineGroups2 } from 'react-icons/md';
import Link from 'next/link';
import { CiShare1 } from 'react-icons/ci';
import { home } from '@/api/accountService';
import { RiMoneyDollarCircleFill } from "react-icons/ri";
import { IoPeopleSharp } from "react-icons/io5";
import { RiTimeFill } from "react-icons/ri";
import { FaReadme } from "react-icons/fa";
import { CheckApplied, PostApply } from '@/api/applyService';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'react-toastify';

interface JobPosting {
    jobID: string,
    jobTitle: string;
    location: string;
    description: string;
    postedDate: string;
    timeRemaining: string;
    position: string;
    companyLogo: string;
    companyName: string;
    industry: string;
    size: string;
    companyLocation: string;
    companyId: string;
    minSalary: number;
    maxSalary: number;
    experienceExpect: number;
    quantity: number;
    jobIndustry: string;
    lockFlg: number;
    status: boolean;
}

const handleLogin = () => {
    router.push('/login');
};

const JobDetailPage = () => {

    const router = useRouter();

    const [hasApplied, setHasApplied] = useState<boolean>(false);
    const [jobDetails, setJobDetails] = useState<JobPosting | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [userToken, setUserToken] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<number | null>(null);
    const [userId, setUserId] = useState<string | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userData, setUserData] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
    });

    const [jobUrl, setJobUrl] = useState<string | string[]>('');


    useEffect(() => {
        if (typeof window !== 'undefined') {
            setJobUrl(window.location.href);
        }
    }, []);

    const handleCopyURL = () => {
        navigator.clipboard.writeText(window.location.toString())
        toast.success("URL copied to clipboard!");
    }

    useEffect(() => {
        const token = localStorage.getItem('userToken');
        if (token) {
            setUserToken(token);
            fetchUserInfo(token);
        }
    }, []);

    const fetchUserInfo = async (token: string | null) => {
        if (!token) return;
        try {
            const response: any = await home();
            setUserRole(response.accountRole);
            setUserId(response.userId);
            setUserData(response);

        } catch (error: any) {
            console.error('Error fetching user info:', error);
        }
    };

    const openModal = () => {
        if (userToken) {
            setIsModalOpen(true);
            fetchUserInfo(userToken);
        } else {
            console.error('No user token available');
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const [cvFile, setCvFile] = useState<File | null>(null);
    const fileInput = useRef<HTMLInputElement | null>(null);

    const handleFileChange = () => {
        if (fileInput.current?.files) {
            setCvFile(fileInput.current.files[0]);
        }
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        if (cvFile) {
            const formData = new FormData();
            const storedJobId = window.location.pathname.split('/')[2];

            if (!storedJobId) {
                console.error('No job ID found');
                return;
            }

            formData.append('JobPostingID', storedJobId);
            formData.append('CVFile', cvFile);

            console.log('FormData:', formData);

            if (userToken) {
                PostApply(formData, userToken)
                    .then(response => {
                        toast.success("Applied successfully!");
                    })
                    .catch(error => {
                        if (error.response) {
                            console.error("Error response:", error.response.data);
                            console.error("Error status:", error.response.status);
                        } else {
                            console.error("Unexpected error:", error.message);
                        }
                    });
            } else {
                console.error('User is not authenticated');
            }
        } else {
            console.error('No CV file selected');
        }
    };

    const handleEditJob = () => {
        const storedJobId = window.location.pathname.split('/')[2];
        router.push(`/edit-job/${storedJobId}`);

    };


    const handleReopenJob = () => {
        const storedJobId = window.location.pathname.split('/')[2];

        router.push(`/edit-job/${storedJobId}`);

    };

    const [showCloseModal, setShowCloseModal] = useState(false);

    const closeJob = async () => {
        const storedJobId = window.location.pathname.split('/')[2];
        try {
            await LockAJob(storedJobId, userToken);
            fetchJobDetails();
        } catch (error) {
            console.error('Error closing job:', error);
            alert('An error occurred while closing the job');
        }
    };

    useEffect(() => {
        const checkApplied = async () => {
            const storedJobId = window.location.pathname.split('/')[2];

            if (storedJobId) {
                try {
                    const response: any = await CheckApplied(storedJobId, userToken);
                    setHasApplied(response.applied);
                } catch (error) {
                    console.error('Error fetching applied:', error);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };

        checkApplied();
    }, [userToken]);

    const fetchJobDetails = async () => {
        const storedJobId = window.location.pathname.split('/')[2];
        if (storedJobId) {
            try {
                const JobPosting: any = await GetJobPostingById(storedJobId);
                setJobDetails(JobPosting);
            } catch (error) {
                console.error('Error fetching job details:', error);
            } finally {
                //setLoading(false);
            }
        } else {
            // setLoading(false);
        }
    };

    useEffect(() => {

        fetchJobDetails();
    }, []);

    /* if (loading) {
         return <div>Loading...</div>; // Simple loading state
     }*/

    if (!jobDetails) {
        return <div className='text-black-color'>No job details found.</div>;
    }



    return (
        <RootLayout>
            <Header />
            <div className="container mx-auto py-8 min-h-screen">
                <div className="flex justify-center sm:flex-row flex-col">
                    {/* Job Information */}
                    <div className="bg-white rounded-lg shadow-lg p-6 w-[90%] sm:w-1/2 mx-5 mb-8">
                        {/* Upper Section */}
                        <div className="mb-4">
                            <h1 className="text-3xl font-semibold text-black-color pb-4 pt-2">{jobDetails.jobTitle}</h1>
                            <p className="flex items-center text-gray-600 mb-2">
                                <FaMapMarkerAlt className="mr-2 text-primary-color" />
                                {jobDetails.location}
                            </p>
                            <p className="flex items-center text-gray-600 mb-2">
                                <FaUser className="mr-2 text-primary-color" />
                                {jobDetails.position}
                            </p>
                            <p className="flex items-center text-gray-600 mb-2">
                                <FaReadme className="mr-2 text-primary-color" />
                                {jobDetails.jobIndustry}
                            </p>
                            <p className="flex items-center text-gray-600 mb-2">
                                <RiMoneyDollarCircleFill className="mr-2  text-primary-color" />
                                {jobDetails.minSalary === 0 && jobDetails.maxSalary === 0
                                    ? "Negotiable"
                                    : `${jobDetails.minSalary} - ${jobDetails.maxSalary} $`}
                            </p>
                            <p className="flex items-center text-gray-600 mb-2">
                                <IoPeopleSharp className="mr-2  text-primary-color" />
                                {jobDetails.quantity} people
                            </p>
                            <p className="flex items-center text-gray-600 mb-2">
                                <RiTimeFill className="mr-2  text-primary-color" />
                                {jobDetails.experienceExpect} year of experience expected
                            </p>
                            <div className="items-center bg-gray-100 px-4 py-2 rounded-lg mt-4 inline-flex">
                                <FaClock className="mr-2 text-gray-700" />
                                <span className="text-darker-color font-semibold mr-1">{jobDetails.timeRemaining}</span>
                                {jobDetails.timeRemaining !== "Expired" && (
                                    <span className="text-black-color">left to apply</span>
                                )}


                            </div>

                        </div>

                        {/* Lower Section */}

                        <div className="mt-6 ">
                            <div className="flex flex-col">
                                <div className='flex items-start pb-2'>
                                    <div className="w-1 bg-primary-color h-8 mr-2"></div>
                                    <h2 className="text-lg font-bold text-darker-color">Description</h2>
                                </div>
                                <div className="mt-2 text-black-color description-content" dangerouslySetInnerHTML={{ __html: jobDetails.description }}></div>


                                <p className="mt-2 text-gray-500">
                                    Posted on: {new Date(jobDetails.postedDate).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        {userToken && userRole === 1 && (
                            <div className="flex flex-col items-center justify-center">
                                {/* Render button only if the job is not expired */}
                                {jobDetails.timeRemaining !== "Expired" && jobDetails.lockFlg == 0 && jobDetails.status == true && (
                                    <button
                                        onClick={openModal}
                                        className={`w-[150px] text-white px-4 py-2 rounded-md mt-2 ${hasApplied ? 'bg-gray-500' : 'bg-primary-color'} hover:${hasApplied ? '' : 'bg-primary-color'}`}
                                        disabled={hasApplied || loading}
                                    >
                                        {hasApplied ? 'Applied' : 'Apply now'}
                                    </button>
                                )}
                            </div>

                        )}


                        {isModalOpen && (
                            <div className="modal-overlay">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <button onClick={closeModal} className="close-button">X</button>
                                    </div>
                                    <div className="modal-body">
                                        <h2 className="text-black-color font-semibold pb-2 ">Job Application</h2>
                                        <p className="modal-instructions">
                                            Please fill out your information in the <Link href="/my-profile" className='text-primary-color'>profile page</Link> so that the recruiter can better understand your contact details and other relevant information.
                                        </p>
                                        <form onSubmit={handleSubmit}>
                                            <div>
                                                <label htmlFor="name" className="text-black-color">Name:</label>
                                                <p className="text-info">{userData.fullName}</p>
                                            </div>
                                            <div>
                                                <label htmlFor="email" className="text-black-color">Email:</label>
                                                <p className="text-info">{userData.email}</p>
                                            </div>
                                            <div>
                                                <label htmlFor="phoneNumber" className="text-black-color">Phone Number:</label>
                                                <p className="text-info">{userData.phoneNumber}</p>
                                            </div>
                                            <div>
                                                <label htmlFor="cv" className="text-black-color">CV (PDF only):</label>
                                                <input
                                                    type="file"
                                                    ref={fileInput}
                                                    className="text-black-color"
                                                    accept=".pdf"
                                                    onChange={handleFileChange}
                                                    required
                                                />
                                            </div>
                                            <button type="submit" className="submit-button bg-primary-color">
                                                Submit Application
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>

                        )}

                        {!userToken && (
                            <div className="flex flex-col items-center justify-center ">
                                <button onClick={handleLogin} className="w-[250px] bg-primary-color text-white px-4 py-2 rounded-md mt-2 hover:bg-primary-color">Sign In to Apply now</button>
                            </div>
                        )}

                        {/* Edit/close Button */}
                        {userId === jobDetails.companyId && (
                            <div className="flex gap-6 items-center justify-center mt-4">

                                {jobDetails.lockFlg === 2 ? (
                                    <button
                                        onClick={handleReopenJob}
                                        className="w-[150px] bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                                    >
                                        Re-open
                                    </button>
                                ) : (
                                    <>
                                        <button onClick={handleEditJob} className="w-[150px] bg-primary-color text-white px-4 py-2 rounded-md hover:bg-secondary-color-dark">
                                            Edit Job
                                        </button>

                                        <button
                                            onClick={() => setShowCloseModal(true)}
                                            className="w-[150px] bg-red-600 text-white px-4 py-2 rounded-md hover:bg-secondary-color-dark"
                                        >
                                            Close Job
                                        </button></>
                                )}

                                <CloseJobModal
                                    show={showCloseModal}
                                    onClose={() => setShowCloseModal(false)}
                                    onConfirm={() => {
                                        closeJob();
                                        setShowCloseModal(false);
                                    }}
                                />

                            </div>
                        )}

                    </div>

                    {/* Company Information */}
                    <div className='flex flex-col w-full sm:w-[30%]'>

                        <div className="bg-white rounded-lg shadow-lg p-8 h-fit mx-5 mb-8">
                            <div className="mt-4 flex items-start">
                                {jobDetails.companyLogo ? (
                                    <img src={jobDetails.companyLogo} alt={`${jobDetails.companyName} Logo`} className="h-20 w-20 object-cover mr-4" />
                                ) : (
                                    <div className="h-20 w-20 bg-gray-300 rounded-md mr-4 flex items-center justify-center">
                                        <span className="text-gray-500">No Logo</span>
                                    </div>
                                )}
                                <p className="text-lg font-semibold text-gray-700">{jobDetails.companyName}</p>
                            </div>

                            <div className="mt-4">
                                <div className="flex items-center mt-2">
                                    <MdOutlineGroups2 className="mr-2 text-gray-400" /> {/* Icon people */}
                                    <span className="text-gray-700">Size: {jobDetails.size}</span>
                                </div>
                                <div className="flex items-center mt-2">
                                    <FaIndustry className="mr-2 text-gray-400" /> {/* Icon industry */}
                                    <span className="text-gray-700">Industry: {jobDetails.industry}</span>
                                </div>
                                <div className="flex items-center mt-2">
                                    <FaMapMarkerAlt className="mr-2 text-gray-400" /> {/* Icon location */}
                                    <span className="text-gray-700">Location: {jobDetails.companyLocation}</span> {/* Company Location */}
                                </div>
                            </div>

                            <div className="mt-4 text-center">
                                {userId === jobDetails.companyId ? (
                                    <a
                                        href={`http://localhost:3000/my-company-profile`}
                                        className="text-primary-color hover:text-yellow-color font-semibold"
                                    >
                                        Find Out More
                                    </a>
                                ) : (
                                    <a
                                        href={`http://localhost:3000/employers/${jobDetails.companyId}`}
                                        className="text-primary-color hover:text-yellow-color font-semibold"
                                    >
                                        Find Out More
                                    </a>
                                )}

                            </div>


                        </div>

                        {/* QR Code Section - Separate Card */}
                        <div className="bg-white rounded-lg shadow-lg p-8 mx-5 mb-8">
                            <h3 className="text-xl font-semibold text-gray-700 text-center mb-4">Scan QR to Apply</h3>
                            <div className="flex justify-center">
                                <QRCodeSVG value={jobUrl} size={128} />

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
                </div>
            </div>
        </RootLayout>
    );
};

interface CloseJobModalProps {
    show: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const CloseJobModal: React.FC<CloseJobModalProps> = ({ show, onClose, onConfirm }) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-xl sm:mx-0 mx-5">
                <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Are you sure you want to close this job?</h3>
                <div className="flex justify-center gap-6">
                    <button
                        onClick={onConfirm}
                        className="bg-primary-color text-white px-8 py-3 rounded-lg hover:bg-yellow-color"
                    >
                        Yes
                    </button>
                    <button
                        onClick={onClose}
                        className="bg-gray-600 text-white px-8 py-3 rounded-lg hover:bg-yellow-color"
                    >
                        No
                    </button>
                </div>
            </div>
        </div>
    );
};


export default JobDetailPage;
