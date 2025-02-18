import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSpinner, FaComments, FaDownload, FaTimes, FaCommentDots } from 'react-icons/fa';
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
  const [products, setProducts] = useState({}); // Store fetched product details
  const [selectedOrderId, setSelectedOrderId] = useState(null);

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

        // Fetch product details for each order
        const productIds = new Set();
        filteredOrders.forEach(order => {
          order.products.forEach(product => {
            if (product.productId) {
              productIds.add(product.productId);
            }
          });
        });

        // Fetch product details
        const productDetails = {};
        for (const productId of productIds) {
          try {
            const productResponse = await fetch(SummaryApi.productDetails.url, {
              method: SummaryApi.productDetails.method,
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ productId: productId })
            });
            
            if (productResponse.ok) {
              const productData = await productResponse.json();
              productDetails[productId] = productData.data;
            }
          } catch (error) {
            console.error(`Error fetching product ${productId}:`, error);
          }
        }
        setProducts(productDetails);
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
    
    // Header Section
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('NEXUS', doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
    
    // Invoice text below brand name
    doc.setFontSize(12);
    doc.text('INVOICE', doc.internal.pageSize.getWidth() / 2, 30, { align: 'center' });
    
    // Invoice Details
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Left side details
    doc.text('Bill To:', 20, 50);
    doc.text(`Name: ${order.userName}`, 20, 57);
    doc.text(`Email: ${order.userEmail}`, 20, 64);
    doc.text(`Address: ${order.address}`, 20, 71);
    
    // Right side details
    doc.text(`Invoice No: INV-${order.invoiceNumber}`, pageWidth - 60, 50);
    doc.text(`Order Date: ${new Date(order.createdAt).toLocaleDateString()}`, pageWidth - 60, 57);
    doc.text(`Order Status: ${order.status}`, pageWidth - 60, 64);
    doc.text(`Expected Delivery: ${new Date(order.deliveryDate).toLocaleDateString()}`, pageWidth - 60, 71);

    // Divider
    doc.setDrawColor(220, 220, 220);
    doc.line(20, 80, pageWidth - 20, 80);

    // Products Table
    const tableColumns = [
      { header: '#', dataKey: 'index' },
      { header: 'Product', dataKey: 'product' },
      { header: 'Category', dataKey: 'category' },
      { header: 'Qty', dataKey: 'quantity' },
      { header: 'Price', dataKey: 'price' },
      { header: 'Total', dataKey: 'total' }
    ];

    const tableRows = order.products.map((product, index) => {
      let productDetails = '';
      if (product.category.toLowerCase() === 'catering') {
        const courses = product.additionalDetails?.catering?.courses || [];
        productDetails = `${product.productName}\n${courses.map(c => 
          `${c.courseName} (${c.menuItems.join(', ')})`
        ).join('\n')}`;
      } else if (product.category.toLowerCase() === 'rent') {
        const rental = product.additionalDetails?.rental;
        productDetails = `${product.productName}\n${rental?.variantName || ''}\n${
          new Date(rental?.startDate).toLocaleDateString()} - ${
          new Date(rental?.endDate).toLocaleDateString()}`;
      } else {
        productDetails = product.productName;
      }

      return {
        index: index + 1,
        product: productDetails,
        category: product.category,
        quantity: product.quantity,
        price: `${product.price.toFixed(2)}`,
        total: `${(product.quantity * product.price).toFixed(2)}`
      };
    });

    doc.autoTable({
      startY: 90,
      head: [tableColumns.map(col => col.header)],
      body: tableRows.map(row => tableColumns.map(col => row[col.dataKey])),
      theme: 'grid',
      headStyles: {
        fillColor: [51, 122, 183],
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      columnStyles: {
        index: { cellWidth: 10 },
        product: { cellWidth: 'auto' },
        category: { cellWidth: 30 },
        quantity: { cellWidth: 20 },
        price: { cellWidth: 30 },
        total: { cellWidth: 30 }
      }
    });

    // Price Summary
    const finalY = doc.autoTable.previous.finalY + 10;
    
    // Summary Box
    doc.setDrawColor(220, 220, 220);
    doc.setFillColor(250, 250, 250);
    const summaryBoxY = finalY;
    const summaryBoxHeight = 40;
    doc.rect(pageWidth - 90, summaryBoxY, 70, summaryBoxHeight, 'F');

    // Price Details
    doc.setFontSize(10);
    doc.text('Sub Total:', pageWidth - 85, summaryBoxY + 10);
    doc.text(`${order.totalPrice.toFixed(2)}`, pageWidth - 25, summaryBoxY + 10, { align: 'right' });
    
    doc.text('Discount:', pageWidth - 85, summaryBoxY + 20);
    doc.text(`${order.discount.toFixed(2)}`, pageWidth - 25, summaryBoxY + 20, { align: 'right' });
    
    doc.setFont('Helvetica', 'bold');
    doc.text('Final Amount:', pageWidth - 85, summaryBoxY + 30);
    doc.text(`${order.finalAmount.toFixed(2)}`, pageWidth - 25, summaryBoxY + 30, { align: 'right' });

    // Footer with Logo and Details
    const footerY = doc.internal.pageSize.getHeight() - 20;
    
    // Add Logo
    const logoUrl = 'https://res.cloudinary.com/du8ogkcns/image/upload/v1726763193/n5swrlk0apekdvwsc2w5.png';
    const logoWidth = 30; // Adjust size as needed
    const logoHeight = 15; // Adjust size as needed
    const logoX = doc.internal.pageSize.getWidth() / 2 - logoWidth / 2;
    
    // Add image with error handling
    try {
      doc.addImage(logoUrl, 'PNG', logoX, footerY - 25, logoWidth, logoHeight);
    } catch (error) {
      console.error('Error adding logo to PDF:', error);
    }

    // Add divider line above footer
    doc.setDrawColor(220, 220, 220);
    doc.line(20, footerY - 8, pageWidth - 20, footerY - 8);

    // Company Details in footer
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Thank you for your business!', doc.internal.pageSize.getWidth() / 2, footerY - 5, { align: 'center' });
    doc.text('For any queries, please contact pheonix.nexus.2024@gmail.com', doc.internal.pageSize.getWidth() / 2, footerY, { align: 'center' });
    doc.text(`Generated on: ${new Date().toLocaleString()}`, doc.internal.pageSize.getWidth() / 2, footerY + 5, { align: 'center' });

    // Add letterhead style elements
    doc.setDrawColor(51, 122, 183); // Blue color for design elements
    doc.setLineWidth(0.5);
    doc.line(20, footerY + 10, pageWidth - 20, footerY + 10); // Bottom border

    // Save the PDF with formatted invoice number
    doc.save(`NEXUS-Invoice-${order.invoiceNumber}.pdf`);
  };

  // Filter and sort orders
  const filteredOrders = selectedStatus === 'All'
    ? [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    : [...orders]
        .filter(order => order.status === selectedStatus)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const handleCancelClick = (orderId) => {
    setSelectedOrderId(orderId);
    setShowCancellationForm(true);
  };

  const handleCancelOrder = async () => {
    if (!cancellationReason) {
      toast.error('Please select a cancellation reason');
      return;
    }

    try {
      const response = await fetch(SummaryApi.cancelOrder.url, {
        method: SummaryApi.cancelOrder.method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          orderId: selectedOrderId, 
          cancellationReason 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to cancel order');
      }

      const data = await response.json();
      
      // Update orders state
      setOrders(orders.map(order => 
        order._id === selectedOrderId
          ? { ...order, status: 'Cancelled' }
          : order
      ));

      toast.success('Order cancelled successfully');
      setShowCancellationForm(false);
      setCancellationReason('');
      setSelectedOrderId(null);
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('Failed to cancel order. Please try again.');
    }
  };

  const handleRatingClick = (orderId, productId) => {
    setSelectedOrderId(orderId);
    setSelectedProductId(productId);
    setShowRatingForm(true);
  };

  const handleRatingSubmit = async (orderId, productId) => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    try {
      const response = await fetch(SummaryApi.submitRating.url, {
        method: SummaryApi.submitRating.method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          productId,
          rating,
          comment: ratingComment,
          userEmail: currentUserEmail
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit rating');
      }

      const data = await response.json();
      
      // Update the orders state to reflect the rating
      setOrders(orders.map(order => {
        if (order._id === orderId) {
          return {
            ...order,
            products: order.products.map(product => {
              if (product.productId === productId) {
                return { ...product, isRated: true };
              }
              return product;
            })
          };
        }
        return order;
      }));

      toast.success('Rating submitted successfully');
      setShowRatingForm(false);
      setRating(0);
      setRatingComment('');
      setSelectedProductId('');
      setSelectedOrderId(null);
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Failed to submit rating. Please try again.');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCourseTypeColor = (courseType) => {
    switch (courseType?.toLowerCase()) {
      case 'starter':
        return 'bg-yellow-100 text-yellow-800';
      case 'main course':
        return 'bg-green-100 text-green-800';
      case 'dessert':
        return 'bg-pink-100 text-pink-800';
      case 'beverage':
        return 'bg-purple-100 text-purple-800';
      case 'snack':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getDishColor = (index) => {
    const colors = [
      'bg-red-100 text-red-800',
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-yellow-100 text-yellow-800',
      'bg-purple-100 text-purple-800',
      'bg-pink-100 text-pink-800',
      'bg-indigo-100 text-indigo-800',
      'bg-orange-100 text-orange-800',
      'bg-teal-100 text-teal-800',
      'bg-cyan-100 text-cyan-800'
    ];
    return colors[index % colors.length];
  };

  const renderProductDetails = (orderProduct) => {
    if (!orderProduct || !orderProduct.category) {
      return null;
    }

    switch (orderProduct.category.toLowerCase()) {
      case 'catering':
        let globalDishIndex = 0; // Track global index for all dishes
        return (
          <div className="mt-3 bg-orange-50 p-4 rounded-lg">
            <h4 className="text-sm font-semibold text-orange-700 mb-2">Catering Details</h4>
            {orderProduct.additionalDetails?.catering?.courses?.map((course, idx) => (
              <div key={idx} className="mb-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h5 className="font-medium text-orange-800">{course.courseName}</h5>
                    <p className="text-sm text-orange-600">{course.courseType}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-xs font-medium text-orange-700 mb-2">Menu Items:</p>
                  <div className="flex flex-wrap gap-2">
                    {course.menuItems?.map((item) => {
                      const color = getDishColor(globalDishIndex++);
                      return (
                        <span 
                          key={globalDishIndex}
                          className={`text-xs px-3 py-1.5 rounded-full ${color} hover:bg-opacity-80 transition-colors duration-200`}
                        >
                          {item}
                        </span>
                      );
                    })}
                  </div>
                </div>
                {course.dietaryRestrictions && course.dietaryRestrictions.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-orange-700 mb-2">Dietary Restrictions:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {course.dietaryRestrictions.map((restriction, i) => (
                        <span key={i} className="text-xs bg-red-100 px-2 py-1 rounded-full text-red-700">
                          {restriction}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {course.additionalNotes && (
                  <p className="mt-3 text-xs text-orange-600 italic">
                    Note: {course.additionalNotes}
                  </p>
                )}
              </div>
            ))}
          </div>
        );

      case 'rent':
        const rentalDetails = orderProduct.additionalDetails?.rental;
        return (
          <div className="mt-3 bg-blue-50 p-4 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-700 mb-2">Rental Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-600">Rental Period</p>
                <p className="text-sm font-medium">
                  {formatDate(rentalDetails?.startDate)} - {formatDate(rentalDetails?.endDate)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Selected Variant</p>
                <p className="text-sm font-medium">{rentalDetails?.variantName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Daily Rate</p>
                <p className="text-sm font-medium">₹{rentalDetails?.variantPrice}/day</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Total Rental Cost</p>
                <p className="text-sm font-medium">₹{rentalDetails?.totalPrice}</p>
              </div>
              {rentalDetails?.fine > 0 && (
                <div>
                  <p className="text-xs text-red-600">Fine Amount</p>
                  <p className="text-sm font-medium text-red-600">₹{rentalDetails.fine}</p>
                  <p className="text-xs text-gray-500">(₹{rentalDetails.finePerDay}/day)</p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-600">Return Status</p>
                <p className={`text-sm font-medium ${rentalDetails?.isReturned ? 'text-green-600' : 'text-orange-600'}`}>
                  {rentalDetails?.isReturned ? 'Returned' : 'Not Returned'}
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="mt-3">
            <p className="text-sm text-gray-600">Regular Purchase</p>
          </div>
        );
    }
  };

  const getProductImage = (product) => {
    if (!product) return 'https://placehold.co/150x150';

    try {
      if (product.category?.toLowerCase() === 'rent' && 
          product.additionalDetails?.rental?.variantImage) {
        return product.additionalDetails.rental.variantImage;
      }
      const productDetails = products[product.productId];
      return productDetails?.productImage?.[0] || 'https://placehold.co/150x150';
    } catch (error) {
      console.error('Error getting product image:', error);
      return 'https://placehold.co/150x150';
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-start justify-center min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white relative mx-10">
      {/* Filter Section */}
      <div className="w-full md:w-1/4 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 pb-2 border-b border-gray-200 dark:border-gray-700">
          Filter Orders
        </h2>
        <div className="space-y-3">
          {['All', 'Pending', 'Ordered', 'Dispatched', 'On the Way', 'Cancelled', 'Delivered'].map((status) => (
            <label 
              key={status} 
              className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 
                hover:bg-gray-50 dark:hover:bg-gray-700
                ${selectedStatus === status ? 'bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700' : ''}`}
            >
              <input
                type="radio"
                value={status}
                checked={selectedStatus === status}
                onChange={() => setSelectedStatus(status)}
                className="form-radio h-4 w-4 text-blue-600 dark:text-blue-400 transition duration-150 ease-in-out cursor-pointer"
              />
              <span className={`ml-3 font-medium ${
                selectedStatus === status 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-gray-900 dark:text-white'
              }`}>
                {status}
                <span className="ml-1 text-sm text-gray-500 dark:text-gray-300">
                  ({status === 'All' ? orders.length : orders.filter(order => order.status === status).length})
                </span>
              </span>
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
            <FaSpinner className="animate-spin text-4xl mb-4 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg text-gray-900 dark:text-white">Loading your orders...</h2>
          </div>
        ) : error ? (
          <div className="text-red-500 dark:text-red-400">
            <h2 className="text-lg">Error: {error}</h2>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">My Orders</h2>
            {filteredOrders.map((order) => (
              <div key={order._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                {/* Order Header */}
                <div className="p-4 border-b bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Order Date</p>
                      <p className="font-medium text-gray-900 dark:text-white">{formatDate(order.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Order ID</p>
                      <p className="font-medium text-gray-900 dark:text-white truncate">{order._id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Total Amount</p>
                      <p className="font-medium text-gray-900 dark:text-white">{order.finalAmount}</p>
                      {order.discount > 0 && (
                        <p className="text-xs text-green-600 dark:text-green-400">Saved {order.discount}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Status</p>
                      <p className={`font-medium ${getStatusClass(order.status)}`}>
                        {order.status}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Products List */}
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {order.products.map((orderProduct, index) => {
                    const productDetails = products[orderProduct.productId];
                    console.log("Order Product:", orderProduct); // Debug log
                    return (
                      <div key={index} className="p-4">
                        <div className="flex gap-4">
                          {/* Updated Product Image section */}
                          <div className="w-32 h-32 flex-shrink-0">
                            <img
                              src={getProductImage(orderProduct)}
                              alt={orderProduct.productName || 'Product'}
                              className="w-full h-full object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://placehold.co/150x150';
                              }}
                            />
                          </div>

                          {/* Product Information */}
                          <div className="flex-grow">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium text-lg text-gray-900 dark:text-white">
                                  {productDetails?.productName || orderProduct.productName}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                  {productDetails?.brandName || orderProduct.brandName || 'Brand'} • {productDetails?.category || orderProduct.category}
                                </p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                                  Quantity: {orderProduct.quantity} × ₹{orderProduct.price}
                                </p>
                              </div>
                              <div className="flex flex-col items-end">
                                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                  ₹{(orderProduct.quantity * orderProduct.price).toFixed(2)}
                                </p>
                              </div>
                            </div>
                            {renderProductDetails(orderProduct)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Order Actions */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700 flex flex-wrap justify-between items-center gap-4">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => downloadInvoice(order)}
                      className="flex items-center px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <FaDownload className="mr-2" /> Download Invoice
                    </button>
                    
                    {order.status === 'Delivered' && order.products.some(product => !product.isRated) && (
                      <button
                        onClick={() => handleRatingClick(order._id, order.products.find(p => !p.isRated).productId)}
                        className="flex items-center px-4 py-2 text-sm font-semibold bg-gradient-to-r from-yellow-400 to-yellow-500 text-white 
                        rounded-md hover:from-yellow-500 hover:to-yellow-600 transform hover:scale-105 
                        transition-all duration-300 shadow-md hover:shadow-lg gap-2 
                        animate-pulse hover:animate-none"
                      >
                        <span>★</span>
                        Rate Product
                      </button>
                    )}
                    
                    {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                      <button
                        onClick={() => handleCancelClick(order._id)}
                        className="flex items-center px-4 py-2 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                      >
                        <FaTimes className="mr-2" /> Cancel Order
                      </button>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Expected Delivery: {formatDate(order.deliveryDate)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-900 dark:text-white">No orders found.</div>
        )}
      </div>

      {/* Fixed Chat Button in bottom right corner */}
      <button
        onClick={() => navigate('/chat')}
        className="fixed bottom-6 right-6 flex items-center px-6 py-3 text-sm font-medium 
        bg-gradient-to-r from-green-400 to-green-500 text-white rounded-full 
        hover:from-green-500 hover:to-green-600 transform hover:scale-105 
        transition-all duration-300 shadow-lg hover:shadow-xl gap-2 z-50"
      >
        <FaCommentDots className="text-xl animate-bounce" />
        <span>Chat with Vendor</span>
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
        </span>
      </button>

      {/* Cancellation Modal */}
      {showCancellationForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Cancel Order</h3>
              <button
                onClick={() => setShowCancellationForm(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <IoCloseSharp size={24} />
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Cancellation
              </label>
              <select
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a reason</option>
                <option value="Changed my mind">Changed my mind</option>
                <option value="Found better price elsewhere">Found better price elsewhere</option>
                <option value="Ordered by mistake">Ordered by mistake</option>
                <option value="Shipping time too long">Shipping time too long</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCancellationForm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCancelOrder}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {showRatingForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Rate Product</h3>
              <button
                onClick={() => {
                  setShowRatingForm(false);
                  setRating(0);
                  setRatingComment('');
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <IoCloseSharp size={24} />
              </button>
            </div>
            
            {/* Star Rating */}
            <div className="flex justify-center space-x-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-2xl ${
                    star <= rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
                  } hover:text-yellow-400 transition-colors`}
                >
                  ★
                </button>
              ))}
            </div>

            {/* Comment Input */}
            <textarea
              value={ratingComment}
              onChange={(e) => setRatingComment(e.target.value)}
              placeholder="Share your experience with this product..."
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              rows="4"
            />

            {/* Submit Button */}
            <button
              onClick={() => handleRatingSubmit(selectedOrderId, selectedProductId)}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Submit Rating
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders;
