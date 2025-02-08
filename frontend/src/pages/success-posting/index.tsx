import React from 'react';
import RootLayout from '../../app/layout';
import Link from 'next/link';
import Header from '@/components/Header';

const SuccessPost: React.FC = () => {
    return (
        <RootLayout>
            <Header />
            <div className="flex flex-col items-center justify-center min-h-[68vh] bg-gray-100">
                <h1 className="text-3xl font-bold mb-4 text-gray-600">Post Successful!</h1>
                <p className="text-lg text-center mb-6 text-black-color">
                    Your job post has been submitted successfully and is awaiting approval from the administrator. <br />Please check for updates regularly.
                </p>
                <Link href="/home" style={{ textDecoration: 'none' }}>
                    <button
                        className="border-2 border-primary-color text-primary-color rounded-full 
                                            px-12 py-2 inline-block font-semibold
                                            hover:text-white hover:bg-primary-color"
                    >Back to Home</button>
                </Link>
            </div>
        </RootLayout>
    );
};

export default SuccessPost;
