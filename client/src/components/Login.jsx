import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setMessage("Email and password are required.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setMessage("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/login`, formData);
      setMessage("Login successful!");

      // Save token and email
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("email", formData.email);

      // Redirect to logged-in page
      navigate("/loggedIn");
    } catch (error) {
      console.error("Login error:", error);
      const status = error.response?.status;
      if (status === 401) {
        setMessage("Invalid credentials. Please try again.");
      } else if (status === 403) {
        setMessage("Your account is disabled or not verified.");
      } else {
        setMessage("An unexpected error occurred. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit} style={{ marginTop: "10px" }}>
        <label htmlFor="email">Email:</label>
        <input
          id="email"
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          style={{ display: "block", marginBottom: "10px", padding: "8px", width: "100%" }}
        />
        <label htmlFor="password">Password:</label>
        <input
          id="password"
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
            backgroundColor: loading ? "#CCCCCC" : "#007BFF",
            color: "#FFF",
            border: "none",
            borderRadius: "5px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      {message && (
        <p style={{ marginTop: "20px", color: message === "Login successful!" ? "green" : "red" }}>
          {message}
        </p>
      )}
    </div>
  );
}

export default Login;
