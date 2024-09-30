import React from 'react';
import { FaYoutube } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { FaSquareXTwitter } from "react-icons/fa6";
import { RiInstagramFill } from "react-icons/ri";

const Footer = () => {
  return (
    <footer className='bg-gray-900 text-white py-8 '>
      <div className='container mx-auto px-4'>
        {/* Top Footer Section */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-8 text-sm'>
          {/* About Section */}
          <div>
            <h4 className='font-bold mb-4'>ABOUT</h4>
            <ul>
              <li><Link to='/portfolio' className='hover:underline text-gray-400'>Portfolio</Link></li>
              <li><Link to='/contact' className='hover:underline text-gray-400'>Contact Us</Link></li>
              <li><Link to='/about' className='hover:underline text-gray-400'>About Us</Link></li>
              <li><Link to='/corporate-info' className='hover:underline text-gray-400'>Corporate Information</Link></li>
            </ul>
          </div>

          {/* Help Section */}
          <div>
            <h4 className='font-bold mb-4'>HELP</h4>
            <ul>
              <li><Link to='/payments' className='hover:underline text-gray-400'>Payments</Link></li>
              <li><Link to='/shipping' className='hover:underline text-gray-400'>Shipping</Link></li>
              <li><Link to='/returns' className='hover:underline text-gray-400'>Cancellation & Returns</Link></li>
              <li><Link to='/faq' className='hover:underline text-gray-400'>FAQ</Link></li>
              <li><Link to='/infringement' className='hover:underline text-gray-400'>Report Infringement</Link></li>
            </ul>
          </div>

          {/* Consumer Policy */}
          <div>
            <h4 className='font-bold mb-4'>CONSUMER POLICY</h4>
            <ul>
              <li><Link to='/cancellation' className='hover:underline text-gray-400'>Cancellation & Returns</Link></li>
              <li><Link to='/terms-conditions' className='hover:underline text-gray-400'>Terms Of Use</Link></li>
              <li><Link to='/security' className='hover:underline text-gray-400'>Security</Link></li>
              <li><Link to='/privacy-policy' className='hover:underline text-gray-400'>Privacy</Link></li>
              <li><Link to='/sitemap' className='hover:underline text-gray-400'>Sitemap</Link></li>
              <li><Link to='/compliance' className='hover:underline text-gray-400'>EPR Compliance</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className='font-bold mb-4'>Mail Us:</h4>
            <p className='text-sm text-gray-400'>
              Nexus <br />
              chittarikkal<br />
              kasaragod, 671326,<br />
              kerala, India<br />
              email:phoenix.nexus.2024@gmail.com
            </p>
            <h4 className='font-bold mt-4'>Registered Office Address:</h4>
            <p className='text-sm text-gray-400'>
              Nexus,<br />
              chittarikkal,<br />
              kasaragod, 671326,<br />
              kerala, India<br />
              email:phoenix.nexus.2024@gmail.com<br />
              Mobile:+91 81380 76720
            </p>
          </div>
        </div>

        {/* Bottom Footer Section */}
        <div className='flex flex-col md:flex-row justify-between items-center mt-8 border-t border-gray-700 pt-4'>
          <div className='flex space-x-8'>
            <Link to='/seller' className='hover:underline text-sm text-gray-400'>Become a Seller</Link>
            <Link to='/advertise' className='hover:underline text-sm text-gray-400'>Advertise</Link>
            <Link to='/help' className='hover:underline text-sm text-gray-400'>Help Center</Link>
          </div>

          <div className='flex space-x-4 mt-4 md:mt-0'>
            <Link to='/facebook' className='text-gray-400 hover:text-white'>
              <RiInstagramFill size={20} />
            </Link>
            <Link to='/twitter' className='text-gray-400 hover:text-white'>
              <FaSquareXTwitter size={20} />
            </Link>
            <Link to='/youtube' className='text-gray-400 hover:text-white'>
              <FaYoutube size={20} />
            </Link>
          </div>

          <p className='text-sm text-gray-400 mt-4 md:mt-0'>&copy; 2024 Nexus. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;