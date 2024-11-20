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
        const response = await axios.get(`http://localhost:3000/verify-email?token=${token}`);
        setMessage(response.data);
      } catch (error) {
        setMessage(error.response?.data?.error || "An error occurred");
      }
    };
    verifyEmail();
  }, [searchParams]);

  return (
    <div>
      <h2>Email Verification</h2>
      <p>{message}</p>
    </div>
  );
}

export default EmailVerification;
