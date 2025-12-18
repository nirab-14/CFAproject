import React, { useState, useEffect, useRef } from 'react';
import './ChatArea.css';
import axios from 'axios';

function ChatArea({ selectedCustomer, admin, socket }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (selectedCustomer) {
      // Fetch messages for selected customer
      fetchMessages();
    }
  }, [selectedCustomer]);

  useEffect(() => {
    if (socket && selectedCustomer) {
      // Listen for new customer messages
      socket.on('new-customer-message', (data) => {
        if (data.userId === selectedCustomer._id) {
          setMessages(prev => [...prev, data]);
        }
      });

      // Listen for customer typing
      socket.on('customer-typing', (data) => {
        if (data.userId === selectedCustomer._id) {
          setIsTyping(true);
          setTimeout(() => setIsTyping(false), 3000);
        }
      });

      // Listen for message sent confirmation
      socket.on('admin-message-sent', (data) => {
        if (data.userId === selectedCustomer._id) {
          // Message already added optimistically
        }
      });
    }

    return () => {
      if (socket) {
        socket.off('new-customer-message');
        socket.off('customer-typing');
        socket.off('admin-message-sent');
      }
    };
  }, [socket, selectedCustomer]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/messages/user/${selectedCustomer._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (inputMessage.trim() && socket && selectedCustomer) {
      const messageData = {
        userId: selectedCustomer._id,
        message: inputMessage,
        adminName: admin.name,
        sender: 'admin',
        timestamp: new Date()
      };

      // Add message optimistically
      setMessages(prev => [...prev, messageData]);

      // Send to server
      socket.emit('admin-message', messageData);

      setInputMessage('');
    }
  };

  const handleTyping = () => {
    if (socket && selectedCustomer) {
      socket.emit('admin-typing', {
        userId: selectedCustomer._id
      });

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        // Stop typing after 2 seconds
      }, 2000);
    }
  };

  if (!selectedCustomer) {
    return (
      <div className="chat-area">
        <div className="no-chat-selected">
          <div className="no-chat-icon">💬</div>
          <h2>Welcome to TechStore Dashboard</h2>
          <p>Select a customer from the sidebar to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-area">
      <div className="chat-header">
        <div className="chat-header-info">
          <div className="chat-avatar">
            {selectedCustomer.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3>{selectedCustomer.name}</h3>
            <p>{selectedCustomer.email}</p>
          </div>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`chat-message ${msg.sender === 'admin' ? 'admin-message' : 'customer-message'}`}
          >
            <div className="message-content">
              {msg.sender === 'admin' && (
                <div className="message-sender">{msg.adminName || 'Admin'}</div>
              )}
              {msg.message}
            </div>
            <div className="message-time">
              {new Date(msg.timestamp).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="chat-message customer-message">
            <div className="message-content typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-area" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleTyping}
          placeholder="Type a message..."
        />
        <button type="submit">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </form>
    </div>
  );
}

export default ChatArea;