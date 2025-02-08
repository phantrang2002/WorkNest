import React, { useState } from 'react';
import Link from 'next/link';
import RootLayout from '@/app/layout';
import { FaRegEnvelope } from "react-icons/fa"; 
import { toast } from 'react-toastify';
import { forgotPassword } from '@/api/accountService';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); 

        try {
            const response: any = await forgotPassword({ email });

            if (!response) {
                console.error("Response is null or undefined");
                return;
            } 
            if(response.status == 200){                
                sessionStorage.setItem('resetToken', response.resetToken);  
                setSuccessMessage('Please check your email for the password reset link!');
            }
        } catch (error: any) {
            toast.error(error.response.data.error);
        }
    };

    return (
        <RootLayout>
            <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gray-100">
                <main className="flex flex-col items-center justify-center w-full flex-1 px-4 sm:px-20 text-center">
                    <div className="bg-white rounded-2xl shadow-2xl flex flex-col md:flex-row w-full md:w-2/3 max-w-4xl">
                        {/* Left Side */}
                        <div className="w-full md:w-2/5 bg-primary-color text-white rounded-tl-2xl rounded-bl-2xl py-16 px-8 md:py-36 md:px-12">
                            <h2 className="text-3xl font-bold mb-2">Forgot Password!</h2>
                            <div className="border-2 w-10 border-white inline-block mb-2"></div>
                            <p className="mb-10">Enter your email address to receive a password reset link.</p>
                            <Link href="/login" className="border-2 border-white rounded-full px-12 py-2 inline-block font-semibold hover:bg-white hover:text-primary-color">
                                Back to Login Page
                            </Link>
                        </div>

                        {/* Right Side */}
                        <div className="w-full md:w-3/5 p-5 flex items-center justify-center">
                            <div className="py-10 flex flex-col items-center w-full">
                                <h2 className="text-3xl font-bold text-primary-color mb-2">Reset Password</h2>
                                <div className="border-2 w-10 border-primary-color inline-block mb-2"></div>
                                <div className="flex justify-center my-2 w-full">                                         
                                    <div className="flex flex-col items-center w-full md:w-2/3">
                                        <form onSubmit={handleSubmit}>
                                            <div className="bg-gray-100 w-full sm:w-64 p-2 flex items-center mb-3">
                                                <FaRegEnvelope className="text-gray-400 m-2" />
                                                <input
                                                    type="email"
                                                    placeholder="Email"
                                                    className="bg-gray-100 outline-none text-sm flex-1 text-black-color"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <button 
                                                type="submit"  
                                                className="border-2 border-primary-color text-primary-color rounded-full 
                                                px-12 py-2 inline-block font-semibold
                                                hover:text-white hover:bg-primary-color mt-5"
                                            >
                                                Send
                                            </button>
                                        </form>

                                        {/* Success Message */}
                                        {successMessage && (
                                            <p className="text-green-500 mt-4">{successMessage}</p>
                                        )}
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

export default ForgotPassword;
