import React from "react";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { Link } from "react-router-dom";

const LoggedInNavBar = ({ isAdmin }) => {
  return (
    <AppBar position="fixed" color="primary">
      <Toolbar>
        <Typography variant="h6" style={{ flexGrow: 1 }}>
          Travel System
        </Typography>
        <Button color="inherit" component={Link} to="/">
          Home
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
            <Button color="inherit" component={Link} to="/AdministratorLogin">
              Admin Login
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default LoggedInNavBar;
