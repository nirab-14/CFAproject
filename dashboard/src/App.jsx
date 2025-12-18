import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import axios from 'axios';
import io from 'socket.io-client';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [socket, setSocket] = useState(null);
  const [onlineCustomers, setOnlineCustomers] = useState({});

  useEffect(() => {
    // Check if admin is already logged in
    const token = localStorage.getItem('adminToken');
    const adminData = localStorage.getItem('adminData');
    
    if (token && adminData) {
      const parsedAdmin = JSON.parse(adminData);
      setAdmin(parsedAdmin);
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn && admin) {
      // Fetch customers
      fetchCustomers();

      // Connect to socket
      const newSocket = io(process.env.REACT_APP_API_URL);
      setSocket(newSocket);

      // Join as admin
      newSocket.emit('admin-join', {
        adminId: admin.id,
        name: admin.name
      });

      // Listen for customer online/offline
      newSocket.on('customer-online', (data) => {
        setOnlineCustomers(prev => ({ ...prev, [data.userId]: true }));
      });

      newSocket.on('customer-offline', (data) => {
        setOnlineCustomers(prev => {
          const updated = { ...prev };
          delete updated[data.userId];
          return updated;
        });
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [isLoggedIn, admin]);

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/customers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const handleLogin = (adminData) => {
    setAdmin(adminData);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    setIsLoggedIn(false);
    setAdmin(null);
    setSelectedCustomer(null);
    if (socket) {
      socket.disconnect();
    }
  };

  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="dashboard">
      <Sidebar
        customers={customers}
        selectedCustomer={selectedCustomer}
        onSelectCustomer={handleSelectCustomer}
        admin={admin}
        onLogout={handleLogout}
        onlineCustomers={onlineCustomers}
      />
      <ChatArea
        selectedCustomer={selectedCustomer}
        admin={admin}
        socket={socket}
      />
    </div>
  );
}

export default App;