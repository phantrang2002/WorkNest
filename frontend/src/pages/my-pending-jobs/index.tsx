import { useEffect, useState } from 'react';
import Header from '../../components/Header';
import RootLayout from '../../app/layout';
import { GetMyPendingJob } from '@/api/employerService';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { MdAccessTime } from 'react-icons/md';
import { Pagination } from '@mui/material';
import Link from 'next/link';

interface PostedJob {
  jobPostingID: string;
  companyLogo: string;
  title: string;
  position: string;
  location: string;
  timeRemaining: string;
  createdOn: string;
  lockFlg: number;
} 

const PendingJobPage = () => {
  const [postedJobs, setPostedJobs] = useState<PostedJob[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(8);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (token) {
      setUserToken(token);
    }
  }, []); 

  useEffect(() => {
    const fetchPostedJob = async () => {
      if (!userToken) return; // Ensure there's a token before making the request
      try {
        const response: any = await GetMyPendingJob(pageNumber, pageSize, userToken);
        setPostedJobs(response.jobPostings); // Store job postings in state
        setTotalPages(Math.ceil(response.totalCount / pageSize)); // Set total pages for pagination
      } catch (error) {
        console.error('Error fetching posted jobs:', error);
      }
    };
  
    fetchPostedJob();
  }, [pageNumber, pageSize, userToken]);
  

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPageNumber(value); 
  };

  const handleApply = (jobPostingID: string) => { 
    router.push(`/jobs/${jobPostingID}`);
  };
   

  return (
    <RootLayout>
      <Header />
      <div className="container mx-auto py-8 bg-white">
        {/* Breadcrumb - Home > Job > My Pending Job */}
        <div className="text-md mb-6 text-gray-500 sm:mx-0 mx-5">
          <Link className="text-primary-color" href="/">Home</Link> &gt; 
          <Link className="text-primary-color" href="/jobs"> Job</Link> &gt; 
          <span className="text-gray-500"> My Pending Job</span>
        </div>     
  
        {/* Grid with 2 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:mx-0 mx-5">
          {postedJobs.length > 0 ? (
            postedJobs.map((job) => (
              <PostedJobCard 
                key={job.jobPostingID} 
                job={job} 
                onApply={() => handleApply(job.jobPostingID)}  
              />
            ))
          ) : (
            <p className="text-center text-gray-600 col-span-2">No jobs posted yet.</p>
          )}
        </div>
  
        {/* Pagination Controls */}
        <div className="flex justify-center mt-10 mb-5">
          <Pagination
            count={totalPages}
            page={pageNumber}
            onChange={handlePageChange}
            variant="outlined"
            shape="rounded" 
          />
        </div>
      </div>
    </RootLayout>
  );
  
};

const PostedJobCard = ({ job, onApply }: { job: PostedJob; onApply: () => void }) => {   
  const formattedCreateDate = new Date(job.createdOn).toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false, // Sử dụng định dạng 24 giờ
  }).replace(',', ''); // Loại bỏ dấu phẩy giữa ngày và giờ
  
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center bg-white p-6 rounded-lg shadow-md transform transition-transform hover:scale-103 hover:shadow-lg">
      {/* Employer Avatar */}
      <div className="w-16 h-16 flex-shrink-0 mb-4 sm:mb-0">
        {job.companyLogo ? (
          <Image
            src={job.companyLogo || 'D:/WorkNest/frontend/src/app/assets/images/default-avatar.jpg'} 
            alt="Company Logo"
            width={64}
            height={64}
            className="object-contain rounded-full"
          />
        ) : (
          <div className="bg-gray-200 w-full h-full rounded-full" />
        )}
      </div>

      {/* Job Information */}
      <div className="flex flex-col sm:ml-4 sm:flex-grow">
        <h2 className="text-xl font-bold text-black-color">{job.title}</h2>
        <p className="text-gray-600">{job.position}</p>
        <div className="flex sm:flex-row flex-col items-start sm:items-center sm:gap-0 gap-2 sm:space-x-2 text-sm">
          <div className="flex items-center bg-gray-200 px-2 py-1 rounded-md text-gray-700">
            <span>{job.location}</span>
          </div>

          <div className={`flex items-center justify-center px-2 py-1 rounded-md ${job.timeRemaining === "Expired" ? "bg-red-500 text-white" : "bg-gray-200 text-gray-700"}`}>
            {job.timeRemaining === "Expired" ? (
              <span>Expired</span>
            ) : (
              <>
                <MdAccessTime className="text-primary-color mr-1" />
                <span className="font-semibold mr-1.5">{job.timeRemaining}</span>
                <span>left to be expired</span>
              </>
            )}
          </div>

          {job.lockFlg === 1 && (
            <div className="flex items-center justify-center px-2 py-1 rounded-md bg-red-500 text-white">
              <span>Locked</span>
            </div>
          )}

          {job.lockFlg === 2 && (
            <div className="flex items-center justify-center px-2 py-1 rounded-md bg-yellow-500 text-white">
              <span>Closed</span>
            </div>
          )}
        </div>

        {/* Created On */}
        <div className="mt-2 text-gray-500 text-xs">
          <span>Created on: {formattedCreateDate}</span>
        </div>
      </div>

      {/* Apply Button */}
      <div className="flex flex-row sm:gap-0 gap-2 sm:flex-col items-end justify-center mt-4 sm:mt-0 sm:ml-4 sm:w-fit w-full"> 
        {/* Button to View Job Details */}
        <button 
          onClick={onApply} 
          className="w-full sm:w-fit bg-brighter-color text-white px-4 py-2 rounded-md mt-2 hover:bg-primary-color">
          View details
        </button>
      </div>
    </div>
  );
};


export default PendingJobPage;
