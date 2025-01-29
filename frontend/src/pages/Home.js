import React, { useEffect, useRef, lazy, Suspense, useState } from 'react';
import { gsap } from 'gsap';
import { useInView } from 'react-intersection-observer';
import { FaComments } from 'react-icons/fa'; // Import an icon from react-icons

// Lazy load your components
const CategoryList = lazy(() => import('../components/CategoryList'));
const BannerProduct = lazy(() => import('../components/BannerProduct'));
const HorizontalCardProduct = lazy(() => import('../components/HorizontalCardProduct'));
const VerticalCardProduct = lazy(() => import('../components/VerticalCardProduct'));
const BannerCenter1Product = lazy(() => import('../components/BannerCenter1Product'));
const BannerCenter2Product = lazy(() => import('../components/BannerCenter2Product'));
const BannerCenter3Product = lazy(() => import('../components/BannerCenter3Product'));
const SponserCardProduct = lazy(() => import('../components/SponserCardProduct'));

const Home2 = () => {
  const contentRef = useRef(null);
  const [chatVisible, setChatVisible] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false); // State to handle typing animation

  const predefinedQuestions = [
    "What services do you offer?",
    "How can I book a service?",
    "Do you offer discounts?",
    "How do I contact customer support?",
    "What are your working hours?",
  ];

  const handleQuestionClick = (question) => {
    // Simulate predefined answers
    const answers = {
      "What services do you offer?": "We offer a variety of event management services including catering, venue rentals, decorations, and more.",
      "How can I book a service?": "You can book a service directly through our website by selecting the service and clicking 'Book Now'.",
      "Do you offer discounts?": "Yes, we offer seasonal discounts. Please subscribe to our newsletter for the latest offers.",
      "How do I contact customer support?": "You can reach out to our support team through the contact form on our website or call us at +123-456-7890.",
      "What are your working hours?": "Our services are available 7 days a week from 9 AM to 8 PM."
    };

    setChatMessages((prevMessages) => [
      ...prevMessages,
      { sender: 'user', text: question }
    ]);
    
    setIsTyping(true);
    setTimeout(() => {
      setChatMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'bot', text: answers[question] }
      ]);
      setIsTyping(false);
    }, 1500); // Simulate typing delay
  };

  const toggleChat = () => {
    setChatVisible(!chatVisible);
  };

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
    <div className="container mx-auto py-5">
      <Suspense fallback={<div>Loading...</div>}>
        <BannerProduct />
      </Suspense>
      <div className="py-10">
        <ComponentInView Component={CategoryList} />
      </div>
      <div className="px-10">
        <ComponentInView Component={() => <HorizontalCardProduct category="catering" heading="Top-Rated Caterers" />} />
        <ComponentInView Component={() => <HorizontalCardProduct category="event-management" heading="Popular Event Management Services" />} />
      </div>
      <div className='px-10'>
        <ComponentInView Component={() => <SponserCardProduct heading="Sponsored Products" />} />
      </div>
      
      <div className="px-10 flex justify-between gap-6">
        <div className="w-[60%]">
          <ComponentInView Component={() => <VerticalCardProduct category="auditorium" heading="Find the Perfect Auditorium" />} />
        </div>
        <div className="w-[40%] h-[600px]">
          <ComponentInView Component={BannerCenter1Product} />
        </div>
      </div>

      <div className="px-10">
        <ComponentInView Component={() => <VerticalCardProduct category="rent" heading="Rental Items for Every Occasion" />} />
        <ComponentInView Component={() => <VerticalCardProduct category="bakers" heading="Delicious Bakes and Desserts" />} />
        <div className="flex justify-between gap-6">
          <div className="w-[40%] h-[650px]">
            <ComponentInView Component={BannerCenter2Product} />
          </div>
          <div className="w-[60%]">
            <ComponentInView Component={() => <VerticalCardProduct category="socia-media" heading="Social Media Marketing Experts" />} />
          </div>
        </div>
        <ComponentInView Component={() => <VerticalCardProduct category="audio-visual-it" heading="Audio-Visual and IT Teams" />} />
        <ComponentInView Component={() => <VerticalCardProduct category="photo-video" heading="Professional Photography and Videography" />} />
        <div className="flex justify-between gap-6 mt-10">
          <div className="w-[60%]">
            <ComponentInView Component={() => <VerticalCardProduct category="logistics" heading="Reliable Logistics Solutions" />} />
          </div>
          <div className="w-[40%] h-[600px]">
            <ComponentInView Component={BannerCenter3Product} />
          </div>
        </div>
        <ComponentInView Component={() => <VerticalCardProduct category="decorations" heading="Stunning Decorations for Any Event" />} />
      </div>

      <div className="py-10" ref={contentRef}>
        <h2 className="text-2xl font-semibold text-center">Discover More</h2>
        <p className="text-center mt-4">Explore additional services and products to make your event unforgettable.</p>
        <div className="flex justify-center mt-6">
          <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">Explore Now</button>
        </div>
      </div>

      {/* Chatbot Icon */}
      <div 
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          backgroundColor: '#39ac31',
          padding: '15px',
          borderRadius: '50%',
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
          cursor: 'pointer',
          zIndex: 1000,
        }}
        onClick={toggleChat}
      >
        <FaComments size={24} color="#fff" />
      </div>

      {/* Chatbot Window */}
      {chatVisible && (
        <div 
          style={{
            position: 'fixed',
            bottom: '80px',
            right: '20px',
            width: '350px',
            maxHeight: '500px',
            backgroundColor: '#fff',
            borderRadius: '15px',
            boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.2)',
            overflow: 'hidden',
            zIndex: 1000,
          }}
        >
          <div style={{ backgroundColor: '#39ac31', padding: '10px', color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>
            Chat with us
          </div>
          <div style={{ padding: '10px', maxHeight: '400px', overflowY: 'auto' }}>
            {chatMessages.map((msg, index) => (
              <div key={index} style={{ margin: '10px 0', textAlign: msg.sender === 'user' ? 'right' : 'left' }}>
                <div
                  style={{
                    display: 'inline-block',
                    backgroundColor: msg.sender === 'user' ? '#007bff' : '#f0f0f0',
                    color: msg.sender === 'user' ? '#fff' : '#000',
                    borderRadius: '10px',
                    padding: '8px 12px',
                    maxWidth: '75%',
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {/* Display typing animation when the bot is typing */}
            {isTyping && (
              <div style={{ margin: '10px 0', textAlign: 'left' }}>
                <div
                  style={{
                    display: 'inline-block',
                    backgroundColor: '#f0f0f0',
                    borderRadius: '10px',
                    padding: '8px 12px',
                    maxWidth: '75%',
                  }}
                >
                  <span className="typing-indicator">Bot is typing</span>
                  <span className="dot">.</span>
                  <span className="dot">.</span>
                  <span className="dot">.</span>
                </div>
              </div>
            )}
          </div>
          <div style={{ padding: '10px', borderTop: '1px solid #ddd' }}>
            <p style={{ marginBottom: '5px', fontWeight: 'bold' }}>Frequently Asked Questions:</p>
            {predefinedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleQuestionClick(question)}
                style={{
                  backgroundColor: '#f0f0f0',
                  border: 'none',
                  borderRadius: '5px',
                  padding: '8px 10px',
                  margin: '5px',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left',
                }}
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home2;
