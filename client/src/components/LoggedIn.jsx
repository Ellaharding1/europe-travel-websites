import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import SearchDestination from "./SearchDestination";

const LoggedIn = () => {
  const [lists, setLists] = useState([]);
  const [listName, setListName] = useState("");
  const [message, setMessage] = useState("");
  const [userEmail, setUserEmail] = useState(localStorage.getItem("email") || ""); // Fetch email once
  const [selectedList, setSelectedList] = useState(null); // Track selected list name
  const [selectedListId, setSelectedListId] = useState(null); // Track selected list ID
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  // Fetch lists for the logged-in user
  const fetchLists = useCallback(async () => {
    try {
      if (!userEmail) {
        console.error("User email not found.");
        return;
      }

      const response = await axios.get(`${BACKEND_URL}/api/getLists`, {
        params: { email: userEmail },
      });

      console.log("Fetched lists:", response.data.lists); // Debug fetched lists
      setLists(response.data.lists || []); // Update state with new lists

      // Find and update the selected list
      const selectedList = response.data.lists.find((list) => list.selected);
      if (selectedList) {
        setSelectedList(selectedList.listName);
        setSelectedListId(selectedList._id); // Update ID if selected
      } else {
        setSelectedList(null);
        setSelectedListId(null);
      }
    } catch (err) {
      console.error("Error fetching lists:", err.message);
    }
  }, [userEmail]);


  // Set up interval to refresh the list every second
  useEffect(() => {
    const interval = setInterval(() => {
        if (true) {
            fetchLists();
        }
    }, 1000);

    return () => clearInterval(interval); // Cleanup interval on component unmount
}, [isLoggedIn]);


  const handleSelectList = async (list) => {
    try {
      const email = localStorage.getItem("email");
      if (!email) {
        console.error("User email not found.");
        return;
      }
  
      await axios.patch(`${BACKEND_URL}/api/select-list`, {
        listName: list.listName,
        email,
      });
  
      setSelectedList(list.listName);
      setSelectedListId(list._id); // Update selected list ID
      setMessage(`List "${list.listName}" selected successfully.`);
      fetchLists(); // Refresh lists
    } catch (err) {
      console.error("Error selecting list:", err.response?.data?.error || err.message);
      setMessage("Failed to select the list.");
    }
  };
  

  const handleDeselectList = async () => {
    try {
      if (!userEmail) {
        console.error("User email not found.");
        return;
      }

      await axios.patch(`${BACKEND_URL}/api/deselect-list`, { email: userEmail });

      setSelectedList(null); // Clear selected list name
      setSelectedListId(null); // Clear selected list ID
      setMessage("List deselected successfully.");
      fetchLists(); // Refresh lists
    } catch (err) {
      console.error("Error deselecting list:", err.response?.data?.error || err.message);
      setMessage("Failed to deselect the list.");
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

  const handleDeleteList = async (list) => {
    try {
      await axios.post(`${BACKEND_URL}/api/deleteList`, {
        listName: list.listName,
        email: userEmail,
      });

      setMessage(`List "${list.listName}" deleted successfully.`);
      fetchLists();
    } catch (err) {
      console.error("Error deleting list:", err.message);
      setMessage("Error deleting list. Please try again.");
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
  selectedListId={selectedListId} // Pass the selected list ID
  setSelectedList={setSelectedList}
  fetchLists={fetchLists}
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



  <div>
    <h3>Your Lists</h3>
    <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
      {lists.length > 0 ? (
        lists.map((list) => (
          <div
            key={list._id}
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
                  onClick={handleDeselectList}
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
                  onClick={() => handleSelectList(list)}
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
                onClick={() => handleDeleteList(list)}
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
