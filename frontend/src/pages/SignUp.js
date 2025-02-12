import React, { useState } from 'react';
import loginIcons from '../assest/signin.gif';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from 'react-router-dom';
import imageTobase64 from '../helpers/imageTobase64';
import SummaryApi from '../common';
import { ToastContainer, toast } from 'react-toastify';
import styled from 'styled-components';

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
    <section className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 transition-all duration-300">
        {/* Profile Picture Section - Modified */}
        <div className="text-center">
          <div className="w-24 h-24 mx-auto relative rounded-full overflow-hidden border-4 border-gray-200 dark:border-gray-700 group">
            <FloatingImage 
              src={data.profilePic || loginIcons} 
              alt="profile" 
              className="w-full h-full object-cover"
            />
            <label className="absolute bottom-0 left-0 right-0 h-1/2 flex items-center justify-center cursor-pointer bg-black bg-opacity-30 backdrop-blur-sm transition-all duration-300 hover:bg-opacity-40">
              <span className="text-sm text-white font-medium">
                {data.profilePic ? 'Change Photo' : 'Upload Photo'}
              </span>
              <input 
                type="file" 
                className="hidden" 
                onChange={handleUploadPic} 
                accept="image/*" 
              />
            </label>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Create Account
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Join us and start your journey
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {formStep === 1 && (
            <div className="space-y-4">
              {/* Username Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  name="name"
                  value={data.name}
                  onChange={handleOnChange}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl placeholder-gray-500 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 transition-all duration-300"
                  placeholder="Enter your username"
                  required
                />
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={data.email}
                  onChange={handleOnChange}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl placeholder-gray-500 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 transition-all duration-300"
                  placeholder="Enter your email"
                  required
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                )}
              </div>

              {/* Password Fields */}
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
                    className="appearance-none block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl placeholder-gray-500 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 transition-all duration-300"
                    placeholder="Create password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-600 dark:text-gray-400"
                  >
                    {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={data.confirmPassword}
                    onChange={handleOnChange}
                    className="appearance-none block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl placeholder-gray-500 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 transition-all duration-300"
                    placeholder="Confirm password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(prev => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-600 dark:text-gray-400"
                  >
                    {showConfirmPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Social Sign Up */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                    Or sign up with
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-300"
              >
                <FcGoogle size={20} />
                <span>Continue with Google</span>
              </button>

              <button
                type="button"
                onClick={handleNextStep}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 mt-6"
              >
                Continue
              </button>
            </div>
          )}

          {formStep === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Role
                </label>
                <select
                  name="role"
                  value={data.role}
                  onChange={handleOnChange}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 transition-all duration-300"
                  required
                >
                  <option value="">Select Role</option>
                  <option value="Vendor">Vendor</option>
                  <option value="Customer">Customer</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 mt-6"
              >
                Sign Up
              </button>
            </div>
          )}
        </form>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
      <ToastContainer position="bottom-center" />
    </section>
  );
};

export default SignUp;
