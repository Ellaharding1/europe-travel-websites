import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext"; // Import the AuthContext if you're using it

const Logout = () => {
  const navigate = useNavigate();
  const { logOut } = useAuth(); // Use the logOut function from AuthContext if available

  useEffect(() => {
    // Clear token and other states
    logOut();

    // Redirect to the login page or homepage
    navigate("/login");
  }, [logOut, navigate]);

  return null; // No UI needed, it just handles the logout logic
};

export default Logout;
