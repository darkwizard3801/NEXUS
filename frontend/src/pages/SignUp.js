import React, { useState } from 'react';
import loginIcons from '../assest/signin.gif';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from 'react-router-dom';
import imageTobase64 from '../helpers/imageTobase64';
import SummaryApi from '../common';
import { ToastContainer, toast } from 'react-toastify';
// import { FaFacebook, FaGoogle } from 'react-icons/fa';
import { FcGoogle } from "react-icons/fc";

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [data, setData] = useState({
    email: "",
    password: "",
    name: "",
    confirmPassword: "",
    profilePic: "",
    role: "",
  });
  const navigate = useNavigate();

  // Email validation function
  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.(in|co\.in|com|org|edu|biz|gov|net)$/;
    return re.test(String(email).toLowerCase());
  };
  

  // Password validation function
  const validatePassword = (password) => {
    return password.length >= 6; // You can add more criteria here (uppercase, number, etc.)
  };

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Perform live validation
    if (name === "email" && !validateEmail(value)) {
      setErrors((prev) => ({ ...prev, email: "Invalid email address" }));
    } else if (name === "email") {
      setErrors((prev) => ({ ...prev, email: null }));
    }

    if (name === "password" && !validatePassword(value)) {
      setErrors((prev) => ({ ...prev, password: "Password must be at least 6 characters long" }));
    } else if (name === "password") {
      setErrors((prev) => ({ ...prev, password: null }));
    }

    if (name === "confirmPassword" && value !== data.password) {
      setErrors((prev) => ({ ...prev, confirmPassword: "Passwords do not match" }));
    } else if (name === "confirmPassword") {
      setErrors((prev) => ({ ...prev, confirmPassword: null }));
    }
  };

  const handleUploadPic = async (e) => {
    const file = e.target.files[0];
    const imagePic = await imageTobase64(file);
    setData((prev) => ({
      ...prev,
      profilePic: imagePic,
    }));
  };

  const handleNextStep = () => {
    if (!validateEmail(data.email)) {
      toast.error("Invalid email address");
      return;
    }
    if (data.password === data.confirmPassword && validatePassword(data.password)) {
      setFormStep(2);
    } else {
      toast.error("Please check password and confirm password");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dataResponse = await fetch(SummaryApi.signUP.url, {
      method: SummaryApi.signUP.method,
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const dataApi = await dataResponse.json();

    if (dataApi.success) {
      toast.success(dataApi.message);
      navigate("/verify-email");
    } else if (dataApi.error) {
      toast.error(dataApi.message);
    }
    if (dataResponse.status === 409) {
      toast.error("Duplicate account detected. Please sign in instead.");
    } else {
      toast.error(dataApi.message);
    }
  };

  const handleGoogleLogin = () => {
    window.open('https://nexus-q4sy.onrender.com/auth/google', '_self');
  };

  const handleFacebookLogin = () => {
    window.open('https://nexus-q4sy.onrender.com/auth/facebook', '_self');
  };

  return (
    <section id='signup' className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className='container mx-auto px-4 max-w-6xl'>
        <div className='bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg max-w-md mx-auto'>
          <div className='w-20 h-20 mx-auto relative overflow-hidden rounded-full'>
            <img src={data.profilePic || loginIcons} alt='login icons' className="w-full h-full object-cover" />
            <form>
              <label>
                <div className='text-xs bg-opacity-80 bg-slate-200 pb-4 pt-2 cursor-pointer text-center absolute bottom-0 w-full'>
                  Upload Photo
                </div>
                <input 
                  type='file' 
                  className='hidden' 
                  onChange={handleUploadPic} 
                  accept="image/*" 
                />
              </label>
            </form>
          </div>

          <h2 className="font-merienda text-4xl font-bold text-center text-gray-800 dark:text-white mb-6">
            Create Account
          </h2>

          <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
            {formStep === 1 && (
              <>
                <div className='grid'>
                  <label className="text-gray-700 dark:text-gray-200 mb-2">Username</label>
                  <div className='bg-gray-50 dark:bg-gray-700 p-3 rounded-xl'>
                    <input
                      type='text'
                      placeholder='Enter your username'
                      name='name'
                      value={data.name}
                      onChange={handleOnChange}
                      required
                      className='w-full outline-none bg-transparent dark:text-white'
                    />
                  </div>
                </div>

                <div className='grid'>
                  <label className="text-gray-700 dark:text-gray-200 mb-2">Email</label>
                  <div className='bg-gray-50 dark:bg-gray-700 p-3 rounded-xl'>
                    <input
                      type='email'
                      placeholder='Enter email'
                      name='email'
                      value={data.email}
                      onChange={handleOnChange}
                      required
                      className='w-full outline-none bg-transparent dark:text-white'
                    />
                  </div>
                  {errors.email && <p className='text-red-500 text-sm mt-1'>{errors.email}</p>}
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
                      required
                      className='w-full outline-none bg-transparent dark:text-white'
                    />
                    <div className='cursor-pointer text-xl text-gray-600 dark:text-gray-300' onClick={() => setShowPassword((prev) => !prev)}>
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </div>
                  </div>
                  {errors.password && <p className='text-red-500 text-sm mt-1'>{errors.password}</p>}
                </div>

                <div>
                  <label className="text-gray-700 dark:text-gray-200 mb-2">Confirm Password</label>
                  <div className='bg-gray-50 dark:bg-gray-700 p-3 flex rounded-xl'>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder='Confirm password'
                      value={data.confirmPassword}
                      name='confirmPassword'
                      onChange={handleOnChange}
                      required
                      className='w-full outline-none bg-transparent dark:text-white'
                    />
                    <div className='cursor-pointer text-xl text-gray-600 dark:text-gray-300' onClick={() => setShowConfirmPassword((prev) => !prev)}>
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </div>
                  </div>
                  {errors.confirmPassword && <p className='text-red-500 text-sm mt-1'>{errors.confirmPassword}</p>}
                </div>

                {/* Social Media Login Section */}
                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white dark:bg-gray-800 px-4 text-sm text-gray-500 dark:text-gray-400">
                      or sign up with
                    </span>
                  </div>
                </div>

                <div className="flex justify-center gap-4">
                  <button 
                    type="button" 
                    className="flex items-center justify-center gap-2 bg-black hover:bg-gray-800 text-white px-6 py-2.5 rounded-full hover:scale-105 transition-all w-full max-w-[200px]"
                    onClick={handleGoogleLogin}
                  >
                    <FcGoogle className="text-xl" />
                    Google
                  </button>
                </div>

                <button 
                  type='button' 
                  className='bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-full hover:scale-105 transition-all mx-auto block mt-6 w-full max-w-[200px] font-medium'
                  onClick={handleNextStep}
                >
                  Continue
                </button>
              </>
            )}

            {formStep === 2 && (
              <>
                <div>
                  <label className="text-gray-700 dark:text-gray-200 mb-2">Role</label>
                  <div className='bg-gray-50 dark:bg-gray-700 p-3 rounded-xl'>
                    <select 
                      name="role" 
                      value={data.role} 
                      onChange={handleOnChange} 
                      className='w-full outline-none bg-transparent dark:text-white'
                    >
                      <option value="">Select Role</option>
                      <option value="Vendor">Vendor</option>
                      <option value="Customer">Customer</option>
                    </select>
                  </div>
                </div>
                <button 
                  type='submit' 
                  className='bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-full hover:scale-105 transition-all mx-auto block mt-6 w-full max-w-[200px] font-medium'
                >
                  Sign Up
                </button>
              </>
            )}
          </form>

          <p className='text-center mt-8 text-gray-600 dark:text-gray-300'>
            Already have an account? {' '}
            <Link to={"/login"} className='text-red-600 hover:text-red-700 hover:underline'>
              Login
            </Link>
          </p>
        </div>
      </div>
      <ToastContainer position='bottom-center' />
    </section>
  );
};

export default SignUp;
