import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, Typography, Card, CardContent, Button, Grid } from "@mui/material";
import AdminNavBar from "./AdminNavBar"; // Import the Admin navbar
import { useAuth } from "./AuthContext"; // Import AuthContext for admin validation

const EditReview = () => {
  const [reviews, setReviews] = useState([]); // Store all reviews
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const { isAdmin } = useAuth(); // Use AuthContext to check admin access

  // Fetch all reviews on component load
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Token not found");

        const response = await axios.get(`${BACKEND_URL}/api/admin/reviews`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Extract reviews and add associated list names
        const reviewsWithListContext = response.data.map((review) => ({
          ...review,
          listName: review.listName || "Unknown List", // Add context for reviews
        }));

        setReviews(reviewsWithListContext); // Load reviews into state
      } catch (err) {
        console.error("Error fetching reviews:", err.message);
      }
    };

    if (isAdmin) fetchReviews(); // Fetch only if the user is an admin
  }, [isAdmin]);

  // Mark review as hidden
  const hideReview = async (reviewId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${BACKEND_URL}/api/admin/reviews/visibility`,
        { reviewId, visibility: "hidden" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Review marked as hidden!");
      // Update local state
      setReviews((prevReviews) =>
        prevReviews.map((review) =>
          review._id === reviewId ? { ...review, visibility: "hidden" } : review
        )
      );
    } catch (err) {
      console.error("Error hiding review:", err.message);
    }
  };

  // Restore review visibility
  const showReview = async (reviewId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${BACKEND_URL}/api/admin/reviews/visibility`,
        { reviewId, visibility: "visible" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Review visibility restored!");
      // Update local state
      setReviews((prevReviews) =>
        prevReviews.map((review) =>
          review._id === reviewId ? { ...review, visibility: "visible" } : review
        )
      );
    } catch (err) {
      console.error("Error restoring review visibility:", err.message);
    }
  };

  return (
    <Box
      sx={{
        padding: "50px",
        minHeight: "100vh",
        fontFamily: "Arial, sans-serif",
        backgroundImage: "url('../img/background.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        color: "#ffffff",
      }}
    >
      <AdminNavBar />
      <Typography
        variant="h3"
        sx={{
          fontWeight: "bold",
          textAlign: "center",
          marginBottom: "20px",
          textShadow: "2px 2px 4px rgba(0, 0, 0, 0.7)",
        }}
      >
        Manage Reviews
      </Typography>

      <Grid container spacing={2}>
        {Array.isArray(reviews) && reviews.length > 0 ? (
          reviews.map((review) => (
            <Grid item xs={12} sm={6} md={4} key={review._id}>
              <Card
                sx={{
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  boxShadow: 3,
                  borderRadius: "10px",
                }}
              >
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: "bold", color: "#333333" }}
                  >
                    {review.listName}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Comment: {review.comment || "No comment available."}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Visibility: {review.visibility || "visible"}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: "10px",
                    }}
                  >
                    {review.visibility !== "hidden" ? (
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => hideReview(review._id)}
                      >
                        Hide
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        color="success"
                        onClick={() => showReview(review._id)}
                      >
                        Show
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Typography variant="body1" color="textSecondary">
            No reviews available.
          </Typography>
        )}
      </Grid>
    </Box>
  );
};

export default EditReview;
