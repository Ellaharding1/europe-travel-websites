import React, { useState, useEffect } from "react";
import axios from "axios";

const Administrator = () => {
  const [users, setUsers] = useState([]);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const usersResponse = await axios.get("/api/admin/users", config);
        setUsers(usersResponse.data);

        const reviewsResponse = await axios.get("/api/admin/reviews", config);
        setReviews(reviewsResponse.data);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };
    fetchData();
  }, []);

  const grantAdmin = async (username) => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      await axios.patch("/api/admin/grant", { username }, config);
      alert(`${username} is now an admin.`);
    } catch (err) {
      console.error("Error granting admin privileges:", err);
    }
  };

  const toggleReviewVisibility = async (reviewId, visibility) => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      await axios.patch("/api/admin/review", { reviewId, visibility }, config);
      alert(`Review visibility updated to ${visibility}.`);
    } catch (err) {
      console.error("Error updating review visibility:", err);
    }
  };

  const toggleUserStatus = async (userId, status) => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      await axios.patch("/api/admin/user", { userId, status }, config);
      alert(`User status updated to ${status}.`);
    } catch (err) {
      console.error("Error updating user status:", err);
    }
  };

  return (
    <div>
      <h2>Administrator Dashboard</h2>

      <h3>Users</h3>
      {Array.isArray(users) && users.length > 0 ? (
        users.map((user) => (
          <div key={user._id}>
            <p>{user.username}</p>
            <button onClick={() => grantAdmin(user.username)}>Grant Admin</button>
            <button onClick={() => toggleUserStatus(user._id, "deactivated")}>
              Deactivate
            </button>
            <button onClick={() => toggleUserStatus(user._id, "active")}>Activate</button>
          </div>
        ))
      ) : (
        <p>No users available</p>
      )}

      <h3>Reviews</h3>
      {Array.isArray(reviews) && reviews.length > 0 ? (
        reviews.map((review) => (
          <div key={review._id}>
            <p>{review.comment}</p>
            <button onClick={() => toggleReviewVisibility(review._id, "hidden")}>
              Hide
            </button>
            <button onClick={() => toggleReviewVisibility(review._id, "visible")}>
              Unhide
            </button>
          </div>
        ))
      ) : (
        <p>No reviews available</p>
      )}
    </div>
  );
};

export default Administrator;
