import { useState } from 'react';
import { useRouter } from 'next/router';
import RootLayout from '../../app/layout';
import { FaRegEnvelope } from "react-icons/fa"; 
import { MdLockOutline } from 'react-icons/md'; 
import Image from 'next/image'; 
import Logo from '../../app/assets/images/WorkNest_full.png';
import Link from 'next/link';
import { SiNamebase } from "react-icons/si";
import { FaRegUser } from "react-icons/fa"; 
import { register } from '@/api/accountService';

const SignUpPage = () => {
    const [username, setUsername] = useState('');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('Candidate'); 
    const [error, setError] = useState('');
    const router = useRouter();
    const [acceptPolicies, setAcceptPolicies] = useState(false); // New state for accepting terms

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
 
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (!acceptPolicies) {  // Check if terms are accepted
            setError("You must accept the policies to sign up.");
            return;
        }
 
        const userData = {
            username,
            fullName,
            email,
            password,
            role,
        };
 
        try { 
            const response: any = await register({ username, fullName, email, password, role });

            if (!response) {
                console.error("Response is null or undefined");
                return;
            }

            router.push('/login');
        } catch (error: any) {
            if (error.response && error.response.data) {
                if (Array.isArray(error.response.data)) {
                    const requirements: any = {
                        PasswordTooShort: "at least 8 characters",
                        PasswordRequiresNonAlphanumeric: "at least one non alphanumeric character",
                        PasswordRequiresLower: "at least one lowercase ('a'-'z')",
                        PasswordRequiresUpper: "at least one uppercase ('A'-'Z')",
                    };
    
                    const errorMessages = error.response.data.map((err: { code: string }) => requirements[err.code]).filter(Boolean);
                    
                    const combinedMessage = `Passwords must be ${errorMessages.join(', ')}.`;
                    setError(combinedMessage);
                } else if (error.response.data.error) {
                    setError(error.response.data.error);
                } else {
                    setError("An unexpected error occurred. Please try again.");
                }
            } else {
                setError("An unexpected error occurred. Please try again.");
            }
        }
    };

    return (
        <RootLayout>
        <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gray-100">
            <main className="flex flex-col items-center justify-center w-full flex-1 px-4 sm:px-20 text-center">
                <div className="bg-white rounded-2xl shadow-2xl flex flex-col sm:flex-row w-full sm:w-2/3 max-w-4xl">
                    {/* Left Section */}
                    <div className="w-full sm:w-2/5 bg-primary-color text-white rounded-tl-2xl sm:rounded-bl-2xl rounded-bl-none rounded-tr-2xl sm:rounded-tr-none py-12 sm:py-36 px-8 sm:px-12">


                        <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                            Welcome!
                        </h2>
                        <div className="border-2 w-10 border-white inline-block mb-2"></div>
                        <p className="text-sm sm:text-base mb-10">Create your account and start your journey with us.</p>
                        <Link href="/login" className="border-2 border-white rounded-full px-12 py-2 inline-block font-semibold hover:bg-white hover:text-primary-color">
                            Sign In
                        </Link>
                    </div>
                    {/* Right Section */}
                    <div className="w-full sm:w-3/5 p-5">
                        <div className="text-left font-bold pt-2 pl-2">
                            <Image src={Logo} alt="Logo" width={100} />
                        </div>
                        <div className="py-10">
                            <h2 className="text-3xl font-bold text-primary-color mb-2">
                                Create an Account
                            </h2>
                            <div className="border-2 w-10 border-primary-color inline-block mb-2"></div>
                            <div className="flex justify-center my-2">                                         
                                <div className="flex flex-col items-center">
                                    <form onSubmit={handleSubmit} className="flex flex-col items-center">
                                        <div className="bg-gray-100 w-64 sm:w-80 p-2 flex items-center mb-3">
                                            <FaRegUser className="text-gray-400 m-2" />                                           
                                            <input
                                                type="text"
                                                id="username"
                                                placeholder="Username"
                                                className="bg-gray-100 outline-none text-sm flex-1 text-black-color" 
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="bg-gray-100 w-64 sm:w-80 p-2 flex items-center mb-3">
                                            <SiNamebase className="text-gray-400 m-2" />
                                            <input
                                                type="text"
                                                id="fullName"
                                                placeholder="Full Name"
                                                className="bg-gray-100 outline-none text-sm flex-1 text-black-color" 
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="bg-gray-100 w-64 sm:w-80 p-2 flex items-center mb-3">
                                            <FaRegEnvelope className="text-gray-400 m-2" />
                                            <input
                                                type="email"
                                                id="email"
                                                placeholder="Email"
                                                className="bg-gray-100 outline-none text-sm flex-1 text-black-color" 
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="bg-gray-100 w-64 sm:w-80 p-2 flex items-center mb-3">
                                            <MdLockOutline className="text-gray-400 m-2" />
                                            <input 
                                                type="password" 
                                                name="password" 
                                                placeholder="Password" 
                                                className="bg-gray-100 outline-none text-sm flex-1 text-black-color" 
                                                value={password} 
                                                onChange={(e) => setPassword(e.target.value)} 
                                                required 
                                            />
                                        </div>
                                        <div className="bg-gray-100 w-64 sm:w-80 p-2 flex items-center mb-3">
                                            <MdLockOutline className="text-gray-400 m-2" />
                                            <input 
                                                type="password" 
                                                name="confirm-password" 
                                                placeholder="Confirm Password" 
                                                className="bg-gray-100 outline-none text-sm flex-1 text-black-color" 
                                                value={confirmPassword} 
                                                onChange={(e) => setConfirmPassword(e.target.value)} 
                                                required 
                                            />
                                        </div>
    
                                        {/* Role Selection */}
                                        <div className="flex justify-evenly mb-4">
                                            <label className={`custom-radio ${role === 'Candidate' ? 'selected' : ''}`}>
                                                <input 
                                                    type="radio" 
                                                    value="Candidate" 
                                                    checked={role === 'Candidate'} 
                                                    onChange={() => setRole('Candidate')} 
                                                />
                                                <span className="checkmark"></span>
                                                Candidate
                                            </label>
                                            <label className={`custom-radio ${role === 'Employer' ? 'selected' : ''}`}>
                                                <input 
                                                    type="radio" 
                                                    value="Employer" 
                                                    checked={role === 'Employer'} 
                                                    onChange={() => setRole('Employer')} 
                                                />
                                                <span className="checkmark"></span>
                                                Employer
                                            </label>
                                        </div>
    
                                        {/* Terms and Conditions */}
                                        <div className="mt-4 flex items-center">
    <input 
        type="checkbox" 
        checked={acceptPolicies}
        onChange={() => setAcceptPolicies(!acceptPolicies)}
        className="mr-2"
    />
    <label className="text-black-color text-sm">
        I accept the 
        <Link href="/policy" className="text-primary-color ml-1">terms and conditions</Link> <br/>
        and certify that I am over 18 years old.
    </label>
</div>
    
                                        {error && (
                                            <p className="text-red-500 text-xs mt-5 max-w-[250px] mx-auto">
                                                {error}
                                            </p>
                                        )}
    
                                        <button 
                                            type="submit"  
                                            className="border-2 border-primary-color text-primary-color rounded-full 
                                            px-12 py-2 inline-block font-semibold
                                            hover:text-white hover:bg-primary-color mt-5"
                                        >
                                            Sign Up
                                        </button>
                                    </form>
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

export default SignUpPage;
