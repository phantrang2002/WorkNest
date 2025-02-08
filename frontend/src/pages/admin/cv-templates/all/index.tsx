import { useEffect, useState } from 'react';
import AdminLayout from '../../../../app/adminLayout';
import { useRouter } from 'next/router';
import { DeleteASampleCV, GetAllSampleCV, UpdateSampleCV } from '@/api/sampleCVService';
import { Table, TableHead, TableBody, TableRow, TableCell, TableContainer, Paper, Pagination, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface CV {
    sampleID: string;
    title: string;
    description: string;
    fileCV: string;
}

const AllCVPage = () => {
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize] = useState(3);
    const [totalPages, setTotalPages] = useState(0);
    const router = useRouter();
    const [userToken, setUserToken] = useState<string | null>(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [currentCV, setCurrentCV] = useState<CV | null>(null);
    const [updatedTitle, setUpdatedTitle] = useState("");
    const [updatedDescription, setUpdatedDescription] = useState("");

    const [cv, setCV] = useState<CV[]>([]);
    const [open, setOpen] = useState(false);


    useEffect(() => {
        const token = localStorage.getItem('userToken');
        if (token) {
            setUserToken(token);
        }
    }, []);

    const fetchCV = async () => {
        try {
            const response: any = await GetAllSampleCV(pageNumber, pageSize);
            setCV(response.cvTemplates);
            setTotalPages(Math.ceil(response.totalCount / pageSize));
        } catch (error) {
            console.error('Error fetching cv:', error);
        }
    };

    useEffect(() => {
        fetchCV();
    }, [pageNumber, pageSize]);

    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setPageNumber(value);
    };

    const handleDelete = async (sampleID: string) => {
        try {
            if (!userToken) {
                console.error('User token not available.');
                return;
            }

            const response: any = await DeleteASampleCV(sampleID, userToken);
            toast.success("CV deleted successfully.");
            fetchCV();
        } catch (error) {
            console.error('Error deleting cv:', error);
            toast.error("Failed to delete the CV. Please try again.");
        }
    };

    const handleEdit = (cvItem: CV) => {
        setCurrentCV(cvItem);
        setUpdatedTitle(cvItem.title);
        setUpdatedDescription(cvItem.description);
        setOpen(true);
    };


    const handleUpdate = async () => {
        if (currentCV) {
            try {
                const data = { title: updatedTitle, description: updatedDescription };
                await UpdateSampleCV(currentCV.sampleID, data, userToken);
                toast.success('CV updated successfully!');
                fetchCV();
                setOpen(false);
            } catch (error) {
                console.error('Error updating CV:', error);
                toast.error('Failed to update CV.');
            }
        }
    };



    return (
        <AdminLayout>
            <h1 className="text-3xl font-semibold mb-6 text-black-color">CV Templates Management</h1>

            {/* CV Table */}
            <TableContainer component={Paper} className="overflow-x-auto bg-white shadow-lg rounded-lg">
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold', textAlign: 'center', width: '5%' }}>No.</TableCell>
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
                            <TableCell sx={{ fontWeight: 'bold', textAlign: 'center', width: '20%' }}>File</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', textAlign: 'center', width: '20%' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {cv && cv.length > 0 ? (
                            cv.map((cvItem, index) => (
                                <TableRow key={cvItem.sampleID} className="hover:bg-gray-50">
                                    {/* Serial Number */}
                                    <TableCell align="center">
                                        {(pageNumber - 1) * pageSize + index + 1}
                                    </TableCell>

                                    {/* CV Title */}
                                    <TableCell align="left" className="font-medium text-gray-800">
                                        {cvItem.title}
                                    </TableCell>

                                    {/* Description */}
                                    <TableCell
                                        align="left"
                                        className="text-gray-600 max-w-[200px]"
                                    >
                                        {cvItem.description}
                                    </TableCell>

                                    {/* File Link */}
                                    <TableCell align="center">
                                        <a
                                            href={`http://localhost:5037/${cvItem.fileCV}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary-color hover:underline"
                                        >
                                            View CV
                                        </a>
                                    </TableCell>

                                    {/* Actions */}
                                    <TableCell align="center">
                                        <button
                                            onClick={() => handleEdit(cvItem)}
                                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700 transition"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(cvItem.sampleID)}
                                            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-700 transition ml-2"
                                        >
                                            Delete
                                        </button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} align="center" className="text-gray-500">
                                    No CVs available.
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

            {/* Modal for updating CV */}
            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Update CV</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Title"
                        fullWidth
                        value={updatedTitle}
                        onChange={(e) => setUpdatedTitle(e.target.value)}
                        margin="normal"
                    />
                    <TextField
                        label="Description"
                        fullWidth
                        value={updatedDescription}
                        onChange={(e) => setUpdatedDescription(e.target.value)}
                        margin="normal"
                        multiline
                        rows={4}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleUpdate} color="primary">
                        Update
                    </Button>
                </DialogActions>
            </Dialog>

            <ToastContainer />
        </AdminLayout>
    );
};

export default AllCVPage;
