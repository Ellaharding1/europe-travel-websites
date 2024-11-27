import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

function EmailVerification() {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

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
      } catch (error) {
        const errorMessage = error.response?.data?.error || "An error occurred during verification.";
        setMessage(errorMessage);
        setIsSuccess(false);
      }
    };

    verifyEmail();
  }, [searchParams]);

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
