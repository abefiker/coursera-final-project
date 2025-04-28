const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Check if username is valid (e.g., not empty and unique)
const isValid = (username) => {
    return username && !users.some(user => user.username === username);
}

// Authenticate user by username and password
const authenticatedUser = (username, password) => {
    return users.some(user => user.username === username && user.password === password);
}

// Only registered users can login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and Password are required" });
    }

    if (authenticatedUser(username, password)) {
        let accessToken = jwt.sign({ username }, 'access', { expiresIn: '1h' });

        req.session.authorization = {
            accessToken,
            username
        };

        return res.status(200).json({ message: "User logged in successfully" });
    } else {
        return res.status(401).json({ message: "Invalid login credentials" });
    }
});

// Add or update a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params;
    const { review } = req.body;

    if (!review) {
        return res.status(400).json({ message: "Review content is required" });
    }

    const book = books[isbn];

    if (book) {
        // Add or update the review
        const username = req.session.authorization.username;
        book.reviews = book.reviews || {}; // Initialize if not present
        book.reviews[username] = review;

        return res.status(200).json({ message: "Review added/updated successfully", book });
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
