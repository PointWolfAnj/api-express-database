const express = require('express');
const petsRouter = express.Router()
const db = require('../utils/database')

petsRouter.get('/', (req, res) => {

  console.log('limit', req.query.limit)
  console.log('offset', req.query.offset)

  let limit = req.query.limit === undefined ? 20 : req.query.limit
  let offset = req.query.offset === undefined ? null : req.query.offset

  const dbData = `SELECT * FROM pets LIMIT ${limit} OFFSET ${offset}`
  db.query(dbData)
    .then(dbres => {
      res.json({ data: dbres.rows })
    })
    .catch(err => {
      res.status(404)
      res.json({ error: 'unexpected Error' })
    })
})

petsRouter.get('/:id', (req, res) => {
  const dbData = 'SELECT * FROM pets WHERE id = $1'
  const queryValues = [req.params.id]
  db.query(dbData, queryValues)
    .then(dbResult => {
      if (dbResult.rowCount === 0) {
        res.status(500)
        res.json({ error: 'unexpected' })
      } else {
        res.json({ pet: dbResult.rows[0] })
      }
    })
    .catch(err => {
      res.status(500)
      res.json({ error: 'unexpected error' })
    })
})

petsRouter.post('/', (req, res) => {
  const dbData = `INSERT INTO pets
(name, age, type, breed, microchip)
VALUES($1, $2, $3, $4, $5)
RETURNING *`
  const { name, age, type, breed, microchip } = req.body
  const queryValues = [name, age, type, breed, microchip]

  db.query(dbData, queryValues)
    .then(dbResult => {
      res.json({ pet: dbResult.rows[0] })
    })
    .catch(err => {
      res.status(404)
      res.json({ error: 'unexpected error' })
    })
})

module.exports = petsRouter