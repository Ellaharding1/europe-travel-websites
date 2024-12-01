import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { useNavigate } from 'react-router-dom';


function EmailVerification() {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();


  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token");
      if (!token) {
        setMessage("Verification token is missing.");
        setIsSuccess(false);
        return;
      }
  
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/verify-email?token=${token}`
        );
        setMessage(response.data.message || "Email verified successfully.");
        setIsSuccess(true);
  
        // Redirect to login page after successful verification
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } catch (error) {
        const errorMessage = error.response?.data?.error || "An error occurred during verification.";
        setMessage(errorMessage);
        setIsSuccess(false);
      }
    };
  
    verifyEmail();
  }, [searchParams, navigate]);


  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h2>Email Verification</h2>
      <p
        style={{
          color: isSuccess ? "green" : "red",
          fontWeight: "bold",
          marginTop: "10px",
        }}
      >
        {message}
      </p>
    </div>
  );
}

export default EmailVerification;
