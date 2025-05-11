import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import axios from "axios";

const sidebarVariants = {
  open: { x: 0 },
  closed: { x: '-100%' },
};

const HistorySidebar = ({ isOpen, onClose, emailHistory, messageHistory, onEmailSelect, onMessageSelect, setEmailHistory, setMessageHistory }) => {
  const [selectedEmails, setSelectedEmails] = useState({});

  const handleApplySelectedEmails = () => {
    const emailsToApply = Object.keys(selectedEmails);
    console.log('emails to apply: ', emailsToApply);
    onEmailSelect(emailsToApply);
    onClose();
  };

  const handleCheckboxChange = (email, isChecked) => {
    setSelectedEmails(prevSelectedEmails => ({
      ...prevSelectedEmails, [email]: isChecked,
    }))
  };

  const clearHistory = async () => {
    try {
      await axios.delete('https://bulk-mail-db-server.onrender.com/message-history');
      // await axios.delete('http://localhost:4000/message-history');// https://bulk-mail-db-server.onrender.com
      setEmailHistory([]);
      setMessageHistory([]);
      console.log('clearing history!');
    } catch (err) {
      console.error('Failed to clear history:', err);
      console.log('clearing history error!', err);
    }
  };
  

  return (
    <section id="history-side-bar">
      <AnimatePresence>
        <motion.div
          className="fixed top-0 left-0 h-full overflow-y-auto w-full lg:w-[50%] bg-gradient-to-bl from-orange-500 to-blue-500 shadow-lg p-6 z-50"
          variants={sidebarVariants}
          initial='closed'
          animate={isOpen ? 'open' : 'closed'}
          transition={{ type: 'tween', stiffness: 50, damping: 50 }}
        >
          <div className="flex justify-end mb-4">
            <button 
              onClick={onClose}
              className="
              p-2 rounded-full text-gray-900 bg-gray-200 cursor-pointer hover:bg-gray-50"
            >
              <X size={25} />
            </button>
          </div>

          <div>
            <span className="flex flex-row items-center justify-between max-w-[80%]">
              <h2 className="text-xl font-semibold mb-2 text-gray-50">
                <span>Email History :</span>
              </h2>
            </span>
            <div className="w-full flex flex-row items-center justify-between my-2">
            {emailHistory.length > 0 && (
                <button
                  onClick={() => {
                  const allSelected = Object.keys(selectedEmails).length === emailHistory.length;
                  const newSelectedEmails = {};

                  if (!allSelected) {
                    emailHistory.forEach((email) => {
                      newSelectedEmails[email] = true;
                    });
                  }
                  setSelectedEmails(newSelectedEmails)
                }}
                className="font-semibold cursor-pointer px-3 py-2 rounded-lg bg-gradient-to-br from-orange-700 to-blue-700 hover:bg-gradient-to-br hover:from-orange-800 hover:to-blue-800 transition duration-300 ease-in-out shadow-md shadow-gray-700 text-gray-50 w-[150px] mb-2"
              >
                {Object.keys(selectedEmails).length === emailHistory.length && Object.keys(selectedEmails).every(email => selectedEmails[email])
                  ? 'Deselect All' 
                  : 'Select All'
                }
              </button>
              )}

              <button
                onClick={handleApplySelectedEmails}
                className="font-semibold cursor-pointer px-3 py-2 rounded-lg bg-gradient-to-br from-orange-700 to-blue-700 hover:bg-gradient-to-br hover:from-orange-800 hover:to-blue-800 transition duration-300 ease-in-out shadow-md shadow-gray-700 text-gray-50 mb-2"
              >
                Apply
              </button>

              {/* Delete History */}
              <button
                onClick={clearHistory}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 mb-2 cursor-pointer shadow-md shadow-gray-800 font-semibold transition duration-300 ease-in-out"
              >
                Clear
              </button>
            </div>

            {emailHistory.length > 0 ? (
              <div className="border w-full border-gray-100 rounded-md bg-gray-600/50 h-full p-2 max-h-[250px] overflow-y-auto">
                {emailHistory.map((email, index) => {
                  return (
                  <div
                  key={index}
                  className={`py-1 w-full text-gray-100 cursor-pointer hover:bg-gray-400 hover:rounded-md flex items-center p-2 ${index < emailHistory.length - 1 ? 'border-b border-white' : ''}`}
                  >
                    <span className="flex items-center justify-start mt-px w-full">
                      <input type="checkbox"
                        checked={selectedEmails[email] || false}
                        onChange={(e) => handleCheckboxChange(email, e.target.checked)}
                        className="mr-1 h-[17px] w-[17px] cursor-pointer"
                        name="email-checkbox"
                      />
                      <span
                        className="text-base uppercase font-mono leading-5 tracking-wider font-medium text-gray-50 hover:text-gray-900"
                        onClick={() => {
                          handleCheckboxChange(email, !selectedEmails[email]); // Toggle checkbox on email click
                        }}
                      >
                        {email}
                      </span>
                    </span>
                    {/* <div className="w-full bg-white"></div> */}
                  </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-300">No Email History Yet.</p>
            )}
          </div>

          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2 text-gray-50">
              <span>Message History :</span>
            </h2>

            {messageHistory.length > 0 ? (
              <div className="border border-gray-100 rounded-md bg-gray-600/50 p-3 h-full max-h-[500px] overflow-y-auto">

                {messageHistory.map((message, index) => (
                  <div
                    key={index}
                    className="py-1 cursor-pointer"
                    onClick={() => onMessageSelect(message)}
                  >
                    <div className="flex flex-col justify-between space-y-1 border border-gray-200 rounded-md p-2  hover:bg-gray-400">
                      <span className="text-xs text-gray-100">
                        {new Date(message.timestamp).toLocaleString()}
                      </span>

                      <div className="flex flex-col">
                        <span className="text-gray-300 text-[13px]">Subject:</span>
                        <span className="text-white text-base">{message.subject}</span>
                      </div>
                      
                      <div className="bg-white w-full h-px"></div>
                      <div className="flex flex-col">
                        <span className="text-gray-300 text-[13px]">Body:</span>
                        <span className="text-white text-base truncate-text">{message.body}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-300">No Message History Yet.</p>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  )
};

export default HistorySidebar;