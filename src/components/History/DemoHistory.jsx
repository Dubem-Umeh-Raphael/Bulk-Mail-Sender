// DemoHistory: Demo version of HistorySideBar without AuthContext, using localStorage for history
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import PopUp from "../../animations/PopUp";

const sidebarVariants = {
  open: { x: 0 },
  closed: { x: '-100%' },
};

const DemoHistory = ({ isOpen, onClose, emailHistory, messageHistory, onEmailSelect, onMessageSelect, setEmailHistory, setMessageHistory, refreshHistory }) => {
  const [selectedEmails, setSelectedEmails] = useState({});
  const [hoveredMessageId, setHoveredMessageId] = useState(null);
  const [selectedMessages, setSelectedMessages] = useState({});
  const [isPopUpOpen, setIsPopUpOpen] = useState(false);
  const [messageToDisplayInPopUp, setMessageToDisplayInPopUp] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (refreshHistory) refreshHistory();
  }, [refreshHistory]);

  const handleApplySelectedEmails = () => {
    const emailsToApply = Object.keys(selectedEmails);
    const selectedMessageIds = Object.keys(selectedMessages).filter(id => selectedMessages[id]);
    if (selectedMessageIds.length > 1) {
      toast.error('Please select only one message to apply.');
      return;
    }
    const selectedMessagesList = messageHistory.filter(
      msg => selectedMessageIds.includes(String(msg.id || msg.index))
    );
    onEmailSelect(emailsToApply);
    onMessageSelect(selectedMessagesList);
    onClose();
  };

  const handleCheckboxChange = (email, isChecked) => {
    setSelectedEmails(prevSelectedEmails => ({
      ...prevSelectedEmails, [email]: isChecked,
    }))
  };

  const handleMessageCheckBoxChange = (messageId, isChecked) => {
    setSelectedMessages(
      prevSelectedMessages => ({
        ...prevSelectedMessages, [messageId]: isChecked,
      })
    );
  };

  const clearHistory = async () => {
    const messageIdsToDelete = Object.keys(selectedMessages).filter(id => selectedMessages[id]);
    if (messageIdsToDelete.length === 0) {
      toast.error('Please select at least one message to delete!');
      return;
    }
    const updated = messageHistory.filter(msg => !messageIdsToDelete.includes(String(msg.id || msg.index)));
    setMessageHistory(updated);
    localStorage.setItem('demo_message_history', JSON.stringify(updated));
    setSelectedMessages({});
    if (refreshHistory) refreshHistory();
  };

  const handleMessageClick = (message) => {
    setMessageToDisplayInPopUp(message);
    setIsPopUpOpen(true);
  };

  const handleDeleteSingleMessage = async (messageId) => {
    setIsDeleting(true);
    if (!window.confirm('Are you sure you want to delete this message?')) {
      setIsDeleting(false);
      return;
    }
    const updated = messageHistory.filter(msg => String(msg.id) !== String(messageId));
    setMessageHistory(updated);
    localStorage.setItem('demo_message_history', JSON.stringify(updated));
    setIsPopUpOpen(false);
    setMessageToDisplayInPopUp(null);
    toast.success('Message deleted successfully!');
    setIsDeleting(false);
    if (refreshHistory) refreshHistory();
  };

  const toggleSelectAllMessages = () => {
    const allMessagesSelected = messageHistory.every(message => selectedMessages[message.id || message.index]);
    const newSelectedMessages = {};
    if (!allMessagesSelected) {
      messageHistory.forEach(message => {
        newSelectedMessages[message.id || message.index] = true;
      });
    }
    setSelectedMessages(newSelectedMessages);
  };

  return (
    <section id="history-side-bar">
      <AnimatePresence>
        <motion.div
          className="fixed top-0 left-0 h-full overflow-y-auto w-full lg:w-[50%] bg-gradient-to-bl from-orange-500 to-blue-500 shadow-lg p-6 z-50 hide-scroll-bar"
          variants={sidebarVariants}
          initial='closed'
          animate={isOpen ? 'open' : 'closed'}
          transition={{ type: 'tween', stiffness: 50, damping: 50 }}
        >
          <div className="flex justify-end mb-4">
            <button 
              onClick={onClose}
              className="p-2 rounded-full text-gray-900 bg-gray-200 cursor-pointer hover:bg-gray-50"
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
                className="font-semibold cursor-pointer py-2 rounded-lg bg-gradient-to-br from-orange-700 to-blue-700 hover:bg-gradient-to-br hover:from-orange-800 hover:to-blue-800 transition duration-300 ease-in-out shadow-md shadow-gray-700 text-gray-50 w-[120px] mb-2"
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
            </div>

            {emailHistory.length > 0 ? (
              <div className="border w-full border-gray-100 rounded-md bg-gray-600/50 h-full p-2 max-h-[250px] overflow-y-auto hide-scroll-bar">
                {emailHistory.map((email, index) => (
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
                          handleCheckboxChange(email, !selectedEmails[email]);
                        }}
                      >
                        {email}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-300">No Email History Yet.</p>
            )}
          </div>

          <div className="mt-6">
            <div className="flex flex-row items-center justify-between">
              <h2 className="text-xl font-semibold mb-2 text-gray-50">
                <span>Message History :</span>
              </h2>
              <button
                className="font-semibold cursor-pointer py-2 rounded-lg bg-gradient-to-br from-orange-700 to-blue-700 hover:bg-gradient-to-br hover:from-orange-800 hover:to-blue-800 transition duration-300 ease-in-out shadow-md shadow-gray-700 text-gray-50 w-[120px] mb-2"
                onClick={toggleSelectAllMessages}
              >
                {messageHistory.length > 0 &&
                  messageHistory.every(message => selectedMessages[message.id || message.index])
                  ? 'Deselect All'
                  : 'Select All'
                }
              </button>
              <button
                onClick={clearHistory}
                className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 mb-2 cursor-pointer shadow-md shadow-gray-800 font-semibold transition duration-300 ease-in-out"
              >
                Delete Selected
              </button>
            </div>

            {messageHistory.length > 0 ? (
              <div className="border border-gray-100 rounded-md bg-gray-600/50 p-3 h-full max-h-[500px] overflow-y-auto hide-scroll-bar">
                {messageHistory.map((message, index) => (
                  <div
                    key={message.id || index}
                    className="py-1 cursor-pointer relative"
                  >
                    <div className={`flex flex-col justify-between space-y-1 border border-gray-200 rounded-md p-2 hover:bg-gray-400 pr-8`} onClick={() => handleMessageClick(message)}>
                      <span className="text-xs text-gray-100">
                        {new Date(message.timestamp).toLocaleString()}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-gray-300 text-[13px]">Subject:</span>
                        <span className={`text-white text-base ${hoveredMessageId === (message.id || index) ? 'truncate-text-with-checkbox' : ''}`}>{message.subject}</span>
                      </div>
                      <div className="bg-white w-full h-px"></div>
                      <div className="flex flex-col">
                        <span className="text-gray-300 text-[13px]">Body:</span>
                        <span className={`text-white text-base truncate-texts ${hoveredMessageId === (message.id || index) ? 'truncate-text-with-checkbox' : ''}`}>{message.body}</span>
                      </div>
                    </div>
                    <input 
                      type="checkbox"
                      className="absolute right-2 top-[47%] h-[25px] w-[25px] cursor-pointer z-10"
                      checked={selectedMessages[message.id || index] || false}
                      onChange={(e) => handleMessageCheckBoxChange(message.id || index, e.target.checked)}
                      onClick={(e) => e.stopPropagation()}                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-300">No Message History Yet.</p>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
      {isPopUpOpen && 
        messageToDisplayInPopUp && (
          <PopUp isOpen={isPopUpOpen} onClose={() => setIsPopUpOpen(false)}>
            <section id="Single message delete popup" className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="bg-white rounded-3xl shadow-2xl p-2 w-full max-w-[350px] md:max-w-[500px] relative flex flex-col items-center">
                <span 
                  className="relative -right-[42%] top-2 bg-gray-500 p-1 rounded-full text-white cursor-pointer hover:text-red-600 hover:bg-gray-400 transition duration-200 ease-in-out" 
                  onClick={() => {
                    setIsPopUpOpen(false);
                    setMessageToDisplayInPopUp(null)
                  }}
                  >
                  <X size={25} />
                </span>
                <div className="p-4 -mt-4 text-center">
                  <div className="mb-4 break-words">
                    <span className="flex items-center justify-center flex-col">
                      <span className="text-lg text-gray-800 font-bold underline underline-offset-4">Subject:</span>
                      <span className="text-[17px] font-semibold text-gray-700">{messageToDisplayInPopUp.subject}</span>
                    </span>
                  </div>
                  <span className="text-gray-700 w-full border-t-2 block"></span>
                  <div className="mb-6 text-gray-700 text-lg whitespace-pre-wrap text-left break-words">
                    <span className="flex items-center justify-center flex-col">
                      <span className="text-lg text-gray-800 font-bold underline underline-offset-4">Body:</span>
                      <span className="text-[17px] font-semibold text-gray-700">{messageToDisplayInPopUp.body}</span>
                    </span>
                  </div>
                  <div className="flex justify-center mt-6" id="Delete Action Button">
                    <button onClick={() => handleDeleteSingleMessage(messageToDisplayInPopUp.id)} className="bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition duration-300 ease-in-out shadow-md cursor-pointer font-semibold text-[17px]">
                      {isDeleting ? 'Deleting...' : 'Delete Message'}
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </PopUp>
        )
      }
    </section>
  )
};

export default DemoHistory;