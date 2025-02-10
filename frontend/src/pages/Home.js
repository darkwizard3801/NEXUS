import React, { useEffect, useRef, lazy, Suspense, useState, memo, useCallback } from 'react';
import { gsap } from 'gsap';
import { useInView } from 'react-intersection-observer';
import { FaComments, FaPaperPlane } from 'react-icons/fa';
import SummaryApi from '../common';

// Import critical components directly instead of lazy loading
import CategoryList from '../components/CategoryList';
import BannerProduct from '../components/BannerProduct';
import HorizontalCardProduct from '../components/HorizontalCardProduct';
import VerticalCardProduct from '../components/VerticalCardProduct';

// Lazy load less critical components
const BannerCenter1Product = lazy(() => import(/* webpackPrefetch: true */'../components/BannerCenter1Product'));
const BannerCenter2Product = lazy(() => import(/* webpackPrefetch: true */'../components/BannerCenter2Product'));
const BannerCenter3Product = lazy(() => import(/* webpackPrefetch: true */'../components/BannerCenter3Product'));
const SponserCardProduct = lazy(() => import(/* webpackPrefetch: true */'../components/SponserCardProduct'));

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

// Memoized Chat Components
const ChatMessage = memo(({ message, style }) => (
  <div style={style.messageContainer}>
    <div style={message.sender === 'user' ? style.userMessage : style.botMessage}>
      <p>{message.text}</p>
    </div>
  </div>
));

const TypingIndicator = memo(({ style }) => (
  <div style={style.messageContainer}>
    <div style={style.botMessage} className="flex space-x-2 w-16">
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
    </div>
  </div>
));

const ChatInput = memo(({ value, onChange, onSend, isTyping }) => (
  <form onSubmit={onSend} className="flex items-center space-x-2">
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder="Type your message..."
      className="flex-1 px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
    />
    <button
      type="submit"
      disabled={!value.trim() || isTyping}
      className={`p-2 rounded-full transition-colors duration-200 ${
        value.trim() && !isTyping
          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white'
          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
      }`}
    >
      <FaPaperPlane className="text-lg" />
    </button>
  </form>
));

// Memoized Chat Window
const ChatWindow = memo(({ visible, messages, isTyping, inputMessage, onSend, onInputChange, chatRef, styles }) => {
  if (!visible) return null;

  return (
    <div style={styles.chatWindow}>
      <div style={styles.chatHeader}>
        <h3 className="text-xl font-semibold mb-1">Event Assistant</h3>
        <p className="text-sm opacity-90">Ask me anything about our platform</p>
      </div>
      <div 
        ref={chatRef}
        style={styles.chatBody}
        className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
      >
        {messages.length === 0 && (
          <ChatMessage 
            message={{ sender: 'bot', text: '👋 Hi! How can I help you with event planning today?' }} 
            style={styles} 
          />
        )}
        {messages.map((msg, index) => (
          <ChatMessage key={index} message={msg} style={styles} />
        ))}
        {isTyping && <TypingIndicator style={styles} />}
      </div>
      <div style={styles.inputContainer}>
        <ChatInput 
          value={inputMessage}
          onChange={onInputChange}
          onSend={onSend}
          isTyping={isTyping}
        />
      </div>
    </div>
  );
});

// Main content component
const MainContent = memo(({ contentRef }) => {
  // Optimized GSAP animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      );
    });
    return () => ctx.revert();
  }, []);

  // Optimized ComponentInView
  const ComponentInView = memo(({ Component, props }) => {
    const [ref, inView] = useInView({
      triggerOnce: true,
      threshold: 0.1,
    });

    useEffect(() => {
      if (inView) {
        gsap.fromTo(
          ref.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
        );
      }
    }, [inView]);

    return (
      <div ref={ref}>
        {inView && <Component {...props} />}
      </div>
    );
  });

  return (
    <>
      <div className="w-full">
        <BannerProduct />
      </div>
      <div className="py-6 md:py-10 px-4 lg:px-8 xl:px-12">
        <CategoryList />
      </div>
      {/* Directly render critical components */}
      <div className="px-4 lg:px-8 xl:px-12 space-y-6">
        <ComponentInView 
          Component={HorizontalCardProduct} 
          props={{ category: "catering", heading: "Top-Rated Caterers" }} 
        />
        <ComponentInView 
          Component={HorizontalCardProduct} 
          props={{ category: "event-management", heading: "Popular Event Management Services" }} 
        />
      </div>

      {/* Lazy load less critical components */}
      <Suspense fallback={null}>
        {/* Sponsored Products - full width */}
        <div className='px-4 lg:px-8 xl:px-12 my-6'>
          <ComponentInView 
            Component={SponserCardProduct} 
            props={{ heading: "Sponsored Products" }} 
          />
        </div>
        
        {/* Split Section */}
        <div className="px-4 lg:px-8 xl:px-12 flex flex-col md:flex-row justify-between md:gap-8 space-y-6 md:space-y-0">
          <div className="w-full md:w-[65%]">
            <ComponentInView 
              Component={VerticalCardProduct} 
              props={{ category: "auditorium", heading: "Find the Perfect Auditorium" }} 
            />
          </div>
          <div className="w-full md:w-[35%] h-[300px] md:h-[600px]">
            <ComponentInView 
              Component={BannerCenter1Product} 
            />
          </div>
        </div>

        {/* Vertical Cards Section - full width */}
        <div className="w-full px-4 lg:px-8 xl:px-12 space-y-6 mt-6">
          <div className="w-full">
            <ComponentInView 
              Component={VerticalCardProduct} 
              props={{ category: "rent", heading: "Rental Items for Every Occasion" }} 
            />
          </div>
          <div className="w-full">
            <ComponentInView 
              Component={VerticalCardProduct} 
              props={{ category: "bakers", heading: "Delicious Bakes and Desserts" }} 
            />
          </div>
          
          {/* Split Section 2 */}
          <div className="flex flex-col md:flex-row justify-between md:gap-8 space-y-6 md:space-y-0">
            <div className="w-full md:w-[35%] h-[300px] md:h-[650px]">
              <ComponentInView 
                Component={BannerCenter2Product} 
              />
            </div>
            <div className="w-full md:w-[65%]">
              <ComponentInView 
                Component={VerticalCardProduct} 
                props={{ category: "socia-media", heading: "Social Media Marketing Experts" }} 
              />
            </div>
          </div>

          <div className="w-full">
            <ComponentInView 
              Component={VerticalCardProduct} 
              props={{ category: "audio-visual-it", heading: "Audio-Visual and IT Teams" }} 
            />
          </div>
          <div className="w-full">
            <ComponentInView 
              Component={VerticalCardProduct} 
              props={{ category: "photo-video", heading: "Professional Photography and Videography" }} 
            />
          </div>
          
          {/* Split Section 3 */}
          <div className="flex flex-col md:flex-row justify-between md:gap-8 space-y-6 md:space-y-0 mt-6">
            <div className="w-full md:w-[65%]">
              <ComponentInView 
                Component={VerticalCardProduct} 
                props={{ category: "logistics", heading: "Reliable Logistics Solutions" }} 
              />
            </div>
            <div className="w-full md:w-[35%] h-[300px] md:h-[600px]">
              <ComponentInView 
                Component={BannerCenter3Product} 
              />
            </div>
          </div>

          <div className="w-full">
            <ComponentInView 
              Component={VerticalCardProduct} 
              props={{ category: "decorations", heading: "Stunning Decorations for Any Event" }} 
            />
          </div>
        </div>

        {/* Discover More Section - full width */}
        <div className="w-full py-6 md:py-10 px-4 lg:px-8 xl:px-12">
          <h2 className="text-xl md:text-2xl font-semibold text-center">Discover More</h2>
          <p className="text-center mt-3 md:mt-4 text-sm md:text-base max-w-2xl mx-auto">
            Explore additional services and products to make your event unforgettable.
          </p>
          <div className="flex justify-center mt-4 md:mt-6">
            <button 
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded text-sm md:text-base"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              Explore Now
            </button>
          </div>
        </div>
      </Suspense>
    </>
  );
});

const Home2 = () => {
  const contentRef = useRef(null);
  const [chatVisible, setChatVisible] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatRef = useRef(null);

  const handleSendMessage = useCallback(async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

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

      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();
      const formattedReply = data.reply
        ? data.reply.trim().replace(/^"|"$/g, '')
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
  }, [inputMessage]);

  const toggleChat = useCallback(() => {
    setChatVisible(prev => !prev);
  }, []);

  const handleInputChange = useCallback((e) => {
    setInputMessage(e.target.value);
  }, []);

  return (
    <div className="w-full max-w-[1920px] mx-auto py-5">
      <MainContent contentRef={contentRef} />
      
      <div 
        className="fixed bottom-5 right-5 bg-gradient-to-r from-indigo-600 to-purple-600 p-4 rounded-full shadow-lg cursor-pointer hover:shadow-xl transform hover:scale-105 transition-all duration-300 z-50"
        onClick={toggleChat}
      >
        <FaComments className="text-white text-2xl" />
      </div>

      <ChatWindow 
        visible={chatVisible}
        messages={chatMessages}
        isTyping={isTyping}
        inputMessage={inputMessage}
        onSend={handleSendMessage}
        onInputChange={handleInputChange}
        chatRef={chatRef}
        styles={chatStyles}
      />
    </div>
  );
};

export default memo(Home2);
