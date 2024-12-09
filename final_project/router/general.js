const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');


public_users.post("/register", (req,res) => {
  const username = req.body.username;
    const password = req.body.password;

    // Check if both username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (!isValid(username)) {
            // Add the new user to the users array
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(404).json({message: "User already exists!"});
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  //res.send(JSON.stringify(books,null,4));
  try{
  const response = await axios.get("https://api.example.com/books");
  res.json(response.data);
  }
  catch(error){
    res.status(500).json({message : "Error fetching books!",error});
  }
});

public_users.get2('/', function (req, res) {
axios.get("https://api.example.com/books")
.then((response) =>{
  res.json(response.data);
})
.catch((error) =>{
  res.status(500).json({message : "Error fetching books!",error});
})

});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = parseInt(req.params.isbn);
  const book = books[isbn];
  if(book)
    res.send(book);
  else
    res.status(404).send({message : "Book not found!"});
 });


 const fetchBookByISBN = async (isbn) => {
  return new Promise((resolve,reject) => {
    const book = books[isbn];
    if(book)
      resolve(book);
    else
      reject("Book not found");
  })
 }
 public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = parseInt(req.params.isbn);
  
  try{
    const book = await fetchBookByISBN(isbn);
    res.send(book);
  }
  catch(error){
    res.status(404).send({message : error});
  }
 });

 public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = parseInt(req.params.isbn);
  
  try{
    const response = await axios.get(`https://api.example.com/books/${isbn}`);
    if(response)
      res.send(response.data);
  }
  catch(error){
    res.status(404).send({message : "Book not found",error});
  }
 });

  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;
  let filtered_books = Object.values(books).filter((book) => book.author === author);
  if(filtered_books.length > 0)
    res.send(filtered_books);
  else
    res.status(404).send({message : "No books found for the given author"})
});

const fetchBookByAuthor = async (author) => {
  return new Promise((reject,resolve) => {
    let filtered_books = Object.values(books).filter((book) => book.author === author);
    if(filtered_books.length > 0)
      resolve(filtered_books);
    else
      reject( "No books found for the given author")
  })
}

public_users.get('/author/:author',async function (req, res) {
  const author = req.params.author;
 try{
  const result = await fetchBookByAuthor(author);
  res.send(result);
 }
 catch(error){
  res.send({message : error});
 }
});

public_users.get('/author/:author',async function (req, res) {
  const author = req.params.author;
 try{
  const response = await axios.get(`https://api.example.com/books/${author}`);
  res.send(response.data);
 }
 catch(error){
  res.send({message : error});
 }
});
// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;
  let filtered_books = Object.values(books).filter((book) => book.title === title);
  if(filtered_books.length > 0)
    res.send(filtered_books);
  else
    res.status(404).send({message : "No books found for the given title"})
});

const fetchBookByTitle = async (title) => {
  return new Promise((reject,resolve) => {
    let filtered_books = Object.values(books).filter((book) => book.title === title);
    if(filtered_books.length > 0)
      resolve(filtered_books);
    else
      reject( "No books found for the given title")
  })
}

public_users.get('/title/:title',async function (req, res) {
  const author = req.params.title;
 try{
  const result = await fetchBookByTitle(title);
  res.send(result);
 }
 catch(error){
  res.send({message : error});
 }
});

public_users.get('/title/:title',async function (req, res) {
  const title = req.params.title;
  await axios.get(`https://api.example.com/books/${title}`)
  .then((response) =>{
    res.json(response.data);
  })
  .catch((error) =>{
    res.status(500).json({message : "No books found with the provided title!",error});
  })
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = parseInt(req.params.isbn);
  const book = books[isbn];
  if(book)
    res.send(book.reviews);
  else
    res.status(404).send({message : "Book not found!"});
});

module.exports.general = public_users;
