import { useEffect, useState } from 'react';
import AdminLayout from '../../../../app/adminLayout';
import { useRouter } from 'next/router';
import { DeleteAPolicy, GetAllPolicy, UpdatePolicy } from '@/api/policyService';
import { Table, TableHead, TableBody, TableRow, TableCell, TableContainer, Paper, Pagination, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button } from '@mui/material';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Policy {
    policyID: string;
    title: string;
    description: string;
    createdOn: string;
}

const AllPolicyPage = () => {
    const [policy, setPolicy] = useState<Policy[]>([]);
    const [pageNumber, setPageNumber] = useState(1); // State for current page
    const [pageSize] = useState(4); // Number of policies per page
    const [totalPages, setTotalPages] = useState(0); // Total number of pages
    const [userToken, setUserToken] = useState<string | null>(null);

    const [open, setOpen] = useState(false); // Modal visibility
    const [currentPolicy, setCurrentPolicy] = useState<Policy | null>(null); // Policy currently being edited
    const [updatedTitle, setUpdatedTitle] = useState(""); // Title to update
    const [updatedDescription, setUpdatedDescription] = useState(""); // Description to update

    useEffect(() => {
        const token = localStorage.getItem('userToken');
        if (token) {
            setUserToken(token);
        }
    }, []);

    const fetchPolicy = async () => {
        try {
            const response: any = await GetAllPolicy(pageNumber, pageSize);
            setPolicy(response.policies);
            setTotalPages(Math.ceil(response.totalCount / pageSize));
        } catch (error) {
            console.error('Error fetching policies:', error);
        }
    };

    useEffect(() => {
        fetchPolicy();
    }, [pageNumber, pageSize]);

    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setPageNumber(value);
    };

    const handleDelete = async (policyID: string) => {
        try {
            if (!userToken) {
                console.error('User token not available.');
                return;
            }
            const response: any = await DeleteAPolicy(policyID, userToken);
            toast.success('Policy deleted successfully.');
            fetchPolicy();
        } catch (error) {
            console.error('Error deleting Policy:', error);
            toast.error('Failed to delete the Policy. Please try again.');
        }
    };

    const handleEdit = (policyItem: Policy) => {
        setCurrentPolicy(policyItem);
        setUpdatedTitle(policyItem.title);
        setUpdatedDescription(policyItem.description);
        setOpen(true); // Open the modal
    };

    const handleUpdate = async () => {
        if (!currentPolicy) return;

        try {
            if (!userToken) {
                console.error('User token not available.');
                return;
            }

            const updatedPolicy = {
                title: updatedTitle,
                description: updatedDescription
            };

            // Send update request
            await UpdatePolicy(currentPolicy.policyID, updatedPolicy, userToken);
            toast.success('Policy updated successfully.');
            fetchPolicy();
            setOpen(false); // Close modal
        } catch (error) {
            console.error('Error updating Policy:', error);
            toast.error('Failed to update the Policy. Please try again.');
        }
    };

    return (
        <AdminLayout>
            <h1 className="text-3xl font-semibold mb-6 text-black-color">Policy Management</h1>

            <TableContainer component={Paper} className="overflow-x-auto bg-white shadow-lg rounded-lg">
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold', textAlign: 'center', width: '5%' }}>No.</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', textAlign: 'left', width: '20%' }}>Title</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', textAlign: 'left', width: '20%' }}>Create/Update On</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'left', width: '35%' }}>Description</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', textAlign: 'center', width: '20%' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {policy && policy.length > 0 ? (
                            policy.map((policyItem, index) => (
                                <TableRow key={policyItem.policyID} className="hover:bg-gray-50">
                                    <TableCell align="center">
                                        {(pageNumber - 1) * pageSize + index + 1}
                                    </TableCell>
                                    <TableCell align="left" className="font-medium text-gray-800">
                                        {policyItem.title}
                                    </TableCell>
                                    <TableCell align="left" className="font-medium text-gray-800">
                                        {new Date(policyItem.createdOn).toLocaleString('en-CA', {
                                            year: 'numeric',
                                            month: '2-digit',
                                            day: '2-digit',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            second: '2-digit',
                                            hour12: false
                                        }).replace(',', '')}
                                    </TableCell>
                                    <TableCell align="left" className="text-gray-600 max-w-[200px]">
                                        {policyItem.description}
                                    </TableCell>
                                    <TableCell align="center">
                                        <button
                                            onClick={() => handleEdit(policyItem)}
                                            className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(policyItem.policyID)}
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
                                    No policies available.
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

            {/* Modal for Updating Policy */}
            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Update Policy</DialogTitle>
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
                        rows={9}  // Set the number of visible rows
                        sx={{ minHeight: '200px' }}  // Apply min height here
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
        </AdminLayout>
    );
};

export default AllPolicyPage;
