import React, { useEffect, useRef, lazy, Suspense } from 'react';
import { gsap } from 'gsap';
import { useInView } from 'react-intersection-observer';

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
      triggerOnce: true, // Trigger only once
      threshold: 0.1, // Adjust this to control when the component should load
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
          <div style={{ height: '600px' }}></div> // Placeholder for spacing
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-1">
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
      {/* 70/30 layout for the Auditorium and BannerProduct */}
      <div className="px-10 flex justify-between gap-6">
        <div className="w-[60%]">
          <ComponentInView Component={() => <VerticalCardProduct category="auditorium" heading="Find the Perfect Auditorium" />} />
        </div>
        <div className="w-[40%] h-[600px]">
          <ComponentInView Component={BannerCenter1Product} />
        </div>
      </div>

      {/* Rest of the vertical components */}
      <div className="px-10">
        <ComponentInView Component={() => <VerticalCardProduct category="rent" heading="Rental Items for Every Occasion" />} />
        <ComponentInView Component={() => <VerticalCardProduct category="bakers" heading="Delicious Bakes and Desserts" />} />

        {/* Add BannerCenter1Product and Social Media Vertical Card */}
        <div className="flex justify-between gap-6">
          <div className="w-[40%] h-[650px]">
            <ComponentInView Component={BannerCenter2Product} />
          </div>
          <div className="w-[60%]">
            <ComponentInView Component={() => <VerticalCardProduct category="socia-media" heading="Social Media Marketing Experts" />} />
          </div>
        </div>

        {/* Add BannerCenter1Product and Logistics Vertical Card */}
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

      {/* Discover More Section */}
      <div className="py-10" ref={contentRef}>
        <h2 className="text-2xl font-semibold text-center">Discover More</h2>
        <p className="text-center mt-4">Explore additional services and products to make your event unforgettable.</p>
        <div className="flex justify-center mt-6">
          <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">Explore Now</button>
        </div>
      </div>
    </div>
  );
};

export default Home2;
