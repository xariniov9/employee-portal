#EMPLOYEE PORTAL

![screenshot](https://github.com/xariniov9/employee-portal/blob/master/employee-portal-home-page.png)


This project is made using POSTGRESQL, REACT, NODE and EXPRESS.

## STRUCTURE

In the project directory, there are two folders:

### employee-portal-app

This is the react app used for the frontend. 

`npm install` when run in this directory installs all the required dependencies.

`npm run start` Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.
The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### node-api-server

This is the backend server written using node and express.

`npm install` when run in this directory installs all the required dependencies.

`node index.js` will start the development server.

If you make any changes in this directory, please re run the server.

### SETUP

Install and setup postgre sql.

Create a database with name `employeeportal`

Run the commands in the DDLscript.sql file on the created database.

Create user `epdba` with password `Passw0rd` and give all the permissions and access to the `employeeportal` database 
