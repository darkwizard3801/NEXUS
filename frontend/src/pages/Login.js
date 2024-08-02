import React, { useContext, useState } from 'react'
import loginIcons from '../assest/signin.gif'

import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from 'react-router-dom';
import SummaryApi from '../common';
import { toast } from 'react-toastify';
import Context from '../context';



const Login = () => {


    const [showPassword,setShowPassword] = useState(false)
    const [data,setData] = useState({
        email : "",
        password : ""
    })
    const navigate = useNavigate()
    const { fetchUserDetails } = useContext(Context)

    const handleOnChange = (e) =>{
        const { name , value } = e.target

        setData((preve)=>{
            return{
                ...preve,
                [name] : value
            }
        })
    }


    const handleSubmit = async(e) =>{
        e.preventDefault()
        try{

      

        const dataResponse = await fetch(SummaryApi.signIn.url,{
            method : SummaryApi.signIn.method,
            credentials : 'include',
            headers : {
                "content-type" : "application/json"
            },
            body : JSON.stringify(data)
        })

        const dataApi = await dataResponse.json()
        if (dataApi.success) {
            toast.success(dataApi.message);
    
            const userDetailsResponse = await fetch(SummaryApi.current_user.url, {
              method: SummaryApi.current_user.method,
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
              },
            });
    
            const userDetails = await userDetailsResponse.json();
            console.log("User details response:", userDetails.data);
    
            if (userDetails && userDetails.data.role) {
              const userRole = userDetails.data.role;
              const name=userDetails.data.name;
    
              if (userRole === "Vendor") {
                // toast.success("welcome Vendor")
                
                navigate("/vendor-page");
                fetchUserDetails()
                console.log("name-details",fetchUserDetails())
                // toast.success("welcome",name)
                console.log(dataApi.message)
              } else if (userRole === "Customer") {
                navigate("/");
              } 
            //   else if (userRole === "admin") {
            //     navigate("/adminpage");
            //   } 
              else {
                toast.error("Invalid role");
              }
            } else {
              toast.error("Failed to retrieve user details");
              console.error("User details response does not contain role:", userDetails);
            }
          } else if (dataApi.error) {
            toast.error(dataApi.message);
          }
        }
        catch (error) {
            toast.error("An error occurred. Please try again.");
            console.error("Error during login or fetching user details:", error);
          } 

        // if(dataApi.success){
        //     toast.success(dataApi.message)
        //     console.log(dataApi)
        //     navigate('/')
        //     // fetchUserDetails()
        //     // fetchUserAddToCart()
        // }

        // if(dataApi.error){
        //     toast.error(dataApi.message)
        //     console.log(dataApi.message)
        // }

    }

    console.log("data login",data)
    


  return (
    <section id='login'>
    <div className='mx-auto container p-10 '>

        <div className='bg-white p-5 w-full max-w-sm mx-auto rounded-3xl'>
                <div className='w-20 h-20 mx-auto'>
                    <img src={loginIcons} alt='login icons'/>
                </div>

                <form className='pt-6 flex flex-col gap-2 rounded-3xl ' onSubmit={handleSubmit}>
                    <div className='grid'>
                        <label>Email : </label>
                        <div className='bg-slate-100 p-2 rounded-2xl'>
                            <input 
                                type='email' 
                                placeholder='enter email' 
                                name='email'
                                value={data.email}
                                onChange={handleOnChange}
                                className='w-full h-full outline-none bg-transparent  '/>
                        </div>
                    </div>

                    <div>
                        <label>Password : </label>
                        <div className='bg-slate-100 p-2 flex rounded-2xl'>
                            <input 
                                type={showPassword ? "text" : "password"} 
                                placeholder='enter password'
                                value={data.password}
                                name='password' 
                                onChange={handleOnChange}
                                className='w-full h-full outline-none bg-transparent '/>
                            <div className='cursor-pointer text-xl' onClick={()=>setShowPassword((preve)=>!preve)}>
                                <span>
                                    {
                                        showPassword ? (
                                            <FaEyeSlash/>
                                        )
                                        :
                                        (
                                            <FaEye/>
                                        )
                                    }
                                </span>
                            </div>
                        </div>
                        <Link to={'/forgot-password'} className='block w-fit ml-auto hover:underline hover:text-red-600'>
                            Forgot password ?
                        </Link>
                    </div>

                    <button className='bg-red-600 hover:bg-red-700 text-white px-6 py-2 w-full max-w-[150px] rounded-full hover:scale-110 transition-all mx-auto block mt-6'>Login</button>

                </form>

                <p className='my-5'>Don't have account ? <Link to={"/sign-up"} className=' text-red-600 hover:text-red-700 hover:underline'>Sign up</Link></p>
        </div>


    </div>
</section>
  )
}

export default Login