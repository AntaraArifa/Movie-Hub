const express = require('express');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// File paths
const reviewsFile = 'reviews.json'; // Path to the reviews file

// Utility to load data from JSON file
const loadFile = (filePath) => {
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
  return [];
};

// Utility to save data to JSON file
const saveFile = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// API to handle user registration
app.post('/api/register', (req, res) => {
  const { username, password } = req.body;

  // Load users data
  const usersFile = 'users.json';
  const users = loadFile(usersFile);

  // Check if user already exists
  const userExists = users.some(user => user.username === username);
  if (userExists) {
    return res.status(400).json({ message: 'User already exists!' });
  }

  // Add new user
  users.push({ username, password });
  saveFile(usersFile, users);
  res.status(201).json({ message: 'Registration successful' });
});

// API to handle user login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  const usersFile = 'users.json';
  const users = loadFile(usersFile);

  // Validate credentials
  const user = users.find(user => user.username === username && user.password === password);
  if (user) {
    res.status(200).json({ message: 'Login successful' });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// API to handle submitting a review
app.post('/api/review', (req, res) => {
  const { movieId, review, username } = req.body;

  if (!movieId || !review || !username) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  let reviews = loadFile(reviewsFile);

  // Add the new review
  reviews.push({ movieId, review, username });
  saveFile(reviewsFile, reviews);

  res.status(200).json({ message: 'Review submitted successfully' });
});

// API to get reviews for a specific movie
app.get('/api/reviews/:movieId', (req, res) => {
  const { movieId } = req.params;
  const reviews = loadFile(reviewsFile);

  // Filter reviews for the given movieId
  const movieReviews = reviews.filter(review => review.movieId === movieId);
  res.status(200).json(movieReviews);
});

// API to get movies (mock data)
app.get('/api/movies', (req, res) => {
  const moviesFile = 'movies.json';
  const movies = loadFile(moviesFile);
  res.status(200).json(movies);
});

// Serve the frontend React build
app.use(express.static(path.join(__dirname, '../frontend/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
