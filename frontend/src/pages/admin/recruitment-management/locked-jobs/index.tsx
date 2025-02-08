import { useEffect, useState } from 'react';
import AdminLayout from '../../../../app/adminLayout';
import { useRouter } from 'next/router';
import { GetAdminLockedJobs, UnlockAJob } from '@/api/jobService';
import { Table, TableHead, TableBody, TableRow, TableCell, TableContainer, Paper, Pagination, Dialog, DialogActions, DialogContent, Button, DialogTitle } from '@mui/material';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BsInfoSquareFill } from 'react-icons/bs';
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

const LockJobPage = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [pageNumber, setPageNumber] = useState(1); // State for current page
  const [pageSize] = useState(7); // Number of jobs per page
  const [totalPages, setTotalPages] = useState(0); // Total number of pages
  const router = useRouter();
  const [userToken, setUserToken] = useState<string | null>(null);
  // Modal state
  const [openModal, setOpenModal] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (token) {
      setUserToken(token);
    }
  }, []);

  const fetchJobs = async () => {
    try {
      const response: any = await GetAdminLockedJobs(pageNumber, pageSize);
      console.log(response);
      setJobs(response.jobPostings);
      setTotalPages(Math.ceil(response.totalCount / pageSize));
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [pageNumber, pageSize]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPageNumber(value);
  };

  const handleUnlock = async (jobPostingID: string) => {
    try {
      if (!userToken) {
        console.error('User token not available.');
        return;
      }

      const response: any = await UnlockAJob(jobPostingID, userToken);
      console.log(response);
      toast.success('Job Unlock successfully.');

      fetchJobs();
    } catch (error) {
      console.error('Error Unlock job:', error);
      toast.error('Failed to Unlock the job. Please try again.');
    }
  };


  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleViewDetail = (jobPostingID: string) => {
    router.push(`/jobs/${jobPostingID}`);
  };

  return (
    <AdminLayout>
      <div className='flex  gap-2'>
        <h1 className="text-3xl font-semibold mb-6 text-black-color">Recruitment Management</h1>
        <BsInfoSquareFill className='text-gray-500' onClick={handleOpenModal} />

      </div>

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
                  <button className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 ml-2 transition"
                    onClick={() => handleUnlock(job.jobPostingID)}>Unlock</button>
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

      {/* Modal with Instructions */}
      <Dialog open={openModal} onClose={handleCloseModal}>
        <DialogTitle>How to Use</DialogTitle>

        <DialogContent>
          <div className=" text-sm text-gray-500 mb-4">
            <p><strong>Note:</strong> This interface is best optimized for desktop viewing.</p>
          </div>
          <div className="flex justify-center space-x-8 mt-4">
            <div className="text-center">
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                disabled
              >
                Unlock
              </button>
              <p className="mt-2 text-sm text-gray-600">When you click "Unlock", the job will be unlocked and move to "Available Jobs".</p>
            </div>
            <div className="text-center">
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
                disabled
              >
                View Details
              </button>
              <p className="mt-2 text-sm text-gray-600">When you click "View Details", you will be redirected to the job's detail page.</p>
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
};

export default LockJobPage;
