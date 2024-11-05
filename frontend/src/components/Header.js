import React, { useContext, useState } from "react";
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

const Header = () => {
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [menuDisplay, setMenuDisplay] = useState(false);
  const context = useContext(Context);
  const searchInput = useLocation();
  const URLSearch = new URLSearchParams(searchInput?.search);
  const searchQuery = URLSearch.getAll("q");
  const [search, setSearch] = useState(searchQuery);
     
  
  const handleLogout = async () => {
    const fetchData = await fetch(SummaryApi.logout_user.url, {
      method: SummaryApi.logout_user.method,
      credentials: "include",
    });

    const data = await fetchData.json();
   console.log(data)
    if (data.success) {
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

  return (
    <header className='h-16 shadow-md bg-white fixed w-full z-40'>
      <div className='h-full container mx-auto flex items-center px-4 justify-between'>
        <Link to={"/"}>
          <Logo w={190} h={70} />
        </Link>

        {/* Search Bar */}
        {/* Desktop Search Bar */}
        <div className='hidden md:flex items-center border rounded-full focus-within:shadow pl-2 w-1/3'>
          <input
            type='text'
            placeholder='Search product here...'
            className='w-full outline-none p-2'
            onChange={handleSearch}
            value={search}
          />
          <div className='text-lg min-w-[60px] h-10 bg-black flex items-center justify-center rounded-r-full text-white'>
            <IoSearch />
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className='md:hidden flex items-center border rounded-full focus-within:shadow pl-2 w-full'>
          <input
            type='text'
            placeholder='Search...'
            className='w-full outline-none p-2'
            onChange={handleSearch}
            value={search}
          />
          <div className='text-lg min-w-[55px] bg-black h-10  flex items-center justify-center rounded-r-full text-white'>
            <IoSearch />
          </div>
        </div>

        {/* Button for Customer to create an event */}
        {user?.role === "Customer" && (
          <button
            onClick={goToCreateEvent}
            className='hidden md:block ml-4 px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition truncate'
          >
            Create Event
          </button>
        )}

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
              <div className='absolute bg-white bottom-0 top-11 h-fit p-2 shadow-lg rounded-2xl'>
                <nav>
                  {user?.role === "Vendor" && (
                    <Link
                      to={"/vendor-panel/vendor-products"}
                      className='whitespace-nowrap hover:bg-slate-100 p-2 block'
                      onClick={() => setMenuDisplay(false)}
                    >
                      Vendor Panel
                    </Link>
                  )}
                  {user?.role === "Admin" && (
                    <Link
                      to={"/admin-panel/all-products"}
                      className='whitespace-nowrap hover:bg-slate-100 p-2 block'
                      onClick={() => setMenuDisplay(false)}
                    >
                      Admin Panel
                    </Link>
                  )}
                  {user?.role === "Customer" && (
                    <nav>
                      <Link
                        to={"/user-panel"}
                        className='whitespace-nowrap hover:bg-slate-100 p-2 block'
                        onClick={() => setMenuDisplay(false)}
                      >
                        My Account
                      </Link>
                      {/* New option for My Orders */}
                      <Link
                        to={"/user-panel/orders"}
                        className='whitespace-nowrap hover:bg-slate-100 p-2 block'
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
    </header>
  );
};

export default Header;
