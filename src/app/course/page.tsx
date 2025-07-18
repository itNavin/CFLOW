"use client"; // <-- add this at the very top

import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../theme"; // path to your theme.ts
import { Button } from "@mui/material";

function CoursePage() {
  return (
    // <ThemeProvider theme={theme}>
    //   <Box>
    //     <Typography variant="h4" >
    //       This text should be in DB Heavent font.
    //     </Typography>
    //     <div style={{ fontFamily: "DB Heavent", fontSize: 32 }}>
    //       This text should be in DB Heavent font.
    //     </div>
    //   </Box>
    // </ThemeProvider>
    <ThemeProvider theme={theme}>
      <Box  className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-md mt-10">
        {/* MUI Typography uses DB Heavent font from theme */}
        <Typography color="primary" variant="h1" className="mb-6  text-gray-800">
          This is h1
        </Typography>
        <Typography variant="h2" className="mb-6  text-gray-800 ">
          This is h2
        </Typography>
        <Typography variant="h3" className="mb-6  text-gray-800">
          This is h3
        </Typography>
        <Typography variant="body1" className="mb-6  text-gray-800">
          This is body1
        </Typography>
        <Button>
            <Typography variant="button" className="text-black">
                Click Me
            </Typography>
        </Button>

        {/* Using Tailwind with your custom font class */}
        <p className=" text-lg text-gray-700 mb-4">
          Welcome to the CSC498 course page! This paragraph uses Tailwind CSS
          with your custom DB Heavent font.
        </p>

        {/* Button styled with Tailwind */}
        <button className="bg-blue-600 text-white font-semibold px-5 py-3 rounded-md hover:bg-blue-700 transition">
          Enroll Now
        </button>

        {/* Another example: card with shadow and spacing */}
        <div className="mt-8 p-4 border border-gray-300 rounded-md font-dbheavent">
          <h4 className="text-xl font-semibold mb-2">Course Description</h4>
          <p>
            This course covers advanced web development concepts using React,
            Next.js, and Material UI. Youll learn how to integrate Tailwind CSS
            and custom fonts seamlessly.
          </p>
        </div>
      </Box>
    </ThemeProvider>
  );
}

export default CoursePage;
