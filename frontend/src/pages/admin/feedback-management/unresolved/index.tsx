import { useEffect, useState } from 'react';
import AdminLayout from '../../../../app/adminLayout';
import { useRouter } from 'next/router';
import { Table, TableHead, TableBody, TableRow, TableCell, TableContainer, Paper, Pagination, Modal, Box, TextField, Button } from '@mui/material';
import { GetUnResolvedContact } from '@/api/contactService';
import { resolveContact } from '@/api/contactService';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
interface Contact {
    contactID: string;
    name: string;
    email: string;
    problemTitle: string;
    description: string;
}

const UnResolvedContactPage = () => {
    const [contact, setContact] = useState<Contact[]>([]);
    const [pageNumber, setPageNumber] = useState(1); // State for current page
    const [pageSize] = useState(7); // Number of jobs per page
    const [totalPages, setTotalPages] = useState(0); // Total number of pages
    const router = useRouter();
    const [userToken, setUserToken] = useState<string | null>(null);

    // Modal state
    const [openModal, setOpenModal] = useState(false);
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('userToken');
        if (token) {
            setUserToken(token);
        }
    }, []);

    const fetchPolicy = async () => {
        try {
            const response: any = await GetUnResolvedContact(pageNumber, pageSize);
            setContact(response.contacts);
            setTotalPages(Math.ceil(response.totalCount / pageSize));
        } catch (error) {
            console.error('Error fetching unresolved contacts:', error);
        }
    };

    useEffect(() => {
        fetchPolicy();
    }, [pageNumber, pageSize]);

    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setPageNumber(value);
    };

    const handleResolve = (contactID: string) => {
        const contactToResolve = contact.find(c => c.contactID === contactID);
        if (contactToResolve) {
            setSelectedContact(contactToResolve);
            setOpenModal(true);
        }
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setTitle('');
        setDescription('');
    };

    const handleSubmitResolve = async () => {
        if (!selectedContact || !title || !description) return;

        try {
            const response = await resolveContact(selectedContact.contactID, title, description, userToken);
            if (response.status === 200) {
                toast.success('Contact resolved successfully');
                fetchPolicy();
                handleCloseModal();
            }
        } catch (error) {
            console.error('Error resolving contact:', error);
            toast.error('Contact resolved failed');
        }
    };

    return (
        <AdminLayout>
            <h1 className="text-3xl font-semibold mb-6 text-black-color">Feedback Management</h1>

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
                            <TableCell sx={{ fontWeight: 'bold', textAlign: 'left', width: '20%' }}>Action</TableCell>
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

                                    {/* Actions */}
                                    <TableCell align="left">
                                        <button
                                            onClick={() => handleResolve(contactItem.contactID)}
                                            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-700 transition"
                                        >
                                            Resolve
                                        </button>
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

            {/* Modal for resolving contact */}
            <Modal open={openModal} onClose={handleCloseModal}>
                <Box className="w-96 p-6 bg-white shadow-lg rounded-lg mx-auto mt-20">
                    <h2 className="text-xl font-semibold mb-4 text-black-color">Resolve Feedback</h2>
                    <TextField
                        fullWidth
                        label="Title"
                        variant="outlined"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="mb-4"
                    />

                    <TextField
                        fullWidth
                        label="Description"
                        variant="outlined"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="mb-4"
                        multiline
                        minRows={5}
                        maxRows={10}
                    />
                    <div className="flex justify-end gap-4">
                        <Button onClick={handleCloseModal} variant="outlined">Cancel</Button>
                        <Button onClick={handleSubmitResolve} variant="contained" color="primary">Resolve</Button>
                    </div>
                </Box>
            </Modal>

        </AdminLayout>
    );
};

export default UnResolvedContactPage;
