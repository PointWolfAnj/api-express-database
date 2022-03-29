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

petsRouter.get('/breeds', (req, res) => {
    let getBreedsRequest = `SELECT DISTINCT breed FROM pets`
    let query = []
  
    if(req.query.type) {
      getBreedsRequest += ` WHERE type = $1`
      query.push(req.query.type)
    }
  
    db
    .query(getBreedsRequest, query)
    .then(result => {
        res.json({breeds: result.rows})
    })
    .catch((error) => {
        res.status(500)
        res.json({error: "Unexpected Error"})
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

petsRouter.put("/:id", (req, res) => {
    const putSQL = 'UPDATE pets SET name = $1,  age = $2,  type = $3,  breed = $4,  microchip = $5 WHERE id = $6 RETURNING *'

    const petValues = [
      req.body.name,
      req.body.age,
      req.body.type,
      req.body.breed,
      req.body.microchip,
      req.params.id
  ]

    db.query(putSQL, petValues)
    .then(result => {
    res.json({pets: result.rows[0]})
   })
    .catch((error) => {
    res.status(500)
    res.json({error: "Unexpected Error"})
})
})

petsRouter.patch("/:id", (req, res) => {
  let patchSQL = 'UPDATE pets SET '
  const petFields = ["name", "age", "type", "breed", "microchip"]

  let petValues = []
  let counter = 1

  for (const field of petFields) {
    if(req.body[field]){
      patchSQL += `${field} = $${counter}, `
      counter++
      petValues.push(req.body[field])
  }  
  }

  patchSQL = patchSQL.substring(0, (patchSQL.length - 2))
  
  petValues.push(req.params.id)
  patchSQL += ` WHERE id = $${counter} RETURNING *`

  db.query(patchSQL, petValues)
  .then(results => res.json({pets: results.rows[0]}))
  .catch((error) => {
    res.status(500)
    res.json({error: "Unexpected Error"})
  })
 });

petsRouter.delete("/:id", (req, res) => {
 const deleteSQL = "DELETE FROM pets WHERE id = $1 RETURNING *"

 db.query(deleteSQL, [req.params.id])
 .then(results => res.json({pets: results.rows[0]}))
 .catch((error) => {
   res.status(500)
   res.json({error: "Unexpected Error"})
 })
});


module.exports = petsRouter