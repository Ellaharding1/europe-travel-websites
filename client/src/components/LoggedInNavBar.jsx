import React from "react";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { Link } from "react-router-dom";

const LoggedInNavBar = ({ isAdmin, logoutHandler }) => {
  return (
    <AppBar position="static" sx={{ backgroundColor: "#333" }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Travel System
        </Typography>
        <Button color="inherit" component={Link} to="/">
          Home
        </Button>
        <Button color="inherit" component={Link} to="/administrator">
          Dashboard
        </Button>
        
        {isAdmin && (
          <Typography
            variant="body1"
            sx={{
              marginLeft: "20px",
              fontWeight: "bold",
              color: "yellow",
              textTransform: "uppercase",
            }}
          >
            Admin Privilege
          </Typography>
        )}
        <Button
          color="inherit"
          onClick={logoutHandler}
          sx={{ marginLeft: "auto" }}
        >
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default LoggedInNavBar;


