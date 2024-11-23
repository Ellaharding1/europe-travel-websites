import React, { useState, useEffect } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Fuse from "fuse.js";



const SearchDestination = () => {
    const [field, setField] = useState("region");
    const [value, setValue] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(5);
    const [results, setResults] = useState([]);
    const [totalPages, setTotalPages] = useState(0);
    const [error, setError] = useState("");

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const searchDestinations = async () => {
    try {
      const params = {
        field,
        value: value.trim(),
        page,
        limit,
      };
  
      // Fetch paginated results from the backend
      const response = await axios.get(`${BACKEND_URL}/search-destinations`, { params });
      console.log("Backend Results:", response.data.results);
  
      let refinedResults = response.data.results; // Default to backend results
      let totalRefinedResults = response.data.totalCount; // Use backend-provided count for pagination
  
      if (value.trim() !== "") {
        // Fetch all results for fuzzy matching
        const allResultsResponse = await axios.get(`${BACKEND_URL}/search-destinations`, {
          params: { field, page: 1, limit: 1000 }, // Fetch all data for fuzzy matching
        });
  
        console.log("All Backend Results for Fuzzy Matching:", allResultsResponse.data.results);
  
        // Prepare data for fuzzy search (preserve case sensitivity and original data)
        const sanitizedResults = allResultsResponse.data.results.map((item) => ({
          ...item,
          name: item.name || "",
          region: item.region || "",
          country: item.country || "",
        }));
  
        console.log("Sanitized Results for Fuzzy Search:", sanitizedResults);
  
        // Perform fuzzy search
        const fuse = new Fuse(sanitizedResults, {
          keys: [field], // Match the selected field
          threshold: 0.4, // Adjust threshold for typo tolerance
          ignoreLocation: true,
          distance: 100, // Allow flexibility in matching distance
        });
  
        const fuzzyResults = fuse.search(value.trim());
        console.log("Fuzzy Results:", fuzzyResults);
  
        // Map fuzzy results back to the original data
        refinedResults = fuzzyResults.map((result) => result.item);
        totalRefinedResults = refinedResults.length; // Update total count to fuzzy-matched results
        console.log("Refined Results for Display:", refinedResults);
      }
  
      // Paginate refined results
      const startIndex = (page - 1) * limit;
      const paginatedResults = refinedResults.slice(startIndex, startIndex + limit);
  
      setResults(paginatedResults);
      setTotalPages(Math.ceil(totalRefinedResults / limit)); // Use the total refined results for page calculation
      setError("");
    } catch (err) {
      console.error("Error in searchDestinations:", err.message);
      setError("Error fetching destinations. Please try again.");
    }
  };
  
  

  useEffect(() => {
    searchDestinations();
  }, [page, limit]);

  const handleDuckDuckGoSearch = (query) => {
    const searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
    window.open(searchUrl, "_blank"); // Opens the search in a new tab
  };

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        backgroundImage: "url('/img/background.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed", // Ensures the background stays in place
        minHeight: "100vh", // Ensures the initial viewport height is covered
     }}
    >
      <h1 style={{ textAlign: "center", color: "#fff" }}>Search Destinations</h1>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "20px",
          marginBottom: "20px",
        }}
      >
        <label>
          <strong style={{ color: "#fff" }}>Field:</strong>
          <select
            value={field}
            onChange={(e) => setField(e.target.value)}
            style={{
              marginLeft: "10px",
              padding: "5px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          >
            <option value="region">Region</option>
            <option value="country">Country</option>
            <option value="name">Name</option>
          </select>
        </label>
        <label>
          <strong style={{ color: "#fff" }}>Value:</strong>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            style={{
              marginLeft: "10px",
              padding: "5px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
        </label>
        <label>
          <strong style={{ color: "#fff" }}>Results per page:</strong>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            style={{
              marginLeft: "10px",
              padding: "5px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          >
            <option value={5}>5 Items Per Page</option>
            <option value={10}>10 Items Per Page</option>
            <option value={15}>15 Items Per Page</option>
            <option value={20}>20 Items Per Page</option>

          </select>
        </label>
        <button
          onClick={() => {
            setPage(1);
            searchDestinations();
          }}
          style={{
            padding: "10px 20px",
            backgroundColor: "#1a1a1a",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Filter
        </button>
      </div>

      <div style={{ textAlign: "center", marginBottom: "20px" }}>
  {/* Display current page and total pages */}
  <p style={{ color: "#fff" }}>
    Page {page} of {totalPages || 1}
  </p>
  <button
    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
    disabled={page === 1}
    style={{
      padding: "10px 20px",
      backgroundColor: page === 1 ? "#444" : "#1a1a1a",
      color: "#fff",
      border: "none",
      borderRadius: "4px",
      cursor: page === 1 ? "not-allowed" : "pointer",
      marginRight: "10px",
    }}
  >
    Previous
  </button>
  <button
    onClick={() => setPage((prev) => prev + 1)}
    disabled={page === totalPages}
    style={{
      padding: "10px 20px",
      backgroundColor: page === totalPages ? "#444" : "#1a1a1a",
      color: "#fff",
      border: "none",
      borderRadius: "4px",
      cursor: page === totalPages ? "not-allowed" : "pointer",
      marginLeft: "10px",
    }}
  >
    Next
  </button>
</div>


      {error && (
        <p style={{ color: "red", textAlign: "center" }}>{error}</p>
      )}

      <div style={{ display: "grid", gap: "20px" }}>
        {results.map((result, index) => (
          <div
            key={index}
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "15px",
              backgroundColor: "#e6f7ff",
              boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",            
              marginLeft: "100px",
              marginRight: "100px",
            }}
          >
            <h2 style={{ color: "#333" }}>{result.name}</h2>
            <p>
              <strong>Region:</strong> {result.region}
            </p>
            <p>
              <strong>Country:</strong> {result.country}
            </p>
            <p>
              <strong>Category:</strong> {result.category}
            </p>
            <p>
              <strong>Approximate Annual Tourists:</strong>{" "}
              {result.approximateAnnualTourists}
            </p>
            <p>
              <strong>Currency:</strong> {result.currency}
            </p>
            <p>
              <strong>Majority Religion:</strong> {result.majorityReligion}
            </p>
            <p>
              <strong>Famous Foods:</strong> {result.famousFoods}
            </p>
            <p>
              <strong>Language:</strong> {result.language}
            </p>
            <p>
              <strong>Best Time to Visit:</strong> {result.bestTimetoVisit}
            </p>
            <p>
              <strong>Cost of Living:</strong> {result.costofLiving}
            </p>
            <p>
              <strong>Safety:</strong> {result.safety}
            </p>
            <p>
              <strong>Cultural Significance:</strong>{" "}
              {result.culturalSignificance}
            </p>
            <p>
              <strong>Description:</strong> {result.description}
            </p>
            <p>
              <strong>Latitude:</strong> {result.latitude}
            </p>
            <p>
              <strong>Longitude:</strong> {result.longitude}
            </p>
          {/* Add a map using Leaflet */}
          {result.latitude && result.longitude ? (
            <div style={{ marginTop: "20px" }}>
                <MapContainer
                center={[result.latitude, result.longitude]}
                zoom={12}
                style={{ height: "300px", width: "100%", borderRadius: "8px" }}
                >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
                />
                <Marker position={[result.latitude, result.longitude]}>
                    <Popup>
                    {result.name} - {result.country}
                    </Popup>
                </Marker>
                </MapContainer>
            </div>
            ) : (
            <p style={{ color: "red" }}>Location data unavailable for this destination.</p>
            )}


            <button
              onClick={() => handleDuckDuckGoSearch(result.name)}
              style={{
                marginTop: "10px",
                padding: "10px 20px",
                backgroundColor: "#1a1a1a", 
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Search on DuckDuckGo
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchDestination;
