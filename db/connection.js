const mysql = require('mysql2');
const util = require("util"); 

const connection = mysql.createConnection({
    port: 3306,
    host: 'localhost',
    // Your MySQL username,
    user: 'root',
    // Replace with your MySQL password
    password: 'Please put your SQL password here',
    database: 'employee_db'
});

connection.query = util.promisify(connection.query); 
connection.connect();



module.exports = connection;