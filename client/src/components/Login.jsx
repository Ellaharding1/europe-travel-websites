import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Box, Button, TextField, Typography,Toolbar } from "@mui/material";
import HomeNavBar from "./HomeNavBar"; // Import the reusable navbar



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
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="flex-start" // Align content higher on the page
      height="100vh"
      textAlign="center"
      sx={{
        margin: "0 auto",
        backgroundImage: "url('../img/background.png')", // Reuse HomePage background
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        color: "#ffffff",
        paddingTop: "15vh", // Adjust top padding to move the form higher
      }}
    >
      <HomeNavBar /> {/* Navigation bar */}
      <Toolbar /> {/* Spacer for the fixed AppBar */}
      <Typography variant="h4" gutterBottom>
        Login
      </Typography>
      <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: "400px" }}>
        <TextField
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          fullWidth
          margin="normal"
          sx={{
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            borderRadius: "5px",
          }}
        />
        <TextField
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          required
          fullWidth
          margin="normal"
          sx={{
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            borderRadius: "5px",
          }}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
          sx={{
            marginTop: "20px",
            padding: "10px",
            width: "100%",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </Button>
      </form>
      {message && (
        <Typography
          variant="body1"
          sx={{
            marginTop: "20px",
            color: message === "Login successful!" ? "green" : "red",
          }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );
}

export default Login;
