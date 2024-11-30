import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../components/AuthContext";
import HomeNavBar from "./HomeNavBar"; // Import the reusable navbar


import { Box, Typography, Button, Collapse, Card, CardContent, List, ListItem, ListItemText,Paper, Divider, TextField } from "@mui/material";

const PublicLists = () => {
  const [publicLists, setPublicLists] = useState([]);
  const [expandedListId, setExpandedListId] = useState(null); // Track expanded list
  const [expandedDestinationId, setExpandedDestinationId] = useState(null); // Track which destination is expanded
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Removed unused lists state
  const [reviewState, setReviewState] = useState({}); // Track review form states for each list
  const getField = (field, fallback = "N/A") => field || fallback;
  const [expandedReviewListId, setExpandedReviewListId] = useState(null); // Tracks which list's review form is expanded
  const { token } = useAuth();
  const [lists, setLists] = useState([]);



  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchPublicLists = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/public-lists`, {
          params: { limit: 10 },
        });
        setPublicLists(response.data.lists || []);
      } catch (err) {
        console.error("Error fetching public lists:", err.message);
        alert("Failed to load public lists. Please try again later."); // User-friendly error
      }
    };

    fetchPublicLists();
  }, []);

  useEffect(() => {
    // Check if the user is logged in
    const token = localStorage.getItem("token"); // Corrected to check for token
    setIsLoggedIn(!!token); // Set to true if token exists
  }, []);

  // Toggle list expansion
  const toggleExpandList = (listId) => {
    setExpandedListId((prevId) => (prevId === listId ? null : listId));
  };
 
  const toggleDestinationExpansion = (destinationId) => {
    setExpandedDestinationId((prevId) =>
      prevId === destinationId ? null : destinationId
    );
  };

  const toggleReviewForm = (listId) => {
    setExpandedReviewListId((prevId) => (prevId === listId ? null : listId));
  };

  const handleReviewSubmit = async (e, listId) => {
    e.preventDefault();
  
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must log in to write a review.");
      return;
    }
  
    const { rating, comment } = reviewState[listId] || {};
  
    if (!rating || rating < 1 || rating > 5) {
      alert("Rating must be between 1 and 5.");
      return;
    }
  
    // Show confirmation dialog
    const isConfirmed = window.confirm(
      `Are you sure you want to submit this review? \n\nRating: ${rating}\nComment: ${comment || "No comment"}`
    );
  
    if (!isConfirmed) return;
  
    try {
      console.log("Submitting review:", { listId, rating, comment });
  
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/add-review`,
        { listId, rating, comment },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      alert(response.data.message);
  
      // Update the list with the new review
      setPublicLists((prevLists) =>
        prevLists.map((list) =>
          list._id === listId ? { ...list, ...response.data.updatedList } : list
        )
      );
  
      // Clear the review state for the list
      setReviewState((prevState) => ({
        ...prevState,
        [listId]: { rating: "", comment: "" },
      }));
    } catch (err) {
      console.error("Error adding review:", err);
  
      const errorMessage = err.response?.data?.error || "An unknown error occurred.";
      alert(`Failed to add review: ${errorMessage}`);
    }
  };
  
  
  
  const handleInputChange = (listId, field, value) => {
    setReviewState((prevState) => ({
      ...prevState,
      [listId]: { ...prevState[listId], [field]: value },
    }));
  };

  return (
    <Box
      sx={{
        padding: "75px",
        fontFamily: "Arial, sans-serif",
        backgroundImage: "url('/img/background.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        minHeight: "100vh",
      }}
    >
              <HomeNavBar />

      <Typography
        variant="h4"
        align="center"
        sx={{
          color: "#ffffff",
          marginBottom: "20px",
        }}
      >
        Public Destination Lists
      </Typography>
      {publicLists.length === 0 ? (
        <Typography
          variant="body1"
          align="center"
          sx={{ color: "#ffffff" }}
        >
          No public lists available.
        </Typography>
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "20px",
          }}
        >
          {publicLists.map((list) => (
            <Paper
              key={list._id}
              elevation={3}
              sx={{
                width: "90%",
                maxWidth: "700px",
                padding: "20px",
                borderRadius: "12px",
                backgroundColor: "rgba(255, 255, 255, 0.8)",
              }}
            >
              {/* Main List Info */}
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      color: "#333333",
                      fontWeight: "bold",
                      marginBottom: "8px",
                    }}
                  >
                    {list.listName}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    <strong>Creator:</strong> {list.nickname}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    <strong>Destinations:</strong> {list.destinationCount}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    <strong>Average Rating:</strong>{" "}
                    {typeof list.averageRating === "number"
                      ? list.averageRating.toFixed(2)
                      : "No reviews yet"}
                  </Typography>

                  {/* Display Reviews */}
                  {list.reviews && list.reviews.length > 0 ? (
  <>
    <Typography variant="body2" sx={{ marginTop: "10px" }}>
      <strong>Reviews:</strong>
    </Typography>
    {list.reviews.map((review, index) => (
      <Box
        key={index}
        sx={{
          marginBottom: "10px",
          padding: "10px",
          backgroundColor: "rgba(240, 240, 240, 0.9)",
          borderRadius: "8px",
        }}
      >
        <Typography variant="body2">
          <strong>{review.username}:</strong> {review.comment}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Rating: {review.rating} / 5
        </Typography>
      </Box>
    ))}
  </>
) : (
  <Typography variant="body2" sx={{ marginTop: "10px", color: "gray" }}>
    No reviews yet.
  </Typography>
)}

                  </Box>
                  <Button
                  variant="contained"
                  color="primary"
                  onClick={() => toggleReviewForm(list._id)}
                  sx={{
                    height: "30px",
                    fontSize: "9px", // Adjust this value to change the text size
                    padding: "5px 10px", // Optional: Adjust padding if needed
                  }}
                >
                  {expandedReviewListId === list._id ? "Close Review Form" : "Write a Review"}
                </Button>
              </Box>

              {/* Divider */}
              <Divider sx={{ marginY: "10px" }} />

              {/* Expanded Review Form */}
              <Collapse in={expandedReviewListId === list._id}>
                <Box
                  sx={{
                    marginTop: "20px",
                    padding: "10px",
                    backgroundColor: "rgba(240, 240, 240, 0.9)",
                    borderRadius: "8px",
                  }}
                >
                  {isLoggedIn ? (
                    <Box component="form" onSubmit={(e) => handleReviewSubmit(e, list._id)}>
                      <Typography variant="h6" gutterBottom>
                        Add a Review
                      </Typography>
                      <TextField
                        label="Rating (1-5)"
                        type="number"
                        value={reviewState[list._id]?.rating || ""}
                        onChange={(e) =>
                          handleInputChange(list._id, "rating", e.target.value)
                        }
                        fullWidth
                        required
                        sx={{ marginBottom: "10px" }}
                      />
                      <TextField
                        label="Comment (optional)"
                        value={reviewState[list._id]?.comment || ""}
                        onChange={(e) =>
                          handleInputChange(list._id, "comment", e.target.value)
                        }
                        fullWidth
                        multiline
                        rows={3}
                        sx={{ marginBottom: "10px" }}
                      />
                      <Button variant="contained" color="primary" type="submit">
                        Submit Review
                      </Button>
                    </Box>
                  ) : (
                    <Typography variant="body1" color="textSecondary" align="center">
                      Please <a href="/login">log in</a> or <a href="/register">sign up</a> to leave a review.
                    </Typography>
                  )}
                </Box>
              </Collapse>
            

              <Typography variant="h6" gutterBottom>
                  Destinations:
                </Typography>

                {/* First Button: Expand All Destinations */}
                <Box sx={{ marginBottom: "10px" }}>
                  <Button
                    size="small"
                    variant="contained"
                    color="primary"
                    onClick={() => toggleExpandList(list._id)}
                  >
                    {expandedListId === list._id ? "Hide Destinations" : "Show Destinations"}
                  </Button>
                </Box>

                {/* Collapsible Section for All Destinations */}
                <Collapse in={expandedListId === list._id}>
                  {list.destinations && list.destinations.length > 0 ? (
                    <Box component="ul" sx={{ paddingLeft: "20px", margin: 0 }}>
                      {list.destinations.map((destination, index) => (
                        <Box
                          component="li"
                          key={index}
                          sx={{
                            marginBottom: "10px",
                            padding: "10px",
                            border: "1px solid #ddd",
                            borderRadius: "6px",
                            backgroundColor: "#ffffff",
                          }}
                        >
                          {/* Basic Destination Info */}
                          <Typography variant="body2">
                            <strong>Name:</strong> {destination.name}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Region:</strong> {destination.region}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Country:</strong> {destination.country}
                          </Typography>

                          {/* Second Button: Show More Details */}
                          <Box sx={{ marginTop: "8px" }}>
                            <Button
                              size="small"
                              variant="outlined"
                              color="secondary"
                              onClick={() => toggleDestinationExpansion(destination.id || index)}
                            >
                              {expandedDestinationId === (destination.id || index)
                                ? "Less Details"
                                : "More Details"}
                            </Button>
                          </Box>

                          {/* Collapsible Section for Detailed Destination Info */}
                          <Collapse in={expandedDestinationId === (destination.id || index)}>
                            <Box
                              sx={{
                                marginTop: "10px",
                                padding: "10px",
                                backgroundColor: "#f0f0f0",
                                borderRadius: "6px",
                              }}
                            >
                              <Typography variant="body2">
                                <strong>Category:</strong> {getField(destination.category)}
                              </Typography>
                              <Typography variant="body2">
                                <strong>Approximate Annual Tourists:</strong>{" "}
                                {getField(destination.approximateAnnualTourists)}
                              </Typography>
                              <Typography variant="body2">
                                <strong>Currency:</strong> {getField(destination.currency)}
                              </Typography>
                              <Typography variant="body2">
                                <strong>Majority Religion:</strong>{" "}
                                {getField(destination.majorityReligion)}
                              </Typography>
                              <Typography variant="body2">
                                <strong>Famous Foods:</strong> {getField(destination.famousFoods)}
                              </Typography>
                              <Typography variant="body2">
                                <strong>Language:</strong> {getField(destination.language)}
                              </Typography>
                              <Typography variant="body2">
                                <strong>Best Time to Visit:</strong>{" "}
                                {getField(destination.bestTimetoVisit)}
                              </Typography>
                              <Typography variant="body2">
                                <strong>Cost of Living:</strong> {getField(destination.costofLiving)}
                              </Typography>
                              <Typography variant="body2">
                                <strong>Safety:</strong> {getField(destination.safety)}
                              </Typography>
                              <Typography variant="body2">
                                <strong>Cultural Significance:</strong>{" "}
                                {getField(destination.culturalSignificance)}
                              </Typography>
                              <Typography variant="body2">
                                <strong>Description:</strong> {getField(destination.description)}
                              </Typography>
                            </Box>
                          </Collapse>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      No destinations available.
                    </Typography>
                  )}
                </Collapse>
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default PublicLists;
