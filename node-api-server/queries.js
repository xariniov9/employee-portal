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

const isEmptyOrNull = (str) => {
	return (!str || str.length === 0 || !str.trim());
}

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
			return res.status(400).send({ 'message': 'Error occured' });
		}
		if (result && !result.rows[0]) {
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
	const queryText = `SELECT Employees.*, Departments.DepartmentName
    FROM Employees INNER JOIN Departments ON Employees.DepartmentId = Departments.DepartmentId
    WHERE
	    ($1::text IS NOT NULL AND  FirstName LIKE $7) OR
	    ($2::text IS NOT NULL AND  LastName LIKE $8) OR
	    ($3::text IS NOT NULL AND  Email LIKE $9) OR
   	    ($6::int IS NOT NULL AND  Employees.DepartmentId = $6::int) OR
	    ($4::timestamp(3) IS NOT NULL AND  DateOfJoining >= ($4::timestamp(3)) ) OR
	    ($5::timestamp(3) IS NOT NULL AND  DateOfJoining <= ($5)::timestamp(3))`;

	const queryText1 = 'SELECT DepartmentId from Departments WHERE DepartmentName = $1';
	if(!isEmptyOrNull(request.body.DepartmentName) ) {
		pool.query(queryText1, [request.body.DepartmentName], (err, result) => {
			if(err || !result.rows[0]	) {
				return response.status(400).send({ 'message': 'Error occured' });
			} else {
				const deptId = result.rows[0].departmentid;
				const StartDate = !isEmptyOrNull(request.body.StartDate) ? request.body.StartDate : null;
				const EndDate = !isEmptyOrNull(request.body.EndDate) ? request.body.EndDate : null;
				const FirstName = !isEmptyOrNull(request.body.FirstName) ? request.body.FirstName : null;
				const LastName =  !isEmptyOrNull(request.body.LastName) ? request.body.LastName : null;
				const Email = !isEmptyOrNull(request.body.Email) ? request.body.Email : null;

				pool.query(queryText, [FirstName, LastName, Email, StartDate, EndDate, deptId, '%'+FirstName+'%', '%'+LastName+'%', '%'+Email+'%'], (err, result) => {
			    	if (err) {
						console.error('Error searching employee', err.stack)
						return response.status(400).send({ 'message': 'Error occured' });
					}
					return response.status(200).json(result.rows);
		    	})	
			}
		});
	} else {
		const deptId = null;
		const StartDate = !isEmptyOrNull(request.body.StartDate) ? request.body.StartDate : null;
		const EndDate = !isEmptyOrNull(request.body.EndDate) ? request.body.EndDate : null;
		const FirstName = !isEmptyOrNull(request.body.FirstName) ? request.body.FirstName : null;
		const LastName =  !isEmptyOrNull(request.body.LastName) ? request.body.LastName : null;
		const Email = !isEmptyOrNull(request.body.Email) ? request.body.Email : null;

		pool.query(queryText, [FirstName, LastName, Email, StartDate, EndDate, deptId, '%'+FirstName+'%', '%'+LastName+'%', '%'+Email+'%'], (err, result) => {
	    	if (err) {
				console.error('Error searching employee', err.stack)
				return response.status(400).send({ 'message': 'Error occured' });
			}
			return response.status(200).json(result.rows);
    	})
	}

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
			return res.status(400).send({ 'message': 'Error occured' });
   		}
		response.status(200).json(result.rows)
   	})
} 

const createUser = (request, response) => {
  console.log("Creating Employee by " + request.userauth)
  if (!request.body.Email || !request.body.Password) {
  	  console.log("Email or Password missing");
      return response.status(400).send({'message': 'Some values are missing'});
  }
  if (!Helper.isValidEmail(request.body.Email)) {
  	console.log("Email is invalid")
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
  	console.log("Inside Begin");	
  	if (shouldAbort(err)) return;
  	const depttname = request.body.DepartmentName;
	const queryText1 = 'INSERT INTO Employees(FirstName,LastName,Email,DateOfJoining,TerminationDate,DepartmentId) VALUES($1,$2,$3,$4,$5,(SELECT DepartmentId from Departments WHERE DepartmentName = $6))';
	const queryText2 = 'INSERT INTO Users(EmployeeId,Password,IsAdmin) VALUES((SELECT EmployeeId from Employees WHERE Email = $1),$2,$3)';
	pool.query(queryText1, [request.body.FirstName,request.body.LastName,request.body.Email,request.body.DateOfJoining,null,request.body.DepartmentName], (err, res) => {
		console.log("Inside 1");
		if(shouldAbort(err)) return;	
		pool.query(queryText2, [request.body.Email, request.body.Password, request.body.IsAdmin], (err, res) => {
			console.log("Inside 2");
			if(shouldAbort(err)) return;
			const result = res.rows;
			pool.query('COMMIT', err => {
				console.log("INSIDE COMMIT");
				if(err) {
					console.error('Error adding user', err.stack)
					return res.status(400).send({ 'message': 'Error occured' });
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

	pool.query(queryText1, [request.body.Title,request.body.Description,request.userauth.employeeId,request.body.Priority], (err, res) => {
		if(shouldAbort(err)) return;	

		pool.query(queryText2, [request.userauth.employeeId], (err, res) => {
			if(shouldAbort(err)) return;
			pool.query('COMMIT', err => {
				if(err) {
					console.error('Error adding issue', err.stack)
					return res.status(400).send({ 'message': 'Error occured' });
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
	console.log("Issues by employee requested! " + request.body.EmployeeId);
	// ADD more checks to prevent fake requests and admin check!
	if(request.body.EmployeeId === '0' && request.userauth.isAdmin === false) {
		return res.status(400).send({ 'message': 'Not Authorised!' });
	}
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
			return res.status(400).send({ 'message': 'Error occured' });
		}
		response.status(200).json(res.rows);
	})	
}

const getAllDepartments = (request, response) => {
	const queryText = 'SELECT * from Departments';
	pool.query(queryText, [], (err, res) => {
		if(err) {
			return res.status(400).send({ 'message': 'Error occured' });
		}
		response.status(200).json(res.rows);
	})
}

const getUserByEmailId = (request, response) => {
	const queryText = 'SELECT Users.userId, Users.employeeid, Users.isAdmin FROM Users INNER JOIN Employees ON Users.employeeid = Employees.employeeid WHERE Employees.email = $1::text';
	pool.query(queryText, [request.body.EmailId], (err, res) => {
		if(err) {
			return res.status(400).send({ 'message': 'Error occured' });
		}
		response.status(200).json(res.rows);
	})
}

const getAllNotices = (request, response) => {
	const queryText = 'SELECT Notices.*, Employees.FirstName, Employees.LastName from Notices INNER JOIN Employees ON Employees.EmployeeId = Notices.PostedBy WHERE IsActive = true';
	pool.query(queryText, [], (err, res) => {
		if(err) {
			return res.status(400).send({ 'message': 'Error occured' });
		}
		response.status(200).json(res.rows);		
	})
}

const publishNotice = (request, response) => {
	if(!request.userauth || request.userauth.isAdmin === false) {
		response.status(400).send({message : 'Not Authorized!'});
		console.log("Unauthorized");
	} else {
		const empId = request.userauth.employeeId;
		console.log(request.userauth);
		const queryText = 'INSERT INTO Notices(Title, Description, PostedBy, StartDate, ExpirationDate, IsActive) VALUES ($1, $2, $3, $4, $5, true)';
		console.log(request.body.Title+ request.body.Description + empId + request.body.StartDate + request.body.ExpirationDate);
		pool.query(queryText, [request.body.Title, request.body.Description, empId, request.body.StartDate, request.body.ExpirationDate], (err, result) => {
			if(err) {
			return response.status(400).send({ 'message': 'Error occured' });
			}
			response.status(200).json(result.rows);		
		})		
	}
}

const deleteNotice = (request, response) => {
	if(!request.userauth || !request.userauth.isAdmin) {
		response.status(400).send( {message : 'Not Authorized!'});
		console.log("Unauthorized");
	} else {
		const queryText = 'UPDATE Notices SET IsActive = false WHERE NoticeId = $1';
		pool.query(queryText, [request.body.NoticeId], (err, res) => {
			if(err) {
				return res.status(400).send({ 'message': 'Error occured' });
			}
			response.status(200).json({deleted: true});
		})
	}
}

const updateNotice = (request, response) => {
	console.log([request.body.Title, request.body.Description, request.body.StartDate, request.body.ExpirationDate, request.body.NoticeId]);
	console.log("inside update");
	if(!request.userauth || !request.userauth.isAdmin) {
		response.status(400).send( {message : 'Not Authorized!'});
		console.log("Unauthorized");
	} else if ((isEmptyOrNull(request.body.Title)) || (isEmptyOrNull(request.body.Description))) {
		response.status(400).send( {message : 'Empty Parameters!'});
	} 
	else {
		const queryText = 'UPDATE Notices SET Title = $1, Description=$2, StartDate=$3, ExpirationDate=$4 WHERE NoticeId = $5';
		pool.query(queryText, [request.body.Title, request.body.Description, request.body.StartDate, request.body.ExpirationDate, request.body.NoticeId], (err, res) => {
			if(err) {
				return response.status(400).send({ 'message': 'Error occured' });
			}
			return response.status(200).json({editedNotice: true});
		})
	}	
}

const updateMyIssue = (request, response) => {
	console.log("Update issue requested!");
	console.log(request.body);
	if(!request.userauth) {
		response.status(400).send( {message : 'Not Authorized!'});
		console.log("Unauthorized");
	}
	else {
		const queryText = 'UPDATE Issues SET Title = $1, Description=$2, Priority=$3 WHERE IssueId = $4 AND PostedBy = $5';
		//Add check this issue belongs to this user!
		pool.query(queryText, [request.body.Title, request.body.Description, request.body.Priority, request.body.IssueId, request.userauth.employeeId], (err, res) => {
			if(err) {
				return response.status(400).send({ 'message': 'Error occured' });
			}
			return response.status(200).json({editedIssue: true});
		})
	}	
}

const updateProfile = (request, response) => {
	if(!request.userauth) {
		console.log("Unauthorized");
		return	response.status(400).send( {message : 'Not Authorized!'});
	}
	const queryText = 'UPDATE Employees SET FirstName = $1, LastName=$2, DepartmentId=$3 WHERE EmployeeId = request.userauth.employeeId';
	const queryText2 = 'UPDATE Users SET Password = $1 WHERE userId = $2 AND Password = $3';

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
	const queryText1 = 'UPDATE Employees SET FirstName = $1, LastName=$2 WHERE EmployeeId = $3';
	const queryText2 = 'UPDATE Users SET Password = $1 WHERE userId = $2 AND Password = $3';

	pool.query(queryText1, [request.body.FirstName,request.body.LastName, request.userauth.employeeId], (err, res) => {
		if(shouldAbort(err)) return;	
		if(!request.body.OldPassword || !request.body.NewPassword || request.body.NewPassword !== request.body.ConfirmPassword) {
			pool.query('COMMIT', err => {
				if(err) {
					console.error('Error updating profile', err.stack)
					return res.status(400).send({ 'message': 'Error occured' });
				}
				else {
					return response.status(200).json({'message' : 'Updated'});
				}
			})
		} else {
			pool.query(queryText2, [request.body.NewPassword, request.userauth.userId, request.body.OldPassword], (err, res) => {
				if(shouldAbort(err)) return;
				pool.query('COMMIT', err => {
					if(err) {
						console.error('Error updating profile', err.stack)
						return res.status(400).send({ 'message': 'Error occured' });
					}
					else {
						return response.status(200).json({'message' : 'Updated'});
					}
				})
			})
		}
	})
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
  deleteNotice,
  updateNotice,
  updateProfile,
  updateMyIssue
}