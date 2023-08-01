const connection = require("./connection");

class dbQuery{
  constructor(connection) {
    this.connection = connection;
  }
  // Get, add, update employee
  getAllEmployees() {
    return this.connection.query( `SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department, r.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager
    FROM employee e
    LEFT JOIN role r
    ON e.role_id = r.id
    LEFT JOIN department d
    ON d.id = r.department_id
    LEFT JOIN employee m
    ON m.id = e.manager_id`);
  }
  createEmployee(employee) {
    return this.connection.query("INSERT INTO employee SET ?", employee);
  }

  updateEmployee() {
    return this.connection.query("UPDATE employee SET role_id = role_id WHERE first_name = name");
  }

  //Get , add role
  viewAllRoles() {
    return this.connection.query("SELECT id, title, salary, department_id AS role FROM role");
  }
  
  addRole(newRole) {
    return this.connection.query("INSERT INTO role SET ?", newRole);
  }

  //Get, add department
  viewAllDepartments() {
    return this.connection.query("SELECT * FROM department",);
  }

  createDepartment(department) {
    return this.connection.query("INSERT INTO department SET ?", department);
  }
  


  //update, remove employee
  updateEmployeeRole(employeeId, newRoleId) {
    console.log("Within query");
    return this.connection.query("UPDATE employee SET role_id = ? WHERE id = ?", [newRoleId, employeeId]);
  }

  removeEmployee(id) {
    return this.connection.query("DELETE FROM employee WHERE id = ?", id);
  }

  // remove role, remove department
  removeRole(id) {
    return this.connection.query("DELETE FROM role WHERE id = ?", id);
  }
  removeDepartment(id) {
    return this.connection.query(`DELETE FROM department WHERE id= ?`
    ,id );

   
  }
}

module.exports = new dbQuery(connection);