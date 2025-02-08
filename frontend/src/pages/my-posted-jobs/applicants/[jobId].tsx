import React, { useState, useEffect } from 'react';
import RootLayout from '@/app/layout';
import Header from '@/components/Header';
import { GetApplicantsForJob, UpdateApplicantStatus } from '@/api/applyService';
import {
    Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Pagination, Select, MenuItem, Button, Dialog, DialogActions,
    DialogContent, DialogContentText, DialogTitle,
    TextField
} from '@mui/material';
import { toast } from 'react-toastify';
import router from 'next/router';
const JobApplicants: React.FC = () => {
    const [applicants, setApplicants] = useState<any[]>([]);
    const [filteredApplicants, setFilteredApplicants] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize] = useState(8);
    const [totalPages, setTotalPages] = useState(0);
    const [storedJobId, setStoredJobId] = useState<string | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<number | null>(null);
    const [selectedApplicantId, setSelectedApplicantId] = useState<string | null>(null);
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [filterStatusFilter, setFilterStatusFilter] = useState<number | null>(null);
    const [sortCriteria, setSortCriteria] = useState('oldApplyDate'); 

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const jobId = window.location.pathname.split('/')[3];
            setStoredJobId(jobId);
        }
    }, []);

    useEffect(() => {
        if (storedJobId) {
            const fetchApplicants = async () => {
                try {
                    const token = localStorage.getItem('userToken');
                    if (!token) {
                        setError('User is not logged in');
                        return;
                    }

                    const response: any = await GetApplicantsForJob(pageNumber, pageSize, token, storedJobId);
                    if (!response || !response.applicants) {
                        setError('No applicants found or invalid data');
                        return;
                    }

                    setApplicants(response.applicants);
                    setTotalPages(Math.ceil(response.totalCount / pageSize));
                    filterApplicants(response.applicants, searchTerm, filterStatusFilter, sortCriteria);
                } catch (err) {
                    setError('Failed to load applicants');
                } finally {
                    setLoading(false);
                }
            };

            fetchApplicants();
        }
    }, [storedJobId, pageNumber, pageSize]);

    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setPageNumber(value);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        filterApplicants(applicants, e.target.value, filterStatusFilter, sortCriteria);
    };

    const handleFilterStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedFilterStatus = event.target.value ? parseInt(event.target.value) : null;
        setFilterStatusFilter(selectedFilterStatus);
        filterApplicants(applicants, searchTerm, selectedFilterStatus, sortCriteria);
    };

    const handleSortCriteriaChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedSort = event.target.value;
        setSortCriteria(selectedSort);
        filterApplicants(applicants, searchTerm, filterStatusFilter, selectedSort);
    };

    const filterApplicants = (applicants: any[], searchTerm: string, filterStatusFilter: number | null, sortCriteria: string) => {
        let filtered = applicants.filter(applicant => {
            const name = applicant.applicantName.toLowerCase();
            const email = applicant.applicantEmail.toLowerCase();
            return name.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase());
        });

        if (filterStatusFilter !== null) {
            filtered = filtered.filter(applicant => applicant.status === filterStatusFilter);
        }

        // Sort applicants based on selected criteria
        filtered = filtered.sort((a, b) => {
            if (sortCriteria === 'name') {
                return a.applicantName.localeCompare(b.applicantName);
            } else if (sortCriteria === 'oldApplyDate') {
                return new Date(a.applyDate).getTime() - new Date(b.applyDate).getTime();
            } else if (sortCriteria === 'newApplyDate') {
                return new Date(b.applyDate).getTime() - new Date(a.applyDate).getTime();
            }
            return 0;
        });

        setFilteredApplicants(filtered);
    };

    const confirmStatusChange = async () => {
        if (selectedApplicantId && selectedStatus !== null && storedJobId) {
            try {
                const token = localStorage.getItem('userToken');
                if (!token) return;

                setOpenModal(false);

                await UpdateApplicantStatus(token, storedJobId, selectedApplicantId, selectedStatus);
                 
                setApplicants(prevApplicants =>
                    prevApplicants.map(applicant =>
                        applicant.applicantId === selectedApplicantId ? { ...applicant, status: selectedStatus } : applicant
                    )
                );

                filterApplicants(
                    applicants.map(applicant =>
                        applicant.applicantId === selectedApplicantId ? { ...applicant, status: selectedStatus } : applicant
                    ),
                    searchTerm,
                    filterStatusFilter,
                    sortCriteria
                );
                toast.success('Application status updated successfully!');
            } catch (err) {
                setError('Failed to update status');
            }
        }
    };

    const handleStatusChange = (applicantId: string, newStatus: number) => {
        setSelectedStatus(newStatus);
        setSelectedApplicantId(applicantId);
    };

    useEffect(() => {
        if (selectedStatus !== null && selectedApplicantId !== null) {
            setOpenModal(true);
        }
    }, [selectedStatus, selectedApplicantId]);

    const closeModal = () => {
        setOpenModal(false);
        setSelectedStatus(null);
        setSelectedApplicantId(null);
    };

    const handleViewDetail = (applicantId: string) => { 
        router.push(`/candidates/${applicantId}`);
      };


      return (
        <RootLayout>
            <Header />
            <div className="container sm:mx-auto py-8">
                {loading && <p>Loading applicants...</p>}
                {error && <Alert severity="error">{error}</Alert>}
    
                {!loading && !error && applicants.length > 0 && (
                    <TableContainer component={Paper} elevation={3} sx={{ padding: 3 }}>
                        <div className="bg-darker-color p-3 rounded-t-lg -mx-6 -mt-6 mb-4">
                            <h2 className="text-lg font-semibold text-white ml-4">Applicants List</h2>
                        </div>
    
                        {/* Search bar */}
                        <TextField
                            label="Search by Name or Email"
                            variant="outlined"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            fullWidth
                            className="mb-4"
                        />
    
                        {/* Filter and Sort options */}
                        <div className="mb-4 text-black-color flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                            <div className="flex items-center">
                                <label htmlFor="statusFilter" className="font-medium mr-2">Filter by Status:</label>
                                <select
                                    id="statusFilter"
                                    value={filterStatusFilter ?? ''}
                                    onChange={handleFilterStatusChange}
                                    className="border rounded px-2 py-1"
                                >
                                    <option value="">All</option>
                                    <option value="0">Not Reviewed Yet</option>
                                    <option value="1">Not Suitable</option>
                                    <option value="2">Suitable</option>
                                </select>
                            </div>
    
                            <div className="flex items-center">
                                <label htmlFor="sortCriteria" className="font-medium mr-2">Sort by:</label>
                                <select
                                    id="sortCriteria"
                                    value={sortCriteria}
                                    onChange={handleSortCriteriaChange}
                                    className="border rounded px-2 py-1"
                                >
                                    <option value="name">Name</option>
                                    <option value="oldApplyDate">Oldest Application Date</option>
                                    <option value="newApplyDate">Newest Application Date</option>
                                </select>
                            </div>
                        </div>
    
                        <div className="overflow-x-auto">
        <Table className="min-w-full table-fixed">
    <TableHead>
        <TableRow>
            <TableCell sx={{ fontWeight: 600 }} className="sm:table-cell">No.</TableCell>
            <TableCell sx={{ fontWeight: 600 }} className="sm:table-cell">Name</TableCell>
            {/* Các cột không cần thiết sẽ bị ẩn trên màn hình nhỏ */}
            <TableCell sx={{ fontWeight: 600 }} className="hidden sm:table-cell">Email</TableCell>
            <TableCell sx={{ fontWeight: 600 }} className="hidden sm:table-cell">Phone number</TableCell>
            <TableCell sx={{ fontWeight: 600 }} className="sm:table-cell">CV</TableCell>
            <TableCell sx={{ fontWeight: 600 }} className="hidden sm:table-cell">Apply date</TableCell>
            <TableCell sx={{ fontWeight: 600 }} className="hidden sm:table-cell">Profile</TableCell>
            <TableCell sx={{ fontWeight: 600 }} className="sm:table-cell">Status</TableCell>
        </TableRow>
    </TableHead>
    {filteredApplicants.length > 0 && (
        <TableBody>
            {filteredApplicants.map((applicant, index) => {
                const fileUrl = `http://localhost:5037/${applicant.cvFile}`;

                return (
                    <TableRow key={index}>
                        <TableCell className="sm:table-cell">{(pageNumber - 1) * pageSize + index + 1}</TableCell>
                        <TableCell className="sm:table-cell">{applicant.applicantName}</TableCell>
                        {/* Ẩn cột Email và Phone number trên màn hình nhỏ */}
                        <TableCell className="hidden sm:table-cell">{applicant.applicantEmail}</TableCell>
                        <TableCell className="hidden sm:table-cell">{applicant.applicantPhone}</TableCell>
                        <TableCell className="sm:table-cell">
                            <a href={fileUrl} className="text-primary-color hover:underline" target="_blank" rel="noopener noreferrer">
                                View CV
                            </a>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                            {new Date(applicant.applyDate).toLocaleString('en-CA', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                                hour12: false
                            }).replace(',', '')}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                            <button
                                onClick={() => handleViewDetail(applicant.applicantId)}
                                className="px-4 py-2 bg-primary-color text-white rounded-md hover:bg-yellow-color transition"
                            >
                                View Details
                            </button>
                        </TableCell>
                        <TableCell className="sm:w-32 w-10 sm:table-cell">
                            <Select
                                value={applicant.status}
                                onChange={(e) => handleStatusChange(applicant.applicantId, e.target.value as number)}
                                displayEmpty
                                sx={{ minWidth: 80, maxWidth: 200, height: 30 }}
                            >
                                <MenuItem value={0}>Not reviewed yet</MenuItem>
                                <MenuItem value={1}>Not Suitable</MenuItem>
                                <MenuItem value={2}>Suitable</MenuItem>
                            </Select>
                        </TableCell>


                    </TableRow>
                );
            })}
        </TableBody>
    )}
</Table>
</div>

                    </TableContainer>
                )}
                <div className="flex justify-center mt-10 mb-5">
                    <Pagination
                        count={totalPages}
                        page={pageNumber}
                        onChange={handlePageChange}
                        variant="outlined"
                        shape="rounded"
                    />
                </div>
    
                {/* Modal Dialog */}
                <Dialog
                    open={openModal}
                    onClose={closeModal}
                    PaperProps={{
                        sx: { margin: '20px', padding: '0' }
                    }}
                >
                    <DialogTitle>Confirm Status Change</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Are you sure you want to confirm the status as "{selectedStatus === 0 ? 'Not reviewed yet' : selectedStatus === 1 ? 'Not Suitable' : 'Suitable'}"?
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={closeModal} className="bg-white border-2 border-primary-color text-primary-color px-4 py-2 rounded-md mt-2 hover:bg-yellow-color hover:text-white hover:border-yellow-color">
                            No
                        </Button>
                        <Button onClick={confirmStatusChange} className="bg-brighter-color text-white px-4 py-2 rounded-md mt-2 hover:bg-primary-color">
                            Yes
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        </RootLayout>
    );
}    

export default JobApplicants;
