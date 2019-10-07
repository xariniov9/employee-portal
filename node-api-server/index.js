const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 3001
const db = require('./queries')

const Auth = require('./authmiddleware')

app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

app.get('/', (request, response) => {
  response.json({ info: 'Node.js, Express, and Postgres API' })
})

app.post('/searchEmployees', db.searchEmployees)
app.post('/createIssue', db.createIssue)
app.post('/auth', db.authorizeUser)
app.post('/users', db.createUser)
app.post('/getIssueHistoryByIssueId',db.getIssueHistoryByIssueId)
app.post('/getAllIssuesByEmployeeId', db.getAllIssuesByEmployeeId)
app.get('/getAllDepartments', db.getAllDepartments)
app.post('/getUserByEmailId', db.getUserByEmailId)
app.listen(port, () => {
  console.log(`App running on port ${port}.`)
})
