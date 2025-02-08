import { useEffect, useRef, useState } from 'react';
import Header from '../../components/Header';
import RootLayout from '../../app/layout';
import { FaSearch } from 'react-icons/fa';
import { FaLocationDot } from 'react-icons/fa6';
import SearchPic from '../../app/assets/images/recruitment.png';
import Image from 'next/image';
import { useSpring, animated } from 'react-spring';
import { useRouter } from 'next/router';
import { counts } from '@/api/accountService';

const HomePage = () => {
    const [role, setRole] = useState<string | null>(null);
    const [jobOpportunities, setJobOpportunities] = useState(0);
    const [partnerCompanies, setPartnerCompanies] = useState(0);
    const [potentialCandidates, setPotentialCandidates] = useState(0);
    const [loaded, setLoaded] = useState(false);

    const sectionRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !loaded) {
                        fetchData();
                        setLoaded(true);
                        observer.disconnect();
                    }
                });
            },
            { threshold: 0.1 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => {
            if (sectionRef.current) {
                observer.unobserve(sectionRef.current);
            }
        };
    }, [loaded]);

    const fetchData = async () => {
        const response: any = await counts();
        setJobOpportunities(response.jobPostings);
        setPartnerCompanies(response.employers);
        setPotentialCandidates(response.candidates);
    };

    const animatedJobOpportunities = useSpring({
        number: jobOpportunities,
        from: { number: 0 },
        config: { duration: 1200 }
    });
    const animatedPartnerCompanies = useSpring({
        number: partnerCompanies,
        from: { number: 0 },
        config: { duration: 1200 }
    });
    const animatedPotentialCandidates = useSpring({
        number: potentialCandidates,
        from: { number: 0 },
        config: { duration: 1200 }
    });

    const [jobTitle, setJobTitle] = useState("");
    const [location, setLocation] = useState("");
    const router = useRouter();

    const handleSearch = () => {
        router.push({
            pathname: '/search',
            query: { jobTitle, location },
        });
    };


    return (
        (
            <RootLayout>
                <Header />
                <div>
                    <main className="bg-white text-black-color">
                        {/* SECTION 1 - Hero Section */}
                        <section className="bg-gradient-radial flex flex-col sm:flex-row items-center justify-between p-8 w-full gap-0 sm:gap-10 sm:h-[800px]">
                            {/* LEFT SIDE */}
                            <div className="text-center sm:text-left sm:w-1/2 w-full max-w-screen-lg mx-auto sm:mx-0 md:pl-[150px]">
                                <h1 className="text-5xl sm:text-6xl text-gray-800 font-bold mb-4">
                                    Find a job that aligns with <br /> your interests and skills
                                </h1>
                                <p className="mt-2 mb-8 text-gray-700">
                                    Thousands of jobs in all the leading sectors are waiting for you.
                                </p>

                                <div className="flex flex-col sm:flex-row md:items-center items-start w-full bg-white p-4 border border-gray-300 rounded-md mb-4">
                                    {/* Input Job Title */}
                                    <div className="flex items-center w-full sm:w-[calc(100%-2rem)] mb-4 sm:mb-0">
                                        <FaSearch className="text-primary-color m-2" />
                                        <input
                                            type="text"
                                            placeholder="Job title, keyword"
                                            className="flex-grow p-2 outline-none"
                                            value={jobTitle}
                                            onChange={(e) => setJobTitle(e.target.value)}
                                        />
                                    </div>

                                    <span className="mx-2 text-gray-200 hidden sm:block">|</span>

                                    {/* Input Location */}
                                    <div className="flex items-center w-full sm:w-[calc(100%-2rem)] mb-4 sm:mb-0">
                                        <FaLocationDot className="text-primary-color m-2" />
                                        <input
                                            type="text"
                                            placeholder="Location"
                                            className="flex-grow p-2 outline-none"
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                        />
                                    </div>

                                    {/* Button Find Job */}
                                    <button
                                        className="md:w-[300px] bg-primary-color text-white rounded-md py-4 px-6 hover:bg-yellow-color w-full sm:w-auto"
                                        onClick={handleSearch}
                                    >
                                        Find Job
                                    </button>
                                </div>

                                <p className="text-gray-500 mb-4">
                                    Suggestion: UI/UX Designer, Programming, Digital Marketing, Video, Animation...
                                </p>
                            </div>

                            {/* RIGHT SIDE - Image in the first section */}
                            <div className="flex justify-center sm:justify-end w-full sm:w-1/2 mt-6 sm:mt-0">
                                <Image
                                    src={SearchPic}
                                    alt="SearchPic"
                                    width={800}
                                    height={500}
                                    objectFit="contain"
                                    className="max-w-full"
                                />
                            </div>
                        </section>

                        {/* SECTION 2 - Job Opportunities, Companies, Candidates */}
                        <section ref={sectionRef} className="bg-white flex flex-col items-center justify-center p-8 w-full gap-10 my-10">
                            {/* Title */}
                            <h2 className="text-4xl font-bold text-gray-800 mb-4 text-center w-full ">
                                Explore Job Opportunities
                            </h2>
                            {/* Description */}
                            <p className="text-gray-600 mb-6 text-center sm:text-left max-w-2xl mx-auto">
                                Discover thousands of job opportunities from leading companies. Our team is here to support you in finding the perfect job that aligns with your skills and interests.
                            </p>

                            {/* Job Opportunities, Partner Companies, and Potential Candidates in one row */}
                            <div className="flex flex-wrap justify-center gap-8 w-full">
                                {/* Job Opportunities */}
                                <div className="flex flex-col items-center">
                                    <animated.h2 className="text-4xl font-bold text-primary-color">
                                        {animatedJobOpportunities.number.to((n) => Math.round(n).toString() + '+')}
                                    </animated.h2>
                                    <p className="text-gray-500">Career Opportunities</p>
                                </div>

                                {/* Partner Companies */}
                                <div className="flex flex-col items-center">
                                    <animated.h2 className="text-4xl font-bold text-primary-color">
                                        {animatedPartnerCompanies.number.to((n) => Math.round(n).toString() + '+')}
                                    </animated.h2>
                                    <p className="text-gray-500">Partner Companies</p>
                                </div>

                                {/* Potential Candidates */}
                                <div className="flex flex-col items-center">
                                    <animated.h2 className="text-4xl font-bold text-primary-color">
                                        {animatedPotentialCandidates.number.to((n) => Math.round(n).toString() + '+')}
                                    </animated.h2>
                                    <p className="text-gray-500">Potential Candidates</p>
                                </div>
                            </div>

                            <button
                                onClick={() => router.push('/jobs')}
                                className="border-2 border-primary-color text-primary-color rounded-md py-4 px-6 ml-2 inline-block font-semibold hover:text-white hover:bg-primary-color mt-6"
                            >
                                Discover Here!
                            </button>
                        </section>

                    </main>
                </div>
            </RootLayout>
        )
    );
};

export default HomePage;
