import React, { useState, useEffect, useRef } from 'react';
import { FaPaperPlane } from 'react-icons/fa';
import SummaryApi from '../common';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const [currentUserName, setCurrentUserName] = useState('');
  const [selectedOrderProducts, setSelectedOrderProducts] = useState([]);
  const [currentVendor, setCurrentVendor] = useState('');
  const [vendorMessageSent, setVendorMessageSent] = useState(false); // New state for vendor message
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedOrderProducts]);

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
        setCurrentUserName(data.data.name)
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

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    const userMessage = { text: newMessage, sender: 'user', timestamp: new Date() };
    setMessages([...messages, userMessage]);
    setNewMessage('');

    // Simulate a response from the support team (replace with actual API call)
    setTimeout(() => {
      const supportMessage = {
        text: 'Thank you for your message. Our support team will get back to you shortly.',
        sender: 'support',
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, supportMessage]);
    }, 1000);
  };

  const handleOrderClick = (order) => {
    setSelectedOrderProducts(order.products);
  };

  const handleProductClick = (product) => {
    setCurrentVendor(`${product.vendorName}`);
    // Set vendor message flag to true
    setVendorMessageSent(true);
    
    // Send a message from the vendor after 3 seconds
    setTimeout(() => {
      const vendorAssistMessage = {
        text: 'How can we assist you?',
        sender: 'vendor',
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, vendorAssistMessage]);
    }, 3000);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-yellow-500 text-white p-4">
          <h1 className="text-2xl font-bold">Customer Support Chat</h1>
        </div>
        <div className="h-[35rem] p-4 overflow-y-auto">
          {/* Display the current vendor message as a heading */}
          {/* Initial prompt */}
          {messages.length === 0 && !loading && !currentVendor && (
            <div className="text-gray-600 mb-4">
              <p>What product do you need help with?</p>
              {orders.length > 0 ? (
                <div className="grid gap-2 mt-2">
                  {orders.map((order) => (
                    <div
                      key={order._id}
                      className="bg-gray-200 rounded-md p-2 flex items-center shadow-sm cursor-pointer w-64"
                      onClick={() => handleOrderClick(order)}
                    >
                      {order.products[0]?.image && (
                        <img
                          src={order.products[0].image}
                          alt={`Product for order ${order._id}`}
                          className="w-12 h-12 object-cover rounded-md mr-2"
                        />
                      )}
                      <div className="flex-1 text-sm">
                        <h2 className="font-semibold">Order #{order._id}</h2>
                        <p className="text-gray-500 text-xs">{order.products[0]?.productName}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No orders found.</p>
              )}
            </div>
          )}
          
          {/* Display products of the selected order */}
          {selectedOrderProducts.length > 0 && (
            <div className="mt-4">
              <h2 className="font-semibold text-lg">Products in Order:</h2>
              <div className="grid gap-4 mt-2">
                {selectedOrderProducts.map((product, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-md p-3 shadow-md flex items-center cursor-pointer"
                    onClick={() => handleProductClick(product)}
                  >
                    {product.image && (
                      <img
                        src={product.image}
                        alt={product.productName}
                        className="w-16 h-16 object-cover rounded-md mr-3"
                      />
                    )}
                    <div>
                      <h3 className="font-semibold">{product.productName}</h3>
                      <p className="text-gray-500">Brand: {product?.vendorName}</p>
                    </div>
                  </div>
                ))} 
              </div>

              {/* Display current vendor message below product cards */}
              {currentVendor && (
                <div className="mt-4 text-sm text-gray-400 py-5 text-center">
                  {currentVendor} has joined and will be ready to chat in just a minute.
                </div>
              )}
            </div>
          )}

          {/* Messages */}
          {messages.map((message, index) => (
  <div key={index} className={`mb-4 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
    <div
      className={`inline-block p-2 rounded-lg ${message.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black'}`}
    >
      {message.sender === 'vendor' ? (
        <span>
          {/* Display vendor name */}
          {message.text}
        </span>
      ) : (
        message.text
      )}
    </div>
    <div className="text-xs text-gray-500 mt-1">
      {message.timestamp.toLocaleTimeString()}
      <span className='px-3'>
        {message.sender === 'user' ? currentUserName : currentVendor}
      </span>
    </div>
  </div>
))}

          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSendMessage} className="bg-gray-100 p-4">
          <div className="flex items-center">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message here..."
              className="flex-1 border rounded-l-lg p-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
            <button
              type="submit"
              className="bg-yellow-500 text-white h-10 w-10 p-2 rounded-r-lg hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <FaPaperPlane />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Chat;
