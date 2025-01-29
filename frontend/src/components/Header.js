import React, { useContext, useState, useEffect } from "react";
import Logo from "./Logo";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { IoSearch } from "react-icons/io5";
import { FaRegCircleUser } from "react-icons/fa6";
import { FaShoppingCart } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import SummaryApi from "../common";
import { toast } from "react-toastify";
import { setUserDetails } from "../store/userSlice";
import Context from "../context";
import Cookies from 'js-cookie'; 
import { useTheme } from '../context/ThemeContext';
import { FaSun, FaMoon, FaStar, FaCloud } from "react-icons/fa";

const Header = () => {
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [menuDisplay, setMenuDisplay] = useState(false);
  const context = useContext(Context);
  const { isDarkMode, toggleTheme } = useTheme();
  const searchInput = useLocation();
  const URLSearch = new URLSearchParams(searchInput?.search);
  const searchQuery = URLSearch.getAll("q");
  const [search, setSearch] = useState(searchQuery);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
     


  console.log("userdetails=",user)
  const getCookie = () => {
    const token = Cookies.get("token"); // Replace 'token' with your actual cookie name
    console.log('Cookie token:', token);
    return token;
  };
  const handleLogout = async () => {
    const fetchData = await fetch(SummaryApi.logout_user.url, {
      method: SummaryApi.logout_user.method,
      credentials: "include",
    });

    const data = await fetchData.json();
       console.log(data)
    if (data.success) {
      // Cookies.remove('token');
      toast.success(data.message);
      dispatch(setUserDetails(null));
      navigate("/", { replace: true });
    }

    if (data.error) {
      toast.error(data.message);
    }
  };

  const handleSearch = (e) => {
    const { value } = e.target;
    setSearch(value);

    if (value) {
      navigate(`/search?q=${value}`);
    } else {
      navigate("/search");
    }
  };

  // Navigate to the create-event page
  const goToCreateEvent = () => {
    navigate("/create-event");
  };

  useEffect(() => {
    getCookie();
  }, []);

  console.log(user)

  return (
    <header className={`h-16 shadow-md ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'} fixed w-full z-40 transition-colors duration-200`}>
      <div className='h-full container mx-auto flex items-center px-4 justify-between'>
        <Link to={"/"} className="flex-shrink-0">
          <Logo w={150} h={70} className="md:w-[190px]" />
        </Link>

        <div className="hidden md:flex items-center gap-4 flex-grow justify-between">
          <button
            onClick={toggleTheme}
            className={`
              w-14 h-7 rounded-full relative transition-all duration-300 ease-in-out focus:outline-none
              ${isDarkMode ? 'bg-gray-700 border-2 border-blue-400' : 'bg-blue-100 border-2 border-yellow-400'}
            `}
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode && (
              <>
                <FaStar className="absolute text-[8px] text-yellow-300 top-1 left-1.5" />
                <FaStar className="absolute text-[8px] text-yellow-300 bottom-1 left-2.5" />
                <FaStar className="absolute text-[8px] text-yellow-300 top-2 left-3.5" />
              </>
            )}
            
            <div
              className={`
                absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full 
                transition-all duration-300 ease-in-out
                ${isDarkMode ? 'translate-x-8 bg-gray-800' : 'translate-x-1 bg-yellow-400'}
                flex items-center justify-center shadow-md
              `}
            >
              {isDarkMode ? (
                <FaMoon className="text-xs text-blue-300" />
              ) : (
                <FaSun className="text-xs text-yellow-600" />
              )}
            </div>

            {!isDarkMode && (
              <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center">
                <div className="w-full h-full flex justify-between items-center px-1">
                  <FaCloud className="text-blue-500 text-xs" />
                  <FaCloud className="text-blue-500 text-xs p" />
                </div>
              </div>
            )}
          </button>

          <div className={`flex items-center rounded-full focus-within:shadow pl-2 w-1/3 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <input
              type='text'
              placeholder='Search product here...'
              className={`w-full outline-none p-2 rounded-l-full ${isDarkMode ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-white text-black'}`}
              onChange={handleSearch}
              value={search}
            />
            <div className={`text-lg min-w-[60px] h-10 flex items-center justify-center rounded-r-full ${isDarkMode ? 'bg-gray-600' : 'bg-black'} text-white`}>
              <IoSearch />
            </div>
          </div>

          <div className='flex items-center gap-6'>
            <div className='relative flex justify-center'>
              {user?._id && (
                <div
                  className='text-3xl cursor-pointer relative flex justify-center'
                  onClick={() => setMenuDisplay((prev) => !prev)}
                >
                  <div className='flex flex-col px-5'>
                    <p className='text-xs font-semibold capitalize'>hello,</p>
                    <p className='text-sm font-bold capitalize mt-1'>{user?.name}</p>
                  </div>
                  {user?.profilePic ? (
                    <img src={user?.profilePic} className='w-10 h-10 rounded-full' alt={user?.name} />
                  ) : (
                    <FaRegCircleUser />
                  )}
                </div>
              )}

              {menuDisplay && (
                <div className={`absolute ${isDarkMode ? 'bg-gray-800' : 'bg-white'} bottom-0 top-11 h-fit p-2 shadow-lg rounded-2xl`}>
                  <nav>
                    {user?.role === "Vendor" && (
                      <Link
                        to={"/vendor-panel/vendor-products"}
                        className={`whitespace-nowrap ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-slate-100'} p-2 block`}
                        onClick={() => setMenuDisplay(false)}
                      >
                        Vendor Panel
                      </Link>
                    )}
                    {user?.role === "Admin" && (
                      <Link
                        to={"/admin-panel/all-products"}
                        className={`whitespace-nowrap ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-slate-100'} p-2 block`}
                        onClick={() => setMenuDisplay(false)}
                      >
                        Admin Panel
                      </Link>
                    )}
                    {user?.role === "Customer" && (
                      <nav>
                        <Link
                          to={"/user-panel"}
                          className={`whitespace-nowrap ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-slate-100'} p-2 block`}
                          onClick={() => setMenuDisplay(false)}
                        >
                          My Account
                        </Link>
                        <Link
                          to={"/user-panel/orders"}
                          className={`whitespace-nowrap ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-slate-100'} p-2 block`}
                          onClick={() => setMenuDisplay(false)}
                        >
                          My Orders
                        </Link>
                      </nav>
                    )}
                  </nav>
                </div>
              )}
            </div>

            {user?._id && (
              <Link to={"/cart"} className='text-2xl relative'>
                <FaShoppingCart />
                <div className='bg-red-600 text-white w-5 h-5 rounded-full p-1 flex items-center justify-center absolute -top-2 -right-3'>
                  <p className='text-sm'>{context?.cartProductCount || 0}</p>
                </div>
              </Link>
            )}

            <div>
              {user?._id ? (
                <button
                  onClick={handleLogout}
                  className='px-3 py-1 rounded-full text-white bg-red-600 hover:bg-red-700'
                >
                  Logout
                </button>
              ) : (
                <Link
                  to={"/login"}
                  className='px-3 py-1 rounded-full text-white bg-green-600 hover:bg-green-700'
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="md:hidden flex items-center gap-2 flex-grow justify-between max-w-[calc(100%-160px)]">
          <div className={`flex items-center rounded-full focus-within:shadow pl-2 flex-grow max-w-[180px] border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <input
              type='text'
              placeholder='Search...'
              className={`w-full outline-none p-2 rounded-l-full text-sm ${isDarkMode ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-white text-black'}`}
              onChange={handleSearch}
              value={search}
            />
            <div className={`text-lg min-w-[32px] h-9 flex items-center justify-center rounded-r-full ${isDarkMode ? 'bg-gray-600' : 'bg-black'} text-white`}>
              <IoSearch />
            </div>
          </div>

          <div className='relative ml-2'>
            <div
              className='text-2xl cursor-pointer w-10 h-10 flex items-center justify-center'
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {user?.profilePic ? (
                <img src={user?.profilePic} className='w-8 h-8 rounded-full' alt={user?.name} />
              ) : (
                <FaRegCircleUser className="w-6 h-6" />
              )}
            </div>

            {mobileMenuOpen && (
              <div className={`absolute right-0 top-11 w-48 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg rounded-lg p-2 z-50`}>
                {user?._id ? (
                  <>
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-semibold">Hello, {user?.name}</p>
                    </div>
                    {user?.role === "Customer" && (
                      <>
                        <Link
                          to={"/user-panel"}
                          className={`block px-4 py-2 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          My Account
                        </Link>
                        <Link
                          to={"/user-panel/orders"}
                          className={`block px-4 py-2 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          My Orders
                        </Link>
                        <Link
                          to={"/cart"}
                          className={`block px-4 py-2 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Cart ({context?.cartProductCount || 0})
                        </Link>
                        <button
                          onClick={goToCreateEvent}
                          className={`block w-full text-left px-4 py-2 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                        >
                          Create Event
                        </button>
                      </>
                    )}
                    {user?.role === "Vendor" && (
                      <Link
                        to={"/vendor-panel/vendor-products"}
                        className={`block px-4 py-2 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Vendor Panel
                      </Link>
                    )}
                    {user?.role === "Admin" && (
                      <Link
                        to={"/admin-panel/all-products"}
                        className={`block px-4 py-2 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    to={"/login"}
                    className="block px-4 py-2 text-green-600 hover:bg-green-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                )}
                <button
                  onClick={() => {
                    toggleTheme();
                    setMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left px-4 py-2 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
