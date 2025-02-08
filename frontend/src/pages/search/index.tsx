import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { SearchJob } from "@/api/jobService"; // Assuming SearchJob is defined here
import { IoLocationOutline } from 'react-icons/io5';
import { MdAccessTime } from 'react-icons/md';
import Image from 'next/image';
import RootLayout from "@/app/layout";
import { Pagination } from "@mui/material";
import Header from "@/components/Header";

interface Job {
    jobPostingID: string;
    companyLogo: string;
    companyName: string;
    title: string;
    position: string;
    location: string;
    timeRemaining: string;
    jobIndustry: string;
  }

// JobCard Component
const JobCard = ({ job, onApply }: { job: Job; onApply: () => void }) => {
    return (
      <div className="flex items-center bg-white p-6 rounded-lg shadow-md transform transition-transform hover:scale-103 hover:shadow-lg">
        <div className="w-16 h-16 flex-shrink-0">
          {job.companyLogo ? (
            <Image
              src={job.companyLogo}
              alt={job.title}
              width={64}
              height={64}
              className="object-contain  rounded-full"
            />
          ) : (
            <div className="bg-gray-200 w-full h-full rounded-lg" />
          )}
        </div>
        <div className="flex flex-col ml-4 flex-grow">
          <h2 className="text-xl font-bold text-black-color">{job.title}</h2>
          <p className="text-gray-600">{job.companyName}</p>
          <div className="flex items-center space-x-2 text-sm">
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
        <div className="flex flex-col items-end justify-center">
          <button
            onClick={onApply}
            className="bg-brighter-color text-white px-4 py-2 rounded-md mt-2 hover:bg-primary-color"
          >
            View details
          </button>
        </div>
      </div>
    );
  };
  
const SearchPage = () => {
  const router = useRouter();
  const { jobTitle, location } = router.query; // Get parameters from query
  const [jobs, setJobs] = useState<any[]>([]); // State to store job postings
  const [totalCount, setTotalCount] = useState(0); // Total job count
  const [pageNumber, setPageNumber] = useState(1); // Current page number
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(null); // Error state
  const pageSize = 8; // Number of jobs per page

  // Fetch jobs from API
  const fetchJob = async () => {
    if (jobTitle || location) {
      setLoading(true); // Start loading
      try {
        const response: any = await SearchJob(jobTitle as string, location as string, pageNumber, pageSize);
        setJobs(response.jobPostings); // Assuming response contains JobPostings
        setTotalCount(response.totalCount); // Assuming response contains TotalCount
      } catch (err) { 
        console.error("Error fetching jobs:", err); // Log the error
      } finally {
        setLoading(false); // Stop loading
      }
    }
  };

  // Re-fetch data when pageNumber, jobTitle, or location changes
  useEffect(() => {
    fetchJob();
  }, [jobTitle, location, pageNumber]);

  const totalPages = Math.ceil(totalCount / pageSize); // Calculate total pages

  
  const handleApply = (jobPostingID: string) => {
    router.push(`/jobs/${jobPostingID}`);
  };
  
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPageNumber(value);
  };

  return (
    <RootLayout>
      <Header />
      <div className="container mx-auto min-h-[800px] py-8 bg-white">

      {loading && (
        <div className="text-center text-gray-500">
          <p>Loading...</p>
        </div>
      )}

      {error && (
        <div className="text-center text-red-500">
          <p>{error}</p>
        </div>
      )}


     
        {jobs.length > 0 ? (
             <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {jobs.map((job) => <JobCard key={job.jobPostingID} job={job} onApply={() => handleApply(job.jobPostingID)}/>)}
          <div className="flex justify-center mt-10 mb-5 col-span-full">
          <Pagination
            count={totalPages}
            page={pageNumber}
            onChange={handlePageChange}
            variant="outlined"
            shape="rounded"
          />
        </div>
              </div>
             </>
        ) : (
            <div className="flex items-center justify-center min-h-[800px] text-gray-500">
            <div className="text-center">
              <h2 className="text-lg font-semibold">No jobs found</h2>
              <p>Try adjusting your search to find more opportunities.</p>
               </div>
            
          </div>
        )} 
       
     
        
      </div>
    </RootLayout>
  );
};

export default SearchPage;
