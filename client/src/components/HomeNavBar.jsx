import React, { useState } from "react";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { Link } from "react-router-dom";
import PrivacyPolicyModal from "./PrivacyPolicyModal";

const HomeNavBar = () => {
  const [privacyOpen, setPrivacyOpen] = useState(false);

  return (
    <>
      <AppBar position="fixed" color="primary">
        <Toolbar>
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            Travel System
          </Typography>
          <Button color="inherit" onClick={() => setPrivacyOpen(true)}>
            Privacy Policy
          </Button>
          <Button color="inherit" component={Link} to="/">
            Home
          </Button>
          <Button color="inherit" component={Link} to="/register">
            Register
          </Button>
          <Button color="inherit" component={Link} to="/login">
            Login
          </Button>
          <Button color="inherit" component={Link} to="/search-destination">
            Search Destination
          </Button>
          <Button color="inherit" component={Link} to="/public-lists">
            Public Lists
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

export default HomeNavBar;
