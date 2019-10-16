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

app.post('/api/searchEmployees', Auth.verifyToken, db.searchEmployees)
app.post('/api/createIssue', Auth.verifyToken, db.createIssue)
app.post('/api/auth', db.authorizeUser)
app.post('/api/authWithToken', db.authWithToken)
app.post('/api/users', Auth.verifyAdminToken, db.createUser)
app.post('/api/getIssueHistoryByIssueId', Auth.verifyToken, db.getIssueHistoryByIssueId)
app.post('/api/getAllIssuesByEmployeeId', Auth.verifyToken, db.getAllIssuesByEmployeeId)
app.post('/api/getAllDepartments', Auth.verifyToken, db.getAllDepartments)
app.post('/api/getUserByEmailId', Auth.verifyToken, db.getUserByEmailId)
app.post('/api/publishNotice', Auth.verifyAdminToken, db.publishNotice);
app.post('/api/getAllNotices', Auth.verifyToken, db.getAllNotices);
app.post('/api/deleteNotice', Auth.verifyAdminToken, db.deleteNotice);
app.post('/api/updateProfile', Auth.verifyToken, db.updateProfile);
app.post('/api/updateNotice', Auth.verifyAdminToken, db.updateNotice);

app.listen(port, () => {
  console.log(`App running on port ${port}.`)
})
	