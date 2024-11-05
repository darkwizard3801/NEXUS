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
    <section id='signup'>
      <div className='mx-auto container p-10'>
        <div className='bg-white p-5 w-full max-w-sm mx-auto rounded-3xl'>
          <div className='w-20 h-20 mx-auto relative overflow-hidden rounded-full'>
            <img src={data.profilePic || loginIcons} alt='login icons' />
            <form>
              <label>
                <div className='text-xs bg-opacity-80 bg-slate-200 pb-4 pt-2 cursor-pointer text-center absolute bottom-0 w-full'>
                  Upload Photo
                </div>
                <input 
 y
  type='file' 
  className='hidden' 
  onChange={handleUploadPic} 
  accept="image/*" 
/>

              </label>
            </form>
          </div>

          <form className='pt-7 flex flex-col gap-5' onSubmit={handleSubmit}>
            {formStep === 1 && (
              <>
                <div className='grid'>
                  <label>Username: </label>
                  <div className='bg-slate-100 p-2 rounded-2xl'>
                    <input
                      type='text'
                      placeholder='enter your username'
                      name='name'
                      value={data.name}
                      onChange={handleOnChange}
                      required
                      className='w-full h-full outline-none bg-transparent'
                    />
                  </div>
                </div>
                <div className='grid'>
                  <label>Email: </label>
                  <div className='bg-slate-100 p-2 rounded-2xl'>
                    <input
                      type='email'
                      placeholder='enter email'
                      name='email'
                      value={data.email}
                      onChange={handleOnChange}
                      required
                      className='w-full h-full outline-none bg-transparent'
                    />
                  </div>
                  {errors.email && <p className='text-red-500 text-sm'>{errors.email}</p>}
                </div>
                <div>
                  <label>Password: </label>
                  <div className='bg-slate-100 p-2 rounded-2xl flex'>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder='enter password'
                      value={data.password}
                      name='password'
                      onChange={handleOnChange}
                      required
                      className='w-full h-full outline-none bg-transparent'
                    />
                    <div className='cursor-pointer text-xl' onClick={() => setShowPassword((prev) => !prev)}>
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </div>
                  </div>
                  {errors.password && <p className='text-red-500 text-sm'>{errors.password}</p>}
                </div>
                <div>
                  <label>Confirm Password: </label>
                  <div className='bg-slate-100 p-2 flex rounded-2xl'>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder='enter confirm password'
                      value={data.confirmPassword}
                      name='confirmPassword'
                      onChange={handleOnChange}
                      required
                      className='w-full h-full outline-none bg-transparent'
                    />
                    <div className='cursor-pointer text-xl' onClick={() => setShowConfirmPassword((prev) => !prev)}>
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </div>
                  </div>
                  {errors.confirmPassword && <p className='text-red-500 text-sm'>{errors.confirmPassword}</p>}
                </div>

                {/* Social Media Login Section */}
                <div className="flex flex-col items-center mt-4">
                  <p>Or sign up with</p>
                  <div className="flex gap-4 mt-2">
                    {/* <button 
                      type="button" 
                      className="flex items-center gap-2 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
                      onClick={handleFacebookLogin}
                    >
                      <FaFacebook />
                      Facebook
                    </button> */}
                    <button 
                      type="button" 
                      className="flex items-center gap-2 p-2 bg-black
                       text-white rounded-full hover:bg-red-600 transition"
                      onClick={handleGoogleLogin}
                    >
                      <FcGoogle />
                      Google
                    </button>
                  </div>
                </div> 

                <button type='button' className='bg-red-600 hover:bg-red-700 text-white px-6 py-2 w-full max-w-[150px] rounded-full hover:scale-110 transition-all mx-auto block mt-6' onClick={handleNextStep}>
                  Continue
                </button>
              </>
            )}

            {formStep === 2 && (
              <>
                <div>
                  <label>Role:</label>
                  <div className='bg-slate-100 p-2 rounded-2xl flex'>
                    <select name="role" value={data.role} onChange={handleOnChange} className='w-full h-full outline-none bg-transparent'>
                      <option value="">Select Role</option>
                      <option value="Vendor">Vendor</option>
                      <option value="Customer">Customer</option>
                    </select>
                  </div>
                </div>
                <button type='submit' className='bg-red-600 hover:bg-red-700 text-white px-6 py-2 w-full max-w-[150px] rounded-full hover:scale-110 transition-all mx-auto block'>
                  Sign Up
                </button>
              </>
            )}
          </form>
        </div>
      </div>
      <ToastContainer position='bottom-center' />
    </section>
  );
};

export default SignUp;
