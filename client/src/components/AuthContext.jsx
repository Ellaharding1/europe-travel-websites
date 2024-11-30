import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [isLoggedIn, setIsLoggedIn] = useState(!!token);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true); // Track loading state for validation

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        console.log("No token found. User is logged out.");
        setIsLoggedIn(false);
        setIsAdmin(false);
        setLoading(false);
        return;
      }
    
      console.log("Token exists, validating with backend...");
    
      try {
        const response = await axios.get(`${BACKEND_URL}/api/user-profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
    
        console.log("Backend response:", response.data);
    
        const { status, isAdmin: adminStatus } = response.data;
        setIsLoggedIn(true);
        setIsAdmin(adminStatus || status === "admin");
        console.log("Updated isAdmin:", adminStatus || status === "admin");
      } catch (error) {
        console.error("Error validating token:", error.message);
        setIsLoggedIn(false);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };
    

    validateToken();
  }, [token]); // Re-run whenever `token` changes

  const logIn = (newToken) => {
    console.log("Logging in with token:", newToken);
    localStorage.setItem("token", newToken);
    setToken(newToken); // Triggers `useEffect` to validate token
  };

  const logOut = () => {
    console.log("Logging out...");
    localStorage.removeItem("token");
    setToken(null);
    setIsLoggedIn(false);
    setIsAdmin(false);
  };

  // Provide a loading state to handle conditional rendering in other components
  return (
    <AuthContext.Provider
      value={{ isLoggedIn, isAdmin, logIn, logOut, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
