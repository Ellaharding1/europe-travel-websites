import React, { createContext, useState, useContext, useEffect } from "react";

export const AuthContext = createContext(); // Ensure AuthContext is explicitly exported

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [isLoggedIn, setIsLoggedIn] = useState(!!token);
  const [isAdmin, setIsAdmin] = useState(false);

  const logIn = (newToken, adminStatus) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setIsLoggedIn(true);
    setIsAdmin(adminStatus); // Set admin status
  };

  const logOut = () => {
    localStorage.removeItem("token");
    setToken(null);
    setIsLoggedIn(false);
    setIsAdmin(false); // Reset admin status
  };

  useEffect(() => {
    setIsLoggedIn(!!token);
    // Optionally fetch and check admin status if token is valid
    if (token) {
      const userIsAdmin = checkAdminStatus(token); // Mock or implement this function
      setIsAdmin(userIsAdmin);
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ isLoggedIn, isAdmin, logIn, logOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

// Optional: Mock admin status checker (replace with real API if necessary)
const checkAdminStatus = (token) => {
  // Decode or validate token and return admin status (mock implementation)
  return token === "mockAdminToken"; // Replace with real logic
};
