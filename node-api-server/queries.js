const Pool = require('pg').Pool
const pool = new Pool({
  user: 'epdba',
  host: 'localhost',
  database: 'employeeportal',
  password: 'Passw0rd'
})
const jwt = require('jsonwebtoken');
const uuidv4 = require('uuid/v4');
const Helper = require('./helpers.js');

  /**
   * Login
   * @param {object} req 
   * @param {object} res
   * @returns {object} user object 
   */

const authorizeUser = (req, res) => {
	if (!req.body.Email || !req.body.Password) {
      return res.status(400).send({'message': 'Some values are missing'});
    }
    if (!Helper.isValidEmail(req.body.Email)) {
      return res.status(400).send({ 'message': 'Please enter a valid email address' });
    }
	const queryText = 'SELECT * FROM Users INNER JOIN Employees ON Users.employeeid = Employees.employeeid WHERE Employees.email = $1::text';

	pool.query(queryText, [req.body.Email], (err, result) => {
		if (err) {
			console.error('Error authorizing user', err.stack);
		}
		if (!result.rows[0]) {
	      return res.status(400).send({'message': 'The credentials you provided is incorrect'});
	    }
	    if(!Helper.comparePassword(result.rows[0].password, req.body.Password)) {
	      return res.status(400).send({ 'message': 'The credentials you provided is incorrect' });
	    }
		const user = Helper.getCleanUser(result.rows[0]);
		console.log(result.rows[0]);
		const token = Helper.generateToken(result.rows[0]);
      	return res.status(200).send({user: user, token: token });
	})
}

const authWithToken = (req, res) => {
	const token = req.headers['x-access-token'] || req.body.token;
	console.log(token);
    if(!token) {
      return res.status(400).send({ 'message': 'Token is not provided' });
    }
    try {
      jwt.verify(token, "justanotherrandomsecretkey", (err, decoded) => {
      	  const text = 'SELECT * FROM users WHERE userid = $1';
	      console.log(decoded);
	      pool.query(text, [decoded.userId], (err, result) => {
	      	if(!result.rows[0]) {
	 	       return res.status(400).send({ 'message': 'The token you provided is invalid' });  		
	      	}
	        return res.status(200).send({user: decoded, token: token });
	      });
      })
    }
	catch(error) {
      return res.status(400).send(error);
    }
}


const searchEmployees = (request, response) => {
	const queryText = `SELECT * 
    FROM Employees
    WHERE
	    ($1::text IS NOT NULL AND  FirstName LIKE $7) OR
	    ($2::text IS NOT NULL AND  LastName LIKE $8) OR
	    ($3::text IS NOT NULL AND  Email LIKE $9) OR
   	    ($6::int IS NOT NULL AND  DepartmentId = $6::int) OR
	    ($4::timestamp(3) IS NOT NULL AND  DateOfJoining >= ($4::timestamp(3)) ) OR
	    ($5::timestamp(3) IS NOT NULL AND  DateOfJoining <= ($5)::timestamp(3))`;
    pool.query(queryText, [request.body.FirstName, request.body.LastName, request.body.Email, request.body.BeginDate, request.body.EndDate, request.body.DepartmentId, '%'+request.body.FirstName+'%', '%'+request.body.LastName+'%', '%'+request.body.Email+'%'], (err, result) => {
    	if (err) {
			console.error('Error searching employee', err.stack)
		}
		response.status(200).json(result.rows);
    })
}

const getIssueHistoryByIssueId = (request, response) => {
	const queryText = `SELECT DISTINCT IH.*, COALESCE(E.FirstName || ' ' || E.LastName, 'NONE') AS AssignedToName
	   FROM IssueHistories IH
	   LEFT JOIN Employees E
	         ON  IH.AssignedTo = E.EmployeeId
	   WHERE IssueId = $1
	   ORDER BY ModifiedOn DESC, IssueHistoryId;`
	   console.log(request.userauth);
   	pool.query(queryText, [request.body.IssueId], (error, result) => {
   		if(error) {
   			throw error;
   		}
		response.status(200).json(result.rows)
   	})
} 

const createUser = (request, response) => {
  if (!request.body.Email || !request.body.Password) {
      return response.status(400).send({'message': 'Some values are missing'});
  }
  if (!Helper.isValidEmail(request.body.Email)) {
    return response.status(400).send({ 'message': 'Please enter a valid email address' });
  }

  const shouldAbort = err => {
    if (err) {
      console.error('Error in transaction', err.stack)
      pool.query('ROLLBACK', err => {
        if (err) {
          console.error('Error rolling back client', err.stack)
        }
      })
    }
    return !!err
  }

  pool.query('BEGIN', err => {
  	if (shouldAbort(err)) return;
  	const depttname = request.body.DepartmentName;
	const queryText1 = 'INSERT INTO Employees(FirstName,LastName,Email,DateOfJoining,TerminationDate,DepartmentId) VALUES($1,$2,$3,$4,$5,(SELECT DepartmentId from Departments WHERE DepartmentName = $6))';
	const queryText2 = 'INSERT INTO Users(EmployeeId,Password,IsAdmin) VALUES((SELECT EmployeeId from Employees WHERE Email = $1),$2,$3)';
	pool.query(queryText1, [request.body.FirstName,request.body.LastName,request.body.Email,request.body.DateOfJoining,request.body.TerminationDate,request.body.DepartmentName], (err, res) => {
		if(shouldAbort(err)) return;	
		pool.query(queryText2, [request.body.Email, request.body.Password, request.body.IsAdmin], (err, res) => {
			if(shouldAbort(err)) return;
			const result = res.rows;
			pool.query('COMMIT', err => {
				if(err) {
					console.error('Error adding user', err.stack)
				}
				else {
					response.status(200).json(result);
				}
			})
		})
	})
  })
}

const createIssue = (request, response) => {
  const shouldAbort = err => {
    if (err) {
      console.error('Error in transaction', err.stack)
      pool.query('ROLLBACK', err => {
        if (err) {
          console.error('Error rolling back client', err.stack)
        }
      })
    }
    return !!err
  }

  pool.query('BEGIN', err => {
  	if (shouldAbort(err)) return;
	const queryText1 = 'INSERT INTO Issues(Title,Description,PostedBy,Priority,IsActive) VALUES($1, $2, $3, $4, true)';
	const queryText2 = "INSERT INTO IssueHistories(IssueId,Comments,ModifiedBy,ModifiedOn,AssignedTo,Status) VALUES((SELECT currval('Issues_seq')),null,$1,now(),null,1);";

	pool.query(queryText1, [request.body.Title,request.body.Description,request.body.PostedBy,request.body.Priority], (err, res) => {
		if(shouldAbort(err)) return;	

		pool.query(queryText2, [request.body.PostedBy], (err, res) => {
			if(shouldAbort(err)) return;
			pool.query('COMMIT', err => {
				if(err) {
					console.error('Error adding issue', err.stack)
				}
				else {
					response.status(200).json(res.rows);
				}
			})
		})
	})
  })
}

const getAllIssuesByEmployeeId = (request, response) => {
	const queryText = `WITH CTE AS
	(
		SELECT I.IssueId, I.Title, I.Priority, I.PostedBy, I.Description, I.IsActive, IH.AssignedTo, IH.Status,
		DENSE_RANK() OVER (PARTITION BY IH.IssueId ORDER BY IH.IssueHistoryId DESC) AS Position
		FROM Issues I
		JOIN IssueHistories IH
				ON I.IssueId=IH.IssueId 
		WHERE ($1=0 OR I.PostedBy = $1::int) AND I.IsActive = true
	)
	SELECT CTE.IssueId,CTE.Title, CTE.Priority, CTE.PostedBy, CTE.Description, CTE.AssignedTo, CTE.Status, CTE.IsActive,
			  PBy.FirstName || ' ' || PBy.LastName AS PostedByName, COALESCE(ATo.FirstName || ' ' || ATo.LastName, 'NONE') AS AssignedToName
	FROM CTE
	JOIN Employees PBy
		   ON CTE.PostedBy = PBy.EmployeeId
	LEFT JOIN Employees ATo
		   ON CTE.AssignedTo = ATo.EmployeeId
	WHERE Position = 1;`
	pool.query(queryText, [request.body.EmployeeId], (err, res) => {
		if(err) {
			throw err;
		}
		response.status(200).json(res.rows);
	})	
}

const getAllDepartments = (request, response) => {
	const queryText = 'SELECT * from Departments';
	pool.query(queryText, [], (err, res) => {
		if(err) {
			throw err;
		}
		response.status(200).json(res.rows);
	})
}

const getUserByEmailId = (request, response) => {
	const queryText = 'SELECT Users.userId, Users.employeeid, Users.isAdmin FROM Users INNER JOIN Employees ON Users.employeeid = Employees.employeeid WHERE Employees.email = $1::text';
	pool.query(queryText, [request.body.EmailId], (err, res) => {
		if(err) {
			throw err;
		}
		response.status(200).json(res.rows);
	})
}

const getAllNotices = (request, response) => {
	const queryText = 'SELECT Notices.*, Employees.FirstName, Employees.LastName from Notices INNER JOIN Employees ON Employees.EmployeeId = Notices.PostedBy WHERE IsActive = true';
	pool.query(queryText, [], (err, res) => {
		if(err) {
			throw err;
		}
		response.status(200).json(res.rows);		
	})
}

const publishNotice = (request, response) => {
	if(!request.userauth || !request.userauth.isAdmin) {
		response.status(400).send('Not Authorized!');
	}
	const queryText = 'INSERT INTO Notices(Title, Description, PostedBy, StartDate, ExpirationDate, IsActive) VALUES ($1, $2, $3, $4, $5, true)';
	pool.query(queryText, [request.body.Title, request.body.Description, empId, request.body.StartDate, request.body.ExpirationDate], (err, result) => {
		if(err) {
			throw err;
		}
		response.status(200).json(result.rows);		
	})
}

const deleteNotice = (request, response) => {
	if(!request.userauth || !request.userauth.isAdmin) {
		response.status(400).send('Not Authorized!');
	}
	const queryText = 'UPDATE Notices SET IsActive = false WHERE NoticeId = $';
	pool.query(queryText, [request.body.NoticeId], (err, res) => {
		if(err) {
			throw err;
		}
		response.status(200).json({deleted: true});
	})
}

module.exports = {
  createUser,
  authorizeUser,
  searchEmployees,
  createIssue,
  getIssueHistoryByIssueId,
  getAllIssuesByEmployeeId,
  getAllDepartments,
  getUserByEmailId,
  authWithToken,
  publishNotice,
  getAllNotices,
  deleteNotice
}