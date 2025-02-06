import React, { useContext, useEffect, useState } from "react";
import SummaryApi from "../common";
import Context from "../context";
import displayINRCurrency from "../helpers/displayCurrency";
import { MdDelete } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Modal } from 'react-modal';
import ConfirmationModal from '../components/ConfirmationModal';

const Cart = () => {
  const [data, setData] = useState([]);
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("Flipkart");
  const [deliveryDate, setDeliveryDate] = useState("");
  const context = useContext(Context);
  const navigate = useNavigate();
  const loadingCart = new Array(4).fill(null);
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventDetails, setEventDetails] = useState({
    occasion: '',
    theme: '',
    keywords: '',
    eventDate: '',
    couplePhoto: null // for weddings only
  });
  const [showPosterModal, setShowPosterModal] = useState(false);
  
  const [posterDetails, setPosterDetails] = useState({
    occasion: '',
    theme: '',
    keywords: '',
    eventDate: '',
    couplePhoto: null // for weddings only
  });

  const [showConfigDetails, setShowConfigDetails] = useState({});

  const getMinDeliveryDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 2); // Add 2 days to today
    return today.toISOString().split('T')[0];
  };

  const isDateValid = (selectedDate) => {
    const today = new Date();
    const minDate = new Date(today);
    minDate.setDate(today.getDate() + 2);
    
    const selected = new Date(selectedDate);
    // Reset time part for accurate date comparison
    selected.setHours(0, 0, 0, 0);
    minDate.setHours(0, 0, 0, 0);
    
    return selected >= minDate;
  };

  const handleDeliveryDateChange = (e) => {
    const selectedDate = e.target.value;
    if (isDateValid(selectedDate)) {
      setDeliveryDate(selectedDate);
    } else {
      // If invalid date selected, set to minimum allowed date
      setDeliveryDate(getMinDeliveryDate());
      toast.error('Please select a date at least 2 days from today');
    }
  };

  const fetchUserDetails = async () => {
    const userDetailsResponse = await fetch(SummaryApi.current_user.url, {
      method: SummaryApi.current_user.method,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const userDetailsData = await userDetailsResponse.json();
    if (userDetailsData.success) {
      setUserDetails(userDetailsData.data);
      console.log("User Details:", userDetailsData.data);
    }
  };

  const fetchData = async () => {
    const response = await fetch(SummaryApi.addToCartProductView.url, {
      method: SummaryApi.addToCartProductView.method,
      credentials: "include",
      headers: {
        "content-type": "application/json",
      },
    });

    const responseData = await response.json();
    if (responseData.success) {
      setData(responseData.data);
      console.log("Cart Data:", {
        fullData: responseData.data,
        items: responseData.data.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          configuration: item.configuration,
          price: item.productId?.price
        }))
      });
    }
  };

  const handleLoading = async () => {
    await fetchData();
    await fetchUserDetails();
  };

  useEffect(() => {
    setLoading(true);
    handleLoading();
    setLoading(false);
  }, []);

  useEffect(() => {
    console.log("Current Cart State:", data);
  }, [data]);

  const increaseQty = async (id, qty) => {
    const response = await fetch(SummaryApi.updateCartProduct.url, {
      method: SummaryApi.updateCartProduct.method,
      credentials: "include",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        _id: id,
        quantity: parseInt(qty) + 1,
      }),
    });

    const responseData = await response.json();
    if (responseData.success) {
      fetchData();
    }
  };

  const decraseQty = async (id, qty) => {
    if (qty >= 2) {
      const response = await fetch(SummaryApi.updateCartProduct.url, {
        method: SummaryApi.updateCartProduct.method,
        credentials: "include",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          _id: id,
          quantity: qty - 1,
        }),
      });

      const responseData = await response.json();
      if (responseData.success) {
        fetchData();
      }
    }
  };

  const deleteCartProduct = async (id) => {
    const response = await fetch(SummaryApi.deleteCartProduct.url, {
      method: SummaryApi.deleteCartProduct.method,
      credentials: "include",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        _id: id,
      }),
    });

    const responseData = await response.json();
    if (responseData.success) {
      fetchData();
      context.fetchUserAddToCart();
    }
  };

//   const productCategory = data.productId.category; // This should dynamically reflect the category of the product
    // console.log(data.productId.category)
  // List of categories that require a delivery fee
//   const categoriesWithDeliveryFee = [
//     "catering",
//     "bakers",
//     "rent",
//     "decorations",
//   ];

  // Calculate delivery fee only if the total price is above 5000 and the category matches
  
    //  && categoriesWithDeliveryFee.includes(productCategory);

  const totalQty = data.reduce((previousValue, currentValue) => previousValue + currentValue.quantity,0);
  const totalPrice = data.reduce((prev, curr) => {
    const itemPrice = curr?.productId?.category.toLowerCase() === 'rent' && curr?.rentalVariant
      ? curr.rentalVariant.variantPrice
      : curr?.productId?.price;
    return prev + (curr.quantity * itemPrice);
  }, 0);


  const shouldApplyDeliveryFee =totalPrice > 5000

  const discount = totalPrice * 0.03; // 3% discount
  const deliveryFee = shouldApplyDeliveryFee ? totalPrice * 0.05 : 0;
  const finalAmount = totalPrice + deliveryFee - discount; // Total after discount
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };
  const handlePayment = async () => {
    const isLoaded = await loadRazorpay();

    if (!isLoaded) {
      toast.error("Razorpay SDK failed to load. Are you online?");
      return;
    }

    try {
      // Fetch current user details to get the email
      const userDetailsResponse = await fetch(SummaryApi.current_user.url, {
        method: SummaryApi.current_user.method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const userResponse = await userDetailsResponse.json();
      console.log(userResponse); // Log to check structure

      if (!userResponse.success) {
        toast.error("Failed to fetch user details. Please try again.");
        return;
      }

      const userEmail = userResponse.data.email; // Extract the current user's email
      const phone = userResponse.data.phoneNumber;
      // Fetch order details with email and status filter
      const response = await fetch(SummaryApi.orderDetails.url, {
        method: SummaryApi.orderDetails.method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const orderDetailsResponse = await response.json();
      console.log("orsers details",orderDetailsResponse); // Log response to check structure

      if (!orderDetailsResponse.success) {
        toast.error("Failed to fetch order details. Please try again.");
        return;
      }

      // Filter the orders based on user email and status
      const pendingOrders = orderDetailsResponse.data.filter(
        (order) => order.userEmail === userEmail && order.status === "Pending"
      );

      if (pendingOrders.length === 0) {
        toast.error("No pending orders found for this user.");
        return;
      }

      const orderDetails = pendingOrders[0]; // Assuming you want the first pending order
      console.log(orderDetails);
      const razorpayKey = process.env.REACT_APP_RAZORPAY_KEY;
      const razorpayKeySecret = process.env.REACT_APP_RAZORPAY_KEY_SECRET;
      //    console.log(razorpayKey)
      const options = {
        key: razorpayKey,
        key_secret: razorpayKeySecret, // Replace with your Razorpay key
        amount: parseInt(finalAmount * 100), // Amount in smallest currency unit
        currency: "INR",
        name: "Nexus Payment Gateway",
        description: "Thank you for shopping with us.",
        handler: async function (response) {
          try {
            const paymentResponse = await fetch(
              SummaryApi.updateOrderWithPayment.url,
              {
                method: "POST",
                credentials: "include",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  paymentId: response.razorpay_payment_id, // Send only paymentId
                  orderDetails: {
                    orderId: orderDetails._id, // Include orderId for reference
                  },
                }),
              }
            );

            const paymentData = await paymentResponse.json();
            console.log(paymentData);
            if (paymentData.success) {
              toast.success("Huray! Payment successful... ");

              // Clear the cart after successful payment
              const clearCartResponse = await fetch(SummaryApi.clear_cart.url, {
                method: "DELETE", // Assuming you're using DELETE to clear the cart
                credentials: "include",
                headers: {
                  "Content-Type": "application/json",
                },
              });

              const clearCartData = await clearCartResponse.json();
              if (clearCartData.success) {
                context.fetchUserAddToCart(); // Refresh cart context
                navigate("/payment-success"); // Redirect to success page
              } else {
                alert("Failed to clear the cart. Please contact support.");
              }
            } else {
              alert(
                "Payment was successful, but updating the order failed. Please contact support."
              );
            }
          } catch (error) {
            console.error("Error updating the order after payment:", error);
            alert(
              "An error occurred while processing your order. Please try again."
            );
          }
        },
        prefill: {
          name: orderDetails.userName,
          email: orderDetails.userEmail,
          contact: phone || "9999999999",
        },
        theme: {
          color: "#ffffff",
        },
        modal: {
          onClose: () => {
            alert("Payment process closed.");
          },
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error("Error fetching order details:", error);
      alert(
        "An error occurred while fetching order details. Please try again."
      );
    }
  };
  const handlePlaceOrder = async () => {
    if (!userDetails || !userDetails.address) {
      toast.error("Please provide a valid delivery address.");
      return;
    }

    if (!deliveryDate) {
      toast.error("Please select a delivery date.");
      return;
    }

    const orderDetails = {
      products: data.map((product) => ({
        productId: product.productId._id,
        productName: product.productId.productName,
        quantity: product.quantity,
        price: product.productId.price,
        vendor: product.productId.user,
        vendorName: product.productId.brandName,
        image: product.productId.productImage[0],
      })),
      address: userDetails.address,
      totalPrice,
      discount,
      finalAmount,
      userEmail: userDetails.email,
      userName: userDetails.name,
      deliveryDate: deliveryDate,
    };

    try {
      const response = await fetch(SummaryApi.checkout.url, {
        method: SummaryApi.checkout.method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderDetails),
      });

      const responseData = await response.json();
      if (responseData.success) {
        handlePayment(); // Directly proceed to payment
      } else {
        toast.error("Failed to place the order. Please try again.");
      }
    } catch (error) {
      console.error("Error placing the order:", error);
      toast.error("An error occurred while placing the order. Please try again.");
    }
  };

  const handlePosterCreation = () => {
    navigate('/social-media');
  };

  const handleAddressChange = () => {
    // Check user role from userDetails
    if (userDetails && userDetails.role) {
      switch (userDetails.role.toLowerCase()) {
        case 'vendor':
          navigate('/vendor-panel/my-profile');
          break;
        case 'customer':
          navigate('/user-panel/my-profile');
          break;
        case 'admin':
          navigate('/admin-panel/my-profile');
          break;
        default:
          toast.error('Unable to determine user role');
          break;
      }
    } else {
      toast.error('Please login to change address');
    }
  };

  // Toggle configuration details for a specific product
  const toggleConfigDetails = (productId) => {
    setShowConfigDetails(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  // Helper function to get the appropriate image for the product
  const getProductImage = (product) => {
    if (product?.productId?.category?.toLowerCase() === 'rent' && product?.rentalVariant) {
      // For rental products, use the first image from the matching variant
      const variant = product.productId.rentalVariants.find(
        v => v._id === product.rentalVariant.variantId
      );
      return variant?.images?.[0] || product?.productId?.productImage[0];
    }
    // For non-rental products, use the first product image
    return product?.productId?.productImage[0];
  };

  return (
    <div className="container mx-auto">
      {/* Address Section with role-based redirect */}
      <div className="bg-white p-4 mb-1">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Delivery Address</h2>
          <button
            className="text-blue-500 hover:text-blue-700 hover:underline transition-colors duration-200"
            onClick={handleAddressChange}
          >
            Change
          </button>
        </div>
        {userDetails && userDetails.address
          ? userDetails.address
          : "No address available"}
      </div>

      {/* Poster Creation Button */}
      <div className="w-full flex justify-end pr-[8%] mb-2">
        <button
          className="group relative bg-gradient-to-r from-blue-600 to-blue-500 
          hover:from-blue-500 hover:to-blue-600 text-white px-8 py-3 rounded-full
          font-semibold text-lg shadow-lg transform hover:scale-105 transition-all duration-300
          overflow-hidden"
          onClick={handlePosterCreation}
        >
          {/* Animated background effect */}
          <div className="absolute inset-0 w-full h-full">
            <div className="absolute w-2 h-full bg-white/20 skew-x-12 
              animate-[shimmer_2s_infinite] group-hover:pause"></div>
          </div>

          {/* Button content with glow effect */}
          <div className="relative flex items-center gap-2">
            <span className="relative">
              Create a Poster for Free
              {/* Glowing dot */}
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full rounded-full 
                  bg-white opacity-75 animate-[ping_1.5s_infinite]"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 
                  bg-white"></span>
              </span>
            </span>
            {/* Animated arrow */}
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 transform group-hover:translate-x-1 transition-transform"
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M17 8l4 4m0 0l-4 4m4-4H3" 
              />
            </svg>
          </div>
        </button>
      </div>

      {/* Cart Items and Summary - Moved up */}
      <div className="flex flex-col lg:flex-row gap-8 lg:justify-between p-4 -mt-4">
        {/* Product List */}
        <div className="w-full max-w-3xl">
          {loading
            ? loadingCart.map((el, index) => (
                <div
                  key={el + "Add To Cart Loading" + index}
                  className="w-full bg-slate-200 h-32 my-1.5 border border-slate-300 animate-pulse rounded"
                ></div>
              ))
            : data.map((product, index) => (
                <div
                  key={product?._id + "Add To Cart Loading"}
                  className="w-full bg-white my-1.5 border border-slate-300 rounded"
                >
                  <div className="grid grid-cols-[128px,1fr]">
                    <div className="w-32 h-32 bg-slate-200 overflow-hidden">
                      <img
                        src={getProductImage(product)}
                        className="w-full h-full object-cover"
                        alt={`${product?.productId?.productName} ${
                          product?.rentalVariant ? `- ${product.rentalVariant.variantName}` : ''
                        }`}
                      />
                    </div>
                    <div className="px-4 py-2 relative">
                      <div
                        className="absolute right-0 text-red-600 rounded-full p-2 hover:bg-red-600 hover:text-white cursor-pointer"
                        onClick={() => deleteCartProduct(product?._id)}
                      >
                        <MdDelete />
                      </div>
                      <h2 className="text-lg lg:text-xl text-ellipsis line-clamp-1">
                        {product?.productId?.productName}
                        {product?.productId?.category.toLowerCase() === 'rent' && product?.rentalVariant && (
                          <span className="text-sm text-gray-600 ml-2">
                            ({product.rentalVariant.variantName})
                          </span>
                        )}
                      </h2>

                      <div className="flex items-center justify-between">
                        <p className="text-red-600 font-medium text-lg">
                          {product?.productId?.category.toLowerCase() === 'rent' && product?.rentalVariant
                            ? displayINRCurrency(product.rentalVariant.variantPrice * product.quantity)
                            : displayINRCurrency(product?.productId?.price * product?.quantity)
                          }
                        </p>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <button
                          className="border border-red-600 text-red-600 hover:bg-red-600 hover:text-white w-6 h-6 flex justify-center items-center rounded"
                          onClick={() => decraseQty(product?._id, product.quantity)}
                        >
                          -
                        </button>
                        <span className="w-6 text-center">{product.quantity}</span>
                        <button
                          className="border border-red-600 text-red-600 hover:bg-red-600 hover:text-white w-6 h-6 flex justify-center items-center rounded"
                          onClick={() => increaseQty(product?._id, product.quantity)}
                        >
                          +
                        </button>
                      </div>

                      {/* Show configuration details for catering items */}
                      {product?.productId?.category === "catering" && (
                        <div className="mt-2">
                          <button
                            onClick={() => toggleConfigDetails(product._id)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium float-right"
                          >
                            {showConfigDetails[product._id] ? "Hide Details" : "Show Details"}
                          </button>
                          
                          {/* Configuration Details */}
                          {showConfigDetails[product._id] && product.configuration && (
                            <div className="mt-4 p-3 bg-gray-50 rounded-md">
                              <h4 className="text-sm font-semibold mb-2">Selected Items:</h4>
                              {Object.entries(product.configuration).map(([courseType, dishes]) => (
                                <div key={courseType} className="mb-2">
                                  <span className="text-sm font-medium text-gray-700">{courseType}:</span>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    {Array.isArray(dishes) && dishes.map((dish, index) => (
                                      <span
                                        key={index}
                                        className="inline-flex items-center px-2 py-1 rounded-full text-xs
                                          bg-blue-100 text-blue-800 border border-blue-200"
                                      >
                                        {dish}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Show rental variant details */}
                      {product?.productId?.category.toLowerCase() === 'rent' && product?.rentalVariant && (
                        <div className="mt-2 text-sm text-gray-600">
                          <p>Option: {product.rentalVariant.variantName}</p>
                          <p>Price per item: {displayINRCurrency(product.rentalVariant.variantPrice)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
        </div>

        {/* Order Summary */}
        <div className="lg:w-[350px] h-max bg-white border border-slate-200 rounded-md p-4">
          <h2 className="font-semibold text-lg mb-2">Order Summary</h2>
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-600">Subtotal ({totalQty} items)</span>
            <span className="font-medium">
              {displayINRCurrency(totalPrice)}
            </span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-600">Discount</span>
            <span className="font-medium">3%</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-600">You save </span>
            <span className="font-medium text-red-400">
              {displayINRCurrency(discount)}
            </span>
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-600">Delivery Fee</span>
            <span
              className={`font-medium ${
                deliveryFee > 0 ? "text-black" : "text-green-600"
              }`}
            >
              {deliveryFee > 0 ? displayINRCurrency(deliveryFee) : "Free"}
            </span>
          </div>
          <hr className="my-2" />

          {/* Add delivery date form */}
          <form className="mb-4">
            <label
              htmlFor="deliveryDate"
              className="block text-lg font-medium text-red-600 mb-1"
            >
              When is the Event?
            </label>
            <input
              type="date"
              id="deliveryDate"
              name="deliveryDate"
              value={deliveryDate}
              onChange={handleDeliveryDateChange}
              min={getMinDeliveryDate()}
              className="mt-1 block w-full rounded-md border-gray-700 text-md font-semibold text-blue-400 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            />
          </form>

          <div className="flex items-center justify-between mb-2">
            <span className="text-lg">Total Amount</span>
            <span className="font-bold text-lg">
              {displayINRCurrency(finalAmount)}
            </span>
          </div>

          {/* Place Order Button */}
          <div className="mt-4">
            <button
              className="bg-red-600 hover:bg-red-700 transition-all duration-300 text-white w-full p-2 rounded"
              onClick={handlePlaceOrder}
            >
              Place Order
            </button>
          </div>
        </div>
      </div>

    
  <ConfirmationModal 
  isOpen={showPosterModal} 
  onClose={() => {
    setShowPosterModal(false); // Close the modal
    handlePayment(); // Proceed with payment
  }} 
  onConfirm={() => {
    navigate('/social-media'); // Redirect to the social media page
    setShowPosterModal(false); // Close the modal
  }} 
/>
    </div>
  

);
};

export default Cart;
