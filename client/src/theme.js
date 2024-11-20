import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#2c3e50", // Navy Blue for AppBar
    },
    secondary: {
      main: "#8e44ad", // Purple for secondary buttons
    },
    background: {
      default: "#f4f6f8", // Light gray for the background
    },
    text: {
      primary: "#2c3e50", // Dark gray for text
    },
  },
  typography: {
    fontFamily: "'Roboto', 'Arial', sans-serif",
    h1: {
      fontWeight: 700,
      fontSize: "3rem",
    },
    h2: {
      fontWeight: 600,
      fontSize: "2.5rem",
    },
    body1: {
      fontSize: "1rem",
    },
  },
});

export default theme;
