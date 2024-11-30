import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, Typography, Card, CardContent, Button, Grid } from "@mui/material";
import AdminNavBar from "./AdminNavBar"; // Import the reusable navbar



const Administrator = () => {
  const [users, setUsers] = useState([]); // Store all users
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;


  useEffect(() => {
    const fetchData = async () => {
        try {
          const token = localStorage.getItem("token");
          if (!token) throw new Error("Token not found");
      
          const response = await axios.get(`${BACKEND_URL}/api/admin/users`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          
      
          setUsers(response.data);
        } catch (err) {
          console.error("Error fetching users:", err.message);
          if (err.response && err.response.status === 404) {
            console.error("API endpoint not found. Check backend route definition.");
          } else if (err.response && err.response.status === 403) {
            console.error("Access denied. Admin privileges required.");
          }
        }
      };
      
  
    fetchData();
  }, []);
  
  
  

  const toggleUserStatus = async (userId, status) => {
    try {
      console.log("Updating user status...");
      console.log("User ID:", userId, "Status:", status);

      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const response = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/user`,
        { userId, status },
        config
      );
      console.log("Response:", response.data);

      alert(response.data.message);
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId ? { ...user, status } : user
        )
      );
    } catch (err) {
      console.error("Error updating user status:", err);
    }
  };

  const grantAdmin = async (email) => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const response = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/grant`,
        { email },
        config
      );
      console.log("Grant Admin Response:", response.data);

      alert(`Admin privileges granted to ${email.split("@")[0]}`);
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.email === email ? { ...user, isAdmin: true } : user
        )
      );
    } catch (err) {
      console.error("Error granting admin privileges:", err);
    }
  };

  const revokeAdmin = async (email) => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const response = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/revoke`,
        { email },
        config
      );
      console.log("Revoke Admin Response:", response.data);

      alert(`Admin privileges revoked for ${email.split("@")[0]}`);
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.email === email ? { ...user, isAdmin: false } : user
        )
      );
    } catch (err) {
      console.error("Error revoking admin privileges:", err);
    }
  };

  return (
    <Box
      sx={{
        padding: "50px",
        minHeight: "100vh",
        fontFamily: "Arial, sans-serif",
        backgroundImage: "url('../img/background.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        color: "#ffffff",
      }}
    >
        <AdminNavBar />
      <Typography
        variant="h3"
        sx={{
          fontWeight: "bold",
          textAlign: "center",
          marginBottom: "20px",
          textShadow: "2px 2px 4px rgba(0, 0, 0, 0.7)",
        }}
      >
        Administrator Dashboard
      </Typography>

      <Typography variant="h4" sx={{ marginBottom: "15px", fontWeight: "bold" }}>
        All Users
      </Typography>

      <Grid container spacing={2}>
        {Array.isArray(users) && users.length > 0 ? (
          users.map((user) => (
            <Grid item xs={12} sm={6} md={4} key={user._id}>
              <Card
                sx={{
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  boxShadow: 3,
                  borderRadius: "10px",
                }}
              >
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: "bold", color: "#333333" }}
                  >
                    {user.email}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Nickname: {user.nickname || "N/A"}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Status: {user.status}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Role: {user.isAdmin ? "Administrator" : "User"}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: "10px",
                    }}
                  >
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => grantAdmin(user.email)}
                      disabled={user.isAdmin}
                    >
                      Grant Admin
                    </Button>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => revokeAdmin(user.email)}
                      disabled={!user.isAdmin}
                    >
                      Revoke Admin
                    </Button>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: "10px",
                    }}
                  >
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => toggleUserStatus(user._id, "deactivated")}
                      disabled={user.status === "deactivated"}
                    >
                      Deactivate
                    </Button>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => toggleUserStatus(user._id, "active")}
                      disabled={user.status === "active"}
                    >
                      Activate
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Typography
            variant="body1"
            color="textSecondary"
            sx={{ marginLeft: "15px" }}
          >
            No users available.
          </Typography>
        )}
      </Grid>
    </Box>
  );
};

export default Administrator;
