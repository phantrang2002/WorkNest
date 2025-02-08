import AdminLayout from '../../../app/adminLayout';

const WelcomePage = () => {
  return (
    <AdminLayout>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-100 to-purple-100 p-6">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-2xl w-full text-center">
          <h1 className="text-4xl font-bold text-primary-color mb-4">
            Welcome to the Admin Dashboard
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            This is the main content area of the welcome page. <br /> You can manage your admin settings here and monitor activities <br /> across the platform.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default WelcomePage;
