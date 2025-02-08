import { useEffect, useState } from 'react';
import AdminLayout from '../../../../app/adminLayout';
import { useRouter } from 'next/router';
import { DeleteAJob, GetAllJobs } from '@/api/jobService';
import { Table, TableHead, TableBody, TableRow, TableCell, TableContainer, Paper, Pagination } from '@mui/material';
import { DeleteASampleCV, GetAllSampleCV } from '@/api/sampleCVService';
import { DeleteAPolicy, GetAllPolicy } from '@/api/policyService';
import { GetResolvedContact } from '@/api/contactService';
 

interface Contact {
    contactID: string;
    name: string;
    email: string;
    problemTitle: string;
    description: string;
}

const ResolvedContactPage = () => {
    const [contact, setContact] = useState<Contact[]>([]);
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

    const fetchPolicy = async () => {
        try {
            const response: any = await GetResolvedContact(pageNumber, pageSize);
            setContact(response.contacts);
            setTotalPages(Math.ceil(response.totalCount / pageSize));
        } catch (error) {
            console.error('Error fetching resolved contact:', error);
        }
    };

    useEffect(() => {
        fetchPolicy();
    }, [pageNumber, pageSize]);

    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setPageNumber(value);
    }; 

    return (

        <AdminLayout>
            <h1 className="text-3xl font-semibold mb-6 text-black-color">Contact Management</h1>

            {/* Job Title Input and Buttons */}
            <div className="mb-6 flex items-center gap-4">
                <input
                    type="text"
                    placeholder="Enter title"
                    className="p-2 border border-gray-300 rounded-md w-64"
                />
                <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition">Search</button>
                <button className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition">Export Report</button>
            </div>

            {/* Table for Job Listings */}
            <TableContainer component={Paper} className="overflow-x-auto bg-white shadow-lg rounded-lg">
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold', textAlign: 'center', width: '5%' }}>No.</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', textAlign: 'left', width: '20%' }}>Name</TableCell> 
                            <TableCell sx={{ fontWeight: 'bold', textAlign: 'left', width: '20%' }}>Email</TableCell> 
                            <TableCell sx={{ fontWeight: 'bold', textAlign: 'left', width: '20%' }}>Title</TableCell>  

                            <TableCell
                                sx={{
                                    fontWeight: 'bold',
                                    maxWidth: '200px',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    textAlign: 'left',
                                    width: '35%'
                                }}
                            >
                                Description
                            </TableCell> 
                        </TableRow>
                    </TableHead>
 
                    <TableBody>
                        {contact && contact.length > 0 ? (
                            contact.map((contactItem, index) => (
                                <TableRow key={contactItem.contactID} className="hover:bg-gray-50">
                                    {/* Serial Number */}
                                    <TableCell align="center">
                                        {(pageNumber - 1) * pageSize + index + 1}
                                    </TableCell>

                                    {/* CV Title */}
                                    <TableCell align="left" className="font-medium text-gray-800">
                                        {contactItem.name}
                                    </TableCell>

                                    {/* Description */}
                                    <TableCell
                                        align="left"
                                        className="text-gray-600 max-w-[200px]"
                                    >
                                        {contactItem.email}
                                    </TableCell> 

                                    {/* Description */}
                                    <TableCell
                                        align="left"
                                        className="text-gray-600 max-w-[200px]"
                                    >
                                        {contactItem.problemTitle}
                                    </TableCell> 

                                     {/* Description */}
                                     <TableCell
                                        align="left"
                                        className="text-gray-600 max-w-[200px]"
                                    >
                                        {contactItem.description}
                                    </TableCell> 
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} align="center" className="text-gray-500">
                                    No contact available.
                                </TableCell>
                            </TableRow>
                        )}
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

export default ResolvedContactPage;
