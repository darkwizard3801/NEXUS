import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { FaRegCircleUser } from "react-icons/fa6";
import { FaBars } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { Link, Outlet, useNavigate } from "react-router-dom";
import {
  TbLayoutSidebarLeftCollapse,
  TbLayoutSidebarRightCollapse,
} from "react-icons/tb";
import { TbCategoryPlus } from "react-icons/tb";
import { CgProfile } from "react-icons/cg";

import { LuRectangleHorizontal } from "react-icons/lu";
import { AiOutlineProduct } from "react-icons/ai";
import { PiUsersThreeLight } from "react-icons/pi";
const AdminPanel = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const user = useSelector((state) => state?.user?.user);
    const navigate = useNavigate();

    useEffect(() => {
        if (user?.role !== "Admin") {
            navigate("/")
        }
    }, [user])

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
      };
    
      const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
      };

      return (
        <div className="min-h-[calc(100vh-120px)] flex flex-col md:flex-row">
          {/* Hamburger Button for Mobile */}
          <button
            onClick={toggleSidebar}
            className="md:hidden flex items-center justify-center p-2 bg-gray-200 hover:bg-gray-300 transition duration-300 ease-in-out rounded-full m-2"
          >
            {isOpen ? (
              <IoMdClose className="text-2xl" />
            ) : (
              <FaBars className="text-2xl" />
            )}
          </button>
    
          {/* Sidebar */}
          <div className={`hidden md:block md:w-1/4 lg:w-1/5`}>
            <aside
              className={`bg-white min-h-full ${
                isCollapsed ? "w-16" : "w-full"
              } transition-all duration-300 customShadow flex flex-col relative`}
            >
              {/* Collapse/Expand Button */}
              <button
                onClick={toggleCollapse}
                className={`absolute top-96 p-2 bg-gray-200 hover:bg-blue-500 transition duration-300 ease-in-out rounded-full flex items-center justify-center ${
                  isCollapsed ? "left-2/3" : "left-56"
                }`}
              >
                {isCollapsed ? (
                  <TbLayoutSidebarRightCollapse className="text-2xl" />
                ) : (
                  <TbLayoutSidebarLeftCollapse className="text-2xl" />
                )}
              </button>
    
              <div className="h-32 flex justify-center items-center flex-col">
                <div className="text-5xl cursor-pointer relative flex justify-center">
                  {user?.profilePic ? (
                    <img
                      src={user?.profilePic}
                      className="w-20 h-20 rounded-full"
                      alt={user?.name}
                    />
                  ) : (
                    <FaRegCircleUser />
                  )}
                </div>
                <p
                  className={`capitalize text-lg font-semibold ${
                    isCollapsed ? "hidden" : ""
                  }`}
                >
                  {user?.name}
                </p>
                <p className={`text-sm capitalize ${isCollapsed ? "hidden" : ""}`}>
                  {user?.role}
                </p>
              </div>
    
              {/* Navigation */}
              <nav className="grid p-4">
                <Link
                  to={"all-users"}
                  className="flex items-center p-2 hover:bg-blue-600 hover:rounded-r-full hover:text-white transition duration-300 ease-in-out transform hover:scale-105"
                >
                 <PiUsersThreeLight 
    
                    className={`${isCollapsed ? "text-2xl" : "mr-2"}`}
                  />
                  {isCollapsed ? null : "All Users"}
                </Link>
                <Link
                  to={"all-products"}
                  className="flex items-center p-2 hover:bg-blue-600 hover:text-white hover:rounded-r-full transition duration-300 ease-in-out transform hover:scale-105"
                >
                  <AiOutlineProduct className={`${isCollapsed ? "text-2xl" : "mr-2"}`} />
                  {isCollapsed ? null : "All Products"}
                </Link>
                <Link
                  to={"banner-admin"}
                  className="flex items-center p-2 hover:bg-blue-600 hover:text-white hover:rounded-r-full transition duration-300 ease-in-out transform hover:scale-105"
                >
                  <LuRectangleHorizontal
                    className={`${isCollapsed ? "text-2xl" : "mr-2"}`}
                  />
                  {isCollapsed ? null : "Banner Requests"}
                </Link>
                <Link
                  to={"category-add"}
                  className="flex items-center p-2 hover:bg-blue-600 hover:text-white hover:rounded-r-full transition duration-300 ease-in-out transform hover:scale-105"
                >
                  <TbCategoryPlus
                    className={`${isCollapsed ? "text-2xl" : "mr-2"}`}
                  />
                  {isCollapsed ? null : "Add Category"}
                </Link>
                <Link
                  to={"my-profile"}
                  className="flex items-center p-2 hover:bg-blue-600 hover:text-white hover:rounded-r-full transition duration-300 ease-in-out transform hover:scale-105"
                >
                  <CgProfile
                    className={`${isCollapsed ? "text-2xl" : "mr-2"}`}
                  />
                  {isCollapsed ? null : "Profile"}
                  </Link>
              </nav>
            </aside>
          </div>
    
          {/* Mobile Sidebar */}
          {isOpen && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-end md:hidden">
              <div className="bg-white w-64 min-h-full p-4">
                <button
                  onClick={toggleSidebar}
                  className="mb-4 flex items-center justify-end text-xl"
                >
                  <IoMdClose />
                </button>
                <div className="h-32 flex justify-center items-center flex-col">
                  <div className="text-5xl cursor-pointer relative flex justify-center">
                    {user?.profilePic ? (
                      <img
                        src={user?.profilePic}
                        className="w-20 h-20 rounded-full"
                        alt={user?.name}
                      />
                    ) : (
                      <FaRegCircleUser />
                    )}
                  </div>
                  <p className="capitalize text-lg font-semibold">{user?.name}</p>
                  <p className="text-sm capitalize">{user?.role}</p>
                </div>
    
                {/* Navigation */}
                <nav className="grid p-4">
                  <Link
                    to={"all-users"}
                    className="flex items-center p-2 transition duration-300 ease-in-out hover:bg-blue-600 hover:text-white rounded-l-full hover:rounded-r-full"
                    onClick={toggleSidebar} // Close sidebar on link click
                  >
                    <PiUsersThreeLight className="mr-2" />
                    All Users
                  </Link>
    
                  <Link
                    to={"all-products"}
                    className="flex items-center p-2 hover:bg-blue-600 hover:text-white transition duration-300 ease-in-out"
                    onClick={toggleSidebar}
                  >
                    <AiOutlineProduct className="mr-2" />
                    All Products
                  </Link>
                  <Link
                    to={"banner-admin"}
                    className="flex items-center p-2 hover:bg-blue-600 hover:text-white transition duration-300 ease-in-out"
                    onClick={toggleSidebar}
                  >
                    <LuRectangleHorizontal className="mr-2" />
                   Banner Requests
                  </Link>
                  <Link
                    to={"category-add"}
                    className="flex items-center p-2 hover:bg-blue-600 hover:text-white transition duration-300 ease-in-out"
                    onClick={toggleSidebar}
                  >
                    <TbCategoryPlus className="mr-2" />
                    Add Category
                  </Link>
                  <Link
                    to={"my-profile"}
                    className="flex items-center p-2 hover:bg-blue-600 hover:text-white transition duration-300 ease-in-out"
                    onClick={toggleSidebar}
                  >
                    <CgProfile className="mr-2" />
                    Profile
                  </Link>
                </nav>
              </div>
            </div>
          )}
    
          {/* Main Content */}
          <main className="w-full h-full p-2">
            <div className="flex flex-col">
              <div className="flex items-center justify-between p-1">
               
              </div>
              <Outlet />
            </div>
          </main>
        </div>
      );
}


export default AdminPanel





