import React, { useEffect, useState } from "react";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { Link } from "react-router-dom";
import axios from "axios";
import PrivacyPolicyModal from "./PrivacyPolicyModal";

const LoggedInNavBar = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false); // State for Privacy Policy Modal

  useEffect(() => {
    const fetchAdminStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/user-profile`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Check if the user is active and has admin privileges
        setIsAdmin(response.data.status === "active" && response.data.isAdmin);
      } catch (err) {
        console.error("Error fetching user profile:", err.message);
      }
    };

    fetchAdminStatus();
  }, []);

  return (
    <>
      <AppBar position="fixed" color="primary">
        <Toolbar>
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            Welcome to your Travel Account!
          </Typography>
          <Button color="inherit" onClick={() => setPrivacyOpen(true)}>
            Privacy Policy
          </Button>
          <Button color="inherit" component={Link} to="/LoggedIn">
            Lists
          </Button>
          <Button color="inherit" component={Link} to="/search-destination">
            Search Destinations
          </Button>
          <Button color="inherit" component={Link} to="/public-lists">
            Public Lists
          </Button>
          <Button color="inherit" component={Link} to="/logout">
            Logout
          </Button>
          {isAdmin && (
            <>
              <Typography
                variant="body1"
                style={{
                  marginLeft: "20px",
                  marginRight: "10px",
                  fontStyle: "italic",
                  color: "#FFD700", // Highlight admin message
                }}
              >
                You have admin privileges
              </Typography>
              <Button color="inherit" component={Link} to="/Administrator">
                Admin Dashboard
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      {/* Privacy Policy Modal */}
      <PrivacyPolicyModal
        open={privacyOpen}
        handleClose={() => setPrivacyOpen(false)}
      />
    </>
  );
};

export default LoggedInNavBar;
