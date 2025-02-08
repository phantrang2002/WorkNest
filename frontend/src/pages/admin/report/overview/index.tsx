import AdminLayout from '../../../../app/adminLayout';
import { Bar, Doughnut, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { GetReport } from '@/api/accountService';
import { useEffect, useState } from 'react';

// Registering necessary components for Bar, Doughnut, and Pie charts
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

// Type Definitions
type JobData = {
  total: number;
  available: number;
  locked: number;
  closed: number;
  pending: number;
  expired: number;
};

type CandidateData = {
  total: number;
  available: number;
  locked: number;
};

type EmployerData = {
  total: number;
  available: number;
  locked: number;
};

type FeedbackData = {
  total: number;
  unresolvedFeedback: number;
  resolvedFeedback: number;
};

const ReportPage = () => {
  const [jobData, setJobData] = useState<JobData | null>(null);
  const [candidateData, setCandidateData] = useState<CandidateData | null>(null);
  const [employerData, setEmployerData] = useState<EmployerData | null>(null);
  const [applications, setApplications] = useState<number>(0);
  const [templates, setTemplates] = useState<number>(0);
  const [feedbackData, setFeedbackData] = useState<FeedbackData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response: any = await GetReport();
        setJobData(response.jobPostings);
        setCandidateData(response.candidates);
        setEmployerData(response.employers);
        setApplications(response.applications || 0);
        setTemplates(response.templates || 0);
        setFeedbackData(response.contacts);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const jobChartData = {
    labels: ['Available', 'Locked', 'Closed', 'Pending', 'Expired'],
    datasets: [
      {
        label: 'Job Postings Count',
        data: [
          jobData?.available || 0,
          jobData?.locked || 0,
          jobData?.closed || 0,
          jobData?.pending || 0,
          jobData?.expired || 0,
        ],
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const candidateChartData = {
    labels: ['Available', 'Locked'],
    datasets: [
      {
        label: 'Candidates Count',
        data: [candidateData?.available || 0, candidateData?.locked || 0],
        backgroundColor: ['rgba(153, 102, 255, 0.2)', 'rgba(255, 99, 132, 0.2)'],
        borderColor: ['rgba(153, 102, 255, 1)', 'rgba(255, 99, 132, 1)'],
        borderWidth: 1,
      },
    ],
  };

  const companyChartData = {
    labels: ['Available', 'Locked'],
    datasets: [
      {
        label: 'Companies Count',
        data: [employerData?.available || 0, employerData?.locked || 0],
        backgroundColor: ['rgba(255, 159, 64, 0.2)', 'rgba(255, 99, 132, 0.2)'],
        borderColor: ['rgba(255, 159, 64, 1)', 'rgba(255, 99, 132, 1)'],
        borderWidth: 1,
      },
    ],
  };

  const comparisonChartData = {
    labels: ['Employers', 'Candidates'],
    datasets: [
      {
        label: 'Employers vs Candidates',
        data: [
          (employerData?.available || 0) + (employerData?.locked || 0),
          (candidateData?.available || 0) + (candidateData?.locked || 0),
        ],
        backgroundColor: ['rgba(255, 159, 64, 0.2)', 'rgba(153, 102, 255, 0.2)'],
        borderColor: ['rgba(255, 159, 64, 1)', 'rgba(153, 102, 255, 1)'],
        borderWidth: 1,
      },
    ],
  };

  const feedbackChartData = {
    labels: ['Unresolved Feedback', 'Resolved Feedback'],
    datasets: [
      {
        label: 'Feedback Count',
        data: [
          feedbackData?.unresolvedFeedback || 0,
          feedbackData?.resolvedFeedback || 0,
        ],
        backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(75, 192, 192, 0.2)'],
        borderColor: ['rgba(255, 99, 132, 1)', 'rgba(75, 192, 192, 1)'],
        borderWidth: 1,
      },
    ],
  };

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Admin Report Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-8 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-lg text-center transition-all hover:scale-105 transform hover:shadow-xl">
          <h2 className="text-xl font-semibold text-gray-700">Companies Count</h2>
          <p className="text-2xl font-bold text-blue-600">{employerData?.total || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg text-center transition-all hover:scale-105 transform hover:shadow-xl">
          <h2 className="text-xl font-semibold text-gray-700">Candidates Count</h2>
          <p className="text-2xl font-bold text-green-600">{candidateData?.total || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg text-center transition-all hover:scale-105 transform hover:shadow-xl">
          <h2 className="text-xl font-semibold text-gray-700">Job Postings Count</h2>
          <p className="text-2xl font-bold text-purple-600">{jobData?.total || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg text-center transition-all hover:scale-105 transform hover:shadow-xl">
          <h2 className="text-xl font-semibold text-gray-700">Applications Count</h2>
          <p className="text-2xl font-bold text-red-600">{applications}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg text-center transition-all hover:scale-105 transform hover:shadow-xl">
          <h2 className="text-xl font-semibold text-gray-700">CV Templates Count</h2>
          <p className="text-2xl font-bold text-red-600">{templates}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg text-center transition-all hover:scale-105 transform hover:shadow-xl">
          <h2 className="text-xl font-semibold text-gray-700">Feedbacks Count</h2>
          <p className="text-2xl font-bold text-orange-600">{feedbackData?.total || 0}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="bg-white p-8 rounded-lg shadow-md mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Job Postings Overview</h3>
        <div className="h-64">
          <Bar
            data={jobChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { position: 'top' } },
              aspectRatio: 2,
            }}
          />
        </div>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Candidates Overview</h3>
        <div className="h-64">
          <Doughnut
            data={candidateChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { position: 'top' } },
              aspectRatio: 2,
            }}
          />
        </div>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Company Overview</h3>
        <div className="h-64">
          <Pie
            data={companyChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { position: 'top' } },
              aspectRatio: 2,
            }}
          />
        </div>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Employers vs Candidates</h3>
        <div className="h-64">
          <Bar
            data={comparisonChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { position: 'top' } },
              aspectRatio: 2,
            }}
          />
        </div>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Feedback Overview</h3>
        <div className="h-64">
          <Doughnut
            data={feedbackChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { position: 'top' } },
              aspectRatio: 2,
            }}
          />
        </div>
      </div>
    </AdminLayout>
  );
};

export default ReportPage;
