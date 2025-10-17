const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const mysql = require("mysql2/promise");

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Create a connection pool instead of a single connection
const pool = mysql.createPool({
  host: process.env.DB_HOST,       // e.g. database-1.*****.rds.amazonaws.com
  user: process.env.DB_USER,       // e.g. admin
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,   // e.g. testdb
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000,           // 10 seconds
});

// ✅ Test connection on startup
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Connected to MySQL RDS successfully");
    connection.release();
  } catch (err) {
    console.error("❌ Database connection failed:", err);
  }
})();

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
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const query = "INSERT INTO users (username, password) VALUES (?, ?)";
    await pool.query(query, [username, password]);
    console.log(`✅ Registered user: ${username}`);
    res.redirect("/");
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.send("⚠️ Username already exists. Please choose another.");
    }
    console.error("Registration error:", err);
    res.send("❌ Registration failed.");
  }
});

// Handle login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const query = "SELECT * FROM users WHERE username = ? AND password = ?";
    const [results] = await pool.query(query, [username, password]);

    if (results.length > 0) {
      res.sendFile(path.join(__dirname, "views", "success.html"));
    } else {
      res.send("❌ Invalid username or password");
    }
  } catch (err) {
    console.error("Login error:", err);
    res.send("❌ Login failed.");
  }
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ App running at http://localhost:${PORT}`);
});
