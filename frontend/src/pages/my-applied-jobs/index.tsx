import { useEffect, useState } from 'react';
import Header from '../../components/Header';
import RootLayout from '../../app/layout';
import { GetAppliedJob } from '@/api/applyService';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { MdAccessTime } from 'react-icons/md';
import { Pagination } from '@mui/material';
import Link from 'next/link';

interface AppliedJob {
  jobPostingID: string;
  jobTitle: string;
  position: string;
  employerName: string;
  employerAvatar: string;
  applyDate: string;
  cvFile: string;
  minSalary: number;
  maxSalary: number;
  status: number;
  jobStatus: boolean;
  jobLocked: number;
  timeRemaining: string;

}

const AppliedJobsPage = () => {
  const [appliedJobs, setAppliedJobs] = useState<AppliedJob[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<AppliedJob[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(8);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [statusFilter, setStatusFilter] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (token) {
      setUserToken(token);
    }
  }, []);

  useEffect(() => {
    const fetchAppliedJobs = async () => {
      try {
        const response: any = await GetAppliedJob(pageNumber, pageSize, userToken); 
        setAppliedJobs(response.jobPostings); // Assuming the API response structure is similar
        const pages = Math.ceil(response.totalCount / pageSize); 
        setTotalPages(pages > 0 ? pages : 1); // Handle cases with 0 jobs properly
      } catch (error) {
        console.error('Error fetching applied jobs:', error);
      }
    };
    
    fetchAppliedJobs();
  }, [pageNumber, pageSize, userToken]);

  useEffect(() => {
    if (appliedJobs && statusFilter !== null) {
      setFilteredJobs(appliedJobs.filter((job) => job.status === statusFilter));
    } else {
      setFilteredJobs(appliedJobs);
    }
  }, [statusFilter, appliedJobs]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPageNumber(value);
  };

  const handleApply = (jobPostingID: string) => {
    router.push(`/jobs/${jobPostingID}`);
  };

  const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedStatus = event.target.value ? parseInt(event.target.value) : null;
    setStatusFilter(selectedStatus);
  };

  return (
    <RootLayout>
      <Header />
      <div className="container mx-5 sm:mx-auto py-8 bg-white">
        
        {/* Breadcrumb - Home > Job > My Applied Job */}
        <div className="text-md mb-6 text-gray-500">
          <Link className="text-primary-color" href="/">Home</Link> &gt; 
          <Link className="text-primary-color" href="/jobs"> Job</Link> &gt; 
          <span className="text-gray-500"> My Applied Job</span>
        </div>
        
        {/* Bộ lọc trạng thái */}
        <div className="mb-4 text-black-color ">
          <label htmlFor="statusFilter" className="font-medium mr-2">Filter by Status:</label>
          <select
            id="statusFilter"
            value={statusFilter ?? ''}
            onChange={handleStatusChange}
            className="border rounded px-2 py-1"
          >
            <option value="">All</option>
            <option value="0">Applied</option>
            <option value="1">Not Suitable</option>
            <option value="2">Suitable</option>
          </select>
        </div>

        {/* Grid with 2 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {filteredJobs && filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <AppliedJobCard key={job.jobPostingID} job={job} onApply={() => handleApply(job.jobPostingID)} />
            ))
          ) : (
            <p className="text-center text-gray-600 col-span-2">No jobs applied for yet.</p>
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

// AppliedJobCard Component
const AppliedJobCard = ({ job, onApply }: { job: AppliedJob; onApply: () => void }) => {     
  const fileUrl = `http://localhost:5037/${job.cvFile}`;
  const salaryDisplay = job.minSalary === 0 && job.maxSalary === 0
    ? "Negotiable"
    : `$${job.minSalary} - $${job.maxSalary}`;

  const statusText = job.status === 0
    ? "Applied"
    : job.status === 1
    ? "Not Suitable"
    : "Suitable";
  const statusColor = job.status === 1
    ? "bg-red-200 text-red-700"
    : job.status === 2
    ? "bg-green-200 text-green-700"
    : "bg-yellow-200 text-yellow-700";

  return (
    <div className="flex sm:flex-row flex-col items-start sm:items-center bg-white p-6 rounded-lg shadow-md transform transition-transform hover:scale-103 hover:shadow-lg sm:w-full w-[90%]">
      {/* Employer Avatar */}
      <div className="w-16 h-16 flex-shrink-0">
        {job.employerAvatar ? (
          <Image
            src={job.employerAvatar}
            alt={job.employerName}
            width={64}
            height={64}
            className="object-contain rounded-full"
          />
        ) : (
          <div className="bg-gray-200 w-full h-full rounded-full" />
        )}
      </div>

      {/* Job Information */}
      <div className="flex flex-col ml-4 flex-grow">
        <h2 className="text-xl font-bold text-black-color">{job.jobTitle}</h2>
        <p className="text-gray-600">{job.employerName}</p>
        <div className="flex sm:flex-row flex-col items-start sm:gap-0 gap-2 sm:items-center sm:space-x-2 text-sm">
          <div className="flex items-center bg-gray-200 px-2 py-1 rounded-md text-gray-700">
            <span>{job.position}</span>
          </div>

          <div className="flex items-center justify-center bg-gray-200 px-2 py-1 rounded-md text-gray-700">
            <MdAccessTime className="text-primary-color mr-1" />
            <span className="font-semibold mr-1.5">Applied at</span>
            <span>{job.applyDate}</span>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-sm"> 
        {/* Status */}
        <div className={`mt-2 px-2 py-1 rounded-md font-semibold ${statusColor} max-w-[150px] text-center truncate`}>
          <span>{statusText}</span>
        </div>
          {/* Job Posting Locked tag */}
          {job.jobLocked === 1 && (
          <div className="mt-2 px-2 py-1 bg-gray-200 text-gray-700 font-semibold rounded-md max-w-[150px] text-center">
            Job Locked
          </div>          
        )}

        {/* Time remaining Locked tag */}
        {job.timeRemaining === "Expired" && (
          <div className="mt-2 px-2 py-1 bg-red-500 text-white-700 font-semibold rounded-md max-w-[150px] text-center">
            Job Expired
          </div>          
        )}

        </div>
      </div>

      {/* CV File and Apply Button */}
      <div className="flex flex-col items-start sm:items-end justify-center sm:ml-0 m-5">
        <p className="text-gray-600">
          {job.cvFile ? (
            <a href={fileUrl} className="text-primary-color hover:underline">
              View CV
            </a>
          ) : (
            "No CV uploaded"
          )}
        </p>
        <p className="text-gray-600">{salaryDisplay}</p>
        <button onClick={onApply} className="bg-brighter-color text-white px-4 py-2 rounded-md mt-2 hover:bg-primary-color">
          View details
        </button>
      </div>
    </div>
  );
};

export default AppliedJobsPage;
