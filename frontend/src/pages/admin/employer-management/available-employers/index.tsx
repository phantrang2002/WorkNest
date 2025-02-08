import { useEffect, useState } from 'react';
import AdminLayout from '../../../../app/adminLayout';
import { useRouter } from 'next/router';
import { DeleteAJob, GetAllJobs } from '@/api/jobService';
import { Table, TableHead, TableBody, TableRow, TableCell, TableContainer, Paper, Pagination } from '@mui/material';
import { DeleteASampleCV, GetAllSampleCV } from '@/api/sampleCVService';
import { GetAvaiEmployer, LockAnEmployer } from '@/api/employerService';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
interface Employer {
    employerID: string;
    employerName: string;
    avatar: string;
    industry: string;
    location: string;
    description: string;
}

const AvaiEmployersPage = () => {
    const [employer, setEmployer] = useState<Employer[]>([]);
    const [pageNumber, setPageNumber] = useState(1); // State for current page
    const [pageSize] = useState(7); // Number of jobs per page
    const [totalPages, setTotalPages] = useState(0); // Total number of pages
    const router = useRouter();
    const [userToken, setUserToken] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('userToken');
        if (token) {
            setUserToken(token);
        }
    }, []);

    const fetchEmployer = async () => {
        try {
            const response: any = await GetAvaiEmployer(pageNumber, pageSize);
            setEmployer(response.employers);
            setTotalPages(Math.ceil(response.totalCount / pageSize));
        } catch (error) {
            console.error('Error fetching available employers:', error);
        }
    };

    useEffect(() => {
        fetchEmployer();
    }, [pageNumber, pageSize]);

    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setPageNumber(value);
    };

    const handleViewDetail = (jobPostingID: string) => { 
        router.push(`/employers/${jobPostingID}`);
      };

    const handleLock= async (employerID: string) => {
        try {
            if (!userToken) {
                console.error('User token not available.');
                return;
            }

            // Call API to delete employer
            const response: any = await LockAnEmployer(employerID, userToken);

            console.log(response);

            // Notify success
            toast.success("Employer unlocked successfully.");  

            // Refresh employer list
            fetchEmployer();
        } catch (error) {
            console.error('Error locking employer:', error);
            toast.error('Failed to lock employer. Please try again.');
        }
    };

    return (
        <AdminLayout>
            <h1 className="text-3xl font-semibold mb-6 text-gray-900">Available Employers Management</h1>

            {/* Search and Export Buttons */}
            <div className="mb-6 flex items-center gap-4">
                <input
                    type="text"
                    placeholder="Search by employer name"
                    className="p-2 border border-gray-300 rounded-md w-64"
                />
                <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition">
                    Search
                </button>
                <button className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition">
                    Export Report
                </button>
            </div>

            {/* Employers Table */}
            <TableContainer component={Paper} className="overflow-x-auto bg-white shadow-lg rounded-lg">
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold', textAlign: 'center', width: '5%' }}>No.</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', textAlign: 'left', width: '15%' }}>Name</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', textAlign: 'left', width: '10%' }}>Avatar</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', textAlign: 'center', width: '20%' }}>Industry</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', textAlign: 'center', width: '20%' }}>Location</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', textAlign: 'center', width: '15%' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {employer && employer.length > 0 ? (
                            employer.map((employerItem, index) => (
                                <TableRow key={employerItem.employerID} className="hover:bg-gray-50">
                                    {/* Serial Number */}
                                    <TableCell align="center">
                                        {(pageNumber - 1) * pageSize + index + 1}
                                    </TableCell>

                                    {/* Employer Name */}
                                    <TableCell align="left" className="font-medium text-gray-800">
                                        {employerItem.employerName}
                                    </TableCell>

                                    {/* Avatar */}
                                    <TableCell>
                                        <img
                                            src={employerItem.avatar || 'https://via.placeholder.com/50'}
                                            alt={`${employerItem.employerName} avatar`}
                                            className="w-12 h-12 rounded-full"
                                        />
                                    </TableCell>

                                    {/* Industry */}
                                    <TableCell align="center" className="text-gray-600">
                                        {employerItem.industry}
                                    </TableCell>

                                    {/* Location */}
                                    <TableCell align="center" className="text-gray-600">
                                        {employerItem.location}
                                    </TableCell>

                                    {/* Actions */}
                                    <TableCell align="center">
                                        {/* Lock Button */}
                                        <button
                                               onClick={() => handleLock(employerItem.employerID)} // assuming handleLock is implemented for locking
                                            className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition mr-2"
                                        >
                                            Lock
                                        </button>

                                        {/* View Details Button */}
                                        <button
                                             onClick={() => handleViewDetail(employerItem.employerID)} // assuming handleViewDetails is implemented for viewing details
                                            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-blue-600 transition"
                                        >
                                            View Details
                                        </button>
                                    </TableCell>

                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} align="center" className="text-gray-500">
                                    No employers available.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Pagination */}
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

export default AvaiEmployersPage;
