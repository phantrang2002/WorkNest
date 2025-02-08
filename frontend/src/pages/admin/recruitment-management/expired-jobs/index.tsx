import { useEffect, useState } from 'react';
import AdminLayout from '../../../../app/adminLayout';
import { useRouter } from 'next/router';
import { GetExpiredJobs } from '@/api/jobService';
import { Table, TableHead, TableBody, TableRow, TableCell, TableContainer, Paper, Pagination } from '@mui/material';

interface Job {
  jobPostingID: string;
  companyLogo: string;
  companyName: string;
  title: string;
  position: string;
  location: string;
  timeRemaining: string;
  createdOn: string;
}

const ExpiredJobPage = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [pageNumber, setPageNumber] = useState(1); // State for current page
  const [pageSize] = useState(7); // Number of jobs per page
  const [totalPages, setTotalPages] = useState(0); // Total number of pages
  const router = useRouter();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response: any = await GetExpiredJobs(pageNumber, pageSize);
        console.log(response);
        setJobs(response.jobPostings);
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

  const handleViewDetail = (jobPostingID: string) => {
    router.push(`/jobs/${jobPostingID}`);
  };

  return (
    <AdminLayout>
      <h1 className="text-3xl font-semibold mb-6 text-black-color">Recruitment Management</h1>


      {/* Job Title Input and Buttons */}
      <div className="mb-6 flex items-center gap-4">
        <input
          type="text"
          placeholder="Enter job title"
          className="p-2 border border-gray-300 rounded-md w-64"
        />
        <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition">Search</button>
        <button className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition">Export Report</button>
      </div>

      {/* Filter & Sorting Options */}
      <div className="mb-4 flex items-center gap-6 text-gray-700">
        <div className="flex items-center">
          <label htmlFor="sortCriteria" className="font-medium mr-2">Sort by:</label>
          <select
            id="sortCriteria"
            className="border rounded px-2 py-1"
          >
            <option value="name">Name</option>
            <option value="oldApplyDate">Oldest Created date</option>
            <option value="newApplyDate">Newest Created Date</option>
          </select>
        </div>
      </div>

      {/* Table for Job Listings */}
      <TableContainer component={Paper} className="overflow-x-auto bg-white shadow-lg rounded-lg">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>No.</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Level</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Company</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Company Avatar</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Time Remaining</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Created On</TableCell>

              <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {jobs.map((job, index) => (
              <TableRow key={job.jobPostingID} className="hover:bg-gray-50">
                <TableCell>{(pageNumber - 1) * pageSize + index + 1}</TableCell>
                <TableCell>{job.title}</TableCell>
                <TableCell>{job.position}</TableCell>
                <TableCell>{job.companyName}</TableCell>
                <TableCell>
                  <img
                    src={job.companyLogo || 'https://via.placeholder.com/50'}
                    alt={`${job.companyName} logo`}
                    className="w-12 h-12 rounded-full"
                  />
                </TableCell>
                <TableCell>{job.timeRemaining}</TableCell> {/* Display Time Remaining */}
                <TableCell>
                  {new Date(job.createdOn).toLocaleString('en-CA', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false
                  }).replace(',', '')}
                </TableCell>
                <TableCell>
                  <button className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 ml-2 transition"
                    onClick={() => handleViewDetail(job.jobPostingID)}>View Details</button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <div className="flex justify-center mt-10 mb-5">
        <Pagination
          count={totalPages}
          page={pageNumber}
          onChange={handlePageChange}
          variant="outlined"
          shape="rounded"
        />
      </div>

    </AdminLayout>
  );
};

export default ExpiredJobPage;
