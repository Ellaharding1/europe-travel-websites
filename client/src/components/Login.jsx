import React, { useState } from "react";
import axios from "axios";

function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Use environment variable for the backend URL
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/login`, formData);
      setMessage("Login successful!");
      localStorage.setItem("token", response.data.token); // Save token for authenticated routes
    } catch (error) {
      setMessage(
        error.response?.data?.error || "An error occurred during login. Please try again."
      );
    }
  };

  const renderMessage = () => {
    if (!message) return null;

    if (typeof message === "object") {
      return JSON.stringify(message); // Handle cases where message is an object
    }

    return message; // Render the string message
  };

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit} style={{ marginTop: "10px" }}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          style={{ display: "block", marginBottom: "10px", padding: "8px", width: "100%" }}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          style={{ display: "block", marginBottom: "10px", padding: "8px", width: "100%" }}
        />
        <button
          type="submit"
          style={{
            padding: "10px 20px",
            backgroundColor: "#007BFF",
            color: "#FFF",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Login
        </button>
      </form>
      {message && (
        <p style={{ marginTop: "20px", color: message === "Login successful!" ? "green" : "red" }}>
          {renderMessage()}
        </p>
      )}
    </div>
  );
}

export default Login;
