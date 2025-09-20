// Simple test server without MongoDB
const express = require("express");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Simple test route
app.get("/test", (req, res) => {
  res.json({ message: "Server is working!" });
});

// Serve static files
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(port, () => {
  console.log(`✅ Test server running at http://localhost:${port}`);
  console.log(`📁 Serving files from: ${path.join(__dirname, "public")}`);
});
