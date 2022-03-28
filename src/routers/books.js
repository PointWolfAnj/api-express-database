const express = require('express')

const booksRouter = express.Router()

/*Required our database - this db variable 
is actually a "Client" object from the 
node postgres library: https://node-postgres.com/api/client */

const db = require('../utils/database')

//GET /books - getting all books from the database

booksRouter.get('/', (req, res) => {

  //The SQL Query we want to run

  const selectAllBooksQuery = "SELECT * FROM books"

  /*Using the query method to send a SQL query
  to the database. This is asynchronous - so
  we use our "then" callbacks to handle the
  response */

  db.query(selectAllBooksQuery)
    .then(databaseResult => {
    
      console.log(databaseResult)
      // Send back the rows we got from the query to the client

      res.json({ books: databaseResult.rows })
    })

    /* If there is a database error, the callback
    we provide to catch will be called. In this
    case we want to send the client a 500 (server error)
    and log out the message */

    .catch(error => {
      res.status(500)
      res.json({error: 'unexpected Error'})
      console.log(error) 
    })
})

//GET /books/:id - loads a single book by id
booksRouter.get('/:id', (req, res) => {

  /*The query we want to run - in this case the id of the book we 
  are looking for will come from the request URL. We don't want
  to add it to the query directly, instead we use $1 as a place 
  holder */

  const selectSingleBookQuery = "SELECT * FROM books WHERE id = $1"

  /*Create an array of values to use instead of the placeholders
  in the above query. When the database runs the query, it will
  replace the $ placeholders with the values from this array.
  
  $1 will be replaced by the first value in the array
  $2 (if we had one for this query) would be replaced by 
  the second value in the array
  $3 by the third, etc. */ 
  const queryValues = [
    req.params.id //$1 = book id
  ]

  //Run the query, passing our query values as a second argument to db.query
  db.query(selectSingleBookQuery, queryValues)
    .then(function(databaseResult) {
      //If we book was not found, return a 404

      if(databaseResult.rowCount===0) {
        res.status(404)
        res.json({error: 'book does not exist'})
      } else {
        //If the book was found, return it

        res.json({book: databaseResult.rows[0]})
      }
    })
    .catch(error => {
      res.status(500)
      res.json({error: 'unexpected Error'})
      console.log(error)
    })
})

//POST /books - Adds a new book
booksRouter.post('/', (req, res) => {

  /*The query we want to run - in this case we want to do an
  INSERT to add a new book to the database. The values we
  are inserting will come from the request body so we'll use
  the $ placeholder values again. In this case we have 6 of them!
  
  RETURNING * tells postgres we want it to return the newly added
  book to us as the query response (by default, an INSERT will )
  return nothing. This allows us to send the book back to the 
  client in the API response */

  const insertBooksQuery = `
    INSERT INTO books(
      title, 
      type, 
      author,
      topic, 
      publicationDate, 
      pages)
    VALUES($1, $2, $3, $4, $5, $6)
RETURNING *`

  //The values we want to use in place of the $ placeholders above in the INSERT query.
  const bookValues = [
    req.body.title, //$1 = title
    req.body.type,  //$2 = type
    req.body.author,//$3 = author
    req.body.topic,//$4 = topic
    req.body.publicationDate, //$5 = publicationDate
    req.body.pages ///$6 = pages
  ]

  /* Run the query passing in the values we want to use 
  instead of the placeholders as the second argument */
  db.query(insertBooksQuery, bookValues)
    .then(databaseResult => {
      console.log(databaseResult)
      res.json({book: databaseResult.rows[0]})
    })
    .catch(error => {
      console.log(error)
      res.status(500)
      res.json({error:'unexpected error'})
    })
})

module.exports = booksRouter

