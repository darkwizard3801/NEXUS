import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSpinner, FaComments, FaDownload, FaTimes } from 'react-icons/fa';
import SummaryApi from '../common';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { IoCloseSharp } from "react-icons/io5";
import { toast } from "react-toastify";


const MyOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All'); // State for selected filter
  const [cancellationReason, setCancellationReason] = useState('');
  const [showCancellationForm, setShowCancellationForm] = useState(false);
  const [showRatingForm, setShowRatingForm] = useState(false); // State to control rating form visibility
  const [rating, setRating] = useState(0); // State to hold the selected rating
  const [ratingComment, setRatingComment] = useState('');
  const [selectedProductId, setSelectedProductId] = useState(''); // State to hold the selected product ID // State to hold the rating comment
  useEffect(() => {
    
    const fetchCurrentUserDetails = async () => {
      try {
        const response = await fetch(SummaryApi.current_user.url, {
          method: SummaryApi.current_user.method,
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch current user details');
        }

        const data = await response.json();
        setCurrentUserEmail(data.data.email);
      } catch (error) {
        setError(error.message);
      }
    };

    const fetchOrders = async () => {
      try {
        const response = await fetch(SummaryApi.orderDetails.url, {
          method: SummaryApi.orderDetails.method,
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }

        const data = await response.json();
        const filteredOrders = data.data.filter(order => order.userEmail === currentUserEmail);
        setOrders(filteredOrders);
        console.log("filteredOrders",filteredOrders);
        setLoading(false);
        
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchCurrentUserDetails().then(() => {
      fetchOrders();
    });
  }, [currentUserEmail]);

  const toggleOrderDetails = (orderId) => {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Pending':
        return 'text-yellow-500';
      case 'Ordered':
        return 'text-green-400';
      case 'Dispatched':
        return 'text-green-500';
      case 'On the Way':
        return 'text-green-600';
      case 'Cancelled':
        return 'text-red-500';
      case 'Delivered':
        return 'text-green-700';
      default:
        return 'text-gray-600';
    }
  };

  const downloadInvoice = (order) => {
    const doc = new jsPDF();
    doc.setFont('Helvetica', 'bold'); // Change font to bold for the heading
    doc.setFontSize(20); // Increased font size for the heading
    doc.text('Invoice', doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' }); // Centered heading
    
    // Add Invoice Number and Date below the heading with reduced size
    doc.setFont('Helvetica', 'normal'); // Change back to normal font
    doc.setFontSize(8); // Further reduced font size
    const invoiceNumberText = `Invoice Number: ${order.invoiceNumber}`;
    const dateText = `Date: ${new Date().toLocaleString()}`;
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Calculate positions for right alignment
    const invoiceNumberX = pageWidth - doc.getTextWidth(invoiceNumberText) - 20; // 20 units from the right
    const dateX = pageWidth - doc.getTextWidth(dateText) - 20; // 20 units from the right

    doc.text(invoiceNumberText, invoiceNumberX, 30); // Positioned below the heading
    doc.text(dateText, dateX, 38); // Positioned below the heading

    doc.setFontSize(12); // Reset font size for the rest of the content
    doc.setFont('Helvetica', 'normal'); // Ensure normal font for the content
    doc.text(`Order ID: ${order._id}`, 20, 50);
    doc.text(`Name: ${order.userName}`, 20, 60);
    doc.text(`User: ${order.userEmail}`, 20, 70);
    doc.text(`Address: ${order.address}`, 20, 80);
    doc.text(`Status: ${order.status}`, 20, 90);
    doc.text(`Delivery Date: ${new Date(order.deliveryDate).toLocaleDateString()}`, 20, 100);
    
    const products = order.products.map((product, index) => {
      return [
        index + 1,
        product.productName || 'N/A',
        product.vendorName,
        product.quantity ? product.quantity.toString() : '0',
        product.price ? `${product.price.toFixed(2)}` : '0.00',
        product.quantity && product.price
          ? `${(product.quantity * product.price).toFixed(2)}`
          : '0.00',
      ];
    });
  
    doc.autoTable({
      startY: 110,
      head: [['#', 'Product Name', 'Vendor', 'Quantity', 'Price', 'Total']],
      body: products,
      theme: 'grid', // Add grid theme for a professional look
      styles: { font: 'Helvetica', fontSize: 10 }, // Set font and size for table
    });

    // Professional price calculation section
    const totalPriceY = doc.autoTable.previous.finalY + 20;
    const discountY = totalPriceY + 10;
    const finalAmountY = discountY + 10;

    doc.setFontSize(12);
    const priceSummaryText = 'Price Summary';
    doc.text(priceSummaryText, doc.internal.pageSize.getWidth() / 2, totalPriceY - 10, { align: 'center' }); // Centered section title
    doc.setFont('Helvetica', 'normal'); // Normal font for the summary

    // Total Price
    doc.text('Total Price:', 20, totalPriceY);
    doc.text(`${order.totalPrice?.toFixed(2) || '0.00'}`, pageWidth - 40, totalPriceY, { align: 'right' });

    // Discount
    doc.text('Discount:', 20, discountY);
    doc.text(`- ${order.discount?.toFixed(2) || '0.00'}`, pageWidth - 40, discountY, { align: 'right' });

    // Final Amount
    doc.text('Final Amount:', 20, finalAmountY);
    doc.text(`${order.finalAmount?.toFixed(2) || '0.00'}`, pageWidth - 40, finalAmountY, { align: 'right' });

    doc.save('invoice.pdf');
  };

  // Filter orders based on the selected status
  const filteredOrders = selectedStatus === 'All'
    ? orders
    : orders.filter(order => order.status === selectedStatus);

    const cancelOrder = async (orderId) => {
      // Check if cancellationReason is provided
      if (!cancellationReason) {
          alert('Please select a cancellation reason');
          return;
      }
  
      try {
          // Make a POST request to cancel the order
          const response = await fetch(SummaryApi.cancelOrder.url, {
              method: 'POST', // Change to POST
              credentials: 'include',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({ orderId, cancellationReason }), // Send both orderId and cancellationReason
          });
  
          // Check if the response is OK
          if (!response.ok) {
              throw new Error('Failed to cancel order');
          }
          if (response.ok)
          {
            toast.success("Order Cancelled SuccessFully")
          }
          // Update the local state with the updated order details
          const updatedOrder = await response.json();
          setOrders(orders.map(order => 
              order._id === updatedOrder.order._id // Use the updated order from the response
                  ? { ...order, status: 'Cancelled', cancellationReason } 
                  : order
          ));
  
          // Reset form and state
          setShowCancellationForm(false);
          setCancellationReason('');
          setExpandedOrderId(null);
      } catch (error) {
          console.error('Error cancelling order:', error);
          alert('Failed to cancel order. Please try again.');
      }
  };
  

  // Add this function to handle the button click
  const handleChatClick = () => {
    navigate('/chat'); // Replace '/chat' with your actual chat page route
  };

  const handleRatingSubmit = async (orderId, productId) => { // Add productId parameter
    try {
      const response = await fetch(SummaryApi.submitRating.url, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId, productId, rating, comment: ratingComment }), // Include productId
      });
  
      if (!response.ok) {
        throw new Error('Failed to submit rating');
      }
  
      toast.success('Rating submitted successfully');
      setShowRatingForm(false);
      setRating(0);
      setRatingComment('');
      setSelectedProductId(''); // Reset selected product ID
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Failed to submit rating. Please try again.');
    }
  };


  return (
    <div className="flex flex-col md:flex-row items-start justify-center min-h-screen bg-gray-50 relative mx-10">
      {/* Filter Section */}
      <div className="w-full md:w-1/4 p-4">
        <h2 className="text-xl font-bold text-gray-700 mb-4">Filter Orders by Status:</h2>
        <div className="flex flex-col space-y-2">
          {['All', 'Pending', 'Ordered', 'Dispatched', 'On the Way', 'Cancelled','Delivered'].map((status) => (
            <label key={status} className="flex items-center space-x-2">
              <input
                type="radio"
                value={status}
                checked={selectedStatus === status}
                onChange={() => setSelectedStatus(status)}
                className="form-radio text-blue-600"
              />
              <span className="text-gray-700">{status}</span>
            </label>
          ))}
        </div>
      </div>
       
      {/* Vertical Divider */}
      <div className="hidden md:block w-1 bg-gray-800 shadow-md mx-4"></div>

      {/* Orders Section */}
      <div className="w-full md:w-3/4 p-4">
        {loading ? (
          <div className="flex flex-col items-center">
            <FaSpinner className="animate-spin text-4xl mb-4 text-blue-600" />
            <h2 className="text-lg text-gray-700">Loading your orders...</h2>
          </div>
        ) : error ? (
          <div className="text-red-500">
            <h2 className="text-lg">Error: {error}</h2>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 col-span-full">My Orders</h2>
            {filteredOrders.map((order) => (
              <div
                key={order._id}
                className={`bg-white rounded-lg shadow-lg overflow-hidden ${order.status === 'Cancelled' && expandedOrderId !== order._id ? 'opacity-50' : ''}`}
              >
                <div onClick={() => toggleOrderDetails(order._id)} className="cursor-pointer">
                  <img
                    src={order.products[0]?.image}
                    alt={order.products[0]?.productName}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <p className="text-center text-gray-800 font-semibold mt-2">
                    {order.products[0]?.productName}
                  </p>
                </div>
                

                {expandedOrderId === order._id && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full relative flex flex-col" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
      {/* Close Button */}
      <button className="absolute top-4 right-4 text-gray-500 hover:text-gray-800" onClick={() => toggleOrderDetails(order._id)}>
        <IoCloseSharp className="text-2xl" />
      </button>

      <h3 className="font-semibold text-gray-800 mb-2">Order ID: {order._id}</h3>
      <div className="text-gray-600 mb-4">
        <h4 className="font-semibold">Address:</h4>
        <p className="whitespace-pre-line">{order.address}</p>
      </div>
      <p className="font-semibold text-black">
        Status: <span className={getStatusClass(order.status)}>{order.status}</span>
      </p>
      <p>Delivery Date: {new Date(order.deliveryDate).toLocaleDateString()}</p>

      {/* Rating Form */}
     

      {/* Give Rating Button */}
     

      <div className="mt-4">
        <h4 className="font-semibold text-gray-700">Products:</h4>
        <ul className="list-disc pl-5 space-y-1">
          {order.products.map((product, index) => (
            <li key={index} className="bg-gray-100 rounded-md p-4 flex items-center space-x-4">
              <img
                src={product.image}
                alt={product.productName}
                className="w-20 h-20 object-cover"
              />
              <div className="flex-1">
                <div className="text-gray-800 font-semibold">{product.productName}</div>
                <div className="text-gray-600">
                  Quantity: {product.quantity} x ₹{product.price}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4">
        <p className="text-gray-700 font-semibold">Total Price: ₹{order.totalPrice || '0.00'}</p>
        <p className="text-gray-700 font-semibold">Discount: ₹{order.discount || '0.00'}</p>
        <p className="text-gray-700 font-semibold">Final Amount: ₹{order.finalAmount}</p>
      </div>

      <div className="mt-4 flex space-x-2">
        <button
          className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700"
          onClick={() => downloadInvoice(order)}
        >
          <FaDownload className="inline mr-1" /> Download Invoice
        </button>

        {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
          <button 
            className="bg-red-500 text-white px-3  rounded-lg hover:bg-red-600"
            onClick={() => setShowCancellationForm(true)}
          >
            <FaTimes className="inline mr-1" /> Cancel Order
          </button>
        )}
      {order.status === 'Delivered' && !showRatingForm && (
        <button
          className="bg-green-500 text-white px-3 py-1  h-9 rounded-lg hover:bg-green-600 "
          onClick={() => setShowRatingForm(true)}
        >
          Give Rating
        </button>
      )}
      </div>


      {showCancellationForm && (
        <div className="mt-4 bg-gray-100 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-700 mb-2">Why are you cancelling the order?</h4>
          <select
            className="w-full p-2 border rounded-md mb-2"
            value={cancellationReason}
            onChange={(e) => setCancellationReason(e.target.value)}
          >
            <option value="">Select a reason</option>
            <option value="Changed my mind">Changed my mind</option>
            <option value="Found a better deal">Found a better deal</option>
            <option value="Ordered by mistake">Ordered by mistake</option>
            <option value="Shipping takes too long">Shipping takes too long</option>
            <option value="Other">Other</option>
          </select>
          <div className="flex justify-end space-x-2">
            <button
              className="bg-gray-300 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-400"
              onClick={() => {
                setShowCancellationForm(false);
                setCancellationReason('');
              }}
            >
              Cancel
            </button>
            <button
              className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600"
              onClick={() => cancelOrder(order._id)}
            >
              Submit
            </button>
          </div>
        </div>
      )}

{showRatingForm && (
  <div className="mt-4">
    <h4 className="font-semibold text-gray-700">Rate this Order:</h4>
    
    {/* Dropdown for selecting product */}
    <select
      className="mt-2 w-full p-2 border rounded-md"
      value={selectedProductId}
      onChange={(e) => setSelectedProductId(e.target.value)}
    >
      <option value="">Select a product</option>
      {order.products.map((product) => (
        <option key={product.productId} value={product.productId}>
         
          {product.productName} <img src={product.image}  className="inline w-6 h-6 mr-2" />
        </option>
      ))}
    </select>

    <div className="flex space-x-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`cursor-pointer ${rating >= star ? 'text-yellow-400' : 'text-gray-400'}`}
          onClick={() => setRating(star)}
        >
          ★
        </span>
      ))}
    </div>
    <textarea
      className="mt-2 w-full p-2 border rounded-md"
      rows={3}
      placeholder="Leave a comment"
      value={ratingComment}
      onChange={(e) => setRatingComment(e.target.value)}
    ></textarea>
    <button
      className="bg-blue-600 text-white mt-2 px-3 py-1 rounded-lg hover:bg-blue-700"
      onClick={() => handleRatingSubmit(order._id, selectedProductId)} // Pass selectedProductId
    >
      Submit Rating
    </button>
  </div>
)}
    </div>
  </div>
)}

              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-600">No orders found.</div>
        )}
      </div>
      {/* Chat with Us button */}
      <div className="fixed bottom-24 right-4 z-50">
        <button 
          className="bg-yellow-500 text-white px-4 py-2 rounded-full hover:bg-yellow-600 shadow-lg flex items-center"
          onClick={handleChatClick}
        >
          <FaComments className="mr-2" /> Chat with Us
        </button>
      </div>
    </div>
  );
};

export default MyOrders;
