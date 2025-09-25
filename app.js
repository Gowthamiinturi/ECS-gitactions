const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));

// Serve login page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "login.html"));
});

// Handle login
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Simple validation (for demo only)
  if (username === "admin" && password === "password") {
    res.sendFile(path.join(__dirname, "views", "success.html"));
  } else {
    res.send("❌ Invalid username or password");
  }
});

app.listen(PORT, () => {
  console.log(`✅ App running at http://localhost:${PORT}`);
});
