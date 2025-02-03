import React, { useEffect, useRef, lazy, Suspense, useState } from 'react';
import { gsap } from 'gsap';
import { useInView } from 'react-intersection-observer';
import { FaComments, FaPaperPlane } from 'react-icons/fa';
import SummaryApi from '../common';

// Lazy load your components
const CategoryList = lazy(() => import('../components/CategoryList'));
const BannerProduct = lazy(() => import('../components/BannerProduct'));
const HorizontalCardProduct = lazy(() => import('../components/HorizontalCardProduct'));
const VerticalCardProduct = lazy(() => import('../components/VerticalCardProduct'));
const BannerCenter1Product = lazy(() => import('../components/BannerCenter1Product'));
const BannerCenter2Product = lazy(() => import('../components/BannerCenter2Product'));
const BannerCenter3Product = lazy(() => import('../components/BannerCenter3Product'));
const SponserCardProduct = lazy(() => import('../components/SponserCardProduct'));

// Add these styles to your CSS or use inline
const chatStyles = {
  chatWindow: {
    position: 'fixed',
    bottom: '80px',
    right: '20px',
    width: '380px',
    height: '600px',
    backgroundColor: 'white',
    borderRadius: '20px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    border: '1px solid #e2e8f0',
    zIndex: 50,
    transition: 'all 0.3s ease'
  },
  chatHeader: {
    padding: '20px',
    background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
    color: 'white',
    borderTopLeftRadius: '20px',
    borderTopRightRadius: '20px'
  },
  chatBody: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    backgroundColor: '#f8fafc'
  },
  messageContainer: {
    marginBottom: '16px',
    display: 'flex',
    flexDirection: 'column'
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#4F46E5',
    color: 'white',
    padding: '12px 16px',
    borderRadius: '16px 16px 4px 16px',
    maxWidth: '80%',
    marginBottom: '8px'
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'white',
    color: '#1F2937',
    padding: '12px 16px',
    borderRadius: '16px 16px 16px 4px',
    maxWidth: '80%',
    marginBottom: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
  },
  inputContainer: {
    padding: '16px',
    backgroundColor: 'white',
    borderTop: '1px solid #e2e8f0'
  }
};

const Home2 = () => {
  const contentRef = useRef(null);
  const [chatVisible, setChatVisible] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatRef = useRef(null);

  // const predefinedQuestions = [
  //   "What services do you offer?",
  //   "How can I book a service?",
  //   "Do you offer discounts?",
  //   "How do I contact customer support?",
  //   "What are your working hours?",
  // ];

  // const handleQuestionClick = (question) => {
  //   // Simulate predefined answers
  //   const answers = {
  //     "What services do you offer?": "We offer a variety of event management services including catering, venue rentals, decorations, and more.",
  //     "How can I book a service?": "You can book a service directly through our website by selecting the service and clicking 'Book Now'.",
  //     "Do you offer discounts?": "Yes, we offer seasonal discounts. Please subscribe to our newsletter for the latest offers.",
  //     "How do I contact customer support?": "You can reach out to our support team through the contact form on our website or call us at +123-456-7890.",
  //     "What are your working hours?": "Our services are available 7 days a week from 9 AM to 8 PM."
  //   };

  //   setChatMessages((prevMessages) => [
  //     ...prevMessages,
  //     { sender: 'user', text: question }
  //   ]);
    
  //   setIsTyping(true);
  //   setTimeout(() => {
  //     setChatMessages((prevMessages) => [
  //       ...prevMessages,
  //       { sender: 'bot', text: answers[question] }
  //     ]);
  //     setIsTyping(false);
  //   }, 1500); // Simulate typing delay
  // };

  const toggleChat = () => {
    setChatVisible(!chatVisible);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    // Add user message to chat
    setChatMessages(prev => [...prev, { 
        sender: 'user', 
        text: inputMessage 
    }]);

    setIsTyping(true);
    const messageToSend = inputMessage;
    setInputMessage('');

    try {
        const response = await fetch(SummaryApi.chat_message.url, {
            method: SummaryApi.chat_message.method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: messageToSend })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();

        // Format and clean the response text
        const formattedReply = data.reply
            ? data.reply.trim().replace(/^"|"$/g, '') // Remove any extra quotes
            : "I'm sorry, I couldn't process that request. Please try again.";

        setTimeout(() => {
            setChatMessages(prev => [...prev, { 
                sender: 'bot', 
                text: formattedReply
            }]);
            setIsTyping(false);
        }, 500);

    } catch (error) {
        console.error('Chat error:', error);
        setChatMessages(prev => [...prev, { 
            sender: 'bot', 
            text: 'I apologize, but I encountered an error. Please try asking your question again.'
        }]);
        setIsTyping(false);
    }
  };

  // Scroll to bottom of chat when new messages arrive
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chatMessages]);

  useEffect(() => {
    gsap.fromTo(
      contentRef.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1, ease: 'power4.out' }
    );
  }, []);

  // Function to render components in view with GSAP animations
  const ComponentInView = ({ Component }) => {
    const [ref, inView] = useInView({
      triggerOnce: true,
      threshold: 0.1,
    });

    useEffect(() => {
      if (inView) {
        gsap.fromTo(ref.current, 
          { opacity: 0, y: 30 }, 
          { opacity: 1, y: 0, duration: 0.6, ease: 'power4.out' }
        );
      }
    }, [inView, ref]);

    return (
      <div ref={ref}>
        {inView ? (
          <Suspense fallback={<div>Loading...</div>}>
            <Component />
          </Suspense>
        ) : (
          <div style={{ height: '600px' }}></div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-[1920px] mx-auto py-5">
      {/* Banner - full width */}
      <div className="w-full">
        <Suspense fallback={<div>Loading...</div>}>
          <BannerProduct />
        </Suspense>
      </div>

      {/* Categories - full width container */}
      <div className="py-6 md:py-10 px-4 lg:px-8 xl:px-12">
        <ComponentInView Component={CategoryList} />
      </div>

      {/* Main content container */}
      <div className="w-full">
        {/* Horizontal Cards Section - full width */}
        <div className="px-4 lg:px-8 xl:px-12 space-y-6">
          <ComponentInView Component={() => <HorizontalCardProduct category="catering" heading="Top-Rated Caterers" />} />
          <ComponentInView Component={() => <HorizontalCardProduct category="event-management" heading="Popular Event Management Services" />} />
        </div>

        {/* Sponsored Products - full width */}
        <div className='px-4 lg:px-8 xl:px-12 my-6'>
          <ComponentInView Component={() => <SponserCardProduct heading="Sponsored Products" />} />
        </div>
        
        {/* Split Section */}
        <div className="px-4 lg:px-8 xl:px-12 flex flex-col md:flex-row justify-between md:gap-8 space-y-6 md:space-y-0">
          <div className="w-full md:w-[65%]">
            <ComponentInView Component={() => <VerticalCardProduct category="auditorium" heading="Find the Perfect Auditorium" />} />
          </div>
          <div className="w-full md:w-[35%] h-[300px] md:h-[600px]">
            <ComponentInView Component={BannerCenter1Product} />
          </div>
        </div>

        {/* Vertical Cards Section - full width */}
        <div className="w-full px-4 lg:px-8 xl:px-12 space-y-6 mt-6">
          <div className="w-full">
            <ComponentInView Component={() => <VerticalCardProduct category="rent" heading="Rental Items for Every Occasion" />} />
          </div>
          <div className="w-full">
            <ComponentInView Component={() => <VerticalCardProduct category="bakers" heading="Delicious Bakes and Desserts" />} />
          </div>
          
          {/* Split Section 2 */}
          <div className="flex flex-col md:flex-row justify-between md:gap-8 space-y-6 md:space-y-0">
            <div className="w-full md:w-[35%] h-[300px] md:h-[650px]">
              <ComponentInView Component={BannerCenter2Product} />
            </div>
            <div className="w-full md:w-[65%]">
              <ComponentInView Component={() => <VerticalCardProduct category="socia-media" heading="Social Media Marketing Experts" />} />
            </div>
          </div>

          <div className="w-full">
            <ComponentInView Component={() => <VerticalCardProduct category="audio-visual-it" heading="Audio-Visual and IT Teams" />} />
          </div>
          <div className="w-full">
            <ComponentInView Component={() => <VerticalCardProduct category="photo-video" heading="Professional Photography and Videography" />} />
          </div>
          
          {/* Split Section 3 */}
          <div className="flex flex-col md:flex-row justify-between md:gap-8 space-y-6 md:space-y-0 mt-6">
            <div className="w-full md:w-[65%]">
              <ComponentInView Component={() => <VerticalCardProduct category="logistics" heading="Reliable Logistics Solutions" />} />
            </div>
            <div className="w-full md:w-[35%] h-[300px] md:h-[600px]">
              <ComponentInView Component={BannerCenter3Product} />
            </div>
          </div>

          <div className="w-full">
            <ComponentInView Component={() => <VerticalCardProduct category="decorations" heading="Stunning Decorations for Any Event" />} />
          </div>
        </div>

        {/* Discover More Section - full width */}
        <div className="w-full py-6 md:py-10 px-4 lg:px-8 xl:px-12" ref={contentRef}>
          <h2 className="text-xl md:text-2xl font-semibold text-center">Discover More</h2>
          <p className="text-center mt-3 md:mt-4 text-sm md:text-base max-w-2xl mx-auto">
            Explore additional services and products to make your event unforgettable.
          </p>
          <div className="flex justify-center mt-4 md:mt-6">
            <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded text-sm md:text-base">
              Explore Now
            </button>
          </div>
        </div>
      </div>

      {/* Chat Icon */}
      <div 
        className="fixed bottom-5 right-5 bg-gradient-to-r from-indigo-600 to-purple-600 p-4 rounded-full shadow-lg cursor-pointer hover:shadow-xl transform hover:scale-105 transition-all duration-300 z-50"
        onClick={toggleChat}
      >
        <FaComments className="text-white text-2xl" />
      </div>

      {/* Chatbot Window */}
      {chatVisible && (
        <div style={chatStyles.chatWindow}>
          {/* Chat Header */}
          <div style={chatStyles.chatHeader}>
            <h3 className="text-xl font-semibold mb-1">Event Assistant</h3>
            <p className="text-sm opacity-90">Ask me anything about our platform</p>
          </div>

          {/* Chat Messages */}
          <div 
            ref={chatRef}
            style={chatStyles.chatBody}
            className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
          >
            {/* Welcome Message */}
            {chatMessages.length === 0 && (
              <div style={chatStyles.messageContainer}>
                <div style={chatStyles.botMessage}>
                  <p>👋 Hi! How can I help you with event planning today?</p>
                </div>
              </div>
            )}

            {/* Chat Messages */}
            {chatMessages.map((msg, index) => (
              <div key={index} style={chatStyles.messageContainer}>
                <div style={msg.sender === 'user' ? chatStyles.userMessage : chatStyles.botMessage}>
                  <p>{msg.text}</p>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div style={chatStyles.messageContainer}>
                <div style={chatStyles.botMessage} className="flex space-x-2 w-16">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div style={chatStyles.inputContainer}>
            <form 
              onSubmit={handleSendMessage}
              className="flex items-center space-x-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isTyping}
                className={`p-2 rounded-full transition-colors duration-200 ${
                  inputMessage.trim() && !isTyping
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <FaPaperPlane className="text-lg" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home2;
