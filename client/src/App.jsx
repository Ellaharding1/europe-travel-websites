import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material"; // Removed Container
import Register from "./components/Register";
import Login from "./components/Login";
import EmailVerification from "./components/EmailVerification";
import SearchDestination from "./components/SearchDestination";
import theme from "./theme"; // Import the custom theme
import logo from "../img/logo.png";
import LoggedIn from "./components/LoggedIn";
import PublicLists from "./components/PublicLists";

// HomePage component with proper centering
function HomePage() {
  return (
    <Box
  display="flex"
  flexDirection="column"
  justifyContent="flex-start" // Align items closer to the top
  alignItems="center"
  height="100vh"
  width="100%"
  textAlign="center"
  sx={{
    margin: "0 auto",
    backgroundImage: "url('../img/background.png')", 
    backgroundSize: "cover", // Ensures the image covers the entire area
    backgroundPosition: "center", // Centers the image
    backgroundRepeat: "no-repeat", // Prevents the image from repeating
    color: "#ffffff",
    paddingTop: "20vh", // Add padding to shift the content downward slightly
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
      component={Link}
      to="/public-lists"
    >
      Public Lists
    </Button>




  </Box>
</Box>

  );
}

// Main App component
function App() {
  return (
    
    <ThemeProvider theme={theme}>
      <Router>
        <div>
          {/* AppBar with logo and navigation links */}
          <AppBar position="fixed">
            <Toolbar>
              <img src={logo} alt="Travel System Logo" style={{ height: "40px", marginRight: "10px" }} />
              <Typography variant="h6" style={{ flexGrow: 1 }}>
                Travel System
              </Typography>
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

          {/* Spacer to avoid overlapping with the AppBar */}
          <Toolbar />

          {/* Routes for navigation */}
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/verify-email" element={<EmailVerification />} />
            <Route path="/search-destination" element={<SearchDestination />} />
            <Route path="/loggedIn" element={<LoggedIn />} /> {/* New route */}
            <Route path="/public-lists" element={<PublicLists />} />
          </Routes>



        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
