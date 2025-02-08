import React, { useEffect, useState } from 'react';
import { FaLock, FaRegEnvelope } from 'react-icons/fa';
import { useRouter } from 'next/router';
import { changePassword } from '@/api/accountService';
import RootLayout from '@/app/layout';

const ChangePassword = () => {
  const router = useRouter();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [userToken, setUserToken] = useState<string | null>(null);


  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (token) {
      setUserToken(token);
    }
  }, []);

  const isPasswordValid = (password: string) => {
    const passwordPattern = /^(?=.*[A-Za-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
    return passwordPattern.test(password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match!');
      setSuccessMessage('');
      return;
    }

    if (!isPasswordValid(newPassword)) {
      setError('Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.');
      setSuccessMessage('');
      return;
    }

    const data = {
      oldPassword,
      newPassword
    };


    setLoading(true);
    try {
      const response: any = await changePassword(data, userToken);
      if (response.status === 200) {
        setSuccessMessage('Your password has been successfully updated.');
        setError('');
      } else {
        const errorMessage = response.error || 'Something went wrong!';
        setError(errorMessage);
        setSuccessMessage('');
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error || 'An error occurred. Please try again.';
      setError(errorMessage);
      setSuccessMessage('');
    } finally {
      setLoading(false);
    }

  };

  return (
    <RootLayout>
      <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gray-100">
        <main className="flex flex-col items-center justify-center w-full flex-1 px-4 sm:px-20 text-center">
          <div className="bg-white rounded-2xl shadow-2xl flex flex-col md:flex-row w-full md:w-2/3 max-w-4xl">
            {/* Left Side */}
            <div className="w-full md:w-2/5 bg-primary-color text-white rounded-tl-2xl rounded-bl-2xl py-16 px-8 md:py-36 md:px-12">
              <h2 className="text-3xl font-bold mb-2">Change Your Password</h2>
              <div className="border-2 w-10 border-white inline-block mb-2"></div>
              <p className="mb-10">Please enter your old password and new password below.</p>
            </div>

            {/* Right Side */}
            <div className="w-full md:w-3/5 p-5 flex items-center justify-center">
              <div className="py-10 flex flex-col items-center w-full">
                <h2 className="text-3xl font-bold text-primary-color mb-2">Change Password</h2>
                <div className="border-2 w-10 border-primary-color inline-block mb-2"></div>
                <div className="flex justify-center my-2 w-full">
                  <div className="flex flex-col items-center w-full md:w-2/3">
                    <form onSubmit={handleSubmit}>
                      {/* Old Password */}
                      <div className="bg-gray-100 w-full sm:w-64 p-2 flex items-center mb-3">
                        <FaLock className="text-gray-400 m-2" />
                        <input
                          type="password"
                          placeholder="Old Password"
                          className="bg-gray-100 outline-none text-sm flex-1 text-black-color"
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          required
                        />
                      </div>

                      {/* New Password */}
                      <div className="bg-gray-100 w-full sm:w-64 p-2 flex items-center mb-3">
                        <FaLock className="text-gray-400 m-2" />
                        <input
                          type="password"
                          placeholder="New Password"
                          className="bg-gray-100 outline-none text-sm flex-1 text-black-color"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                        />
                      </div>

                      {/* Confirm New Password */}
                      <div className="bg-gray-100 w-full sm:w-64 p-2 flex items-center mb-3">
                        <FaLock className="text-gray-400 m-2" />
                        <input
                          type="password"
                          placeholder="Confirm New Password"
                          className="bg-gray-100 outline-none text-sm flex-1 text-black-color"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                        />
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        className="border-2 border-primary-color text-primary-color rounded-full 
                      px-12 py-2 inline-block font-semibold
                      hover:text-white hover:bg-primary-color mt-5"
                        disabled={loading}
                      >
                        {loading ? 'Processing...' : 'Change Password'}
                      </button>
                    </form>

                    {error && <p className="text-red-500 mt-4">{error}</p>}
                    {successMessage && <p className="text-green-500 mt-4">{successMessage}</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </RootLayout>
  );
};

export default ChangePassword;
