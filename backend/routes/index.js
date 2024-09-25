const express = require('express')


const router = express.Router()

const userSignUpController = require("../controller/user/userSignUp")
const userSignInController = require('../controller/user/userSignIn')
const userDetailsController = require('../controller/user/userDetails')
const authToken = require('../middleware/authToken')
const userLogout = require('../controller/user/userLogout')
// const { updateUserRole } = require('../controller/userController');

const updateRoleController = require('../controller/user/updateRoleController');
const allUsers = require('../controller/user/allUsers')
const updateUser = require('../controller/user/updateUser')
const UploadProductController = require('../controller/product/uploadProduct')
const getProductController = require('../controller/product/getProduct')
const updateProductController = require('../controller/product/updateProduct')
const { disableProduct , enableProduct } = require('../controller/product/productController'); // Adjust the path to your controller
const verifyEmailController = require('../controller/user/verifyEmailController')
const { forgotPassword, resetPassword, verifyOtp, resendOtp } = require('../controller/user/forgotPasswordController')
const { getUserByEmail } = require('../controller/user/fetchuser')
const getCategoryProduct = require('../controller/product/getCategoryProductOne')
const getCategoryWiseProduct = require('../controller/product/getCategoryWiseProduct')
const getProductDetails = require('../controller/product/getProductDetails')
const addToCartController = require('../controller/user/addToCartController')
const countAddToCartProduct = require('../controller/user/countAddToCartProduct')
const addToCartViewProduct = require('../controller/user/addToCartViewProduct')
const updateAddToCartProduct = require('../controller/user/updateAddToCartProduct')
const deleteAddToCartProduct = require('../controller/user/deleteAddToCartProduct')

const { handleContactForm, getAllContactMessages } = require('../controller/user/contactController');
const { handleBannerRequest } = require('../controller/user/bannerController')

// const { updateUserRole } = require('../controller/userController');

const { getAllCategories, addCategory,toggleCategory } = require('../controller/product/categoryController');










router.post("/signup",userSignUpController)
router.post("/signin",userSignInController)
router.get("/user-details",authToken,userDetailsController)
router.get("/userLogout",userLogout)
// router.post('/update-role', updateUserRole);
router.post('/api/update-role', updateRoleController);

router.get('/verify-email', verifyEmailController);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.get('/fetch-user/:email', getUserByEmail);




//admin panel
router.get("/all-user",authToken,allUsers)
router.post("/update-user",authToken,updateUser)





//product routes
router.post("/upload-product",authToken,UploadProductController)
router.get("/get-product",getProductController)
router.post("/update-product",authToken,updateProductController)

router.patch('/products/:id', disableProduct);
router.patch('/enable/:id', enableProduct);
router.get("/get-categoryProduct",getCategoryProduct)
router.post("/category-product",getCategoryWiseProduct)
router.post("/product-details",getProductDetails)

router.get('/categories', getAllCategories);

// Route to add a new category
router.post('/category-add', addCategory);
router.put('/togle-cat/:id', toggleCategory);





router.post("/upload-product",authToken,UploadProductController)
router.get("/get-product",getProductController)
router.post("/update-product",authToken,updateProductController)


//add to cart


router.post("/addtocart",authToken,addToCartController)
router.get("/countAddToCartProduct",authToken,countAddToCartProduct)
router.get("/view-card-product",authToken,addToCartViewProduct)
router.post("/update-cart-product",authToken,updateAddToCartProduct)
router.post("/delete-cart-product",authToken,deleteAddToCartProduct)



//contacts

router.post('/contact', handleContactForm);
router.post('/banner-request', handleBannerRequest);
router.get('/contact-messages', getAllContactMessages);
















module.exports = router

