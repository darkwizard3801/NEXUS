import React, { useContext, useState } from 'react';
import loginIcons from '../assest/signin.gif';
import { FaEye, FaEyeSlash, FaGoogle, FaFacebookF } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

import { Link, useNavigate,Navigate } from 'react-router-dom';
import SummaryApi from '../common';
import { toast } from 'react-toastify';
import Context from '../context';
import { useSelector } from 'react-redux';

const Login = () => {
    const user = useSelector(state => state.user.user);
    const [showPassword, setShowPassword] = useState(false);
    const [data, setData] = useState({
        email: "",
        password: ""
    });
    const navigate = useNavigate();
    const { fetchUserDetails } = useContext(Context);
    if (user?._id) {
        return <Navigate to="/" replace />;
      }

    const handleOnChange = (e) => {
        const { name, value } = e.target;

        setData((prev) => ({
            ...prev,
            [name]: value
        }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dataResponse = await fetch(SummaryApi.signIn.url, {
                method: SummaryApi.signIn.method,
                credentials: 'include',
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify(data)
            });

            const dataApi = await dataResponse.json();
            console.log("Login response:", dataApi); // Log the entire response for debugging

            // Check if the response has a success property
            if (dataApi.success) {
                // Use a fallback message
                const userDetailsResponse = await fetch(SummaryApi.current_user.url, {
                    method: SummaryApi.current_user.method,
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                const userDetails = await userDetailsResponse.json();
                console.log("User details response:", userDetails); // Log user details response

                if (userDetails && userDetails.data && userDetails.data.role) {
                    const userRole = userDetails.data.role;
                    const isVerified = userDetails.data.isVerified;

                    if (!isVerified) {
                        toast.error("Please verify your email before proceeding.");
                        return; // Prevent further execution if email is not verified
                    }

                    if (userRole === "Vendor") {
                        navigate("/");
                        fetchUserDetails();
                        toast.success(dataApi.message || "Login successful");

                        
                    } else if (userRole === "Customer") {
                        navigate("/",{ replace: true });
                        
                         
                        fetchUserDetails();
                        toast.success(dataApi.message || "Login successful");

                        
                    } 
                    else if (userRole === "Admin") {
                        navigate("/",{ replace: true });
                        
                         
                        fetchUserDetails();
                        toast.success(dataApi.message || "Login successful");

                        
                    }else {
                        toast.error("Invalid role");
                    }
                } else {
                    toast.error("Failed to retrieve user details");
                    console.error("User details response does not contain role:", userDetails);
                }
            } else {
                toast.error(dataApi.message || "Login failed");
            }
        } catch (error) {
            toast.error("An error occurred. Please try again.");
            console.error("Error during login or fetching user details:", error);
        }
    };

    const handleGoogleLogin = () => {
        // Trigger Google OAuth login
        window.open(`${process.env.REACT_APP_BACKEND_URL}/auth/google`, "_self");

        // Assuming the backend redirects back to the frontend with user data after successful login
        window.addEventListener('message', async (event) => {
            if (event.origin !== process.env.REACT_APP_BACKEND_URL) return; // Ensure the event is from your backend

            const { success, isNewUser, role } = event.data;

            if (success) {
                if (isNewUser || !role) {
                    // If the user is new or has no role, navigate to role selection
                    navigate("/select-role");
                } else {
                    // If the user has a role, redirect based on their role
                    if (role === "Vendor") {
                        navigate("/vendor-page");
                    } else if (role === "Customer") {
                        navigate("/");
                    } else if (role === "Admin") {
                        navigate("/");
                        fetchUserDetails();
                    } else {
                        toast.error("Invalid role");
                    }
                }
            } else {
                toast.error("Google login failed");
            }
        });
    };

    // const handleFacebookLogin = () => {
    //     window.open("https://nexus-q4sy.onrender.com/auth/facebook", "_self");
    // };

    return (
        <section id='login' className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
            <div className='container mx-auto px-4 max-w-6xl'>
                <div className='bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg max-w-md mx-auto'>
                    <div className='w-20 h-20 mx-auto'>
                        <img src={loginIcons} alt='login icons' className="w-full h-full object-contain" />
                    </div>

                    <h2 className="font-merienda text-4xl font-bold text-center text-gray-800 dark:text-white mb-6">
                        Welcome Back
                    </h2>

                    <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
                        <div className='grid'>
                            <label className="text-gray-700 dark:text-gray-200 mb-2">Email</label>
                            <div className='bg-gray-50 dark:bg-gray-700 p-3 rounded-xl'>
                                <input
                                    type='email'
                                    placeholder='Enter email'
                                    name='email'
                                    value={data.email}
                                    onChange={handleOnChange}
                                    className='w-full outline-none bg-transparent dark:text-white'
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-gray-700 dark:text-gray-200 mb-2">Password</label>
                            <div className='bg-gray-50 dark:bg-gray-700 p-3 flex rounded-xl'>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder='Enter password'
                                    value={data.password}
                                    name='password'
                                    onChange={handleOnChange}
                                    className='w-full outline-none bg-transparent dark:text-white'
                                />
                                <div className='cursor-pointer text-xl text-gray-600 dark:text-gray-300' onClick={() => setShowPassword((prev) => !prev)}>
                                    <span>
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </span>
                                </div>
                            </div>
                            <Link to={'/forgot-password'} className='block w-fit ml-auto mt-2 text-sm text-red-600 hover:text-red-700 hover:underline'>
                                Forgot password?
                            </Link>
                        </div>

                        <button className='bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-full hover:scale-105 transition-all mx-auto block mt-6 w-full max-w-[200px] font-medium'>
                            Login
                        </button>
                    </form>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-white dark:bg-gray-800 px-4 text-sm text-gray-500 dark:text-gray-400">
                                or Login with
                            </span>
                        </div>
                    </div>

                    <div className="flex justify-center gap-4">
                        <button 
                            onClick={handleGoogleLogin} 
                            className='flex items-center justify-center gap-2 bg-black hover:bg-gray-800 text-white px-6 py-2.5 rounded-full hover:scale-105 transition-all w-full max-w-[200px]'
                        >
                            <FcGoogle className='text-xl' />
                            Google
                        </button>
                    </div>

                    <p className='text-center mt-8 text-gray-600 dark:text-gray-300'>
                        Don't have an account? {' '}
                        <Link to={"/sign-up"} className='text-red-600 hover:text-red-700 hover:underline'>
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </section>
    )
}

export default Login;