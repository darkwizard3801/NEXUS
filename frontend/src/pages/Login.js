import React, { useContext, useState } from 'react';
import loginIcons from '../assest/signin.gif';
import { FaEye, FaEyeSlash, FaGoogle, FaFacebookF } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

import { Link, useNavigate,Navigate } from 'react-router-dom';
import SummaryApi from '../common';
import { toast } from 'react-toastify';
import Context from '../context';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

// Styled component for floating animation
const FloatingImage = styled.img`
  animation: float 3s ease-in-out infinite;
  
  @keyframes float {
    0% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
    100% {
      transform: translateY(0px);
    }
  }
`;

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
        <section className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
            <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 transition-all duration-300">
                {/* Header Section */}
                <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-6 relative">
                        <FloatingImage 
                            src={loginIcons} 
                            alt="login" 
                            className="w-full h-full object-contain"
                        />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
                        Welcome Back
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Sign in to continue to your account
                    </p>
                </div>

                {/* Login Form */}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        {/* Email Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <input
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    onChange={handleOnChange}
                                    className="appearance-none relative block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl placeholder-gray-500 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 transition-all duration-300"
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={data.password}
                                    onChange={handleOnChange}
                                    className="appearance-none relative block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl placeholder-gray-500 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 transition-all duration-300"
                                    placeholder="Enter your password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(prev => !prev)}
                                    className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                                >
                                    {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                                </button>
                            </div>
                            <div className="flex justify-end mt-2">
                                <Link 
                                    to="/forgot-password"
                                    className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 font-medium"
                    >
                        Sign in
                    </button>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                                Or continue with
                            </span>
                        </div>
                    </div>

                    {/* Social Login */}
                    <div>
                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-300"
                        >
                            <FcGoogle size={20} />
                            <span>Sign in with Google</span>
                        </button>
                    </div>

                    {/* Sign Up Link */}
                    <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                        Don't have an account?{' '}
                        <Link 
                            to="/sign-up"
                            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                        >
                            Sign up
                        </Link>
                    </p>
                </form>
            </div>
        </section>
    );
};

export default Login;