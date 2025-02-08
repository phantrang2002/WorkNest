import { useEffect, useState } from 'react';
import Header from '../../components/Header';
import RootLayout from '../../app/layout';
import { GetPostedJob } from '@/api/employerService';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { MdAccessTime } from 'react-icons/md';
import { Pagination, TextField, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import { IoLocationOutline } from 'react-icons/io5';
import Link from 'next/link';

interface PostedJob {
  jobPostingID: string;
  companyLogo: string;
  title: string;
  position: string;
  location: string;
  timeRemaining: string;
  createdOn: string;
  lockFlg: number;
  totalApplications: string;
  notReviewedCount: string;
  notSuitableCount: string;
  suitableCount: string;
  industry: string;
}

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

const locations = [
  { province_id: 1, province_name: 'Thành phố Hà Nội' },
  { province_id: 2, province_name: 'Tỉnh Hà Giang' },
  { province_id: 3, province_name: 'Tỉnh Cao Bằng' },
  { province_id: 4, province_name: 'Tỉnh Bắc Kạn' },
  { province_id: 5, province_name: 'Tỉnh Tuyên Quang' },
  { province_id: 6, province_name: 'Tỉnh Lào Cai' },
  { province_id: 7, province_name: 'Tỉnh Điện Biên' },
  { province_id: 8, province_name: 'Tỉnh Lai Châu' },
  { province_id: 9, province_name: 'Tỉnh Sơn La' },
  { province_id: 10, province_name: 'Tỉnh Yên Bái' },
  { province_id: 11, province_name: 'Tỉnh Hoà Bình' },
  { province_id: 12, province_name: 'Tỉnh Thái Nguyên' },
  { province_id: 13, province_name: 'Tỉnh Lạng Sơn' },
  { province_id: 14, province_name: 'Tỉnh Quảng Ninh' },
  { province_id: 15, province_name: 'Tỉnh Bắc Giang' },
  { province_id: 16, province_name: 'Tỉnh Phú Thọ' },
  { province_id: 17, province_name: 'Tỉnh Vĩnh Phúc' },
  { province_id: 18, province_name: 'Tỉnh Bắc Ninh' },
  { province_id: 19, province_name: 'Tỉnh Hải Dương' },
  { province_id: 20, province_name: 'Thành phố Hải Phòng' },
  { province_id: 21, province_name: 'Tỉnh Hưng Yên' },
  { province_id: 22, province_name: 'Tỉnh Thái Bình' },
  { province_id: 23, province_name: 'Tỉnh Hà Nam' },
  { province_id: 24, province_name: 'Tỉnh Nam Định' },
  { province_id: 25, province_name: 'Tỉnh Ninh Bình' },
  { province_id: 26, province_name: 'Tỉnh Thanh Hóa' },
  { province_id: 27, province_name: 'Tỉnh Nghệ An' },
  { province_id: 28, province_name: 'Tỉnh Hà Tĩnh' },
  { province_id: 29, province_name: 'Tỉnh Quảng Bình' },
  { province_id: 30, province_name: 'Tỉnh Quảng Trị' },
  { province_id: 31, province_name: 'Tỉnh Thừa Thiên Huế' },
  { province_id: 32, province_name: 'Thành phố Đà Nẵng' },
  { province_id: 33, province_name: 'Tỉnh Quảng Nam' },
  { province_id: 34, province_name: 'Tỉnh Quảng Ngãi' },
  { province_id: 35, province_name: 'Tỉnh Bình Định' },
  { province_id: 36, province_name: 'Tỉnh Phú Yên' },
  { province_id: 37, province_name: 'Tỉnh Khánh Hòa' },
  { province_id: 38, province_name: 'Tỉnh Ninh Thuận' },
  { province_id: 39, province_name: 'Tỉnh Bình Thuận' },
  { province_id: 40, province_name: 'Tỉnh Kon Tum' },
  { province_id: 41, province_name: 'Tỉnh Gia Lai' },
  { province_id: 42, province_name: 'Tỉnh Đắk Lắk' },
  { province_id: 43, province_name: 'Tỉnh Đắk Nông' },
  { province_id: 44, province_name: 'Tỉnh Lâm Đồng' },
  { province_id: 45, province_name: 'Tỉnh Bình Phước' },
  { province_id: 46, province_name: 'Tỉnh Tây Ninh' },
  { province_id: 47, province_name: 'Tỉnh Bình Dương' },
  { province_id: 48, province_name: 'Tỉnh Đồng Nai' },
  { province_id: 49, province_name: 'Tỉnh Bà Rịa - Vũng Tàu' },
  { province_id: 50, province_name: 'Thành phố Hồ Chí Minh' },
  { province_id: 51, province_name: 'Tỉnh Long An' },
  { province_id: 52, province_name: 'Tỉnh Tiền Giang' },
  { province_id: 53, province_name: 'Tỉnh Bến Tre' },
  { province_id: 54, province_name: 'Tỉnh Trà Vinh' },
  { province_id: 55, province_name: 'Tỉnh Vĩnh Long' },
  { province_id: 56, province_name: 'Tỉnh Đồng Tháp' },
  { province_id: 57, province_name: 'Tỉnh An Giang' },
  { province_id: 58, province_name: 'Tỉnh Kiên Giang' },
  { province_id: 59, province_name: 'Thành phố Cần Thơ' },
  { province_id: 60, province_name: 'Tỉnh Hậu Giang' },
  { province_id: 61, province_name: 'Tỉnh Sóc Trăng' },
  { province_id: 62, province_name: 'Tỉnh Bạc Liêu' },
  { province_id: 63, province_name: 'Tỉnh Cà Mau' },
];

const PostedJobPage = () => {
  const [allJobs, setAllJobs] = useState<PostedJob[]>([]); // Lưu trữ tất cả các job
  const [filteredJobs, setFilteredJobs] = useState<PostedJob[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(4);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (token) {
      setUserToken(token);
    }
  }, []);

  useEffect(() => {
    const fetchPostedJobs = async () => {
      if (!userToken) return;
      try {
        const response: any = await GetPostedJob(1, 1000, userToken); // Tải tất cả các job một lần
        setAllJobs(response.jobPostings);
      } catch (error) {
        console.error('Error fetching posted jobs:', error);
      }
    };
    fetchPostedJobs();
  }, [userToken]);

  useEffect(() => {
    let filtered = allJobs;

    if (searchTerm) {
      filtered = filtered.filter((job) =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedIndustry) {
      filtered = filtered.filter((job) => job.industry === selectedIndustry);
    }

    if (selectedLocation) {
      filtered = filtered.filter((job) => job.location === selectedLocation);
    }

    setFilteredJobs(filtered);
    setTotalPages(Math.ceil(filtered.length / pageSize)); // Cập nhật lại số trang sau khi lọc
  }, [searchTerm, selectedIndustry, selectedLocation, allJobs]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPageNumber(value);
  };

  const handleApply = (jobPostingID: string) => {
    router.push(`/jobs/${jobPostingID}`);
  };

  const handleViewApplicants = (jobPostingID: string) => {
    router.push(`/my-posted-jobs/applicants/${jobPostingID}`);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedIndustry('');
    setSelectedLocation('');
  };

  // Lấy các job hiện tại trên trang (sau khi lọc)
  const currentJobs = filteredJobs.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);

  return (
    <RootLayout>
      <Header />
      <div className="container mx-auto py-8 bg-white">
        {/* Search and Filter Section */}
        <div className="mb-6 flex flex-col sm:flex-row items-center sm:justify-between gap-4 mx-5 sm:mx-0">
          <TextField
            label="Search for jobs"
            variant="outlined"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-50 rounded-md sm:w-2/3 md:w-3/5 lg:w-1/2"
          />

          <FormControl fullWidth variant="outlined" className="w-full sm:w-1/3 md:w-1/4 lg:w-1/5 bg-gray-50">
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

          <FormControl variant="outlined" className="w-full sm:w-1/3 md:w-1/4 lg:w-1/5 bg-gray-50">
            <InputLabel id="location-label">Select Location</InputLabel>
            <Select
              labelId="location-label"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              label="Select Location"
              className="rounded-md"
            >
              <MenuItem value="">All Locations</MenuItem>
              {locations.map((location) => (
                <MenuItem key={location.province_id} value={location.province_name}>
                  {location.province_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <button
            onClick={clearFilters}
            className="bg-primary-color text-white py-2 px-4 rounded-md hover:bg-yellow-color transition-all mt-2 sm:mt-0 sm:w-fit w-full"
          >
            Clear Filters
          </button>
        </div>

        {/* Job Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {currentJobs.length > 0 ? (
            currentJobs.map((job) => (
              <PostedJobCard
                key={job.jobPostingID}
                job={job}
                onApply={() => handleApply(job.jobPostingID)}
                onViewApplicants={() => handleViewApplicants(job.jobPostingID)}
              />
            ))
          ) : (
            <p className="text-center text-gray-600 col-span-2">No jobs found with the applied filters.</p>
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

// PostedJobCard Component
const PostedJobCard = ({ job, onApply, onViewApplicants }: { job: PostedJob; onApply: () => void; onViewApplicants: () => void }) => {   
  const formattedCreateDate = new Date(job.createdOn).toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false, // Sử dụng định dạng 24 giờ
  }).replace(',', ''); // Loại bỏ dấu phẩy giữa ngày và giờ
  
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center bg-white p-6 rounded-lg shadow-md transform transition-transform hover:scale-103 hover:shadow-lg">
      {/* Employer Avatar */}
      <div className="w-16 h-16 flex-shrink-0 mb-4 sm:mb-0">
        {job.companyLogo ? (
          <Image
            src={job.companyLogo || 'D:/WorkNest/frontend/src/app/assets/images/default-avatar.jpg'} 
            alt="Company Logo"
            width={64}
            height={64}
            className="object-contain rounded-full"
          />
        ) : (
          <div className="bg-gray-200 w-full h-full rounded-full" />
        )}
      </div>

      {/* Job Information */}
      <div className="flex flex-col sm:ml-4 sm:flex-grow">
        <h2 className="text-xl font-bold text-black-color">{job.title}</h2>
        <p className="text-gray-600">{job.position}</p>
        <div className="flex flex-wrap items-center gap-2 text-sm">
  <div className="flex items-center bg-gray-200 px-2 py-1 rounded-md text-gray-700">
    <span>{job.location}</span>
  </div>

  <div
    className={`flex items-center px-2 py-1 rounded-md ${
      job.timeRemaining === "Expired"
        ? "bg-red-500 text-white"
        : "bg-gray-200 text-gray-700"
    }`}
  >
    {job.timeRemaining === "Expired" ? (
      <span>Expired</span>
    ) : (
      <>
        <MdAccessTime className="text-primary-color mr-1" />
        <span className="font-semibold mr-1.5">{job.timeRemaining}</span>
        <span>left to be expired</span>
      </>
    )}
  </div>

  {job.lockFlg === 1 && (
    <div className="flex items-center px-2 py-1 rounded-md bg-red-500 text-white">
      <span>Locked</span>
    </div>
  )}

  {job.lockFlg === 2 && (
    <div className="flex items-center px-2 py-1 rounded-md bg-yellow-500 text-white">
      <span>Closed</span>
    </div>
  )}
</div>


        {/* Created On */}
        <div className="mt-2 text-gray-500 text-xs">
          <span>Created on: {formattedCreateDate}</span>
        </div>

        {/* Job Statistics */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-gray-600">
          <div className="flex items-center">
            <span className="font-semibold">Total Applications:</span>
            <span className="ml-2">{job.totalApplications}</span>
          </div>
          <div className="flex items-center">
            <span className="font-semibold">Not Reviewed:</span>
            <span className="ml-2">{job.notReviewedCount}</span>
          </div>
          <div className="flex items-center">
            <span className="font-semibold">Not Suitable:</span>
            <span className="ml-2">{job.notSuitableCount}</span>
          </div>
          <div className="flex items-center">
            <span className="font-semibold">Suitable:</span>
            <span className="ml-2">{job.suitableCount}</span>
          </div>
        </div>
      </div>

      {/* CV File and Apply Button */}
{/* CV File and Apply Button */}
<div className="flex flex-row sm:gap-0 gap-2 sm:flex-col items-end justify-center mt-4 sm:mt-0 sm:ml-4 sm:w-fit w-full">
  <button 
    onClick={onViewApplicants}  
    className="w-full sm:w-auto bg-white border border-brighter-color text-brighter-color px-4 py-2 rounded-md mt-2 hover:bg-yellow-color hover:text-white hover:border-yellow-color whitespace-nowrap">
    View Applicants
  </button>

  <button 
    onClick={onApply} 
    className="w-full sm:w-auto bg-brighter-color border border-brighter-color text-white px-4 py-2 rounded-md mt-2 hover:bg-primary-color">
    View details
  </button>
</div>


    </div>
  );
};


export default PostedJobPage;
