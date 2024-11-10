const express = require("express");
const jwt = require("jsonwebtoken");

const JWT_SECRET = "kirat123123";
const app = express();
app.use(express.json());

const users = [];

function logger(req, res, next) {
    console.log(req.method + " request came");
    next();
}

// Home route
app.get("/", function(req, res) {
    res.sendFile(__dirname + "/public/index.html");
});

// Signup route
app.post("/signup", logger, function(req, res) {
    const username = req.body.username;
    const password = req.body.password;
    
    // Check if user already exists
    if (users.find(user => user.username === username)) {
        return res.status(400).json({ message: "User already exists" });
    }
    
    // Add new user
    users.push({ username, password });
    res.json({ message: "You are signed up" });
});

// Signin route
app.post("/signin", logger, function(req, res) {
    const { username, password } = req.body;
    const foundUser = users.find(user => user.username === username && user.password === password);
    
    if (!foundUser) {
        return res.status(400).json({ message: "Credentials incorrect" });
    }
    
    const token = jwt.sign({ username: foundUser.username }, JWT_SECRET);
    res.json({ token });
});

// Auth middleware
function auth(req, res, next) {
    const token = req.headers.token;
    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }
    
    try {
        const decodedData = jwt.verify(token, JWT_SECRET);
        req.username = decodedData.username;
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
}

// Protected route
app.get("/me", logger, auth, function(req, res) {
    const foundUser = users.find(user => user.username === req.username);
    
    if (foundUser) {
        res.json({
            username: foundUser.username,
            password: foundUser.password
        });
    } else {
        res.status(404).json({ message: "User not found" });
    }
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
