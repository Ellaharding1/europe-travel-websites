import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import SearchDestination from "./SearchDestination";

const LoggedIn = () => {
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editVisibility, setEditVisibility] = useState("private");
  const [expandedListId, setExpandedListId] = useState(null);
  const [editingList, setEditingList] = useState(null);


  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);


  const [lastEditedTime, setLastEditedTime] = useState({});
  const [lists, setLists] = useState([]);
  const [listName, setListName] = useState("");

  const [description, setDescription] = useState(""); // State for description

  const [message, setMessage] = useState("");

  const [userEmail, setUserEmail] = useState(localStorage.getItem("email") || "");

  const [selectedList, setSelectedList] = useState(null);
  const [selectedListId, setSelectedListId] = useState(null);

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

      if (!listName.trim()) {
        setMessage("List name cannot be empty.");
        return;
      }
  
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

  const handleChangeVisibility = async (list, newVisibility) => {
    try {
      await axios.patch(`${BACKEND_URL}/api/change-visibility`, {
        listId: list._id,
        visibility: newVisibility,
      });
  
      setMessage(`Visibility of "${list.listName}" changed to ${newVisibility}.`);
      fetchLists(); // Refresh the lists
    } catch (err) {
      console.error("Error changing visibility:", err.message);
      setMessage("Failed to change visibility. Please try again.");
    }
  };

// Add this handler for saving edits
const handleSaveEdit = async () => {
  try {
    await axios.patch(`${BACKEND_URL}/api/editList`, {
      listId: editingList,
      listName: editName,
      description: editDescription,
      visibility: editVisibility,
    });

    setEditingList(null); // Clear the editing state
    setMessage("List updated successfully.");
    fetchLists(); // Refresh the lists after the update
  } catch (err) {
    console.error("Error saving list edits:", err.message);
    setMessage("Failed to save the list. Please try again.");
  }
};

const handleCancelEdit = () => {
  setEditingList(null); // Clear the editing state
  setEditName(""); // Reset the input fields
  setEditDescription("");
  setEditVisibility("private");
};

const startEditingList = (list) => {
  setEditingList(list._id); // Set the ID of the list being edited
  setEditName(list.listName); // Initialize the name in the form
  setEditDescription(list.description || ""); // Initialize the description
  setEditVisibility(list.visibility || "private"); // Initialize visibility
};

  

  const handleCreateList = async () => {
    if (!listName.trim()) {
      setMessage("List name cannot be empty.");
      return;
    }

    // Check if the user already has 20 lists
    if (lists.length >= 20) {
      setMessage("You cannot create more than 20 lists.");
      return;
    }

    // Frontend validation to check if the list name already exists
    if (lists.some((list) => list.listName.toLowerCase() === listName.toLowerCase())) {
      setMessage("A list with this name already exists.");
    return;
    }

    try {
      await axios.post(`${BACKEND_URL}/api/createList`, {
        email: userEmail,
        listName,
        description, // Include description in the request
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
      await axios.delete(`${BACKEND_URL}/api/deleteList`, {
        data: { listId: list._id }, // Use `data` for DELETE requests
      });
  
      setMessage(`List "${list.listName}" deleted successfully.`);
      setListName("");
      setDescription(""); // Clear the description field
      fetchLists(); // Refresh the lists after deletion
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

  {/* Create List Section */}
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
    <textarea
      placeholder="Enter description (optional)"
      value={description}
      onChange={(e) => setDescription(e.target.value)}
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

  {/* List Section */}
{/* List Section */}
<div>
  <h3>Your Lists</h3>
  <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
    {lists.length > 0 ? (
      lists.map((list) => {
        const isExpanded = expandedListId === list._id; // Check if this list is expanded


          return (
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
              {/* List Name and Expand/Collapse Button */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h4 style={{ marginBottom: "10px" }}>
                {isEditing && editListId === list._id ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    style={{
                      padding: "5px",
                      border: "1px solid #ddd",
                      borderRadius: "5px",
                    }}
                  />
                ) : (
                  list.listName
                )}
              </h4>
              <button
                style={{
                  padding: "5px 10px",
                  backgroundColor: isExpanded ? "red" : "blue",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
                onClick={() =>
                  setExpandedListId(isExpanded ? null : list._id)
                } // Toggle expand/collapse
              >
                {isExpanded ? "Collapse" : "Expand"}
              </button>
            </div>

            {/* Expanded List Details */}
            {isExpanded && (
              <>
                {isEditing && editListId === list._id ? (
                  <>
                    <textarea
                      placeholder="Edit description"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px",
                        marginBottom: "10px",
                        borderRadius: "5px",
                        border: "1px solid #ddd",
                      }}
                    />
                    <select
                      value={editVisibility}
                      onChange={(e) => setEditVisibility(e.target.value)}
                      style={{
                        padding: "5px",
                        marginBottom: "10px",
                        borderRadius: "5px",
                        border: "1px solid #ddd",
                      }}
                    >
                      <option value="private">Private</option>
                      <option value="public">Public</option>
                    </select>
                  </>
                ) : (
              <>
                    <p style={{ marginBottom: "10px", color: "gray" }}>
                      {list.description || "No description provided."}
                    </p>
                    <p style={{ marginBottom: "10px" }}>
                      Visibility: {list.visibility || "Private"}
                    </p>
                  </>
                )}

    {list.destinationDetails &&
                    list.destinationDetails.length > 0 ? (
                      <ul style={{ paddingLeft: "20px", marginBottom: "10px" }}>
                        {list.destinationDetails.map((destination, i) => (
                          <li key={i} style={{ marginBottom: "5px" }}>
                            <span style={{ fontWeight: "bold" }}>Destination:</span>{" "}
                            {destination?.name || "Unknown"}
                            <br />
                            <span style={{ fontWeight: "bold" }}>Country:</span>{" "}
                            {destination?.country || "Unknown Country"}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p style={{ color: "gray", marginBottom: "10px" }}>
                        No destinations found.
                      </p>
                    )}

                    {/* Buttons */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
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
                          onClick={handleDeselectList} // Call the deselect function
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
                          onClick={() => handleSelectList(list)} // Call the select function
                        >
                          Select
                        </button>
                      )}

                      {/* Change Visibility Button */}
                      <button
                        style={{
                          padding: "10px 15px",
                          backgroundColor:
                            list.visibility === "public" ? "green" : "gray",
                          color: "white",
                          border: "none",
                          borderRadius: "5px",
                          cursor: "pointer",
                        }}
                        onClick={() =>
                          handleChangeVisibility(
                            list,
                            list.visibility === "public"
                              ? "private"
                              : "public"
                          )
                        }
                      >
                        {list.visibility === "public"
                          ? "Make Private"
                          : "Make Public"}
                      </button>

                      {isEditing && editListId === list._id ? (
                        <button
                          style={{
                            padding: "10px 15px",
                            backgroundColor: "green",
                            color: "white",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer",
                          }}
                          onClick={() => handleSaveEdits(list)} // Save changes
                        >
                          Save
                        </button>
                      ) : (
                        <button
                          style={{
                            padding: "10px 15px",
                            backgroundColor: "orange",
                            color: "white",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer",
                          }}
                          onClick={() => startEditingList(list)} // Call the startEditingList function
                        >
                          Edit
                        </button>

                      )}

                      {editingList === list._id && (
                        <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                          <button
                            style={{
                              padding: "10px 15px",
                              backgroundColor: "green",
                              color: "white",
                              border: "none",
                              borderRadius: "5px",
                              cursor: "pointer",
                            }}
                            onClick={handleSaveEdit} // Save the changes
                          >
                            Save
                          </button>
                          <button
                            style={{
                              padding: "10px 15px",
                              backgroundColor: "gray",
                              color: "white",
                              border: "none",
                              borderRadius: "5px",
                              cursor: "pointer",
                            }}
                            onClick={handleCancelEdit} // Cancel the edit
                          >
                            Cancel
                          </button>
                        </div>
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
                  </>
                )}
              </div>
            );
          })
        ) : (
          <p>No lists found.</p>
        )}
      </div>
    </div>
      </div>
    </div>
  );
};
  

export default LoggedIn;
