import React, { useState } from "react";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { Link } from "react-router-dom";
import PrivacyPolicyModal from "./PrivacyPolicyModal"; // Ensure this file exists

const AdminNavBar = () => {
  const [privacyOpen, setPrivacyOpen] = useState(false); // State to control the modal

  return (
    <>
      <AppBar position="fixed" color="secondary">
        <Toolbar>
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            Admin Dashboard
          </Typography>
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            Welcome to Travel System
          </Typography>
          {/* Button to open the Privacy Policy modal */}
          <Button color="inherit" onClick={() => setPrivacyOpen(true)}>
            Privacy Policy
          </Button>
          <Button color="inherit" component={Link} to="/LoggedIn">
            Back to Travel Account
          </Button>
          <Button color="inherit" component={Link} to="/Administrator">
            Manage Users
          </Button>
          <Button color="inherit" component={Link} to="/edit-review">
            Manage Reviews
          </Button>
          <Button color="inherit" component={Link} to="/logout">
            Logout
          </Button>
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

export default AdminNavBar;
