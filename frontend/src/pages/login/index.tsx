import { useEffect, useState } from 'react';
import { login } from '../../api/accountService';
import { useRouter } from 'next/router';
import RootLayout from '../../app/layout';
import { FaRegEnvelope } from "react-icons/fa";
import { MdLockOutline } from 'react-icons/md';
import Image from 'next/image';
import Logo from '../../app/assets/images/WorkNest_full.png';
import Link from 'next/link';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const savedEmail = localStorage.getItem('savedEmail');
        const savedRememberMe = localStorage.getItem('rememberMe') === 'true';
        if (savedEmail && savedRememberMe) {
            setEmail(savedEmail);
            setRememberMe(savedRememberMe);
        }
    }, []);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const response: any = await login({ email, password });

            if (!response) {
                console.error("Response is null or undefined");
                return;
            }


            // Lưu email và trạng thái Remember Me vào local storage
            if (rememberMe) {
                localStorage.setItem('savedEmail', email);
                localStorage.setItem('rememberMe', 'true');
            } else {
                localStorage.removeItem('savedEmail');
                localStorage.removeItem('rememberMe');
            }

            localStorage.setItem('userToken', response.token);
            localStorage.setItem('userRole', response.role);


            if (response.role == "Admin") {
                router.push('/admin/welcome');
            } else {
                if (response.status == true) {
                    router.push('/home');
                }
                else {
                    router.push('/account-locked');
                }
            }

            // Proceed to the home page
        } catch (error: any) {
            setError(error.response.data.error);
        }
    };

    return (
        <RootLayout>
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gray-100">
        <main className="flex flex-col items-center justify-center w-full flex-1 px-4 sm:px-20 text-center">
            <div className="bg-white rounded-2xl shadow-2xl flex flex-col sm:flex-row w-full sm:w-2/3 max-w-4xl">
                {/* Left Section */}
                <div className="w-full sm:w-3/5 p-5">
                    <div className="text-left font-bold pt-2 pl-2">
                        <Image src={Logo} alt="Logo" width={100} />
                    </div>
                    <div className="py-10">
                        <h2 className="text-3xl font-bold text-primary-color mb-2">
                            Sign in to Account
                        </h2>
                        <div className="border-2 w-10 border-primary-color inline-block mb-2"></div>
                        <div className="flex justify-center my-2">
                            <div className="flex flex-col items-center">
                                <form onSubmit={handleSubmit}>
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
                                    {error && (
                                        <p className="text-red-500 text-xs mt-2 mb-2">
                                            {error}
                                        </p>
                                    )}

                                    <div className="flex justify-between w-64 sm:w-80 mb-5">
                                        <label className="flex items-center text-xs text-black-color">
                                            <input
                                                type="checkbox"
                                                name="remember"
                                                className="mr-1"
                                                checked={rememberMe}
                                                onChange={() => setRememberMe(!rememberMe)}
                                            />
                                            Remember me
                                        </label>
                                        <Link href="/forgot-password" className="text-xs text-black-color">Forgot Password? </Link>
                                    </div>
                                    <button
                                        type="submit"
                                        className="border-2 border-primary-color text-primary-color rounded-full 
                                            px-12 py-2 inline-block font-semibold
                                            hover:text-white hover:bg-primary-color"
                                    >
                                        Sign In
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Section */}
                <div className="w-full sm:w-2/5 bg-primary-color text-white rounded-tr-2xl rounded-br-2xl py-10 sm:py-36 px-8 sm:px-12">
                    <h2 className="text-3xl font-bold mb-2">
                        Hello, Friend!
                    </h2>
                    <div className="border-2 w-10 border-white inline-block mb-2"></div>
                    <p className="mb-10">Fill up personal information and start your journey with us.</p>
                    <Link href="/sign-up" className="border-2 border-white rounded-full px-12 py-2 
                        inline-block font-semibold
                        hover:bg-white hover:text-primary-color">
                        Sign Up
                    </Link>
                </div>
            </div>
        </main>
    </div>
</RootLayout>

    );
};

export default LoginPage;
