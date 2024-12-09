const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ 
      let userswithsamename = users.filter((user) => {
      return user.username === username;
        });
        // Return true if any user with the same username is found, otherwise false
        if (userswithsamename.length > 0) {
          return true;
        } else {
          return false;
  }
}

const authenticatedUser = (username,password)=>{ 
  let validusers = users.filter((user) => {
  return (user.username === username && user.password === password);
        });
        // Return true if any valid user is found, otherwise false
        if (validusers.length > 0) {
          return true;
        } else {
          return false;
}
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if username or password is missing
  if (!username || !password) {
      return res.status(404).json({ message: "Error logging in" });
  }

  // Authenticate user
  if (authenticatedUser(username, password)) {
      // Generate JWT access token
      let accessToken = jwt.sign({
          data: password
      }, 'access', { expiresIn: 60 * 60 });

      // Store access token and username in session
      req.session.authorization = {
          accessToken, username
      }
      return res.status(200).send("User successfully logged in");
  } else {
      return res.status(208).json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = parseInt(req.params.isbn);
  const review = req.query.review;
  const username = req.session.authorization?.username;

  if(!username)
    res.status(403).send({message : "User not logged in!"});
  if(!review)
    res.status(400).send({message : "Review is required!"});

  if(books[isbn])
  {
    const book = books[isbn];
    const userReview = book.reviews[username];

    if(userReview)
    {
      book.reviews[username] = review;
      res.status(200).send({message: "Review updated successfully!"});
    }
    else{
      book.reviews[username] = review;
      res.status(200).send({message : "Review added successfully!"});
    }
  }
  else{
    res.status(404).send({message : "Book not found!"});
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = parseInt(req.params.isbn);
  const username = req.session.authorization?.username;

  if(!username)
    res.status(403).send({message : "User not logged in!"}); 

  if(books[isbn])
  {
    const book = books[isbn]; 
    const userReview = book.reviews[username];   

    if(userReview)
    {
      delete book.reviews[username];
      res.status(200).send({message: "Review deleted successfully!"});
    }
    else{     
      res.status(404).send({message : "Review not found!"});
    }
  }
  else{
    res.status(404).send({message : "Book not found!"});
  }
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
