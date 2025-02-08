import { useEffect, useState } from 'react';
import AdminLayout from '../../../../app/adminLayout';
import { useRouter } from 'next/router';
import { Table, TableHead, TableBody, TableRow, TableCell, TableContainer, Paper, Pagination } from '@mui/material';
import { GetLockedCandidate, UnlockACandidate } from '@/api/candidateService';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Candidate {
    candidateID: string;
    name: string;
    avatar: string;
    phoneNumber: string;
    location: string;
    experience: number;
    industry: string;
}

const LockedCandidatesPage = () => {
    const [candidate, setCandidate] = useState<Candidate[]>([]);
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

    const fetchCandidate = async () => {
        try {
            const response: any = await GetLockedCandidate(pageNumber, pageSize);
            setCandidate(response.candidates);
            setTotalPages(Math.ceil(response.totalCount / pageSize));
        } catch (error) {
            console.error('Error fetching available candidate:', error);
        }
    };

    useEffect(() => {
        fetchCandidate();
    }, [pageNumber, pageSize]);

    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setPageNumber(value);
    };

    const handleViewDetail = (candidateID: string) => {
        router.push(`/candidates/${candidateID}`);
    };

    const handleUnlock = async (candidateID: string) => {
        try {
            if (!userToken) {
                console.error('User token not available.');
                return;
            }

            const response: any = await UnlockACandidate(candidateID, userToken);

            console.log(response);
            toast.success("Candidate unlocked successfully.");

            fetchCandidate();
        } catch (error) {
            console.error('Error unlocking candidate:', error);
            toast.error("Failed to unlock candidate. Please try again.");
        }
    };

    return (
        <AdminLayout>
            <h1 className="text-3xl font-semibold mb-6 text-gray-900">Locked Candidates Management</h1>

            {/* Search and Export Buttons */}
            <div className="mb-6 flex items-center gap-4">
                <input
                    type="text"
                    placeholder="Search by candidate name"
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
                            <TableCell sx={{ fontWeight: 'bold', textAlign: 'center', width: '10%' }}>Phone Number</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', textAlign: 'center', width: '10%' }}>Years of Experiences</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', textAlign: 'center', width: '20%' }}>Industry</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', textAlign: 'center', width: '15%' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {candidate && candidate.length > 0 ? (
                            candidate.map((candidateItem, index) => (
                                <TableRow key={candidateItem.candidateID} className="hover:bg-gray-50">
                                    {/* Serial Number */}
                                    <TableCell align="center">
                                        {(pageNumber - 1) * pageSize + index + 1}
                                    </TableCell>

                                    {/* Employer Name */}
                                    <TableCell align="left" className="font-medium text-gray-800">
                                        {candidateItem.name}
                                    </TableCell>

                                    {/* Avatar */}
                                    <TableCell>
                                        <img
                                            src={candidateItem.avatar || 'https://via.placeholder.com/50'}
                                            alt={`${candidateItem.name} avatar`}
                                            className="w-12 h-12 rounded-full"
                                        />
                                    </TableCell>

                                    {/* Industry */}
                                    <TableCell align="center" className="text-gray-600">
                                        {candidateItem.phoneNumber}
                                    </TableCell>

                                    {/* Location */}
                                    <TableCell align="center" className="text-gray-600">
                                        {candidateItem.experience}
                                    </TableCell>

                                    {/* Location */}
                                    <TableCell align="center" className="text-gray-600">
                                        {candidateItem.industry}
                                    </TableCell>

                                    {/* Actions */}
                                    <TableCell align="center">
                                        {/* Lock Button */}
                                        <button
                                            onClick={() => handleUnlock(candidateItem.candidateID)}
                                            className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition mr-2"
                                        >
                                            Unlock
                                        </button>

                                        {/* View Details Button */}
                                        <button
                                            onClick={() => handleViewDetail(candidateItem.candidateID)}
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
                                    No candidate available.
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

export default LockedCandidatesPage;
