import React, { useContext, useEffect, useState } from "react";
import SummaryApi from "../common";
import Context from "../context";
import displayINRCurrency from "../helpers/displayCurrency";
import { MdDelete } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Cart = () => {
  const [data, setData] = useState([]);
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("Flipkart");
  const [deliveryDate, setDeliveryDate] = useState("");
  const context = useContext(Context);
  const navigate = useNavigate();
  const loadingCart = new Array(4).fill(null);

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
      console.log(data)
   
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
  const totalPrice = data.reduce((preve, curr) => preve + curr.quantity * curr?.productId?.price,0);


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
          color: "#000000",
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
      alert("Please provide a valid delivery address.");
      return;
    }

    if (!deliveryDate) {
      alert("Please select a delivery date.");
      return;
    }

    const orderDetails = {
      products: data.map((product) => ({
        productId: product.productId._id,
        productName: product.productId.productName,
        quantity: product.quantity,
        price: product.productId.price,
        vendor:product.productId.user,
        vendorName:product.productId.brandName,
        image:product.productId.productImage[0],
      })),
      address: userDetails.address,
      totalPrice,
      discount,
      finalAmount,
      
      userEmail: userDetails.email,
      userName: userDetails.name,
      deliveryDate: deliveryDate, // Add delivery date to order details
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
        handlePayment(); // Trigger Razorpay payment after successful order creation
      } else {
        alert("Failed to place the order. Please try again.");
      }
    } catch (error) {
      console.error("Error placing the order:", error);
      alert("An error occurred while placing the order. Please try again.");
    }
  };

  return (
    <div className="container mx-auto">
      {/* Address Section */}
      <div className="bg-white p-4 mb-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Delivery Address</h2>
          <button
            className="text-blue-500 hover:underline"
            onClick={() => console.log("Edit Address")}
          >
            Change
          </button>
        </div>
        {userDetails && userDetails.address
          ? userDetails.address
          : "No address available"}
      </div>

      {/* Cart Items and Summary */}
      <div className="flex flex-col lg:flex-row gap-10 lg:justify-between p-4">
        {/* Product List */}
        <div className="w-full max-w-3xl">
          {loading
            ? loadingCart.map((el, index) => (
                <div
                  key={el + "Add To Cart Loading" + index}
                  className="w-full bg-slate-200 h-32 my-2 border border-slate-300 animate-pulse rounded"
                ></div>
              ))
            : data.map((product, index) => (
                <div
                  key={product?._id + "Add To Cart Loading"}
                  className="w-full bg-white h-32 my-2 border border-slate-300 rounded grid grid-cols-[128px,1fr]"
                >
                  <div className="w-32 h-32 bg-slate-200">
                    <img
                      src={product?.productId?.productImage[0]}
                      className="w-full h-full object-scale-down mix-blend-multiply"
                      alt={product?.productId?.productName}
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
                    </h2>

                    <div className="flex items-center justify-between">
                      <p className="text-red-600 font-medium text-lg">
                        {displayINRCurrency(
                          product?.productId?.price * product?.quantity
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <button
                        className="border border-red-600 text-red-600 hover:bg-red-600 hover:text-white w-6 h-6 flex justify-center items-center rounded"
                        onClick={() =>
                          decraseQty(product?._id, product.quantity)
                        }
                      >
                        -
                      </button>
                      <span className="w-6 text-center">
                        {product.quantity}
                      </span>
                      <button
                        className="border border-red-600 text-red-600 hover:bg-red-600 hover:text-white w-6 h-6 flex justify-center items-center rounded"
                        onClick={() =>
                          increaseQty(product?._id, product.quantity)
                        }
                      >
                        +
                      </button>
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
              onChange={(e) => setDeliveryDate(e.target.value)}
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
          <button
            className="bg-red-600 hover:bg-red-700 transition-all duration-300 text-white w-full p-2 rounded mt-4"
            onClick={handlePlaceOrder}
          >
            Place Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
