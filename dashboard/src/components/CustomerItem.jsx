import React from 'react';
import './CustomerItem.css';

function CustomerItem({ customer, isSelected, isOnline, onClick }) {
  return (
    <div 
      className={`customer-item ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <div className="customer-avatar-container">
        <div className="customer-avatar">
          {customer.name.charAt(0).toUpperCase()}
        </div>
        {isOnline && <span className="online-indicator"></span>}
      </div>
      
      <div className="customer-info">
        <div className="customer-header">
          <h4 className="customer-name">{customer.name}</h4>
          <span className="customer-time">
            {new Date(customer.createdAt).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        </div>
        <p className="customer-email">{customer.email}</p>
      </div>
    </div>
  );
}

export default CustomerItem;