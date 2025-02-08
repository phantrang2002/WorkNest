import { useEffect, useState } from 'react';
import Header from '../../components/Header';
import RootLayout from '../../app/layout';
import { EditJobPosting, GetJobPostingById, PostAJob } from '@/api/jobService';
import { useRouter } from 'next/router';
import { TextField, MenuItem, Button, FormControlLabel, Checkbox } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
 
import 'react-quill/dist/quill.snow.css'; 
import 'dayjs/locale/en-gb';

import dynamic from 'next/dynamic';
 

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

dayjs.extend(utc);

interface Location {
    province_id: number;
    province_name: string;
}


// Define the modules for the Quill toolbar
const modules = {
    toolbar: [
      [{ header: '1' }, { header: '2' }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['bold', 'italic', 'underline', 'strike'], 
    ],
  };
  
  // Formats to allow for styling options in the editor
  const formats = [
    'header',
    'font',
    'list',
    'bullet',
    'bold',
    'italic',
    'underline',
    'strike',
    'align',
    'link',
    'image',
  ];

  
const positions = [
    { id: 1, name: 'Intern' },
    { id: 2, name: 'Entry-level' },
    { id: 3, name: 'Junior' },
    { id: 4, name: 'Mid-level' },
    { id: 5, name: 'Senior' },
    { id: 6, name: 'Lead' },
    { id: 7, name: 'Manager' },
    { id: 8, name: 'Director' },
    { id: 9, name: 'Vice President (VP)' },
    { id: 10, name: 'COO (Chief Operating Officer)' },
    { id: 11, name: 'CEO (Chief Executive Officer)' },
];

const jobIndustries = [
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
    { id: 19, name: 'Transportation' }
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


const EditAJobPage = () => {
    const [jobTitle, setJobTitle] = useState<string>('');
    const [position, setPosition] = useState<string>('');
    const [jobIndustry, setjobIndustry] = useState<string>('');
    const [location, setLocation] = useState<string>(''); 

    const [description, setDescription] = useState<string>('');
    const [expirationDate, setExpirationDate] = useState<Dayjs | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const router = useRouter();
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const [negotiable, setNegotiable] = useState<boolean>(false);
    const [minSalary, setMinSalary] = useState<number | null>(null);
    const [maxSalary, setMaxSalary] = useState<number | null>(null);
    const [experienceExpect, setExperienceExpect] = useState<number | null>(null);
    const [quantity, setQuantity] = useState<number | null>(null);

    const [jobDetails, setJobDetails] = useState({
        jobTitle: "",
        location: "",
        description: "", 
        timeRemaining: "",
        position: "",
        minSalary: 0,
        maxSalary: 0,
        experienceExpect: 0,
        quantity: 0,
        jobIndustry: "",
        time: null
    });

    useEffect(() => {
        const storedToken = localStorage.getItem('userToken');
        setToken(storedToken);
    }, []); 

    const fetchJobDetails = async () => {
        try {
            const storedJobId = window.location.pathname.split('/')[2];

            const response: any = await GetJobPostingById(storedJobId);
            const jobData = response; 
            setJobTitle(jobData.jobTitle);
            setPosition(jobData.position);
            setjobIndustry(jobData.jobIndustry);
            setExperienceExpect(jobData.experienceExpect);
            setMinSalary(jobData.minSalary);
            setMaxSalary(jobData.maxSalary);
            setQuantity(jobData.quantity);
            setDescription(jobData.description);
            setLocation(jobData.location);
            setExpirationDate(dayjs(jobData.time))
        } catch (error) { 
            console.error(error);
        }
    };

    useEffect(() => {
        fetchJobDetails();
    }, []);

    const handleNegotiableChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = event.target.checked;
        setNegotiable(isChecked);

        // If checked, clear and disable the salary fields
        if (isChecked) {
            setMinSalary(null);
            setMaxSalary(null);
        }
    };

    const handleDateChange = (newValue: Dayjs | null) => {
        setExpirationDate(newValue);
        if (!newValue) {
            setErrors({ expirationTime: "Expiration date is required." });
        } else {
            setErrors({});
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrors({});

        const newErrors: { [key: string]: string } = {};
        if (!jobTitle) newErrors.jobTitle = 'Title is required';
        if (!position) newErrors.position = 'Position is required';
        if (!jobIndustry) newErrors.jobIndustry = 'Industry is required';
        if (!description) newErrors.description = 'Description is required';
        if (!location) newErrors.location = 'Location is required';
        if (!expirationDate) newErrors.expirationTime = 'Expiration date is required';
        if (!quantity) newErrors.quantity = 'Quantity is required';
        if (!experienceExpect) newErrors.experienceExpect = 'Experience Expect is required';



        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            return;
        }

        if (!expirationDate || !expirationDate.isValid()) {
            console.error('Invalid expiration date');
            return;
        }

        const localDatetime = expirationDate.startOf('day');

        const formattedDatetime = localDatetime.format('YYYY-MM-DD HH:mm:ss');
  
        if (!token) {
            console.error('No token found!');
            return;
        }


        // Set minSalary and maxSalary to 0 if negotiable is true
        const salaryData = negotiable ? { minSalary: 0, maxSalary: 0 } : { minSalary, maxSalary };

        const storedJobId = window.location.pathname.split('/')[2];
    
        try {
            const response = await EditJobPosting(storedJobId,{
                title: jobTitle,
                position: position,
                jobIndustry: jobIndustry,
                description: description,
                location: location,
                time: formattedDatetime,  // the formatted expiration date
                ...salaryData,
                experienceExpect: experienceExpect,
                quantity: quantity
            }, token);

            console.log(response);

            if (response) {
                router.push('/success-posting');
            } else {
                console.error('Error update job3:', response);
            }
        } catch (error) {
            console.error('Error update job2:', error);
        }
    };


    return (
        <RootLayout>
            <Header />
            <div>
                <main className="p-8 bg-gray-50 text-gray-900 h-fit">
                    <h1 className="text-3xl font-bold mb-6 text-center">Edit a Job</h1>
                    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl mx-auto">
                        <TextField
                            label="Title"
                            variant="outlined"
                            fullWidth
                            className=""
                            value={jobTitle}
                            onChange={(e) => setJobTitle(e.target.value)}
                            error={!!errors.jobTitle}
                            helperText={errors.jobTitle}

                        />
                        <TextField
                            select
                            label="Position"
                            variant="outlined"
                            fullWidth
                            value={position}
                            onChange={(e) => setPosition(e.target.value)}
                            error={!!errors.position}
                            helperText={errors.position}
                        >
                            <MenuItem value="">
                                <em>Select a position</em>
                            </MenuItem>
                            {positions.map(pos => (
                                <MenuItem key={pos.id} value={pos.name}>
                                    {pos.name}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            select
                            label="Industry"
                            variant="outlined"
                            fullWidth
                            value={jobIndustry}
                            onChange={(e) => setjobIndustry(e.target.value)}
                            error={!!errors.jobIndustry}
                            helperText={errors.jobIndustry}
                        >
                            <MenuItem value="">
                                <em>Select a Industry</em>
                            </MenuItem>
                            {jobIndustries.map(pos => (
                                <MenuItem key={pos.id} value={pos.name}>
                                    {pos.name}
                                </MenuItem>
                            ))}
                        </TextField>
                        <div className="flex space-x-4">
                            <TextField
                                label="Year of Experience"
                                variant="outlined"
                                fullWidth
                                className="w-1/2"
                                value={experienceExpect !== null ? experienceExpect : ''}
                                type="number"
                                onChange={(e) => setExperienceExpect(e.target.value ? parseInt(e.target.value, 10) : null)}
                                error={!!experienceExpect && experienceExpect < 0} // Adjust the validation based on your needs
                                helperText={experienceExpect && experienceExpect < 0 ? "Experience must be a positive number" : ""}
                            />
                            <TextField
                                label="Quantity"
                                variant="outlined"
                                fullWidth
                                className="w-1/2"
                                value={quantity !== null ? quantity : ''}
                                type="number"
                                onChange={(e) => setQuantity(e.target.value ? parseInt(e.target.value, 10) : null)}
                                error={!!quantity && quantity < 0} // Adjust the validation based on your needs
                                helperText={quantity && quantity < 0 ? "Quantity must be a positive number" : ""}
                            />
                        </div>

                        {!negotiable && (
                            <>
                                <div className="flex space-x-4">
                            <TextField
                                label="Min Salary"
                                variant="outlined"
                                fullWidth
                                className="w-1/2"
                                value={minSalary !== null ? minSalary : ''}
                                type="number"
                                onChange={(e) => setMinSalary(e.target.value ? parseInt(e.target.value, 10) : null)}
                                error={!!minSalary && minSalary < 0} // Adjust the validation based on your needs
                                helperText={minSalary && minSalary < 0 ? "Min Salary must be a positive number" : ""}
                                disabled={negotiable} // Disable when negotiable is checked
                            />
                            <TextField
                                label="Max Salary"
                                variant="outlined"
                                fullWidth
                                className="w-1/2"
                                value={maxSalary !== null ? maxSalary : ''}
                                type="number"
                                onChange={(e) => setMaxSalary(e.target.value ? parseInt(e.target.value, 10) : null)}
                                error={!!maxSalary && maxSalary < 0} // Adjust the validation based on your needs
                                helperText={maxSalary && maxSalary < 0 ? "Max Salary must be a positive number" : ""}
                                disabled={negotiable} // Disable when negotiable is checked
                            />
                            
                        </div>
                            </>
                        )}

                        


                        {/* Negotiable Checkbox */}
                        <div className="mt-4">
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={negotiable}
                                        onChange={handleNegotiableChange}
                                        name="negotiable"
                                    />
                                }
                                label="Salary negotiabled"
                            />
                        </div>


                        <div className="flex space-x-4"> {/* Sử dụng flexbox và khoảng cách giữa các phần tử */}
                        <TextField
                            select
                            label="Location"
                            variant="outlined"
                            fullWidth
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            error={!!errors.location}
                            helperText={errors.location}
                            >
                                <MenuItem value="">
                                <em>Select a location</em>
                            </MenuItem>
                            {locations.map(pos => (
                                <MenuItem key={pos.province_id} value={pos.province_name}>
                                    {pos.province_name}
                                </MenuItem>
                            ))} 
                            </TextField>

                            
 

                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    label="Expiration Date"
                                    value={expirationDate}
                                    onChange={handleDateChange}
                                    minDate={dayjs()}
                                    className="w-1/2"
                                />
                            </LocalizationProvider> 
                        </div>



                        <MyRichTextEditor
                            description={description}
                            setDescription={setDescription}
                            errors={errors}
                            
                            />

                        <Button
                            type="submit"
                            variant="contained"
                            className="
                                border-2 text-base border-primary-color hover:text-primary-color rounded-full 
                                            px-12 py-4 inline-block font-semibold
                                            text-white bg-primary-color hover:bg-white"
                            fullWidth
                        >
                            Submit Job
                        </Button>
                    </form>
                </main>
            </div>
        </RootLayout>

    );
};

 

// MyRichTextEditor component
type MyRichTextEditorProps = {
    description: string;
    setDescription: React.Dispatch<React.SetStateAction<string>>;
    errors: { description?: string };
  };
  
  const MyRichTextEditor: React.FC<MyRichTextEditorProps> = ({ description, setDescription, errors }) => {
    return (
      <div style={{ minHeight: '300px' }}>
        <ReactQuill
          value={description}
          onChange={setDescription}
          theme="snow"
          modules={modules}
          formats={formats}
          placeholder="Enter job description here..."
          style={{ minHeight: '300px' }}
          
        />
        
        {errors.description && (
          <p style={{ color: 'red', fontSize: '0.8rem' }}>{errors.description}</p>
        )}
      </div>
    );
  };
export default EditAJobPage;