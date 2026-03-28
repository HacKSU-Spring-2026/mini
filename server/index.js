const express = require('express'); // import the Express framework for handling HTTP
const path = require('path');       // import Node's path module for building file paths safely

const app = express();              // create the Express application instance
const PORT = process.env.PORT || 3000; // use the environment's PORT if set, otherwise default to 3000

app.use(express.static(path.join(__dirname, '../public'))); // serve everything in the /public folder as static files

// explicit route for each minigame so /reaction works without a trailing slash
app.get('/reaction', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/reaction/index.html'));
});

app.get('/typing', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/typing/index.html'));
});

app.get('/states', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/states/index.html'));
});

app.get('/wordle', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/wordle/index.html'));
});


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`); // log the URL once the server is ready
});
