import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Box, Button, TextField, Typography, Toolbar } from "@mui/material";
import HomeNavBar from "./HomeNavBar";
import { useAuth } from "./AuthContext";

function Login() {
  const [formData, setFormData] = useState({ usernameOrEmail: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { logIn } = useAuth();

  const [showVerifyButton, setShowVerifyButton] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.usernameOrEmail || !formData.password) {
      setMessage("Username/Email and password are required.");
      return;
    }
  
    setLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/login`, formData);
      const { token, isAdmin } = response.data;
  
      setMessage("Login successful!");
      localStorage.setItem("token", token);
  
      logIn(token);
  
      // Redirect to admin dashboard if admin, else to logged-in dashboard
      if (isAdmin) {
        navigate("/administrator");
      } else {
        navigate("/loggedIn");
      }
    } catch (error) {
      console.error("Login error:", error);
      const status = error.response?.status;
      if (status === 401) {
        setMessage("Invalid credentials. Please try again.");
      } else if (status === 403) {
        setMessage("Your email is not verified. ");
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
      justifyContent="flex-start"
      height="100vh"
      textAlign="center"
      sx={{
        backgroundImage: "url('../img/background.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        color: "#ffffff",
        paddingTop: "15vh",
      }}
    >
      <HomeNavBar />
      <Toolbar />
      <Typography variant="h4" gutterBottom>
        Login
      </Typography>
      <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: "400px" }}>
        <TextField
          label="Username or Email"
          name="usernameOrEmail"
          type="text"
          value={formData.usernameOrEmail}
          onChange={handleChange}
          required
          fullWidth
          margin="normal"
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
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
          fullWidth
          sx={{ marginTop: "20px" }}
        >
          {loading ? "Logging in..." : "Login"}
        </Button>
      </form>
      {message && <Typography sx={{ marginTop: "20px", color: "red" }}>{message}</Typography>}

      {showVerifyButton && (
        <Button
          variant="contained"
          color="secondary"
          sx={{ marginTop: "20px" }}
          onClick={handleVerifyClick}
        >
          Click to Verify Your Email
        </Button>
      )}
    </Box>
  );
}

export default Login;
