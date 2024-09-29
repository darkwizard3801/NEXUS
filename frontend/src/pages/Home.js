import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

import CategoryList from '../components/CategoryList';
import BannerProduct from '../components/BannerProduct';
import HorizontalCardProduct from '../components/HorizontalCardProduct';
import VerticalCardProduct from '../components/VerticalCardProduct';
import BannerCenter1Product from '../components/BannerCenter1Product';
import BannerCenter2Product from '../components/BannerCenter2Product';
import BannerCenter3Product from '../components/BannerCenter3Product';

const Home2 = () => {
  const contentRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      contentRef.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1, ease: 'power4.out' }
    );
  }, []);

  return (
    <div className="container mx-auto py-1">
      <BannerProduct />
      <div className="py-10">
        <CategoryList />
      </div>
      <div className="px-10">
        <HorizontalCardProduct category="catering" heading="Top-Rated Caterers" />
        <HorizontalCardProduct category="event-management" heading="Popular Event Management Services" />
      </div>

      {/* 70/30 layout for the Auditorium and BannerProduct */}
      <div className="px-10 flex justify-between gap-6">
        <div className="w-[60%]">
          <VerticalCardProduct category="auditorium" heading="Find the Perfect Auditorium" />
        </div>
        <div className="w-[40%] h-[600px]">
          <BannerCenter1Product />
        </div>
      </div>

      {/* Rest of the vertical components */}
      <div className="px-10">
        <VerticalCardProduct category="rent" heading="Rental Items for Every Occasion" />
        <VerticalCardProduct category="bakers" heading="Delicious Bakes and Desserts" />

        {/* Add BannerCenter1Product and Social Media Vertical Card */}
        <div className="flex justify-between gap-6">
          <div className="w-[40%] h-[650px]">
            <BannerCenter2Product />
          </div>
          <div className="w-[60%]">
            <VerticalCardProduct category="socia-media" heading="Social Media Marketing Experts" />
          </div>
        </div>

        {/* Add BannerCenter1Product and Logistics Vertical Card */}
       

        <VerticalCardProduct category="audio-visual-it" heading="Audio-Visual and IT Teams" />
        <VerticalCardProduct category="photo-video" heading="Professional Photography and Videography" />
        <div className="flex justify-between gap-6 mt-10">
          <div className="w-[60%]">
            <VerticalCardProduct category="logistics" heading="Reliable Logistics Solutions" />
          </div>
          <div className="w-[40%] h-[600px]">
            <BannerCenter3Product />
          </div>
        </div>
        <VerticalCardProduct category="decorations" heading="Stunning Decorations for Any Event" />
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
