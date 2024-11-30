import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/login`,
        formData
      );
      const { token } = response.data;

      // Save the token to localStorage
      localStorage.setItem("token", token);

      // Decode token (use jwt-decode if needed to extract role)
      const decoded = JSON.parse(atob(token.split(".")[1]));

      // Redirect based on role
      if (decoded.role === "admin") {
        navigate("/administrator");
      } else {
        setError("You do not have admin privileges.");
      }
    } catch (err) {
      console.error(err);
      setError("Invalid credentials or server error.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="username"
        placeholder="Username"
        value={formData.username}
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
      {error && <p>{error}</p>}
    </form>
  );
};

export default AdminLogin;
