import React, { useState } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import Chatbot from './components/Chatbot';
import { products } from './data/products';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <div className={`app ${darkMode ? 'dark-mode' : ''}`}>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      
      <div className="container">
        <div className="hero-section">
          <h1>Welcome to TechStore</h1>
          <p>Discover the latest electronics at unbeatable prices</p>
        </div>

        <div className="products-section">
          <h2>Featured Products</h2>
          <div className="products-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} darkMode={darkMode} />
            ))}
          </div>
        </div>
      </div>

      {/* Chat Button */}
      <button 
        className={`chat-button ${darkMode ? 'dark' : ''}`}
        onClick={toggleChat}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </button>

      {/* Chatbot */}
      {isChatOpen && (
        <Chatbot darkMode={darkMode} onClose={toggleChat} />
      )}
    </div>
  );
}

export default App;