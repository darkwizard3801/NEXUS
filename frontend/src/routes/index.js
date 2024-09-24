import { createBrowserRouter } from 'react-router-dom'
import App from '../App'
import Home from '../pages/Home'
import Login from '../pages/Login'

import Vendorpage from '../pages/Vendorpage'
import ForgotPassowrd from '../pages/ForgotPassowrd'
import SignUp from '../pages/SignUp'
import AdminPanel from '../pages/AdminPanel'
import Vendorpanel from '../pages/Vendorpanel'
import SelectRole from '../pages/SelectRole'
import AdminPage from '../pages/AdminPage'

import AllUsers from '../pages/AllUsers'
import AllProducts from '../pages/AllProducts'

import VendorProducts from '../pages/VendorProducts'
import VerifyEmail from '../pages/VerifyEmail'
import ResetPassword from '../pages/ResetPassword'
import CategoryProduct from '../pages/CategoryProduct'
import Home2 from '../pages/Home2'
import ProductDetails from '../pages/ProductDetails'
import Cart from '../pages/Cart'
import ContactUs from '../pages/ContactUs'
import ContactMessages from '../pages/contact-messages'
import BannerRequest from '../pages/BannerRequest'
import Banners from '../pages/Banners'
import MyOrders from '../pages/MyOrders'
import UserPanel from '../pages/UserPanel'
// import ContactMessage from '../../../backend/models/ContactMessage'











const router = createBrowserRouter([
    {
        path : "/",
        element : <App/>,
        children : [
            {
                path : "",
                element : <Home/>
            },
            {
                path : "home2",
                element : <Home2/>
            },

            {
                path : "login",
                element : <Login/>
            },
            {
                path: "select-role", // New route for SelectRole
                element: <SelectRole />
            },
         
        
            {
                path : "forgot-password",
                element : <ForgotPassowrd/>
            },
            {
                path : "sign-up",
                element : <SignUp/>
            },
            {
                path : "vendor-page",
                element : <Vendorpage/>
            },
            {
                path : "admin-page",
                element : <AdminPage/>
            },

            {
                path : "verify-email",
                element : <VerifyEmail/>
            },
            {
                path : "reset-password",
                element : <ResetPassword/>
            },
            {
                path : "product-category",
                element : <CategoryProduct/>
            },
            {
                path : "product/:id",
                element : <ProductDetails/>
            },
            {
                path : 'cart',
                element : <Cart/>
            },
            {
                path : 'contact',
                element : <ContactUs/>
            },
            





            {
                path : "admin-panel",
                element : <AdminPanel/>,
                children : [
                    {
                        path : "all-users",
                        element : <AllUsers/>
                    },
                    {
                        path : "all-products",
                        element : <AllProducts/>
                    },
                    {
                        path : "contact-msg",
                        element : <ContactMessages/>
                    },
                    {
                        path : "banner-admin",
                        element : <Banners/>
                    },
                    
                ]

            },
            {
                path : "vendor-panel",
                element : <Vendorpanel/>,

                children : [
                    {
                        path : "vendor-products",
                        element : <VendorProducts/>
                    },
                    {
                        path : "banner-req",
                        element : <BannerRequest/>
                    }
                ]


            },
            {
            path:"user-panel",
            element:<UserPanel/>,

            children:[
                {
                    path : 'orders',
                    element : <MyOrders/>
                },
               
            ]

            }



        ]
    }
])

export default router
