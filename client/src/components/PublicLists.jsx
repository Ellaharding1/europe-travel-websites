import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, Typography, Paper, Button, Collapse, Divider } from "@mui/material";

const PublicLists = () => {
  const [publicLists, setPublicLists] = useState([]);
  const [expandedListId, setExpandedListId] = useState(null); // Track expanded list
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    // Fetch public destination lists
    const fetchPublicLists = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/public-lists`, {
          params: { limit: 10 },
        });
        setPublicLists(response.data.lists || []);
      } catch (err) {
        console.error("Error fetching public lists:", err.message);
      }
    };

    fetchPublicLists();
  }, []);

  // Toggle list expansion
  const toggleExpandList = (listId) => {
    setExpandedListId((prevId) => (prevId === listId ? null : listId));
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
                    <strong>Creator:</strong> {list.userName}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    <strong>Destinations:</strong> {list.destinationCount}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    <strong>Average Rating:</strong> {list.averageRating || "N/A"}
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => toggleExpandList(list._id)}
                  sx={{
                    height: "40px",
                  }}
                >
                  {expandedListId === list._id ? "Collapse" : "Expand"}
                </Button>
              </Box>

              {/* Divider */}
              <Divider sx={{ marginY: "10px" }} />

              {/* Expanded Section */}
              <Collapse in={expandedListId === list._id}>
                <Box
                  sx={{
                    padding: "10px",
                    backgroundColor: "rgba(240, 240, 240, 0.9)",
                    borderRadius: "8px",
                  }}
                >
                  <Typography variant="body1" gutterBottom>
                    <strong>Description:</strong> {list.description || "No description available."}
                  </Typography>
                  <Typography variant="h6" gutterBottom>
                    Destinations:
                  </Typography>
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
                          <Typography variant="body2">
                            <strong>Name:</strong> {destination.name}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Region:</strong> {destination.region}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Country:</strong> {destination.country}
                          </Typography>
                          <Button
                            size="small"
                            variant="outlined"
                            color="secondary"
                            sx={{ marginTop: "8px" }}
                            onClick={() => alert(JSON.stringify(destination, null, 2))}
                          >
                            More Details
                          </Button>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      No destinations available.
                    </Typography>
                  )}
                </Box>
              </Collapse>
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default PublicLists;
