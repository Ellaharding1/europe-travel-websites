import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import SearchDestination from "./SearchDestination";

const LoggedIn = () => {
  const [lists, setLists] = useState([]);
  const [currentListName, setCurrentListName] = useState("");
  const [listName, setListName] = useState("");
  const [message, setMessage] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [selectedList, setSelectedList] = useState(null); // Track selected list

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);
  

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token); // Dynamically update the state
  }, []);

  // Fetch lists for the logged-in user
  const fetchLists = useCallback(async () => {
    try {
      const email = localStorage.getItem("email");
      if (!email) {
        console.error("Email not found in localStorage");
        return;
      }
  
      const response = await axios.get(`${BACKEND_URL}/api/getLists`, {
        params: { email },
      });
  
      console.log("Fetched lists:", response.data.lists); // Debug fetched lists
      setLists(response.data.lists || []); // Update state with new lists
    } catch (err) {
      console.error("Error fetching lists:", err.message);
    }
  }, []);
  

  
  useEffect(() => {
    fetchLists();
  }, [fetchLists]);
  

  const handleAddToList = async (destinationId) => {
    if (!selectedList) {
      setMessage("Please select a list first.");
      return;
    }
  
    try {
      const response = await axios.post(`${BACKEND_URL}/api/add-to-list`, {
        listName: selectedList,
        destinationId,
      });
  
      console.log("Add to list response:", response.data);
  
      // Fetch updated lists from the server
      fetchLists();
  
      setMessage(response.data.message || "Destination added successfully!");
    } catch (err) {
      console.error("Error adding to list:", err.message);
      setMessage(err.response?.data?.error || "Failed to add destination.");
    }
  };
  

  const handleCreateList = async () => {
    if (!listName.trim()) {
      setMessage("List name cannot be empty.");
      return;
    }

    try {
      await axios.post(`${BACKEND_URL}/api/createList`, {
        email: userEmail,
        listName,
      });

      setMessage("List created successfully!");
      setListName("");
      fetchLists();
    } catch (err) {
      console.error("Error creating list:", err.message);
      setMessage("Error creating list. Please try again.");
    }
  };

  // **Delete a List**
  const handleDeleteList = async (listName) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/deleteList`, {
        listName,
        email: userEmail,
      });

      setMessage(response.data.message || "List deleted successfully.");
      fetchLists();
    } catch (err) {
      console.error("Error deleting list:", err.message);
      setMessage("Error deleting list. Please try again.");
    }
  };

  const addToList = async (destination) => {
    if (!selectedList) {
      setMessage("Please select a list first.");
      return;
    }
  
    try {
      const response = await axios.post(`${BACKEND_URL}/api/add-to-list`, {
        listName: selectedList,
        destinationId: destination.id, // Use destination object directly
      });
  
      setMessage(response.data.message || "Destination added successfully.");
      fetchLists(); // Refresh the lists to reflect changes
    } catch (err) {
      console.error("Error adding to list:", err.message);
      setMessage(err.response?.data?.error || "Failed to add destination.");
    }
  };
  
  

  const handleSelectList = async (listName) => {
    try {
      const email = localStorage.getItem("email");
      await axios.patch(`${BACKEND_URL}/api/select-list`, { listName, email });

      setSelectedList(listName);
      fetchLists(); // Refresh lists
    } catch (err) {
      console.error("Error selecting list:", err.message);
    }
  };
  const handleDeselectList = async () => {
    try {
      const email = localStorage.getItem("email");
  
      if (!email) {
        setMessage("User email not found.");
        return;
      }
  
      const response = await axios.patch(`${BACKEND_URL}/api/deselect-list`, { email });
  
      setSelectedList(null); // Clear the local state
      setMessage(response.data.message || "List deselected successfully.");
      fetchLists(); // Refresh lists
    } catch (err) {
      console.error("Error deselecting list:", err.response?.data?.error || err.message);
      setMessage(err.response?.data?.error || "Failed to deselect the list.");
    }
  };
  
  
  
  
  

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
        <h2>Welcome to your Dashboard!</h2>
  
        {/* Search Destination Component */}
        <SearchDestination
        selectedList={selectedList}
        setSelectedList={setSelectedList}
        fetchLists={fetchLists} // Pass the fetchLists function as a prop
        handleAddToList={handleAddToList} // Pass handleAddToList
        handleCreateList={handleCreateList} // Pass handleCreateList
          addToList={(destination) => {
            if (!currentListName) {
              setMessage("Please select a list to add destinations.");
              return;
            }
            addToList(destination);
          }}
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
                    backgroundColor: currentListName ? "blue" : "gray",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: currentListName ? "pointer" : "not-allowed",
                  }}
                  onClick={() => {
                    if (currentListName) {
                      addToList(destination);
                    }
                  }}
                  disabled={!currentListName}
                >
                  Add to {currentListName || "List"}
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
    <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
      {lists.length > 0 ? (
        lists.map((list, index) => (
          <div
            key={index}
            style={{
              padding: "15px",
              border: `2px solid ${list.selected ? "green" : "#ddd"}`,
              borderRadius: "10px",
              backgroundColor: list.selected ? "#e6ffe6" : "#fff",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              transition: "background-color 0.3s ease, border-color 0.3s ease",
            }}
          >
            <h4 style={{ marginBottom: "10px" }}>{list.listName}</h4>

            {list.destinationDetails && list.destinationDetails.length > 0 ? (
              <ul style={{ paddingLeft: "20px", marginBottom: "10px" }}>
                {list.destinationDetails.map((destination, i) => (
                  <li key={i} style={{ marginBottom: "5px" }}>
                    {destination?.name || "Unknown"}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: "gray", marginBottom: "10px" }}>
                No destinations found.
              </p>
            )}

<div style={{ display: "flex", justifyContent: "space-between" }}>
  {list.selected ? (
    <button
      style={{
        padding: "10px 15px",
        backgroundColor: "red",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        transition: "background-color 0.3s ease",
      }}
      onClick={handleDeselectList} // Use the updated function here
    >
      Deselect
    </button>
  ) : (
    <button
      style={{
        padding: "10px 15px",
        backgroundColor: "blue",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        transition: "background-color 0.3s ease",
      }}
      onClick={() => handleSelectList(list.listName)} // Call handleSelectList for selection
    >
      Select
    </button>
  )}



              <button
                style={{
                  padding: "10px 15px",
                  backgroundColor: "red",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  transition: "background-color 0.3s ease",
                }}
                onClick={() => handleDeleteList(list.listName)} // Delete the list
              >
                Delete List
              </button>
            </div>
          </div>
        ))
      ) : (
        <p>No lists found.</p>
      )}
    </div>
  </div>
</div>

    </div>
  );
}
  

export default LoggedIn;
