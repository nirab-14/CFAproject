import React from 'react';
import './Sidebar.css';
import CustomerItem from './CustomerItem';

function Sidebar({ customers, selectedCustomer, onSelectCustomer, admin, onLogout, onlineCustomers }) {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="admin-info">
          <div className="admin-avatar">{admin.name.charAt(0).toUpperCase()}</div>
          <div className="admin-details">
            <h3>{admin.name}</h3>
            <p>Admin</p>
          </div>
        </div>
        <button className="logout-btn" onClick={onLogout} title="Logout">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        </button>
      </div>

      <div className="sidebar-search">
        <input type="text" placeholder="Search customers..." />
      </div>

      <div className="customers-list">
        <h4 className="list-title">Customer Chats ({customers.length})</h4>
        {customers.length === 0 ? (
          <div className="no-customers">
            <p>No customers yet</p>
            <p className="hint">Customers will appear here when they start chatting</p>
          </div>
        ) : (
          customers.map((customer) => (
            <CustomerItem
              key={customer._id}
              customer={customer}
              isSelected={selectedCustomer?._id === customer._id}
              isOnline={onlineCustomers[customer._id]}
              onClick={() => onSelectCustomer(customer)}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default Sidebar;