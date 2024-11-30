import React from "react";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { Link } from "react-router-dom";

const AdminNavBar = () => {
  return (
    <AppBar position="fixed" color="secondary">
      <Toolbar>
        <Typography variant="h6" style={{ flexGrow: 1 }}>
          Admin Dashboard
        </Typography>
        <Button color="inherit" component={Link} to="/">
          Home
        </Button>
        <Button color="inherit" component={Link} to="/Administrator">
          Manage Users
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
      </Toolbar>
    </AppBar>
  );
};

export default AdminNavBar;
