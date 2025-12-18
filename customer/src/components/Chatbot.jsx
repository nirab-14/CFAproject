import React, { useState, useEffect, useRef } from 'react';
import './Chatbot.css';
import ChatLogin from './ChatLogin';
import io from 'socket.io-client';

function Chatbot({ darkMode, onClose }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('customerToken');
    const userData = localStorage.getItem('customerData');
    
    if (token && userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn && user) {
      // Connect to socket
      const newSocket = io(process.env.REACT_APP_API_URL);
      setSocket(newSocket);

      // Join as customer
      newSocket.emit('customer-join', {
        userId: user.id,
        name: user.name
      });

      // Send welcome message
      setTimeout(() => {
        const welcomeMessage = {
          message: `Hi ${user.name}! 👋 Welcome to TechStore support. How can I help you today?`,
          sender: 'admin',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, welcomeMessage]);
      }, 500);

      // Listen for admin replies
      newSocket.on('admin-reply', (data) => {
        setMessages(prev => [...prev, data]);
        setIsTyping(false);
      });

      // Listen for typing indicator
      newSocket.on('admin-typing', () => {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 3000);
      });

      // Listen for message sent confirmation
      newSocket.on('message-sent', (data) => {
        // Message already added optimistically
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [isLoggedIn, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (inputMessage.trim() && socket) {
      const messageData = {
        userId: user.id,
        userName: user.name,
        message: inputMessage,
        sender: 'customer',
        timestamp: new Date()
      };

      // Add message optimistically
      setMessages(prev => [...prev, messageData]);

      // Send to server
      socket.emit('customer-message', messageData);

      setInputMessage('');

      // Auto-reply simulation for demo (remove in production)
      setTimeout(() => {
        const autoReply = getAutoReply(inputMessage);
        if (autoReply) {
          const replyMessage = {
            message: autoReply,
            sender: 'admin',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, replyMessage]);
        }
      }, 1500);
    }
  };

  const getAutoReply = (message) => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return `Hello ${user.name}! How can I assist you with your shopping today?`;
    } else if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
      return `${user.name}, all our products have competitive pricing! You can check the product cards for detailed pricing information.`;
    } else if (lowerMessage.includes('shipping') || lowerMessage.includes('delivery')) {
      return `We offer free shipping on orders over $50, ${user.name}! Standard delivery takes 3-5 business days.`;
    } else if (lowerMessage.includes('return') || lowerMessage.includes('refund')) {
      return `${user.name}, we have a 30-day return policy. You can return any product within 30 days for a full refund!`;
    } else if (lowerMessage.includes('thank')) {
      return `You're welcome, ${user.name}! Is there anything else I can help you with?`;
    } else if (lowerMessage.includes('help')) {
      return `Of course, ${user.name}! I'm here to help. What would you like to know about our products or services?`;
    }
    
    return null;
  };

  const handleTyping = () => {
    if (socket && user) {
      socket.emit('customer-typing', {
        userId: user.id,
        userName: user.name
      });

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set new timeout
      typingTimeoutRef.current = setTimeout(() => {
        // Stop typing indicator after 2 seconds
      }, 2000);
    }
  };

  return (
    <div className={`chatbot-container ${darkMode ? 'dark' : ''}`}>
      <div className="chatbot-header">
        <div className="chatbot-header-info">
          <div className="chatbot-avatar">💬</div>
          <div>
            <h3>TechStore Support</h3>
            <p className="status-online">● Online</p>
          </div>
        </div>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>

      {!isLoggedIn ? (
        <ChatLogin onLogin={handleLogin} darkMode={darkMode} />
      ) : (
        <>
          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`message ${msg.sender === 'customer' ? 'user-message' : 'bot-message'}`}
              >
                <div className="message-content">
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
              <div className="message bot-message">
                <div className="message-content typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          <form className="chatbot-input" onSubmit={handleSendMessage}>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleTyping}
              placeholder={`Type your message, ${user.name}...`}
            />
            <button type="submit">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
        </>
      )}
    </div>
  );
}

export default Chatbot;