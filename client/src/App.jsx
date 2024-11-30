import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; // Removed unnecessary Link import
import { ThemeProvider } from "@mui/material/styles";
import { AuthProvider, AuthContext } from "./components/AuthContext"; // Ensure paths are correct
import theme from "./theme"; // Import the custom theme

import HomePage from "./components/HomePage"; // Ensure HomePage is imported
import Register from "./components/Register";
import Login from "./components/Login";
import EmailVerification from "./components/EmailVerification";
import SearchDestination from "./components/SearchDestination";
import LoggedIn from "./components/LoggedIn";
import PublicLists from "./components/PublicLists";
import Administrator from "./components/Administrator";
import AdministratorLogin from "./components/AdministratorLogin";
import HomeNavBar from "./components/HomeNavBar";
import LoggedInNavBar from "./components/LoggedInNavBar";
import EditReview from "./components/EditReview"; 

import Logout from "./components/Logout";

// Main App component
function App() {
  const { isLoggedIn, isAdmin, logout } = useContext(AuthContext);

  return (
    <ThemeProvider theme={theme}>
      <Router>      
        <div style={{ marginTop: "64px" }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<EmailVerification />} />
            <Route path="/search-destination" element={<SearchDestination />} />
            <Route path="/loggedIn" element={<LoggedIn />} />
            <Route path="/public-lists" element={<PublicLists />} />
            <Route path="/administrator" element={<Administrator />} />
            <Route path="/AdministratorLogin" element={<AdministratorLogin />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/edit-review" element={<EditReview />} /> {/* New Route */}

          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}


// Wrap App with AuthProvider
function WrappedApp() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}

export default WrappedApp;
