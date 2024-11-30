import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;


export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [isLoggedIn, setIsLoggedIn] = useState(!!token);
  const [isAdmin, setIsAdmin] = useState(false);

  // Log in and set token & admin status
  const logIn = async (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setIsLoggedIn(true);

    // Fetch admin status after login
    try {

      const response = await axios.get(`${BACKEND_URL}/api/admin/status`, {
        headers: { Authorization: `Bearer ${newToken}` },
      });
      setIsAdmin(response.data.isAdmin); // Backend should return whether the user is admin
    } catch (error) {
      console.error("Error checking admin status:", error.message);
      setIsAdmin(false);
    }
  };

  // Log out and clear local storage
  const logOut = () => {
    localStorage.removeItem("token");
    setToken(null);
    setIsLoggedIn(false);
    setIsAdmin(false);
  };

  // Automatically check admin status if token exists on first load
  useEffect(() => {
    const fetchAdminStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setIsAdmin(false);
          return;
        }
  
        const response = await axios.get(`${BACKEND_URL}/api/admin/status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        setIsAdmin(response.data.isAdmin);
      } catch (err) {
        console.error("Error checking admin status on load:", err.message);
        setIsAdmin(false);
      }
    };
  
    fetchAdminStatus();
  }, []);
  

  return (
    <AuthContext.Provider value={{ isLoggedIn, isAdmin, logIn, logOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
