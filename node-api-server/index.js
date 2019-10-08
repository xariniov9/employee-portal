const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 3001
const db = require('./queries')
var cors = require('cors');
const Auth = require('./authmiddleware')

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', 'example.com');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
}


app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)
app.use(allowCrossDomain);

app.get('/', (request, response) => {
  response.json({ info: 'Node.js, Express, and Postgres API' })
})

app.post('/api/searchEmployees', db.searchEmployees)
app.post('/api/createIssue', db.createIssue)
app.post('/api/auth', db.authorizeUser)
app.post('/api/authWithToken', db.authWithToken)
app.post('/api/users', db.createUser)
app.post('/api/getIssueHistoryByIssueId',db.getIssueHistoryByIssueId)
app.post('/api/getAllIssuesByEmployeeId', db.getAllIssuesByEmployeeId)
app.get('/api/getAllDepartments', db.getAllDepartments)
app.post('/api/getUserByEmailId', db.getUserByEmailId)
app.post('/api/publishNotice', Auth.verifyToken, db.publishNotice);
app.get('/api/getAllNotices', Auth.verifyToken, db.getAllNotices);
app.get('/api/deleteNotice', Auth.verifyToken, db.deleteNotice);

app.listen(port, () => {
  console.log(`App running on port ${port}.`)
})
	