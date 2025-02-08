import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-gradient-radial pt-20 pb-11">
            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:pl-[500px] lg:flex-row justify-center lg:justify-between items-start gap-8">
                    {/* Footer Links */}
                    <div className="flex flex-col lg:flex-row lg:gap-[80px] w-full">
                        {/* About Us */}
                        <div className="mb-6 lg:mb-0 w-full lg:w-auto">
                            <h4 className="font-bold mb-2 text-gray-800 text-center lg:text-left">About Us</h4>
                            <ul className="space-y-1 text-center lg:text-left">
                                <li><a href="/about" className="text-gray-600 hover:text-gray-800">About</a></li>
                                <li><a href="/contact-us" className="text-gray-600 hover:text-gray-800">Contact</a></li>
                                <li><a href="/policy" className="text-gray-600 hover:text-gray-800">Policy</a></li>
                            </ul>
                        </div>

                        {/* For Job Seekers */}
                        <div className="mb-6 lg:mb-0 w-full lg:w-auto">
                            <h4 className="font-bold mb-2 text-gray-800 text-center lg:text-left">For Candidates</h4>
                            <ul className="space-y-1 text-center lg:text-left">
                                <li><a href="/jobs" className="text-gray-600 hover:text-gray-800">Find a Job</a></li>
                                <li><a href="/employers" className="text-gray-600 hover:text-gray-800">Browse Employers</a></li>
                                <li><a href="/sample-cv" className="text-gray-600 hover:text-gray-800">Sample CV</a></li>
                            </ul>
                        </div>

                        {/* For Employers */}
                        <div className="w-full lg:w-auto">
                            <h4 className="font-bold mb-2 text-gray-800 text-center lg:text-left">For Employers</h4>
                            <ul className="space-y-1 text-center lg:text-left">
                                <li><a href="/post-a-job" className="text-gray-600 hover:text-gray-800">Post a Job</a></li>
                                <li><a href="/my-posted-job" className="text-gray-600 hover:text-gray-800">My Posted Jobs</a></li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Footer Copyright */}
                <p className="text-center text-gray-600 opacity-50 pt-11 text-sm">
                    © All rights reserved. Made by Phan Thi Thu Trang
                </p>
            </div>
        </footer>
    );
};

export default Footer;
