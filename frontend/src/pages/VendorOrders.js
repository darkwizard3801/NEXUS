import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import displayINRCurrency from '../helpers/displayCurrency'
import SummaryApi from '../common';

const VendorOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState(null);
  const dispatch = useDispatch();

  // Updated Status options without 'Pending'
  const statusOptions = ['Ordered', 'Accepted', 'Processing', 'Delivered', 'Declined', 'Cancelled'];

  // Create a custom event for status updates
  const statusUpdateEvent = new CustomEvent('orderStatusUpdated');

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
        // Filter orders where any product's vendor email matches current user's email
        // AND status is not pending
        const vendorOrders = data.data.filter(order => 
          order.products.some(product => product.vendor === currentUserEmail) &&
          order.status.toLowerCase() !== 'pending'
        );
        
        // Map through orders to only include products belonging to this vendor
        const filteredOrders = vendorOrders.map(order => ({
          ...order,
          products: order.products.filter(product => product.vendor === currentUserEmail)
        }));

        // Sort orders by createdAt date, latest first
        const sortedOrders = filteredOrders.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );

        setOrders(sortedOrders);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchCurrentUserDetails().then(() => {
      if (currentUserEmail) {
        fetchOrders();
      }
    });
  }, [currentUserEmail]);

  // Updated status color function (removed pending case)
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'ordered':
        return 'text-purple-600 bg-purple-100';
      case 'accepted':
        return 'text-blue-600 bg-blue-100';
      case 'processing':
        return 'text-indigo-600 bg-indigo-100';
      case 'delivered':
        return 'text-green-600 bg-green-100';
      case 'declined':
        return 'text-orange-600 bg-orange-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  // Updated handleStatusChange function
  const handleStatusChange = (orderId, newStatus, currentStatus) => {
    if (newStatus === currentStatus) return;
    setPendingStatusChange({ orderId, newStatus, currentStatus });
    setShowConfirmModal(true);
  };

  // Updated handleConfirmStatusChange function
  const handleConfirmStatusChange = async () => {
    const { orderId, newStatus, currentStatus } = pendingStatusChange;
    try {
      const response = await fetch(`${SummaryApi.updateOrderStatus.url}/${orderId}`, {
        method: SummaryApi.updateOrderStatus.method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();

      if (data.success) {
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === orderId 
              ? { ...order, status: newStatus }
              : order
          )
        );
        toast.success(`Order status updated to ${newStatus}`);
        
        // Dispatch custom event to trigger notification count refresh
        window.dispatchEvent(statusUpdateEvent);
      } else {
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === orderId 
              ? { ...order, status: currentStatus }
              : order
          )
        );
        toast.error(data.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderId 
            ? { ...order, status: currentStatus }
            : order
        )
      );
      toast.error('Failed to update order status');
    } finally {
      setShowConfirmModal(false);
      setPendingStatusChange(null);
    }
  };

  // Handle cancel status change
  const handleCancelStatusChange = () => {
    const { orderId, currentStatus } = pendingStatusChange;
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order._id === orderId 
          ? { ...order, status: currentStatus }
          : order
      )
    );
    setShowConfirmModal(false);
    setPendingStatusChange(null);
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Vendor Orders</h1>

        {loading ? (
          // Loading skeleton
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-white p-4 rounded-lg shadow animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          // No orders message
          <div className="text-center py-8">
            <p className="text-gray-500">No orders found</p>
          </div>
        ) : (
          // Orders list
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="bg-white p-6 rounded-lg shadow-md">
                {/* Order Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-lg font-semibold">Order #{order.invoiceNumber}</h2>
                    <p className="text-sm text-gray-500">
                      Ordered on {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      Delivery Date: {new Date(order.deliveryDate).toLocaleDateString()}
                    </p>
                  </div>
                  {/* Status Dropdown */}
                  <div className="flex items-center gap-2">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value, order.status)}
                      className={`px-3 py-1 rounded-full text-sm font-medium cursor-pointer border 
                        ${getStatusColor(order.status)} focus:outline-none focus:ring-2 focus:ring-red-500`}
                    >
                      {statusOptions.map((status) => (
                        <option 
                          key={status} 
                          value={status}
                          className="bg-white text-gray-800"
                        >
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-4">
                  {order.products.map((item) => (
                    <div key={item._id} className="flex items-center gap-4 border-b pb-4">
                      <img
                        src={item.image}
                        alt={item.productName}
                        className="w-20 h-20 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium">{item.productName}</h3>
                        <p className="text-sm text-gray-600">
                          Quantity: {item.quantity}
                        </p>
                        <p className="text-sm font-medium text-gray-800">
                          Price: {displayINRCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Summary - Only showing vendor's products total */}
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">Customer: {order.userName}</p>
                      <p className="text-sm text-gray-600">Email: {order.userEmail}</p>
                      <p className="text-sm text-gray-600">Address: {order.address}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Total Items: {order.products.length}</p>
                      <p className="font-medium">
                        Total Amount: {displayINRCurrency(
                          order.products.reduce((total, item) => total + (item.price * item.quantity), 0)
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Modal Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={handleCancelStatusChange}
          ></div>
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-lg shadow-xl p-6 w-96 max-w-[90%] transform transition-all scale-100 animate-fadeIn">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
                <svg 
                  className="h-6 w-6 text-yellow-600" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                  />
                </svg>
              </div>
              
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Confirm Status Change
              </h3>
              
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to change the order status to{' '}
                <span className="font-semibold text-gray-700">
                  {pendingStatusChange?.newStatus}
                </span>
                ?
              </p>

              <div className="flex justify-center gap-4">
                <button
                  onClick={handleCancelStatusChange}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmStatusChange}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VendorOrders;
