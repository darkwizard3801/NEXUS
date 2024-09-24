import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import SummaryApi from '../common';

const SelectRole = () => {
  const [role, setRole] = useState("");
  const [userId, setUserId] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('userId');
    setUserId(id);
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const response = await fetch(SummaryApi.updateRole.url, {
      method: SummaryApi.updateRole.method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, role }),
    });

    const data = await response.json();
    
    if (data.success) {
      toast.success(data.message);

      // Redirect based on the selected role
      const redirectUrl = role === "Vendor" 
        ? '/vendor-page' 
        : role === "Customer" 
        ? '/' 
        : '/admin-page'; // Add more roles if necessary

      navigate(redirectUrl); // Redirect to the appropriate page
    } else {
      toast.error(data.message);
    }
  };

  return (
    <section id='select-role'>
      <div className='mx-auto container p-10'>
        <div className='bg-white p-5 w-full max-w-sm mx-auto rounded-3xl'>
          <h1 className='text-center text-2xl font-semibold mb-5'>Select Your Role</h1>
          <form onSubmit={handleSubmit} className='flex flex-col gap-5'>
            <div className='grid'>
              <label className='text-lg font-medium'>Role:</label>
              <div className='bg-slate-100 p-2 rounded-2xl'>
                <select 
                  name="role" 
                  value={role} 
                  onChange={(e) => setRole(e.target.value)} 
                  className='w-full h-full outline-none bg-transparent' 
                  required
                >
                  <option value="" disabled>Select your role</option>
                  <option value="Customer">Customer</option>
                  <option value="Vendor">Vendor</option>
                  {/* <option value="Admin">Admin</option> Optional: Add Admin role if needed */}
                </select>
              </div>
            </div>
            <button 
              type='submit' 
              className='bg-red-600 hover:bg-red-700 text-white px-6 py-2 w-full max-w-[150px] rounded-full hover:scale-110 transition-all mx-auto block mt-6'
            >
             SignUp
            </button>
          </form>
        </div>
        <ToastContainer />
      </div>
    </section>
  );
};

export default SelectRole;
