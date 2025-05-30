import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { KeyRound, MailCheck, X } from 'lucide-react';
import PopupVerify from '../animations/PopupVerify';
import PopUp from '../animations/PopUp';
import VerifyToken from '../components/Token/VerifyToken';

const DashBoard = ({ handleContinue }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [tokenPopUp, setTokenPopUp] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-300 to-blue-300 flex items-center justify-center px-4 relative overflow-y-hidden">
      <Link to='/' className='p-3 mt-2 bg-red-500 hover:bg-red-600 transition duration-200 w-fit rounded-xl text-base text-gray-50 absolute top-3 left-3'>Go Back</Link>
      <div className="max-w-5xl w-full bg-[#fcfafa] rounded-3xl shadow-2xl my-[5rem] p-5 md:p-10">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-center hero-name tracking-wide mt-2">
          Welcome to Your Dashboard
        </h2>
        <p className="text-base md:text-xl text-gray-800 mb-6 md:mb-10 text-center">
          Choose how you want to set up your email sending:
        </p>
        <div className="flex flex-col gap-8 sm:flex-row sm:flex-wrap md:flex-row md:gap-8 justify-center items-stretch">
          <div className="flex-1 min-w-[260px] max-w-md bg-gray-200 rounded-2xl p-7 flex flex-col items-center shadow-lg shadow-gray-400 mb-6 sm:mb-0">
            <MailCheck size={40} className="text-indigo-500 mb-3" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">I have SMTP credentials</h3>
            <p className="text-gray-700 mb-5 text-center">
              Use your own SMTP server for sending emails. Recommended for advanced users.
            </p>
            <button
              onClick={() => setShowPopup(true)}
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-6 rounded-xl transition duration-200 text-center cursor-pointer mb-3"
            >
              Add SMTP
            </button>
          </div>
          <div className="flex-1 min-w-[260px] max-w-md bg-gray-200 rounded-2xl p-7 flex flex-col items-center shadow-lg shadow-gray-400 mb-6 sm:mb-0">
            <KeyRound size={40} className="text-orange-500 mb-3" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">I need SMTP credentials</h3>
            <p className="text-gray-700 mb-5 text-center">
              Get started quickly with our built-in SMTP service. No setup required.
            </p>
            <button
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl transition duration-200 text-center mb-3 cursor-pointer"
              onClick={() => setTokenPopUp(true)}
            >
              Use Built-in SMTP
            </button>
          </div>
          {/* Demo */}
          <div className="flex-1 min-w-[260px] max-w-md bg-gradient-to-br from-blue-200 to-orange-100 rounded-2xl p-7 flex flex-col items-center shadow-lg shadow-gray-400 border-2 border-dashed border-indigo-400">
            <div className="flex flex-col items-center mb-3 -mt-3">
              <MailCheck size={36} className="text-indigo-400 mb-2" />
              <h3 className="text-lg font-semibold text-gray-800 mb-1">Try the Demo</h3>
            </div>
            <p className="text-gray-700 mb-5 text-center text-base">
              Curious how the mail sending area looks and feels? Explore our interactive demo page—no login or setup required!
            </p>
            <Link
              to='/demo'
              className="w-full bg-indigo-400 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-xl transition duration-200 text-center mt-auto"
            >
              View Demo Mail Page
            </Link>
          </div>
        </div>
      </div>
      <PopupVerify isOpen={showPopup} onClose={() => setShowPopup(false)} />
      <PopUp isOpen={tokenPopUp} onClose={() => setTokenPopUp(false)} handleContinue={handleContinue}>
        <section id='token-verify'>
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className='bg-white rounded-3xl shadow-2xl p-8 w-full max-w-[350px] md:max-w-md relative flex flex-col items-center'>
              <div className='absolute top-5 right-5  bg-gray-400 p-0.5 rounded-full'>
                <span className='cursor-pointer text-gray-900 hover:text-red-500 font-bold focus:outline-none' onClick={() => setTokenPopUp(false)}><X size={30} /></span>
              </div>
              <VerifyToken />
            </div>
          </div>
        </section>
      </PopUp>
    </div>
  )
}

export default DashBoard;