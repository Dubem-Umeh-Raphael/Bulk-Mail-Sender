import React, { useState, useRef } from 'react';
import { Send, Mail, Info, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const DemoMail = () => {
  const [emails] = useState([]);
  const [currentInput] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [status, setStatus] = useState('');
  const [loading] = useState(false);
  const emailInputRef = useRef(null);

  // Dummy handlers for prototype
  const handleInputChange = () => {};
  const handleKeyDown = () => {};
  const handleRemoveEmail = () => {};
  const handlePaste = () => {};
  const handleInputBlur = () => {};
  const handleSubmit = (e) => { e.preventDefault(); setStatus('This is a demo. Sending is disabled.'); };

  return (
    <section className='w-full h-full min-h-screen bg-gradient-to-br from-orange-300 to-blue-300'>
      <div className='pt-3 pl-3'>
        <Link to='/dash' className='flex items-center justify-center p-3 bg-red-500 hover:bg-red-600 transition duration-200 w-fit rounded-xl text-base text-gray-50'>Go Back</Link>
      </div>
      <div className='w-full h-full py-8 px-3'>
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-gray-400">
            <Mail className="text-blue-700" size={24} />
            <h2 className="text-2xl font-extrabold text-gray-900 hero-name tracking-wide -mb-2">Bulk Email Sender (Demo)</h2>
          </div>
          <div className="bg-blue-100 p-4 rounded-lg mb-6 flex items-start gap-3">
            <Info className="text-blue-700 flex-shrink-0 mt-3" size={18} />
            <p className="text-sm md:text-base font-medium text-blue-900">
              This is a demo prototype. Sending is disabled.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2" htmlFor="email-recipients">
                Recipients
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {/* Demo: No real email chips, just a disabled input */}
                <input
                  type="text"
                  id='email-recipients'
                  name="recipients"
                  autoComplete="on"
                  ref={emailInputRef}
                  value={currentInput}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  onBlur={handleInputBlur}
                  onPaste={handlePaste}
                  className="flex-grow p-3 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all placeholder-gray-500 text-xs md:text-base"
                  placeholder="Enter email and press space (demo disabled)"
                  disabled
                />
              </div>
              <p className="mt-1 text-base font-medium text-blue-600">Enter emails and press space</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2" htmlFor="email-subject">
                Subject Line
              </label>
              <input
                type="text"
                id='email-subject'
                name="subject"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full p-3 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all placeholder-gray-500 text-lg"
                placeholder="Enter the email subject"
                required
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2" htmlFor="email-body">
                Email Content
              </label>
              <textarea
                name="body"
                id='email-body'
                value={body}
                onChange={e => setBody(e.target.value)}
                className="w-full p-3 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all placeholder-gray-500"
                rows="8"
                placeholder="Type your message here..."
                required
                disabled
              />
            </div>
            <div className="pt-4">
              <button
                type="submit"
                disabled
                className={`w-full flex items-center justify-center gap-2 bg-blue-400 text-white py-3 px-6 rounded-md font-medium opacity-70 cursor-not-allowed transition-all shadow-md`}
              >
                <Send size={18} />
                <span>Send Bulk Emails (Demo)</span>
              </button>
            </div>
            {status && (
              <div className={`mt-4 p-4 rounded-md flex items-center gap-3 bg-yellow-100 text-yellow-800 border-2 border-yellow-300`}>
                <div className={`rounded-full p-1 bg-yellow-300`}>!</div>
                <div className="font-medium">{status}</div>
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
};

export default DemoMail;