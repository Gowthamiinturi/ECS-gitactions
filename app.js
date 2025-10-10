const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const mysql = require("mysql2");

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Load database credentials from environment variables
const db = mysql.createConnection({
  host: process.env.DB_HOST,       // e.g., 'database-1.*****.rds.amazonaws.com'
  user: process.env.DB_USER,       // e.g., 'admin'
  password: process.env.DB_PASSWORD,   // e.g., 'your_password'
  database: process.env.DB_NAME    // e.g., 'testdb'
});

// Connect to database
db.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed:", err.stack);
    return;
  }
  console.log("✅ Connected to MySQL RDS");
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));

// Serve login page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "login.html"));
});

// Serve register page
app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "register.html"));
});

// Handle registration
app.post("/register", (req, res) => {
  const { username, password } = req.body;

  const query = "INSERT INTO users (username, password) VALUES (?, ?)";
  db.query(query, [username, password], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.send("⚠️ Username already exists. Please choose another.");
      }
      console.error("Registration error:", err);
      return res.send("❌ Registration failed.");
    }

    console.log(`✅ Registered user: ${username}`);
    res.redirect("/");
  });
});

// Handle login
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const query = "SELECT * FROM users WHERE username = ? AND password = ?";
  db.query(query, [username, password], (err, results) => {
    if (err) {
      console.error("Login error:", err);
      return res.send("❌ Login failed.");
    }

    if (results.length > 0) {
      res.sendFile(path.join(__dirname, "views", "success.html"));
    } else {
      res.send("❌ Invalid username or password");
    }
  });
});

// Start the server
app.listen(3000, '0.0.0.0', () => {
  console.log(`✅ App running at http://localhost:${PORT}`);
});
