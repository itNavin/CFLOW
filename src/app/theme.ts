import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#326295",
    },
    background: {
      default: "#ffffff",
      paper: "#ffffff",
    },
    text: {
      primary: "#000000",
      secondary: "#555555",
    },
  },

  typography: {
    fontFamily: '"DB Heavent", "Roboto", "Helvetica", "Arial", sans-serif',

    h1: {
      fontSize: "36px",
      fontWeight: 500,
    },
    h2: {
      fontSize: "30px",
      fontWeight: 500,
    },
    h3: {
      fontSize: "26px",
      fontWeight: 500,
    },
    body1: {
      fontSize: "22px",
      fontWeight: 300,
    },
    body2: {
      fontSize: "0.875rem", // 14px
      fontWeight: 300,
    },
    button: {
      fontSize: "22px",
      textTransform: "none", // remove UPPERCASE
      fontWeight: 500,
    },
  },
});

export default theme;
