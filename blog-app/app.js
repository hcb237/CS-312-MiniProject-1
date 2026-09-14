const express = require('express');
const path = require('path');

// Create express application instance
const app = express();

// The port number
const PORT = 3000;

// ---------- Setup ----------

//Use EJS as the template engine for rendering pages
app.set('view engine', 'ejs');

//Set location
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// ---------- In-Memory Data ----------
// Create post array
let posts = [];

//Create ID counter
let nextId = 1;

// ---------- Routes ----------

// 1) Homepage: show the new-post form and the list of all posts
app.get('/', function (req, res) {
  // Render views/index.ejs hand to current posts array
  res.render('index', { posts: posts });
});

// 2) Create a new post
app.post('/posts', function (req, res) {
  // Pull the three fields out of the submitted form data
  const author = req.body.author;
  const title = req.body.title;
  const content = req.body.content;

  // Build a new post object
  const newPost = {
    id: nextId,
    author: author,
    title: title,
    content: content,
    createdAt: new Date().toLocaleString()
  };

  // Bump ID counter
  nextId = nextId + 1;

  // unshift() adds to the front of array
  posts.unshift(newPost);

  // Send user back to homepage
  res.redirect('/');
});

// 3) laod edit form for one post
app.get('/posts/:id/edit', function (req, res) {
  // req.params.id convert to number to compair
  const id = parseInt(req.params.id);

  // Search array for matching post
  let foundPost = null;
  for (let i = 0; i < posts.length; i++) {
    if (posts[i].id === id) {
      foundPost = posts[i];
      //stop when found
      break;
    }
  }

  // if not found, redirect home
  if (foundPost === null) {
    res.redirect('/');
    return;
  }

  // Render edit form, fill with posts current values
  res.render('edit', { post: foundPost });
});

// 4) Edit a post
//Creat new and delete old
app.post('/posts/:id/replace', function (req, res) {

  const oldId = parseInt(req.params.id);

  // creates a new post, with data from old
  const replacementPost = {
    id: nextId,
    author: req.body.author,
    title: req.body.title,
    content: req.body.content,
    createdAt: new Date().toLocaleString()
  };

  // bump counter
  nextId = nextId + 1;

  //rebuilt array without original
  const remainingPosts = [];
  for (let i = 0; i < posts.length; i++) {
    if (posts[i].id !== oldId) {
      remainingPosts.push(posts[i]);
    }
  }

  //Put replacement at the front of array
  remainingPosts.unshift(replacementPost);

  // Swap old array for the new one
  posts = remainingPosts;

  // Send user back to homepage
  res.redirect('/');
});

// 5) Delete a post
app.post('/posts/:id/delete', function (req, res) {
  // Convert URL parameter to number for comparison
  const id = parseInt(req.params.id);

  // Build a new array containing every post but one being deleted
  const remainingPosts = [];
  for (let i = 0; i < posts.length; i++) {
    if (posts[i].id !== id) {
      remainingPosts.push(posts[i]);
    }
  }
  // Replace old array with filtered one.
  posts = remainingPosts;

  // Send user back to the homepage
  res.redirect('/');
});

// ---------- Start Server ----------

// Start listening for requests on chosen port.
app.listen(PORT, function () {
  console.log('Blog app running at http://localhost:' + PORT);
});