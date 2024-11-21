import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

function EmailVerification() {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token");
      try {
        // Use environment variable for the backend URL
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/verify-email?token=${token}`);
        setMessage(response.data.message || "Email verified successfully."); // Extract the message field
      } catch (error) {
        setMessage(error.response?.data?.error || "An error occurred during verification.");
      }
    };
    verifyEmail();
  }, [searchParams]);

  const renderMessage = () => {
    if (!message) return null;

    if (typeof message === "object") {
      return JSON.stringify(message); // Safely handle objects
    }

    return message; // Display string messages directly
  };

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h2>Email Verification</h2>
      <p style={{ color: "#555", marginTop: "10px" }}>{renderMessage()}</p>
    </div>
  );
}

export default EmailVerification;
