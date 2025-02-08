// /pages/thank-you.tsx
import React from 'react';
import RootLayout from '../../app/layout';
import Header from '@/components/Header';
import Link from 'next/link';

const ThankYouPage = () => {
    return (
        <RootLayout>
            <Header />
            <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-100 to-purple-100">
                <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-full text-center">
                    <h1 className="text-3xl font-bold mb-4 text-gray-700">Thank You!</h1>
                    <p className="text-lg mb-6 text-gray-600">
                        Your message has been successfully submitted. <br/> We will get back to you shortly.
                    </p>
                    <Link 
                        href="/"
                        className="inline-block bg-primary-color text-white rounded-full px-12 py-3 text-lg font-semibold 
                        hover:bg-primary-color-dark transition-all duration-300 transform hover:scale-105"
                    >
                        Go Back to Home
                    </Link>
                </div>
            </div>
        </RootLayout>
    );
};

export default ThankYouPage;
