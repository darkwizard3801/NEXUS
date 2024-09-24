


import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);

  const navigate = useNavigate();

  const handleEmailChange = (e) => setEmail(e.target.value);
  const handleOtpChange = (e) => setOtp(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8080/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!data.success) {
        toast.error(data.message || 'No user associated with this email');
      } else {
        toast.success('OTP sent! Check your inbox.');
        setOtpSent(true);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResettingPassword(true);

    try {
      const response = await fetch('http://localhost:8080/api/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!data.success) {
        toast.error(data.message || 'OTP verification failed');
      } else {
        toast.success('OTP verified! Redirecting...');
        navigate(`/reset-password?email=${encodeURIComponent(email)}`);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setResettingPassword(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8080/api/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('OTP resent successfully.');
      } else {
        toast.error('Failed to resend OTP. Try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id='forgot-password'>
      <div className='mx-auto container p-10'>
        <div className='bg-white p-5 w-full max-w-sm mx-auto rounded-3xl'>
          {/* GIF at the top of the form */}
          <div className='flex justify-center mb-4'>
            <img src='https://res.cloudinary.com/du8ogkcns/image/upload/v1726831709/Nexus/kyirmfgsii6d8ciywinr.gif'  className='w-17 h-17' />
          </div>
          <form className='pt-6 flex flex-col gap-4 rounded-3xl' onSubmit={otpSent ? handleResetPassword : handleSubmit}>
            <p className='text-center text-lg'>
              {otpSent ? 'Enter the OTP sent to your email:' : 'Enter your email to receive a password reset OTP.'}
            </p>

            {!otpSent && (
              <div className='bg-slate-100 p-2 rounded-2xl mt-4'>
                <input
                  type='email'
                  placeholder='Email address'
                  value={email}
                  onChange={handleEmailChange}
                  required
                  className='w-full h-full outline-none bg-transparent'
                />
              </div>
            )}

            {otpSent && (
              <>
                <div className='bg-slate-100 p-2 rounded-2xl mt-4'>
                  <input
                    type='text'
                    placeholder='Enter OTP'
                    value={otp}
                    onChange={handleOtpChange}
                    required
                    className='w-full h-full outline-none bg-transparent'
                  />
                </div>
                <button
                  type='button'
                  className='text-blue-600 hover:underline mt-2'
                  onClick={handleResendOtp}
                  disabled={loading}
                >
                  {loading ? 'Resending...' : 'Resend OTP'}
                </button>
              </>
            )}

            <button 
              type='submit' 
              className='bg-red-600 hover:bg-red-700 text-white px-6 py-2 w-full max-w-[150px] rounded-full hover:scale-110 transition-all mx-auto block mt-6'
              disabled={loading || resettingPassword}
            >
              {loading ? 'Sending...' : otpSent ? (resettingPassword ? 'Resetting...' : 'Verify OTP') : 'Send OTP'}
            </button>
          </form>

          <br />
          <p className='my-5 text-center'>
            Don't have an account? 
            <Link to={"/sign-up"} className='text-red-600 hover:text-red-700 hover:underline'>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default ForgotPassword;





