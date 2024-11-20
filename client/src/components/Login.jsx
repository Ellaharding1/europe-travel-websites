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
      setMessage(error.response?.data?.error || "An error occurred");
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <button type="submit">Login</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default Login;
