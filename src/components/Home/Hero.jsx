import React from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';

const Hero = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-300 to-blue-300 py-20 px-5">
      <div className="max-w-4xl mx-auto bg-[#f5e9e9] shadow-2xl shadow-gray-600 rounded-lg overflow-hidden">
        <div className="bg-indigo-600 py-12 px-8 text-white text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 hero-name tracking-wider">
            Streamline Your Communication
          </h1>
          <p className="text-base md:text-lg opacity-85">
            Efficiently send bulk emails with our intuitive platform.
            Connect with your audience like never before.
          </p>
        </div>
        <div className="py-10 px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-semibold text-gray-800 mb-3">
              Ready to Get Started?
            </h2>
            <p className="text-gray-700">
              Click the link below to access the bulk email sender.
            </p>
          </div>
          <div className="flex justify-center">
            <Link
              to="/verify"
              className="bg-indigo-500 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-full shadow-md transition duration-300 ease-in-out flex items-center gap-2"
            >
              <Mail size={20} />
              <span>Send Mail</span>
            </Link>
          </div>
          <div className="mt-12 text-center text-gray-700 text-base">
            <p>
              Powered by cutting-edge technology for seamless email delivery.
            </p>
            <p className="mt-2 font-mono text-base md:text-lg font-semibold">
              ©2025 <Link to='https://x.com/@dubem_umeh' className='underline underline-offset-2 text-indigo-800 font-medium'>LuckyTwins Code</Link>. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;