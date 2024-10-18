import React, { useState, useEffect, useRef } from 'react';
import { FaPaperPlane } from 'react-icons/fa';
import SummaryApi from '../common';
import { toast } from 'react-toastify';

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
  const [vendormail, setVendormail] = useState('');
  const [vendorMessageSent, setVendorMessageSent] = useState(false); // New state for vendor message
  const [showQuestions, setShowQuestions] = useState(false); // New state for question bubbles
  const [allUsers, setAllUsers] = useState([]);
  const [isVendorReady, setIsVendorReady] = useState(false);
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


  const fetchAllUsers = async () => {
    try {
      const response = await fetch(SummaryApi.allUser.url, {
        method: SummaryApi.allUser.method,
        credentials: 'include',
      });

      const dataResponse = await response.json();

      if (dataResponse.success) {
        setAllUsers(dataResponse.data);
      } else if (dataResponse.error) {
        toast.error(dataResponse.message);
      }
    } catch (error) {
      toast.error('Failed to fetch users');
    }
  };

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
    setVendormail(`${product.vendor}`)
    
    setVendorMessageSent(true);
    
    // Send a message from the vendor after 3 seconds
    setTimeout(() => {
      const vendorAssistMessage = {
        text: 'How can we assist you?',
        sender: 'vendor',
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, vendorAssistMessage]);
      setShowQuestions(true); // Show question bubbles after vendor message
    }, 3000);
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const day = String(d.getDate()).padStart(2, '0'); // Get day and pad with zero if needed
    const month = String(d.getMonth() + 1).padStart(2, '0'); // Get month (0-indexed) and pad
    const year = d.getFullYear(); // Get full year
    const dayOfWeek = dayNames[d.getDay()]; // Get the day of the week
    return `${dayOfWeek}, ${day}/${month}/${year}`; // Return formatted date with day
  };

  const handleQuestionClick = () => {
    if (selectedOrderProducts.length > 0) {
      // Find the order that matches the selected products
      const order = orders.find(order => 
        order.products.some(product => 
          selectedOrderProducts.some(selectedProduct => selectedProduct._id === product._id)
        )
      );

      console.log("Selected Order:", order); // Debugging statement

      if (order) {
        const deliveryDate = order.deliveryDate; // Access the delivery date directly from the order
        console.log("Delivery Date:", deliveryDate); // Debugging statement

        if (deliveryDate) {
          const formattedDeliveryDate = formatDate(deliveryDate); // Format the date
          const deliveryMessage = {
            text: `The product will be delivered on ${formattedDeliveryDate}.`,
            sender: 'support',
            timestamp: new Date(),
          };
          setMessages((prevMessages) => [...prevMessages, deliveryMessage]);
        } else {
          // Handle case where deliveryDate is not available
          const errorMessage = {
            text: 'Sorry, we could not determine the delivery date.',
            sender: 'support',
            timestamp: new Date(),
          };
          setMessages((prevMessages) => [...prevMessages, errorMessage]);
        }
      } else {
        console.log("No matching order found."); // Debugging statement
      }
    } else {
      console.log("No selected order products."); // Debugging statement
    }
  };
  console.log(vendormail)

  const handleCallVendor = async () => {
    await fetchAllUsers();
    const vendor = allUsers.find(user => user.email === vendormail);
     console.log("vendor details",vendor)
    if (vendor) {
      // Example action with the vendor data:
      const callMessage = {
        text: `Phone Number: ${vendor.phoneNumber}`,
        sender: 'user',
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, callMessage]);
    } else {
      const errorMessage = {
        text: "Sorry, we could not determine the vendor's phone number.",
        sender: 'support',
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    }
  };

  const handleChatClick = () => {
    setIsVendorReady(true);
    setShowQuestions(false); // Hide question bubbles when vendor chat is initiated
    setVendorMessageSent(true); // Set this to true to indicate the message has been sent
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
              <br/>

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

          {/* Render question bubbles if showQuestions is true */}
          {showQuestions && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              <button 
                className="bg-white border-2 border-black text-black p-2 rounded-full hover:bg-blue-500 hover:text-white"
                onClick={handleQuestionClick}
              >
                When will the product be delivered?
              </button>
              <button className="bg-white border-2 border-black text-black p-2 rounded-full hover:bg-blue-500 hover:text-white"  >Cancel Order</button>
              <button className="bg-white border-2 border-black text-black p-2 rounded-full hover:bg-blue-500 hover:text-white" onClick={handleCallVendor}>Call Vendor</button>
              <button className="bg-white border-2 border-black text-black p-2 rounded-full hover:bg-blue-500 hover:text-white" onClick={handleChatClick}>Chat with Vendor</button>
            </div>
          )}
                 {/* {isVendorReady && vendorMessageSent && ( // Ensure the message appears only once
                <div className="mt-4 text-sm text-gray-400 py-5 text-center">
                  
                    {currentVendor} has joined and will be ready to chat in just a minute.
                  
                </div>
            )} */}
              
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
