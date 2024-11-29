import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom"; // Ensure Link is imported
import { ThemeProvider } from "@mui/material/styles";
import { Typography, Button, Box } from "@mui/material"; // Ensure Box is imported
import Register from "./components/Register";
import Login from "./components/Login";
import EmailVerification from "./components/EmailVerification";
import SearchDestination from "./components/SearchDestination";
import theme from "./theme"; // Import the custom theme
import LoggedIn from "./components/LoggedIn";
import PublicLists from "./components/PublicLists";
import { AuthProvider } from "../src/components/AuthContext";
import Administrator from "./components/Administrator";
import AdministratorLogin from "./components/AdministratorLogin";
import HomeNavBar from "./components/HomeNavBar"; // Import the reusable navbar

// HomePage component with proper centering
function HomePage() {
  return (
    <div>
      <HomeNavBar />
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
            style={{ marginRight: "10px" }}
            component={Link}
            to="/public-lists"
          >
            Public Lists
          </Button>
          <Button
            variant="contained"
            color="primary"
            component={Link}
            to="/AdministratorLogin"
          >
            Admin Login
          </Button>
        </Box>
      </Box>
    </div>
  );
}

// Main App component
function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/verify-email" element={<EmailVerification />} />
            <Route path="/search-destination" element={<SearchDestination />} />
            <Route path="/loggedIn" element={<LoggedIn />} />
            <Route path="/public-lists" element={<PublicLists />} />
            <Route path="/Administrator" element={<Administrator />} />
            <Route path="/AdministratorLogin" element={<AdministratorLogin />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
