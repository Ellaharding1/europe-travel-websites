import React, { useState, useEffect, useCallback } from "react";
import { Box, Typography, Toolbar } from "@mui/material";
import axios from "axios";
import SearchDestination from "./SearchDestination";
import PublicLists from "./PublicLists";
import { useAuth } from "./AuthContext";
import LoggedInNavBar from "./LoggedInNavBar"; // Import the new navbar




const LoggedIn = () => {
  const [editName, setEditName] = useState("");
  const [editVisibility, setEditVisibility] = useState("private");
  const [expandedListId, setExpandedListId] = useState(null);
  const [editingList, setEditingList] = useState(null); // Track the ID of the list being edited
  const [editDescription, setEditDescription] = useState(""); // Track the description being edited
  const [editListId, setEditListId] = useState(null);

  const { userStatus } = useAuth(); // Get user status from AuthContext

  const { isAdmin } = useAuth(); // Directly get `isAdmin` from AuthContext




  //sconst [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false); // State for toggling the "Your Travel Lists" section
  const [isPublicListsCollapsed, setIsPublicListsCollapsed] = useState(false); // State for "Public Lists"
  const [isTravelListCollapsed, setIsTravelListCollapsed] = useState(false); // State for "Your Travel Lists"


  const [lastEditedTime, setLastEditedTime] = useState({});
  const [lists, setLists] = useState([]);
  const [listName, setListName] = useState("");

  const [description, setDescription] = useState(""); // State for description

  const [message, setMessage] = useState("");

  const [userEmail, setUserEmail] = useState(localStorage.getItem("email") || "");

  const [selectedList, setSelectedList] = useState(null);
  const [selectedListId, setSelectedListId] = useState(null);

  const { token, isLoggedIn } = useAuth(); // Get the login state and token


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

  const handleChangeVisibility = async (list, newVisibility) => {
    try {
      await axios.patch(`${BACKEND_URL}/api/change-visibility`, {
        listId: list._id,
        visibility: newVisibility,
      });
      console.log(list._id);
      await updateLastEdited(list._id); // Call the API to update the lastEdited timestamp
      setMessage(`Visibility of "${list.listName}" changed to ${newVisibility}.`);
      fetchLists(); // Refresh the lists
    } catch (err) {
      console.error("Error changing visibility:", err.message);
      setMessage("Failed to change visibility. Please try again.");
    }
  };

const handleCancelEdit = () => {
  setEditingList(null); // Clear the editing state
  setEditName(""); // Reset the input fields
  setEditDescription("");
  setEditVisibility("private");
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

  // Example: Editing the description
const handleDescriptionEdit = async (listId, newDescription) => {
  try {
    await axios.patch(`${BACKEND_URL}/api/editDescription`, {
      listId,
      description: newDescription,
      
    });

    await updateLastEdited(listId); // Call the API to update the lastEdited timestamp
    fetchLists(); // Refresh lists
  } catch (err) {
    console.error("Error editing description:", err.message);
  }
};

  const handleRemoveDestination = async (listId, destinationId) => {
    try {
      const response = await axios.patch(`${BACKEND_URL}/api/remove-destination`, {
        listId,
        destinationId,
      });
  
      await updateLastEdited(listId); // Call the API to update the lastEdited timestamp
      console.log(response.data.message); // Log the success message
      fetchLists(); // Refresh the lists to show updated data
    } catch (err) {
      console.error("Error removing destination:", err.message);
      setMessage("Failed to remove destination. Please try again.");
    }
  };
  
  const updateLastEdited = async (listId) => {
    try {
      await axios.patch(`${BACKEND_URL}/api/updateLastEdited`, { listId });
      console.log("Last edited timestamp updated successfully.");
    } catch (err) {
      console.error("Error updating last edited timestamp:", err.message);
    }
  };
console.log(isAdmin)


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
            <LoggedInNavBar isAdmin={isAdmin} /> {/* Use the updated navbar */}
            <Toolbar /> {/* Spacer for the fixed AppBar */}

            <div
        style={{
          display: "flex",
          flexDirection: "row",
          flexGrow: 0,
        }}
      >


      {/* Public Lists (Left Section) */}
    <div
      style={{
        width: "50%", // Adjust width as needed
        borderRight: "1px solid #ccc",
        overflowY: "auto",
        padding: "20px",
        backgroundColor: "#2d3d50",
      }}
    >
      <PublicLists />
    </div>
      {/* Left Section (Search Destinations) */}
      <div
        style={{
          width: isPublicListsCollapsed ? "90%" : "70%",
          borderRight: "1px solid #ccc",
          overflowY: "auto",
          padding: "20px",
          transition: "width 0.3s ease",
          backgroundColor: "#2d3d50",
        }}
      >
  
        {/* Search Destination Component */}
        <SearchDestination
            selectedList={selectedList}
            selectedListId={selectedListId} // Pass the selected list ID
            setSelectedList={setSelectedList}
            fetchLists={fetchLists}
            ddToList={(destination) => {
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
                backgroundColor: "#2d3d50",
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

      



      {/* Toggle Button for Your Travel Lists */}
      <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              style={{
                backgroundColor: "gray",
                color: "white",
                border: "none",
                cursor: "pointer",
                position: "absolute",
                right: isCollapsed ? "5%" : "25%",
                top: "50%",
                transform: "translateY(-50%)",
                padding: "10px",
                borderRadius: "5px",
                zIndex: 1000,
              }}
            >        
              {isCollapsed ? ">" : "<"}
            </button>
  
{/* Right Section */}
<div
        style={{
          marginTop: "70px",
          width: isCollapsed ? "5%" : "25%",
          padding: isCollapsed ? "10px" : "20px",
          overflowY: "auto",
          backgroundColor: "#f7f7f7",
          transition: "width 0.3s ease",
        }}
      >
        {!isCollapsed && (
          <>
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
        backgroundColor: "gray",
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
          color: message.includes("successfully") ? "darkgreen" : "red",
        }}
      >
        {message}
      </p>
    )}
  </div>

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
                  backgroundColor: isExpanded ? "gray" : "black",
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



              {editListId === list._id ? (
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
                  <button
                    onClick={async () => {
                      await handleDescriptionEdit(list._id, editDescription);
                      setEditListId(null); // End editing after saving
                    }}
                    style={{
                      padding: "5px 10px",
                      backgroundColor: "green",
                      color: "white",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                      marginTop: "10px",
                    }}
                  >
                    Save
                  </button>
                </>
              ) : (
                <>
                  <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
                    <p style={{ marginRight: "10px", color: "gray" }}>
                      {"List Description:   "}
                      {list.description || "No description provided."}
                    </p>
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setEditListId(list._id); // Start editing this list
                        setEditDescription(list.description || ""); // Initialize edit with current description
                      }}
                      style={{
                        padding: "2px 5px",
                        backgroundColor: "blue",
                        color: "white",
                        border: "none",
                        borderRadius: "3px",
                        cursor: "pointer",
                      }}
                    >
                      Edit
                    </button>

                    
                  </div>

                  <p style={{ fontSize: "12px", color: "gray" }}>
                    Last Edited: {list.lastEdited ? new Date(list.lastEdited).toLocaleString() : "Never"}
                  </p>
                </>
              )}



                      {list.destinationDetails && list.destinationDetails.length > 0 ? (
                        <ul style={{ paddingLeft: "20px", marginBottom: "10px" }}>
                          {list.destinationDetails.map((destination, i) => (
                            <li
                              key={i}
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: "5px",
                              }}
                            >
                              <span>
                                <strong>Destination:</strong> {destination?.name || "Unknown"}
                                <br />
                                <strong>Country:</strong> {destination?.country || "Unknown Country"}
                              </span>
                              <button
                                onClick={() => handleRemoveDestination(list._id, destination.id)} // Call the remove function
                                style={{
                                  marginLeft: "10px",
                                  padding: "5px", // Reduce padding to make the button smaller
                                  backgroundColor: "gray", // Set background color to dark gray
                                  color: "white", // Set the "X" color to white for contrast
                                  border: "none", // Remove any border
                                  borderRadius: "50%", // Make it circular
                                  fontSize: "9px", // Adjust the font size of the "X"
                                  width: "15px", // Set button width
                                  height: "15px", // Set button height
                                  display: "flex", // Center the "X" inside the circle
                                  alignItems: "center", // Vertical centering
                                  justifyContent: "center", // Horizontal centering
                                  cursor: "pointer",
                                }}
                              >
                                X
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p style={{ color: "gray", marginBottom: "10px" }}>No destinations found.</p>
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
                            padding: "1px 5px", // Smaller padding for smaller button size
                            backgroundColor: "black",
                            color: "white",
                            border: "none",
                            borderRadius: "5px",
                            fontSize: "12px", // Smaller font size
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
                            padding: "5px 8px", // Smaller padding
                            backgroundColor: "blue",
                            color: "white",
                            border: "none",
                            borderRadius: "5px",
                            fontSize: "12px", // Smaller font size
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
                          padding: "5px 8px", // Smaller padding
                          backgroundColor: list.visibility === "public" ? "green" : "gray",
                          color: "white",
                          border: "none",
                          borderRadius: "5px",
                          fontSize: "12px", // Smaller font size
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
                          padding: "5px 8px", // Smaller padding
                          backgroundColor: "black",
                          color: "white",
                          border: "none",
                          borderRadius: "5px",
                          fontSize: "12px", // Smaller font size
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
        </>
        )}
        
      </div>
    </div>
    </div>
  );
};

export default LoggedIn;
