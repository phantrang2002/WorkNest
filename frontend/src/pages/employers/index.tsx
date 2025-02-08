import { useEffect, useState } from 'react';
import Header from '../../components/Header';
import RootLayout from '../../app/layout';
import { GetAvaiEmployer } from '@/api/employerService';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { Pagination, TextField, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import { IoLocationOutline } from 'react-icons/io5';

const industries = [
  { id: 1, name: 'Advertising and marketing' },
  { id: 2, name: 'Aerospace' },
  { id: 3, name: 'Agriculture' },
  { id: 4, name: 'Computer and technology' },
  { id: 5, name: 'Construction' },
  { id: 6, name: 'Education' },
  { id: 7, name: 'Energy' },
  { id: 8, name: 'Entertainment' },
  { id: 9, name: 'Fashion' },
  { id: 10, name: 'Finance and economic' },
  { id: 11, name: 'Food and beverage' },
  { id: 12, name: 'Healthcare' },
  { id: 13, name: 'Hospitality' },
  { id: 14, name: 'Manufacturing' },
  { id: 15, name: 'Media and news' },
  { id: 16, name: 'Mining' },
  { id: 17, name: 'Pharmaceutical' },
  { id: 18, name: 'Telecommunication' },
  { id: 19, name: 'Transportation' },
];



interface Employer {
  employerID: string;
  employerName: string;
  avatar: string;
  industry: string;
  location: string;
  size: string;
}

const EmployersPage = () => {
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [filteredEmployers, setFilteredEmployers] = useState<Employer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(8);
  const [totalPages, setTotalPages] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const fetchEmployers = async () => {
      try {
        const response: any = await GetAvaiEmployer(pageNumber, pageSize);
        setEmployers(response.employers);
        setFilteredEmployers(response.employers);
        setTotalPages(Math.ceil(response.totalCount / pageSize));
      } catch (error) {
        console.error('Error fetching employers:', error);
      }
    };

    fetchEmployers();
  }, [pageNumber, pageSize]);

  useEffect(() => {
    let filtered = employers;

    if (searchTerm) {
      filtered = filtered.filter((employer) =>
        employer.employerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedIndustry) {
      filtered = filtered.filter((employer) => employer.industry === selectedIndustry);
    }


    setFilteredEmployers(filtered);
  }, [searchTerm, selectedIndustry, employers]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPageNumber(value);
  };


  const handleViewEmployer = (employerId: string) => {
    const userId = localStorage.getItem('userId');
    console.log(employerId, userId);
    if (userId == employerId) {
      router.push('/my-company-profile');
    } else {
      router.push(`/employers/${employerId}`);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedIndustry('');
  };

  return (
    <RootLayout>
      <Header />
      <div className="container mx-auto py-8 bg-white">
        {/* Search and Filter Section */}
        <div className="mb-6 flex flex-col sm:flex-row items-center sm:justify-between gap-4 mx-5 sm:mx-0">
          {/* Search Bar */}
          <TextField
            label="Search for employers"
            variant="outlined"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-50 rounded-md sm:w-2/3 md:w-3/5 lg:w-1/2"
          />

          {/* Industry Filter */}
          <FormControl fullWidth variant="outlined" className="w-full sm:w-1/2 bg-gray-50">
            <InputLabel id="industry-label">Select Industry</InputLabel>
            <Select
              labelId="industry-label"
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              label="Select Industry"
              className="rounded-md"
            >
              <MenuItem value="">All Industries</MenuItem>
              {industries.map((industry) => (
                <MenuItem key={industry.id} value={industry.name}>
                  {industry.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Clear Filters Button */}
          <button
            onClick={clearFilters}
            className="bg-primary-color text-white py-2 px-4 rounded-md hover:bg-yellow-color transition-all mt-2 sm:mt-0 sm:w-fit w-full"
          >
            Clear Filters
          </button>
        </div>

        {/* Employer List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {filteredEmployers.length > 0 ? (
            filteredEmployers.map((employer) => (
              <EmployerCard key={employer.employerID} employer={employer} onView={() => handleViewEmployer(employer.employerID)} />
            ))
          ) : (
            <div className="col-span-full text-center py-10 text-gray-500">
              <h2 className="text-lg font-semibold">No employers found</h2>
              <p>Try adjusting your search or filters to find more employers.</p>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-center mt-10 mb-5">
          <Pagination
            count={totalPages}
            page={pageNumber}
            onChange={handlePageChange}
            variant="outlined"
            shape="rounded"
          />
        </div>
      </div>
    </RootLayout>
  );
};

// EmployerCard Component
const EmployerCard = ({ employer, onView }: { employer: Employer; onView: () => void }) => {
  return (
    <div className="flex sm:flex-row flex-col sm:items-center items-start bg-white p-6 rounded-lg shadow-md transform transition-transform hover:scale-103 hover:shadow-lg mx-5 sm:mx-0">
      <div className="w-16 h-16 flex-shrink-0 sm:ml-0 ml-6 sm:mb-0 mb-2">
        {employer.avatar ? (
          <Image
            src={employer.avatar}
            alt={employer.employerName}
            width={64}
            height={64}
            className="object-contain rounded-full"
          />
        ) : (
          <div className="bg-gray-200 w-full h-full rounded-full" />
        )}
      </div>
      <div className="flex flex-col ml-4 flex-grow">
        <h2 className="text-xl font-bold text-black-color">{employer.employerName}</h2>
        <p className="text-gray-600">{employer.industry}</p>
        <div className="flex sm:items-center items-start sm:space-x-2 text-sm sm:flex-row flex-col sm:gap-0 gap-2">
          <div className="flex items-center bg-gray-200 px-2 py-1 rounded-md text-gray-700">
            <IoLocationOutline className="text-primary-color mr-1" />
            <span>{employer.location}</span>
          </div>
          <div className="flex items-center bg-gray-200 px-2 py-1 rounded-md text-gray-700">
            <IoLocationOutline className="text-primary-color mr-1" />
            <span>{employer.size ? `${employer.size} employees` : '-'}</span>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end justify-center">
        <button
          onClick={onView}
          className="bg-brighter-color text-white px-4 py-2 rounded-md mt-2 hover:bg-primary-color sm:ml-0 ml-4 sm:w-fit"
        >
          View Employer
        </button>
      </div>
    </div>
  );
};

export default EmployersPage;
