const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// User registration
public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (!isValid(username)) {
        return res.status(409).json({ message: "Username already exists" });
    }

    users.push({ username, password });
    return res.status(201).json({ message: "User successfully registered" });
});

// Get the book list available in the shop
public_users.get('/', async (req, res) => {
    try {
        return res.status(200).json(books);
    } catch (error) {
        return res.status(404).json(error)
    }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
    try {
        const { isbn } = req.params;
        const book = books[isbn];

        if (book) {
            return res.status(200).json(book);
        } else {
            return res.status(404).json({ message: "Book not found" });
        }
    } catch (error) {
        return res.status(404).json(error)
    }
});

// Get book details based on author
public_users.get('/author/:author', async (req, res) => {
    try {
        const { author } = req.params;
        let matchingBooks = [];

        for (let isbn in books) {
            if (books[isbn].author.toLowerCase() === author.toLowerCase()) {
                matchingBooks.push({ isbn, ...books[isbn] });
            }
        }

        if (matchingBooks.length > 0) {
            return res.status(200).json(matchingBooks);
        } else {
            return res.status(404).json({ message: "No books found for this author" });
        }
    } catch (error) {
        return res.status(404).json(error)
    }
});

// Get all books based on title
public_users.get('/title/:title', async (req, res) => {
    try {
        const { title } = req.params;
        let matchingBooks = [];

        for (let isbn in books) {
            if (books[isbn].title.toLowerCase() === title.toLowerCase()) {
                matchingBooks.push({ isbn, ...books[isbn] });
            }
        }

        if (matchingBooks.length > 0) {
            return res.status(200).json(matchingBooks);
        } else {
            return res.status(404).json({ message: "No books found with this title" });
        }
    } catch (error) {
        return res.status(404).json(error)
    }
});

// Get book reviews
public_users.get('/review/:isbn', (req, res) => {
    const { isbn } = req.params;
    const book = books[isbn];

    if (book) {
        return res.status(200).json(book.reviews || {});
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

module.exports.general = public_users;
