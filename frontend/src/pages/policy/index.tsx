import { GetPolicy } from '@/api/policyService';
import RootLayout from '@/app/layout';
import Header from '@/components/Header';
import { useEffect, useState } from 'react';

interface Policy {
  policyID: string;
  title: string;
  description: string;
}

const PolicyPage = () => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [mostRecentlyUpdatedDate, setMostRecentlyUpdatedDate] = useState<string>('');

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const response: any = await GetPolicy();
        setPolicies(response.policies);
        setMostRecentlyUpdatedDate(response.mostRecentlyUpdatedPolicy);
      } catch (error) {
        console.error('Error fetching policies:', error);
      }
    };

    fetchPolicy();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <RootLayout>
      <Header />
      <div className="flex flex-col items-center p-6 max-w-screen-lg mx-auto">
        {/* Display most recently updated policy date */}
        <div className="w-full text-center mb-4">
          <p className="text-gray-700">
            Most Recently Updated Policy Date: <span className="font-semibold">{mostRecentlyUpdatedDate}</span>
          </p>
        </div>

        {/* Scrollable list of policies */}
        <div className="flex flex-col space-y-6 w-full">
          {policies.map((policy) => (
            <div key={policy.policyID} className="p-4">
              <h2 className="text-2xl font-semibold text-gray-800">{policy.title}</h2>
              <p className="text-gray-600 mt-2">{policy.description}</p>
            </div>
          ))}
        </div>

        {/* Scroll to Top Button */}
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 focus:outline-none"
        >
          ↑
        </button>
      </div>
    </RootLayout>
  );
};

export default PolicyPage;
