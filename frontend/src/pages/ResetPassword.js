import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = new URLSearchParams(location.search).get('email');
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null); // To store user details

  useEffect(() => {
    // Fetch user details using the email to greet the user
    const fetchUser = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/fetch-user/${email}`);
        const data = await response.json();
        
        if (data.success) {
          setUser(data.user); // Assume the response includes user details
        } else {
          toast.error(data.message || 'Failed to fetch user details');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        toast.error('An error occurred while fetching user details.');
      }
    };

    fetchUser();
  }, [email]);

  const handleNewPasswordChange = (e) => setNewPassword(e.target.value);
  const handleConfirmPasswordChange = (e) => setConfirmPassword(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:8080/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, newPassword }),
      });

      const data = await response.json();

      if (!data.success) {
        toast.error(data.message || 'Failed to reset password');
      } else {
        toast.success('Password has been reset successfully.');
        navigate('/login'); // Redirect to login after successful reset
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id='reset-password'>
      <div className='mx-auto container p-10'>
        <div className='bg-white p-5 w-full max-w-sm mx-auto rounded-3xl'>
          {user && (
            <div className='text-center mb-5'>
              <img src={user.profilePic} alt={`${user.name}'s profile`} className='w-16 h-16 rounded-full mx-auto mb-2' />
              <p className='text-lg'>Hello, {user.name}!</p>
              <p className='text-gray-600'>Please reset your password.</p>
            </div>
          )}
          <form className='pt-6 flex flex-col gap-2 rounded-3xl' onSubmit={handleSubmit}>
            <div className='bg-slate-100 p-2 rounded-2xl mt-4'>
              <input
                type='password'
                placeholder='New Password'
                value={newPassword}
                onChange={handleNewPasswordChange}
                required
                className='w-full h-full outline-none bg-transparent'
              />
            </div>
            <div className='bg-slate-100 p-2 rounded-2xl mt-4'>
              <input
                type='password'
                placeholder='Confirm Password'
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                required
                className='w-full h-full outline-none bg-transparent'
              />
            </div>

            <button 
              type='submit' 
              className='bg-red-600 hover:bg-red-700 text-white px-6 py-2 w-full max-w-[150px] rounded-full hover:scale-110 transition-all mx-auto block mt-6'
              disabled={loading}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>

          <br />
          <p className='my-5'>
            Remembered your password? 
            <Link to={"/login"} className='text-red-600 hover:text-red-700 hover:underline'>
              Log in
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default ResetPassword;
