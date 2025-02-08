import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { FaBars, FaUser } from 'react-icons/fa';
import Image from 'next/image';
import Logo from '../app/assets/images/WorkNest_full.png';
import { home } from '@/api/accountService';

const Header: React.FC = () => {
    const router = useRouter();
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const [userToken, setUserToken] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<number | null>(null);
    const [fullName, setFullName] = useState<string>('User'); 
    const [status, setStatus] = useState<boolean>(true);  
    const [dropdownTimeout, setDropdownTimeout] = useState<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('userToken');
        if (token) {
            setUserToken(token);
            fetchUserInfo(token);
        }
    }, []);

    const fetchUserInfo = async (token: string | null) => {
        if (!token) return;

        try {
            const response: any = await home();
            setFullName(response.fullName);
            setUserRole(response.accountRole); 
            setStatus(response.status); // Lấy status từ server và lưu trữ trong state
            
            localStorage.setItem('userId', response.userId);
            if(response.status == false){
                router.push('/account-locked');
            }
        } catch (error: any) {
            console.error('Error fetching user info:', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('userToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userId');

        router.push('/login');
    };

    const openDropdown = () => {
        if (dropdownTimeout) clearTimeout(dropdownTimeout);
        setDropdownOpen(true);
    };

    const closeDropdown = () => {
        const timeoutId = setTimeout(() => {
            setDropdownOpen(false);
        }, 100);
        setDropdownTimeout(timeoutId);
    };

    const handlePostJob = () => {
        if (status) { 
            router.push('/post-a-job');
        }
    };

    const handleSuitableJob = () => {
        if (status) { 
            router.push('/suitable-jobs');
        }
    };
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
      setIsMobileMenuOpen(!isMobileMenuOpen);
    };
  
    const menuRef = useRef<HTMLDivElement | null>(null);


      // Đóng menu khi nhấn ngoài menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false); // Đóng menu khi nhấn ngoài
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    // Cleanup listener khi component unmount
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

    // Check current tab
    const isActiveLink = (path: string) => router.pathname === path;

    return (
        <header className="flex items-center p-6 bg-white site-header shadow-md">
  {/* Logo */}
  <div className="flex items-center space-x-4 pr-[250px] lg:pl-6 pb-2">
    <a href="/home" className="flex-shrink-0">
      <Image src={Logo} alt="Logo" className="h-8 w-auto" width={150} height={50} />
    </a>
  </div>

  {/* Main Navigation */}
  <nav className="flex-grow flex justify-between items-center">
    {/* Menu items (Desktop and larger screens) */}
    <ul className="hidden lg:flex space-x-6">
      <li>
        <a
          href="/home"
          className={`font-semibold ${isActiveLink('/home') ? 'text-primary-color' : 'text-black-color'} hover:text-yellow-color`}
        >
          Home
        </a>
      </li>
      <li>
        <a
          href="/jobs"
          className={`font-semibold ${isActiveLink('/jobs') ? 'text-primary-color' : 'text-black-color'} hover:text-yellow-color`}
        >
          Jobs
        </a>
      </li>
      <li>
        <a
          href="/employers"
          className={`font-semibold ${isActiveLink('/employers') ? 'text-primary-color' : 'text-black-color'} hover:text-yellow-color`}
        >
          Employers
        </a>
      </li>
      <li>
        <a
          href="/sample-cv"
          className={`font-semibold ${isActiveLink('/sample-cv') ? 'text-primary-color' : 'text-black-color'} hover:text-yellow-color`}
        >
          Sample CV
        </a>
      </li>
      <li>
        <a
          href="/contact-us"
          className={`font-semibold ${isActiveLink('/contact-us') ? 'text-primary-color' : 'text-black-color'} hover:text-yellow-color`}
        >
          Contact Us
        </a>
      </li>
      {userRole === 2 && (
        <li>
          <button
            onClick={handlePostJob}
            disabled={!status}
            className={`font-semibold ${isActiveLink('/post-a-job') ? 'text-primary-color' : 'text-yellow-color'} hover:text-primary-color ${!status ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            Post a Job
          </button>
        </li>
      )}
      {userRole === 1 && (
        <li>
          <button
            onClick={handleSuitableJob}
            disabled={!status}
            className={`font-semibold ${isActiveLink('/suitable-jobs') ? 'text-primary-color' : 'text-yellow-color'} hover:text-primary-color ${!status ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            Suitable Job For You
          </button>
        </li>
      )}
    </ul>

    {/* Hello and Dropdown Menu */}
    {userToken ? (
      <div className="hidden lg:flex relative items-center space-x-1 ml-auto text-black-color" onMouseEnter={openDropdown} onMouseLeave={closeDropdown}>
        <span className="text-black-color">
          Hello, <span className="text-primary-color font-bold">{fullName}</span>
        </span>
        <FaUser className="text-black-color" />
        {isDropdownOpen && (
          <div
            className="absolute bg-white right-0 shadow-lg top-full mt-1 rounded-lg z-10"
            onMouseEnter={openDropdown}
            onMouseLeave={closeDropdown}
          >
            <ul className="flex flex-col p-2 space-y-2">
              {userRole === 1 && <li><a href="/my-profile" className="block px-4 py-2 hover:bg-gray-200">Your Profile</a></li>}
              {userRole === 2 && <li><a href="/my-company-profile" className="block px-4 py-2 hover:bg-gray-200">Your Profile</a></li>}
              {userRole === 1 && <li><a href="/my-applied-jobs" className="block px-4 py-2 hover:bg-gray-200">Your Applied Jobs</a></li>}
              {userRole === 2 && <li><a href="/my-posted-jobs" className="block px-4 py-2 hover:bg-gray-200">Your Posted Jobs</a></li>}
              {userRole === 2 && <li><a href="/my-pending-jobs" className="block px-4 py-2 hover:bg-gray-200">Your Pending Jobs</a></li>}
              <li><a href="/change-password" className="block px-4 py-2 hover:bg-gray-200">Change Password</a></li>
              <li>
                <button onClick={handleLogout} className="block w-full text-left px-4 py-2 hover:bg-red-500 hover:text-white">Logout</button>
              </li>
            </ul>
          </div>
        )}
      </div>
    ) : (
      <div className="hidden lg:flex space-x-4 ml-auto">
        <button
          onClick={() => router.push('/login')}
          className="border-2 border-primary-color rounded-md px-5 py-2 inline-block font-semibold text-primary-color hover:bg-yellow-color hover:border-yellow-color hover:text-white"
        >
          Sign In
        </button>
        <button
          onClick={() => router.push('/sign-up')}
          className="border-2 border-primary-color rounded-md px-5 py-2 inline-block font-semibold text-white bg-primary-color hover:bg-yellow-color hover:border-yellow-color"
        >
          Sign Up
        </button>
      </div>
    )}
    
    {/* Hamburger Icon for mobile */}
    <div className="lg:hidden flex items-center space-x-4">
      <button onClick={toggleMobileMenu} className="text-black-color">
        <FaBars className="text-xl" />
      </button>
    </div>
  </nav>

  {/* Slide-in Menu (Mobile) */}
  <div
    ref={menuRef}
    className={`fixed top-0 right-0 w-2/3 sm:w-1/2 bg-white h-full shadow-md z-50 transform transition-transform duration-300 ease-in-out
                ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
  >
    <ul className="flex flex-col p-6 space-y-4">
      <li><a href="/home" className="font-semibold text-black-color hover:text-yellow-color">Home</a></li>
      <li><a href="/jobs" className="font-semibold text-black-color hover:text-yellow-color">Jobs</a></li>
      <li><a href="/employers" className="font-semibold text-black-color hover:text-yellow-color">Employers</a></li>
      <li><a href="/sample-cv" className="font-semibold text-black-color hover:text-yellow-color">Sample CV</a></li>
      <li><a href="/contact-us" className="font-semibold text-black-color hover:text-yellow-color">Contact Us</a></li>
      {userRole === 2 && <li><a href="/post-a-job" className="font-semibold text-black-color hover:text-yellow-color ">Post A Job</a></li>}
      {userRole === 1 && <li><a href="/suitable-jobs" className="font-semibold text-black-color hover:text-yellow-color ">Suitable Job For You</a></li>}

      
      {/* User Dropdown inside the slide menu */}
      {userToken && (
        <div className="flex flex-col space-y-4 !mt-[30px]">
          <div className="flex items-center space-x-1 text-black-color">
            <span className="text-black-color">Hello, <span className="text-primary-color font-bold">{fullName}</span></span>
          </div>

          <ul className="flex flex-col">
            {userRole === 1 && <li><a href="/my-profile" className="block px-4 py-2 ">Your Profile</a></li>}
            {userRole === 2 && <li><a href="/my-company-profile" className="block px-4 py-2">Your Profile</a></li>}
            {userRole === 1 && <li><a href="/my-applied-jobs" className="block px-4 py-2 ">Your Applied Jobs</a></li>}
            {userRole === 2 && <li><a href="/my-posted-jobs" className="block px-4 py-2 ">Your Posted Jobs</a></li>}
            {userRole === 2 && <li><a href="/my-pending-jobs" className="block px-4 py-2 ">Your Pending Jobs</a></li>}
            <li><a href="/change-password" className="block px-4 py-2 ">Change Password</a></li>
            <li>
              <button onClick={handleLogout} className="w-full mt-2 border-2 border-primary-color rounded-md px-5 py-2 inline-block font-semibold text-primary-color hover:bg-yellow-color hover:border-yellow-color hover:text-white">Logout</button>
            </li>
          </ul>
        </div>
      )}

      {!userToken && (
        <div className="flex flex-col space-y-4">
          <button
            onClick={() => router.push('/login')}
            className="mt-2 border-2 border-primary-color rounded-md px-5 py-2 inline-block font-semibold text-primary-color hover:bg-yellow-color hover:border-yellow-color hover:text-white"
          >
            Sign In
          </button>
          <button
            onClick={() => router.push('/sign-up')}
            className="border-2 border-primary-color rounded-md px-5 py-2 inline-block font-semibold text-white bg-primary-color hover:bg-yellow-color hover:border-yellow-color"
          >
            Sign Up
          </button>
        </div>
      )}
    </ul>
  </div>


   {/* Lớp phủ opacity */}
   {isMobileMenuOpen && (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={toggleMobileMenu}></div>
  )}

</header>

      
      );
    };
    
    export default Header;