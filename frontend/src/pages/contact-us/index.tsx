import { PostContact } from '@/api/contactService';
import { useEffect, useState } from 'react';
import React from 'react';
import RootLayout from '../../app/layout';
import Header from '@/components/Header';

import router from 'next/router';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ContactForm = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState('');
    const [userToken, setUserToken] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('userToken');
        if (token) {
            setUserToken(token);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('problemTitle', title);
        formData.append('description', description);

        setLoading(true);
        setError('');

        try {
            const response = await PostContact(formData, userToken);
            if (response.status == 200) {
                toast.success("Submitted your feedback");
                router.push('/success-feedback');
            }
        } catch (err) {
            setError('Failed to submit contact form. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <RootLayout>
            <Header />
            <div className="flex flex-col items-center justify-center min-h-[800px] bg-gradient-to-r from-blue-100 to-purple-100">


                <div className="sm:max-w-md mx-auto p-6 bg-white rounded-lg shadow-md mt-8 w-full sm:px-4">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-6 text-center">Contact Us</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-gray-600 text-sm font-medium mb-2" htmlFor="title">Problem Title</label>
                            <input
                                type="text"
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter the problem title"
                                required
                                className="w-full p-3 border border-gray-300 text-black-color  rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-color focus:border-transparent"
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-gray-600 text-sm font-medium mb-2" htmlFor="description">Description</label>
                            <textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe the issue in detail"
                                required
                                rows={4}
                                className="w-full p-3 border border-gray-300 rounded-md text-black-color shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-color focus:border-transparent"
                            />
                        </div>

                        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

                        <div className="flex justify-center">
                            {loading ? (
                                <button
                                    type="button"
                                    disabled
                                    className="px-5 py-2 text-white bg-gray-500 rounded-full cursor-not-allowed"
                                >
                                    Loading...
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    className="w-full px-5 py-4 text-white bg-primary-color rounded-md font-semibold hover:bg-primary-color-dark transition-colors"
                                >
                                    Submit
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </RootLayout>
    );
};

export default ContactForm;
