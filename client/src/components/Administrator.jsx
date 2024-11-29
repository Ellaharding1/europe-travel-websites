import React, { useState, useEffect } from "react";
import axios from "axios";

const Administrator = () => {
  const [users, setUsers] = useState([]);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersResponse = await axios.get("/api/admin/users");
        const reviewsResponse = await axios.get("/api/admin/reviews");
        setUsers(usersResponse.data);
        setReviews(reviewsResponse.data);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };
    fetchData();
  }, []);

  const grantAdmin = async (username) => {
    try {
      await axios.patch("/api/admin/grant", { username });
      alert(`${username} is now an admin.`);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleReviewVisibility = async (reviewId, visibility) => {
    try {
      await axios.patch("/api/admin/review", { reviewId, visibility });
      alert(`Review visibility updated to ${visibility}.`);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleUserStatus = async (userId, status) => {
    try {
      await axios.patch("/api/admin/user", { userId, status });
      alert(`User status updated to ${status}.`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Administrator Dashboard</h2>
      <h3>Users</h3>
      {users.map((user) => (
        <div key={user._id}>
          <p>{user.username}</p>
          <button onClick={() => grantAdmin(user.username)}>Grant Admin</button>
          <button onClick={() => toggleUserStatus(user._id, "deactivated")}>Deactivate</button>
          <button onClick={() => toggleUserStatus(user._id, "active")}>Activate</button>
        </div>
      ))}
      <h3>Reviews</h3>
      {reviews.map((review) => (
        <div key={review._id}>
          <p>{review.comment}</p>
          <button onClick={() => toggleReviewVisibility(review._id, "hidden")}>Hide</button>
          <button onClick={() => toggleReviewVisibility(review._id, "visible")}>Unhide</button>
        </div>
      ))}
    </div>
  );
};

export default Administrator;
