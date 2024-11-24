import React, { useState, useEffect } from "react";
import axios from "axios";
import SearchDestination from "./SearchDestination"; // Ensure this is imported

const LoggedIn = () => {
  const [lists, setLists] = useState([]);
  const [currentListName, setCurrentListName] = useState("");
  const [listName, setListName] = useState("");
  const [message, setMessage] = useState("");
  const [userEmail, setUserEmail] = useState("");

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const isLoggedIn = !!localStorage.getItem("token");

  useEffect(() => {
    const email = localStorage.getItem("email"); // Retrieve email from localStorage
    if (email) {
      setUserEmail(email); // Set state with the email
    }
  }, []);

  // Fetch user lists
  const fetchLists = async () => {
    try {
      const email = localStorage.getItem("email"); // Get email from localStorage
      if (!email) {
        setMessage("Email not found. Please log in again.");
        return;
      }
  
      const response = await axios.get(`${BACKEND_URL}/api/getLists`, {
        params: { email }, // Pass email as a query parameter
      });
  
      setLists(response.data.lists || []);
    } catch (err) {
      console.error("Error fetching lists:", err.response?.data || err.message);
      setMessage("Error fetching lists. Please try again.");
    }
  };
  
  
  
  

  // Create a new list
  const handleCreateList = async () => {
    if (!listName.trim()) {
      setMessage("List name cannot be empty.");
      return;
    }

    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/createLists`,
        {
          listName,
          destinationIDs: [],
          userName: userEmail, // Use the logged-in user's email
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Include token for authentication
          },
        }
      );

      setMessage("List created successfully.");
      setListName(""); // Clear the input field
      fetchLists(); // Refresh the lists
    } catch (err) {
      console.error("Error creating list:", err.message);
      setMessage("Error creating list. Please try again.");
    }
  };

  // Add destination to a list
  const addToList = async (destination) => {
    if (!currentListName) {
      setMessage("Please select or create a list first.");
      return;
    }

    try {
      const response = await axios.post(
        `${BACKEND_URL}/add-to-list`,
        { listName: currentListName, destination },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setMessage(response.data.message || "Added to list successfully.");
      fetchLists();
    } catch (err) {
      console.error("Error adding to list:", err.message);
      setMessage("Error adding to list. Please try again.");
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchLists();
    }
  }, [isLoggedIn]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        height: "100vh",
        width: "100%",
        overflow: "hidden",
      }}
    >
      {/* Left Section */}
      <div
        style={{
          width: "75%",
          borderRight: "1px solid #ccc",
          overflowY: "auto",
          padding: "20px",
        }}
      >
        <h2>Welcome{userEmail ? `, ${userEmail}` : "!"}</h2>
  
        <SearchDestination
          addToList={addToList}
          isLoggedIn={isLoggedIn}
          customRenderDestination={(destination) => (
            <div
              key={destination.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "5px",
                marginBottom: "10px",
                backgroundColor: "#fff",
              }}
            >
              <span>
                {destination?.name || "Unknown"} - {destination?.country || "Unknown"}
              </span>
              {isLoggedIn ? (
                <button
                  style={{
                    padding: "5px 10px",
                    backgroundColor: "blue",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                  onClick={() => handleAddToList(destination)}
                >
                  Add to List
                </button>
              ) : (
                <p style={{ color: "red" }}>Please log in to add destinations to a list.</p>
              )}
            </div>
          )}
        />
      </div>
  
      {/* Right Section */}
      <div
        style={{
          width: "25%",
          padding: "20px",
          overflowY: "auto",
          backgroundColor: "#f7f7f7",
        }}
      >
        <h2>Your Travel Lists</h2>
        <div>
  <h3>Your Lists</h3>
  <ul>
    {lists.length > 0 ? (
      lists.map((list, index) => (
        <li key={index}>{list.name || list}</li> // Adjust as per list structure
      ))
    ) : (
      <p>No lists found.</p>
    )}
  </ul>
</div>

        <div style={{ marginTop: "20px" }}>
          <h3>Create a List</h3>
          <input
            type="text"
            placeholder="Enter list name"
            value={listName}
            onChange={(e) => setListName(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "10px",
              borderRadius: "5px",
              border: "1px solid #ddd",
            }}
          />
          <button
            onClick={handleCreateList}
            style={{
              padding: "10px 20px",
              backgroundColor: "green",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Save List
          </button>
          {message && (
            <p
              style={{
                marginTop: "10px",
                color: message.includes("successfully") ? "green" : "red",
              }}
            >
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
  

export default LoggedIn;
