import React, { useState } from "react";
import axios from "axios";
import { Box, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from "@mui/material";

function Register() {
  const [formData, setFormData] = useState({ email: "", password: "", nickname: "" });
  const [message, setMessage] = useState("");
  const [open, setOpen] = useState(false); // For the modal
  const [verificationMessage, setVerificationMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form data submitted:", formData);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/register`,
        formData
      );
      console.log("Backend response:", response.data);

      // Set the response message (object) and open the modal
      setMessage(response.data);
      setOpen(true);
    } catch (error) {
      console.error("Registration error:", error.response?.data);
      setMessage({ error: error.response?.data?.error || "Registration failed." });
    }
  };

  const renderMessage = () => {
    if (!message) return null;

    if (typeof message === "object") {
      return (
        <p style={{ color: "#555", marginTop: "10px" }}>
          {message.error || message.message || JSON.stringify(message)}
        </p>
      );
    }

    return (
      <p style={{ color: "#555", marginTop: "10px" }}>
        {message}
      </p>
    );
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="flex-start" // Move content toward the top
      height="100vh"
      textAlign="center"
      sx={{
        margin: "0 auto",
        backgroundImage: "url('../img/background.png')", // Reuse the HomePage background
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        color: "#ffffff",
        paddingTop: "10vh", // Adjust padding to move content further up
      }}
    >
      <Typography variant="h4" gutterBottom>
        Register
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
        <TextField
          label="Nickname"
          name="nickname"
          value={formData.nickname}
          onChange={handleChange}
          required
          fullWidth
          margin="normal"
          sx={{
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            borderRadius: "5px",
          }}
        />
        <Button type="submit" variant="contained" color="primary" sx={{ marginTop: "20px" }}>
          Register
        </Button>
      </form>

      {/* Message below the form */}
      {renderMessage()}

      {/* Modal for Email Verification */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Email Verification</DialogTitle>
        <DialogContent>
          {/* Render the main message */}
          <p>
            {typeof message === "string"
              ? message
              : message?.message || "Something went wrong. Please try again."}
          </p>

          {/* Render the verification link if it exists */}
          {message?.verificationLink && (
            <p>
              <a
                href={message.verificationLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                Verify Email
              </a>
            </p>
          )}

          {/* Render the verification message if present */}
          {verificationMessage && (
            <p style={{ color: "blue", marginTop: "10px" }}>
              {verificationMessage}
            </p>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Register;
