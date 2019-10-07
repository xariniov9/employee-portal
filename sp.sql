CREATE OR REPLACE FUNCTION CreateEmployee ( 
	p_FirstName text, 
	p_LastName text,
	p_Email text,
	p_DateOfJoining text,
	p_Department int,
	p_Password text,
	p_IsAdmin boolean,
	p_Id int ) RETURNS VOID
AS $$
BEGIN
		INSERT INTO Employees(FirstName,LastName,Email,DateOfJoining,TerminationDate,DepartmentId)
		VALUES(p_FirstName,p_LastName,p_Email,p_DateOfJoining,NULL,p_Department);


		INSERT INTO Users(EmployeeId,Password,IsAdmin)
		VALUES(SCOPE_IDENTITY(),p_Password,p_IsAdmin);

		p_Id := SCOPE_IDENTITY();
	
	COMMIT; 
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION CreateIssue ( 
	p_Title text, 
	p_Description text,
	p_PostedBy int,
	p_Priority int,
	p_Id int ) RETURNS VOID
AS $$
BEGIN
		INSERT INTO Issues(Title,Description,PostedBy,Priority,IsActive)
		VALUES(p_Title,p_Description,p_PostedBy,p_Priority,1);

		p_Id := SCOPE_IDENTITY();

		INSERT INTO IssueHistories(IssueId,Comments,ModifiedBy,ModifiedOn,AssignedTo,Status)
		VALUES(SCOPE_IDENTITY(),null,p_PostedBy,NOW(),null,1);
		 
	 COMMIT; 
END
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION GetAllIssuesByEmployeeId (
	p_EmpId INT) RETURNS refcursor
AS $$
DECLARE
 ref refcursor;
BEGIN
	OPEN ref FOR WITH CTE AS
	(
		SELECT I.IssueId, I.Title, I.Priority, I.PostedBy, I.Description, I.IsActive, IH.AssignedTo, IH.Status,
		DENSE_RANK() OVER (PARTITION BY IH.IssueId ORDER BY IH.IssueHistoryId DESC) AS Position
		FROM Issues I
		JOIN IssueHistories IH
				ON I.IssueId=IH.IssueId 
		WHERE (p_EmpId IS NULL OR I.PostedBy = p_EmpId) AND I.IsActive = true
	)
	SELECT CTE.IssueId,CTE.Title, CTE.Priority, CTE.PostedBy, CTE.Description, CTE.AssignedTo, CTE.Status, CTE.IsActive,
			  PBy.FirstName || ' ' || PBy.LastName AS PostedByName, COALESCE(ATo.FirstName || ' ' || ATo.LastName, 'NONE') AS AssignedToName
	FROM CTE
	JOIN Employees PBy
		   ON CTE.PostedBy = PBy.EmployeeId
	LEFT JOIN Employees ATo
		   ON CTE.AssignedTo = ATo.EmployeeId
	WHERE Position = 1;
	RETURN ref;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION GetIssueHistoryByIssueId (
	p_IssueId INT) RETURNS refcursor
AS $$
DECLARE
	ref refcursor;
BEGIN
	OPEN ref FOR SELECT DISTINCT IH.*, COALESCE(E.FirstName || ' ' || E.LastName, 'NONE') AS AssignedToName
       FROM IssueHistories IH
       LEFT JOIN dbo.Employees E
             ON  IH.AssignedTo = E.EmployeeId
       WHERE IssueId = p_IssueId
       ORDER BY ModifiedOn DESC, IssueHistoryId;
		RETURN ref;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION SearchEmployee ( 
	-- Add the parameters for the stored procedure here
	p_FirstName text, 
	p_LastName text,
	p_Email text,
	p_BeginDate timestamp(3),
	p_EndDate timestamp(3),
	p_Department int,
	p_checkTerminationDate boolean) RETURNS refcursor
AS $$
DECLARE 
	ref refcursor;
BEGIN
	OPEN ref FOR SELECT * 
    FROM Employees
    WHERE
    (
	    (p_FirstName IS NOT NULL AND  FirstName LIKE '%' + p_FirstName || '%') OR
	    (p_LastName IS NOT NULL AND  LastName LIKE '%' + p_LastName || '%') OR
	    (p_Email IS NOT NULL AND  Email LIKE '%' || p_Email || '%') OR
	    (p_BeginDate IS NOT NULL AND  DateOfJoining >= p_BeginDate ) OR
	    (p_EndDate IS NOT NULL AND  DateOfJoining <= p_EndDate) OR
	    (p_Department IS NOT NULL AND  DepartmentId = p_Department) AND
		(p_checkTerminationDate = 0 OR TerminationDate IS NULL )
    );
    RETURN ref;
END;
$$ LANGUAGE plpgsql;

