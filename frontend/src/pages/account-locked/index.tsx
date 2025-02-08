import React from 'react'; 
import RootLayout from '../../app/layout'; 
import Header from '@/components/Header';

const AccountLocked: React.FC = () => {
    return (
        <RootLayout>
            <Header />
            <div className="flex flex-col items-center justify-center min-h-[800px] bg-gradient-to-r from-blue-100 to-purple-100">
                <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-full text-center">
                    <h1 className="text-3xl font-bold mb-4 text-gray-700">Your Account has been locked</h1>
                    <p className="text-lg mb-6 text-gray-600">
                        We're sorry, but your account has been locked. <br/> Please contact support for assistance.
                    </p>
                    <p className="text-lg mb-6 text-gray-600">
                        You can reach us at: 
                        <a href="mailto:phantrang2002@gmail.com" className="text-blue-500 hover:underline"> phantrang2002@gmail.com</a>
                        <br />
                        Or call us at: 
                        <a href="tel:+84812632749" className="text-blue-500 hover:underline"> 0812632749</a>
                    </p>
                </div>
            </div>
        </RootLayout>
    );
};

export default AccountLocked;
