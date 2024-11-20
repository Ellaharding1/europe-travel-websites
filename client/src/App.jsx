import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./components/Register";
import Login from "./components/Login";
import EmailVerification from "./components/EmailVerification";

function App() {
  return (
    <Router>
      <div>
        <h1>Authentication System</h1>
        <Routes>
          {/* Route for the registration page */}
          <Route path="/register" element={<Register />} />
          {/* Route for the login page */}
          <Route path="/login" element={<Login />} />
          {/* Route for email verification */}
          <Route path="/verify-email" element={<EmailVerification />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
