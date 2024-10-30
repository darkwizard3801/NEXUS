import React, { useContext, useState } from 'react';
import loginIcons from '../assest/signin.gif';
import { FaEye, FaEyeSlash, FaGoogle, FaFacebookF } from "react-icons/fa";
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

                        
                    } else {
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
        window.open(SummaryApi.google_login.url, "_self");

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
                        navigate("/admin-page");
                    } else {
                        toast.error("Invalid role");
                    }
                }
            } else {
                toast.error("Google login failed");
            }
        });
    };

    const handleFacebookLogin = () => {
        window.open(`${process.env.REACT_APP_BACKEND_URL}/auth/facebook`, "_self");
    };

    return (
        <section id='login'>
            <div className='mx-auto container p-10'>

                <div className='bg-white p-5 w-full max-w-sm mx-auto rounded-3xl'>
                    <div className='w-20 h-20 mx-auto'>
                        <img src={loginIcons} alt='login icons' />
                    </div>

                    <form className='pt-6 flex flex-col gap-2 rounded-3xl' onSubmit={handleSubmit}>
                        <div className='grid'>
                            <label>Email :</label>
                            <div className='bg-slate-100 p-2 rounded-2xl'>
                                <input
                                    type='email'
                                    id='email'
                                    placeholder='Enter email'
                                    name='email'
                                    value={data.email}
                                    onChange={handleOnChange}
                                    className='w-full h-full outline-none bg-transparent'
                                />
                            </div>
                        </div>

                        <div>
                            <label>Password :</label>
                            <div className='bg-slate-100 p-2 flex rounded-2xl'>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder='Enter password'
                                    id='password'
                                    value={data.password}
                                    name='password'
                                    onChange={handleOnChange}
                                    className='w-full h-full outline-none bg-transparent'
                                />
                                <div className='cursor-pointer text-xl' onClick={() => setShowPassword((prev) => !prev)}>
                                    <span>
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </span>
                                </div>
                            </div>
                            <Link to={'/forgot-password'} className='block w-fit ml-auto hover:underline hover:text-red-600'>
                                Forgot password?
                            </Link>
                        </div>

                        <button className='bg-red-600 hover:bg-red-700 text-white px-6 py-2 w-full max-w-[150px] rounded-full hover:scale-110 transition-all mx-auto block mt-6' id='loginButton'>
                            Login
                        </button>
                    </form>
                    <br />
                    <label><center><b>or Login with</b></center></label>
                    <div className="flex justify-center mt-4 gap-4">
                        <button onClick={handleGoogleLogin} className='bg-red-500 hover:bg-red-600 text-white px-6 py-2 w-full max-w-[150px] rounded-full hover:scale-110 transition-all flex items-center justify-center'>
                            <FaGoogle className='mr-2' />
                            Google
                        </button>
                        <button onClick={handleFacebookLogin} className='bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 w-full max-w-[150px] rounded-full hover:scale-110 transition-all flex items-center justify-center'>
                            <FaFacebookF className='mr-2' />
                            Facebook
                        </button>
                    </div>

                    <p className='my-5'>Don't have an account? <Link to={"/sign-up"} className='text-red-600 hover:text-red-700 hover:underline'>Sign up</Link></p>
                </div>

            </div>
        </section>
    )
}

export default Login;
