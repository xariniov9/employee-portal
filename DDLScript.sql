 

CREATE SEQUENCE Departments_seq;

CREATE TABLE Departments(
	DepartmentId int DEFAULT NEXTVAL ('Departments_seq') NOT NULL,
	DepartmentName Varchar(100) NOT NULL,
PRIMARY KEY 
(
	DepartmentId
) 
);


CREATE SEQUENCE Employees_seq;

CREATE TABLE Employees(
	EmployeeId int DEFAULT NEXTVAL ('Employees_seq') NOT NULL,
	FirstName Varchar(50) NOT NULL,
	LastName Varchar(50) NOT NULL,
	Email Varchar(100) NOT NULL,
	DateOfJoining date NOT NULL,
	TerminationDate date NULL,
	DepartmentId int NOT NULL,
PRIMARY KEY 
(
	EmployeeId
) 
);


CREATE SEQUENCE Users_seq;

CREATE TABLE Users(
	UserId int DEFAULT NEXTVAL ('Users_seq') NOT NULL,
	EmployeeId int NOT NULL,
	Password Varchar(20) NOT NULL,
	IsAdmin Boolean NOT NULL,
PRIMARY KEY 
(
	UserId
) 
);


CREATE SEQUENCE Issues_seq;

CREATE TABLE Issues(
	IssueId int DEFAULT NEXTVAL ('Issues_seq') NOT NULL,
	Title Varchar(100) NOT NULL,
	Description Varchar(500) NOT NULL,
	PostedBy int NOT NULL,
	Priority int NOT NULL,
	IsActive Boolean NOT NULL,
PRIMARY KEY 
(
	IssueId
) 
);


CREATE SEQUENCE IssueHistories_seq;

CREATE TABLE IssueHistories(
	IssueHistoryId int DEFAULT NEXTVAL ('IssueHistories_seq') NOT NULL,
	IssueId int NOT NULL,
	Comments Varchar(500) NULL,
	ModifiedBy int NOT NULL,
	ModifiedOn date NOT NULL,
	AssignedTo int NULL,
	Status int NOT NULL,
PRIMARY KEY 
(
	IssueHistoryId
) 
);


CREATE SEQUENCE Notices_seq;

CREATE TABLE Notices(
	NoticeId int DEFAULT NEXTVAL ('Notices_seq') NOT NULL,
	Title Varchar(100) NOT NULL,
	Description Varchar(500) NOT NULL,
	PostedBy int NOT NULL,
	StartDate date NOT NULL,
	ExpirationDate date NOT NULL,
	IsActive Boolean NOT NULL,
PRIMARY KEY 
(
	NoticeId
) 
);


ALTER TABLE Employees ADD CONSTRAINT constraint_emp_fk FOREIGN KEY(DepartmentId)
REFERENCES Departments(DepartmentId);


ALTER TABLE Users  ADD CONSTRAINT constraint_usr_fk FOREIGN KEY(EmployeeId)
REFERENCES Employees(EmployeeId);


ALTER TABLE Issues ADD CONSTRAINT constraint_issue_fk FOREIGN KEY(PostedBy)
REFERENCES Employees(EmployeeId);


ALTER TABLE IssueHistories ADD CONSTRAINT constraint_issue_fk FOREIGN KEY(IssueId)
REFERENCES Issues(IssueId);


ALTER TABLE IssueHistories  ADD CONSTRAINT constraint_issueassigned_fk FOREIGN KEY(AssignedTo)
REFERENCES Employees(EmployeeId);


ALTER TABLE IssueHistories ADD CONSTRAINT constraint_issuemodified_fk FOREIGN KEY(ModifiedBy)
REFERENCES Employees(EmployeeId);


ALTER TABLE Notices ADD CONSTRAINT constraint_noticeposted_fk FOREIGN KEY(PostedBy)
REFERENCES Employees(EmployeeId);


ALTER TABLE Departments ADD CONSTRAINT dept_unique UNIQUE (DepartmentName);


ALTER TABLE Employees ADD CONSTRAINT email_unique UNIQUE(Email);


ALTER TABLE Users ADD CONSTRAINT employee_unique UNIQUE(EmployeeId);


INSERT INTO Departments(DepartmentName)
  VALUES('Administration');
 

INSERT INTO Departments(DepartmentName)
  VALUES('Finance');
 

INSERT INTO Departments(DepartmentName)
  VALUES('HR');
 

INSERT INTO Departments(DepartmentName)
  VALUES('Engineering');
 

INSERT INTO Departments(DepartmentName)
  VALUES('IT');
 

INSERT INTO Departments(DepartmentName)
  VALUES('Marketing');
 

INSERT INTO Employees(FirstName,LastName,Email,DateOfJoining,TerminationDate,DepartmentId)
 VALUES('System','Admin','system.admin@himanshutiwari.com','1996-03-01','2100-01-01',(SELECT DepartmentId from Departments WHERE DepartmentName = 'Administration'));
 

INSERT INTO Users(EmployeeId,Password,IsAdmin)
  VALUES((SELECT EmployeeId from Employees WHERE Email = 'system.admin@himanshutiwari.com'),'admin',true);
  

