import { useEffect, useState } from 'react';
import AdminLayout from '../../../../app/adminLayout';
import { useRouter } from 'next/router';
import { DeleteAJob, GetAvailableJobPostingsForAdmin, GetRecruitmentStatsDownload } from '@/api/jobService';
import { Table, TableHead, TableBody, TableRow, TableCell, TableContainer, Paper, Pagination, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BsInfoSquareFill } from 'react-icons/bs';

interface Job {
  jobPostingID: string;
  companyLogo: string;
  companyName: string;
  title: string;
  timeRemaining: string;
  createdOn: string;
  totalApplications: string;
  notReviewedCount: string;
  notSuitableCount: string;
  suitableCount: string;
}

const RecruitmentStatsPage = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [pageNumber, setPageNumber] = useState(1); // State for current page
  const [pageSize] = useState(7); // Number of jobs per page
  const [totalPages, setTotalPages] = useState(0); // Total number of pages
  const [userToken, setUserToken] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState(''); // State for search keyword
  const [sortCriteria, setSortCriteria] = useState('name'); // State for sorting criteria
  const [openModal, setOpenModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (token) {
      setUserToken(token);
    }
  }, []);

  const fetchJobs = async () => {
    try {
      const response: any = await GetAvailableJobPostingsForAdmin(pageNumber, pageSize, userToken);
      setJobs(response.jobPostings);
      setTotalPages(Math.ceil(response.totalCount / pageSize));
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(event.target.value);
  };

  const handleSortChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSortCriteria(event.target.value as string);
  };
 
  const filterJobs = (jobs: Job[], searchKeyword: string) => {
    if (!searchKeyword) return jobs;  
    return jobs.filter(job =>
      job.title.toLowerCase().includes(searchKeyword.toLowerCase())
    );
  };

  // Function to sort jobs based on selected criteria
  const sortJobs = (jobs: Job[], sortCriteria: string) => {
    const sortedJobs = [...jobs];
    if (sortCriteria === 'name') {
      sortedJobs.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortCriteria === 'oldApplyDate') {
      sortedJobs.sort((a, b) => new Date(a.createdOn).getTime() - new Date(b.createdOn).getTime());
    } else if (sortCriteria === 'newApplyDate') {
      sortedJobs.sort((a, b) => new Date(b.createdOn).getTime() - new Date(a.createdOn).getTime());
    }
    return sortedJobs;
  };

  // Combined filter and sort logic
  const getFilteredAndSortedJobs = () => {
    let filteredJobs = filterJobs(jobs, searchKeyword);
    return sortJobs(filteredJobs, sortCriteria);
  };

  const handleDownload = async () => {
    try {
      const fileBlob = await GetRecruitmentStatsDownload();
      if (!(fileBlob instanceof Blob)) {
        throw new Error('The downloaded file is not a valid Blob');
      }

      const downloadLink = document.createElement('a');
      const fileURL = URL.createObjectURL(fileBlob);

      downloadLink.href = fileURL;
      downloadLink.download = `Recruitment_Stats_Report_${new Date().toISOString().split('T')[0]}.xlsx`;

      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      URL.revokeObjectURL(fileURL);
    } catch (error) {
      console.error('Error downloading report:', error);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [pageNumber, pageSize]); 

  const handleViewDetail = (jobPostingID: string) => {
    router.push(`/jobs/${jobPostingID}`);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPageNumber(value);
  };

  // Open Modal
  const handleOpenModal = () => {
    setOpenModal(true);
  };

  // Close Modal
  const handleCloseModal = () => {
    setOpenModal(false);
  };

  return (
    <AdminLayout>
      <div className='flex gap-2'>
        <h1 className="text-3xl font-semibold mb-6 text-black-color">Recruitment Report</h1>
        <BsInfoSquareFill className='text-gray-500' onClick={handleOpenModal} />
      </div>

      {/* Job Title Input and Buttons */}
      <div className="mb-6 flex items-center gap-4">
        <input
          type="text"
          placeholder="Enter job title"
          className="p-2 border border-gray-300 rounded-md w-64 focus:outline-none text-black-color"
          value={searchKeyword}
          onChange={handleSearchChange}
        />
        <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition">Search</button>
        <button className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition" onClick={handleDownload}>Export Report</button>
      </div>

      {/* Filter & Sorting Options */}
      <div className="mb-4 flex items-center gap-6 text-gray-700">
        <div className="flex items-center">
          <label htmlFor="sortCriteria" className="font-medium mr-2">Sort by:</label>
          <select
            id="sortCriteria"
            className="border rounded px-2 py-1"
            value={sortCriteria}
            onChange={handleSortChange}
          >
            <option value="name">Name</option>
            <option value="oldApplyDate">Oldest Created Date</option>
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
              <TableCell sx={{ fontWeight: 600 }}>Company</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Company Avatar</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Time Remaining</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Created On</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Total</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Not Reviewed</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Not Suitable</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Suitable</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {getFilteredAndSortedJobs().map((job, index) => (
              <TableRow key={job.jobPostingID} className="hover:bg-gray-50">
                <TableCell>{(pageNumber - 1) * pageSize + index + 1}</TableCell>
                <TableCell>{job.title}</TableCell>
                <TableCell>{job.companyName}</TableCell>
                <TableCell>
                  <img
                    src={job.companyLogo || 'https://via.placeholder.com/50'}
                    alt={`${job.companyName} logo`}
                    className="w-12 h-12 rounded-full"
                  />
                </TableCell>
                <TableCell>{job.timeRemaining}</TableCell>
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
                <TableCell className='text-center'>{job.totalApplications}</TableCell>
                <TableCell className='text-center'>{job.notReviewedCount}</TableCell>
                <TableCell className='text-center'>{job.notSuitableCount}</TableCell>
                <TableCell className='text-center'>{job.suitableCount}</TableCell>

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

      {/* Modal with Instructions */}
      <Dialog open={openModal} onClose={handleCloseModal}>
        <DialogTitle>How to Use</DialogTitle>
        <DialogContent>
          <div className="text-sm text-gray-500 mb-4">
            <p><strong>Note:</strong><br />- This interface is best optimized for desktop viewing.</p>
            <p>- These jobs are approved jobs, which do not include jobs locked by admin.</p>
          </div>
          <div className="flex justify-center space-x-8 mt-4">
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

export default RecruitmentStatsPage;
