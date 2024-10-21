import React, { useEffect,useState } from 'react'
import { useSelector } from 'react-redux'
import { FaRegCircleUser } from "react-icons/fa6";
import {  FaBars } from "react-icons/fa"; // Changed import from fa6 to fa
import { IoMdClose } from "react-icons/io";

import { Link, Outlet, useNavigate } from 'react-router-dom';


// import ROLE from '../common/role';



const VendorPanel = () => {
    const [isOpen, setIsOpen] = useState(false); // Added state for sidebar visibility

    const user = useSelector(state => state?.user?.user)
    const navigate = useNavigate()

    useEffect(() => {
        if (user?.role !== "Vendor") {
            navigate("/")
        }
    }, [user])

    const toggleSidebar = () => { // Added function to toggle sidebar
        setIsOpen(!isOpen);
    }

    return (
        <div className='min-h-[calc(100vh-120px)] flex flex-col md:flex-row'> {/* Updated flex direction */}
            <aside className={`bg-white min-h-full w-full max-w-60 customShadow ${isOpen ? 'block' : 'hidden'} md:block`}> {/* Conditional rendering */}
                <div className='h-32 flex justify-center items-center flex-col'>
                    <div className='text-5xl cursor-pointer relative flex justify-center'>
                        {
                            user?.profilePic ? (
                                <img src={user?.profilePic} className='w-20 h-20 rounded-full' alt={user?.name} />
                            ) : (
                                <FaRegCircleUser />
                            )
                        }
                    </div>
                    <p className='capitalize text-lg font-semibold'>{user?.name}</p>
                    <p className='text-sm capitalize'>{user?.role}</p>
                </div>

                {/***navigation */}
                <div>
                    <nav className='grid p-4'>
                        <Link to={"vendor-products"} className='px-2 py-1 rounded-2xl hover:bg-blue-600 hover:text-white hover:rounded-2xl transition duration-300 ease-in-out transform hover:scale-105'>All product</Link>
                        <Link to={"banner-req"} className='px-2 py-1 rounded-2xl  hover:bg-blue-600 hover:text-white hover:rounded-2xl transition duration-300 ease-in-out transform hover:scale-105'>Request banner Adds</Link>
                        <Link to={"my-profile"} className='px-2 py-1 rounded-2xl hover:bg-blue-600 hover:text-white hover:rounded-2xl transition duration-300 ease-in-out transform hover:scale-105'>Profile</Link>
                        <Link to={"sponser-add"} className='px-2 py-1 rounded-2xl  hover:bg-blue-600 hover:text-white hover:rounded-2xl transition duration-300 ease-in-out transform hover:scale-105'>Sponser Ad Request</Link>
                    </nav>
                </div>
            </aside>

            <div className="md:hidden flex items-center justify-between p-4"> {/* Hamburger menu for mobile */}
                <h1 className="text-xl">Vendor Panel</h1>
                <button onClick={toggleSidebar}>
                    {isOpen ? <IoMdClose /> : <FaBars />} {/* Toggle icon */}
                </button>
            </div>

            <main className='w-full h-full p-2'>
                <Outlet />
            </main>
        </div>
    )
}

export default VendorPanel


