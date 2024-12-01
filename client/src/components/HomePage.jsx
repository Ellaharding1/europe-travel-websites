import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import HomeNavBar from './HomeNavBar';
function HomePage() {
    return (
      <div>
        <HomeNavBar />
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="flex-start"
          alignItems="center"
          height="100vh"
          width="100%"
          textAlign="center"
          sx={{
            margin: "0 auto",
            backgroundImage: "url('../img/background.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            color: "#ffffff",
            paddingTop: "20vh",
          }}
        >
          <Typography variant="h2" gutterBottom>
            Welcome to the Travel System
          </Typography>
          <Typography variant="body1" paragraph>
            Your gateway to managing travel and account details. Click below to get started:
          </Typography>
          <Box mt={2}>
            <Button
              variant="contained"
              color="primary"
              style={{ marginRight: "10px" }}
              component={Link}
              to="/register"
            >
              Register
            </Button>
            <Button
              variant="contained"
              color="primary"
              style={{ marginRight: "10px" }}
              component={Link}
              to="/login"
            >
              Login
            </Button>
            <Button
              variant="contained"
              color="primary"
              style={{ marginRight: "10px" }}
              component={Link}
              to="/search-destination"
            >
              Search Destinations
            </Button>
            <Button
              variant="contained"
              color="primary"
              style={{ marginRight: "10px" }}
              component={Link}
              to="/public-lists"
            >
              Public Lists
            </Button>
            
          </Box>
        </Box>
      </div>
    );
  }export default HomePage;
