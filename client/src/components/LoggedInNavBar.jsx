import React from "react";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { Link } from "react-router-dom";

const LoggedInNavBar = ({ isAdmin, logoutHandler }) => {
  return (
    <AppBar position="fixed" style={{ backgroundColor: "#333" }}>
      <Toolbar>
        <Typography variant="h6" style={{ flexGrow: 1 }}>
          Travel System
        </Typography>
        <Button color="inherit" component={Link} to="/dashboard">
          Dashboard
        </Button>
        <Button color="inherit" component={Link} to="/search-destination">
          Search Destination
        </Button>
        <Button color="inherit" component={Link} to="/public-lists">
          Public Lists
        </Button>
        {isAdmin && (
          <Button color="inherit" component={Link} to="/Administrator">
            Admin Panel
          </Button>
        )}
        <Typography variant="body1" style={{ marginLeft: "20px", color: "#fff" }}>
          {isAdmin ? "Administrator" : "User"}
        </Typography>
        <Button color="inherit" onClick={logoutHandler}>
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default LoggedInNavBar;
