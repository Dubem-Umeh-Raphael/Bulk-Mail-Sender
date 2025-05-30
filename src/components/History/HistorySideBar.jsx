import React, { useState, useContext, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from 'axios';
import { X } from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";
import PopUp from "../../animations/PopUp";

const sidebarVariants = {
  open: { x: 0 },
  closed: { x: '-100%' },
};

const HistorySidebar = ({ isOpen, onClose, onEmailSelect, onMessageSelect }) => {
  const [selectedEmails, setSelectedEmails] = useState({});
  const { emailHistory, messageHistory, refreshHistory } = useContext(AuthContext);

  const [hoveredMessageId, setHoveredMessageId] = useState(null);
  const [selectedMessages, setSelectedMessages] = useState({});
  const [isPopUpOpen, setIsPopUpOpen] = useState(false);
  const [messageToDisplayInPopUp, setMessageToDisplayInPopUp] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    refreshHistory()
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
    // console.log('emails to apply: ', emailsToApply);
    // console.log('messages to apply: ', selectedMessagesList);
    onEmailSelect(emailsToApply);
    onMessageSelect(selectedMessagesList); // Pass selected messages
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
    // console.log('clearHistory function triggered');

    // Get the IDs of the messages that are currently selected (checkboxes checked)
    const messageIdsToDelete = Object.keys(selectedMessages).filter(id => selectedMessages[id]);

    if (messageIdsToDelete.length === 0) {
      toast.error('Please enter at least One message to delete!');
      return
    };

    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        console.error('Auth token not found in localStorage!')
        return;
      };

      await toast.promise(
        (async () =>{
          // Construct the URL with selected message IDs, sending messageIds as a comma-separated string in the query param
          const queryParams = new URLSearchParams({
            smtp_token: token,
            messageIds: messageIdsToDelete.join(',') // Join IDs with a comma
          }).toString();

          const response = await axios.delete(`https://bulk-mail-db-server.onrender.com/message/message-history?${queryParams}`);
          // const response = await axios.delete(`http://localhost:4000/message/message-history?${queryParams}`);
          // console.log('Delete selected messages response:', response);

          if (response.data.success) {
            refreshHistory(); // refresh the UI
            setSelectedMessages({}); // Clear selected messages after deletion
          } else {
            console.error(`Failed to delete messages: ${(response.data.error || 'Unknown error' || error)}`);
          };
        })(),
        {
          loading: 'Deleting messages...',
          success: 'Messages deleted successfully!',
          error: 'Error deleting messages!'
        }
      )
    } catch (err) {
      console.error('Error in clearHistory (Frontend): ', err);
      toast.error(`Error deleting messages: ${(err.response?.data?.error || err.message)}`);
    }
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


    try {
      const token = localStorage.getItem('auth_token');

      if (!token) {
        console.error('Auth token not found in the localStorage');
        return;
      }

      await toast.promise(
        (async () =>{
          // Send just the single messageId to the Backend
          const queryParams = new URLSearchParams({
            smtp_token: token,
            messageIds: messageId // Backend expects comma-separated, single ID works
          }).toString();

          // const response = await axios.delete(`http://localhost:4000/message/message-history?${queryParams}`);
          const response = await axios.delete(`https://bulk-mail-db-server.onrender.com/message/message-history?${queryParams}`);

          if (response.data.message) {
            // alert(response.data.message);
            refreshHistory();
            setIsPopUpOpen(false);
            setMessageToDisplayInPopUp(null);
          } else {
            // alert('Failed to delete message: ' + (response.data.error || 'Unknown error'));
            console.error('Failed to delete message: ', error);
          }
        })(),
        {
          loading: 'Deleting message...',
          success: 'Message deleted successfully!',
          error: 'Error deleting message!'
        }
      )
    } catch (err) {
      console.error('Error deleting single message (frontend): ', err);
      // alert('Error deleting message: ' + (err.response?.data?.error || err.message));
      setIsDeleting(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleSelectAllMessages = () => {

    // Determine if all messages are currently selected
    const allMessagesSelected = messageHistory.every(message =>
      selectedMessages[message.id || message.index]
    );

    const newSelectedMessages = {};

    if (!allMessagesSelected) {
      // If not all are selected, select all
      messageHistory.forEach(message => {
        // Use message.id if available,  otherwise fallback to index as key
        newSelectedMessages[message.id || message.index] = true;
      });
    }

    // If all are selected, newSelectedMessages will remain empty, effectively deselecting all.
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
            <div className="flex flex-row items-center justify-between">
              <h2 className="text-xl font-semibold mb-2 text-gray-50">
                <span>Message History :</span>
              </h2>
              {/* Select and Deselect All in message history */}
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

              {/* Delete History */}
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
                    // onMouseEnter={() => {setHoveredMessageId(message.id || index)}}
                    // onMouseLeave={() => {setHoveredMessageId(null)}}
                    // onClick={() => onMessageSelect(message.id)}
                    // ${hoveredMessageId === (message.id || index) ? 'pr-8' : ''} removed from the below div
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
                    {/* Checkbox for hovered message */}
                    {/* {hoveredMessageId === (message.id || index)
                      && (
                        <input 
                          type="checkbox" 
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-[20px] w-[20px] cursor-pointer z-10"
                          checked={selectedMessages[message.id || index] || false}
                          onChange={(e) => handleMessageCheckBoxChange(message.id || index, e.target.checked)}
                          onClick={(e) => e.stopPropagation()} // prevent message click when checkbox is clicked
                        />
                      )
                    } */}
                    <input 
                      type="checkbox"
                      className="absolute right-2 top-[47%] h-[25px] w-[25px] cursor-pointer z-10"
                      checked={selectedMessages[message.id || index] || false}
                      onChange={(e) => handleMessageCheckBoxChange(message.id || index, e.target.checked)}
                      onClick={(e) => e.stopPropagation()} // prevent message click when checkbox is clicked
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-300">No Message History Yet.</p>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* PopUp for displaying and deleting a single message */}
        {isPopUpOpen && 
          messageToDisplayInPopUp && (
            <PopUp isOpen={isPopUpOpen} onClose={() => setIsPopUpOpen(false)}>
              <section id="Single message delete popup" className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="bg-white rounded-3xl shadow-2xl p-2 w-full max-w-[400px] md:max-w-[500px] relative flex flex-col items-center">
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

export default HistorySidebar;