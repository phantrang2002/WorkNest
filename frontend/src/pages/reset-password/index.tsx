import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import RootLayout from '@/app/layout';
import { FaLock, FaRegEnvelope } from "react-icons/fa";
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import { resetPassword } from '@/api/accountService';

const ResetPassword = () => {
    const router = useRouter();
    const { email } = router.query;
    const [token, setToken] = useState<string | null>(null);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const storedToken = sessionStorage.getItem('resetToken');
        if (storedToken) {
            setToken(storedToken);
        } else {
            setError('Token is missing');
            setSuccessMessage('');
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

        setLoading(true);
        try {
            const response: any = await resetPassword({ email, token, newPassword });
            if (response.status == 200) {
                setSuccessMessage('Your password has been successfully reset. Please log in!');
                sessionStorage.removeItem('resetToken');
                setError('');
            } else {
                setError(response.data.message || 'Something went wrong!');
                setSuccessMessage('');
            }
        } catch (error: any) {
            setError('An error occurred. Please try again.');
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
                            <h2 className="text-3xl font-bold mb-2">Reset Your Password</h2>
                            <div className="border-2 w-10 border-white inline-block mb-2"></div>
                            <p className="mb-10">Please enter your new password below.</p>
                            <Link href="/login" className="border-2 border-white rounded-full px-12 py-2 inline-block font-semibold hover:bg-white hover:text-primary-color">
                                Back to Login Page
                            </Link>
                        </div>

                        {/* Right Side */}
                        <div className="w-full md:w-3/5 p-5 flex items-center justify-center">
                            <div className="py-10 flex flex-col items-center w-full">
                                <h2 className="text-3xl font-bold text-primary-color mb-2">Set New Password</h2>
                                <div className="border-2 w-10 border-primary-color inline-block mb-2"></div>
                                <div className="flex justify-center my-2 w-full">
                                    <div className="flex flex-col items-center w-full md:w-2/3">
                                        <form onSubmit={handleSubmit}>
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

                                            <button
                                                type="submit"
                                                className="border-2 border-primary-color text-primary-color rounded-full 
                                                px-12 py-2 inline-block font-semibold
                                                hover:text-white hover:bg-primary-color mt-5"
                                                disabled={loading}
                                            >
                                                {loading ? 'Processing...' : 'Reset Password'}
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

export default ResetPassword;
