import { useEffect, useState } from 'react';
import Header from '../../components/Header';
import RootLayout from '../../app/layout';
import { GetSuitableJobs } from '@/api/jobService';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { Pagination } from '@mui/material';
import { IoLocationOutline } from 'react-icons/io5';
import { MdAccessTime } from 'react-icons/md';

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

const SuitablesJobPage = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(8);
  const [totalPages, setTotalPages] = useState(0);
  const router = useRouter();
  const [userToken, setUserToken] = useState<string | null>(null);


  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (token) {
      setUserToken(token);
    }
  }, []);



  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response: any = await GetSuitableJobs(userToken, pageNumber, pageSize);
        setJobs(response.jobPostings);
        setFilteredJobs(response.jobPostings);
        setTotalPages(Math.ceil(response.totalCount / pageSize));
      } catch (error) {
        console.error('Error fetching jobs:', error);
      }
    };

    fetchJobs();
  }, [pageNumber, pageSize]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPageNumber(value);
  };

  const handleApply = (jobPostingID: string) => {
    router.push(`/jobs/${jobPostingID}`);
  };

  return (
    <RootLayout>
      <Header />
      <div className="container mx-auto py-8 bg-white min-h-[800px]">

        {/* Job List */}
        {filteredJobs.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {filteredJobs.map((job) => (
                <JobCard
                  key={job.jobPostingID}
                  job={job}
                  onApply={() => handleApply(job.jobPostingID)}
                />
              ))}
              {/* Pagination */}
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
              <p>Try adjusting your profile to find more opportunities.</p>
              <button className="mt-4 px-4 py-2 bg-primary-color text-white rounded-md hover:bg-gray-600 ml-2 transition"
                onClick={() => router.push(`/my-profile`)}>Check Your Profile</button>
            </div>

          </div>
        )}




      </div>
    </RootLayout>
  );
};

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

export default SuitablesJobPage;
