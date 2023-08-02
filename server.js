// Import required modules
const inquirer = require("inquirer"); // Inquirer module for interactive command-line prompts
const dbQueries = require("./db/dbQueries.js"); // Custom module for database queries
const connection = require("./db/connection"); // MySQL connection module

// Start the server after establishing a database connection
connection.connect((err) => {
  if (err) throw err;
  console.log("Database is connected.");
  console.log("WELCOME TO SQL-EMPLOYEE-TRACKER");
  start(); // Call the main function to begin the application
});

// Function to start the command-line application
function start() {
  // Prompt the user with a list of options
  inquirer
    .prompt([
      {
        type: "list",
        name: "prompt",
        message: "What would you like to do?",
        choices: [
          "Add Department",
          "Add Role",
          "Add Employee",
          "View Departments",
          "View Roles",
          "View Employees",
          "Update Employee Role",
          "Delete Employee",
          "Delete Role",
          "Delete Department",
          "Quit",
        ],
      },
    ])
    .then(async (answer) => {
      console.log(answer);
      // Perform actions based on the user's choice
      switch (answer.prompt) {
        case "View Employees":
          await viewAll("employees"); // View all employees
          break;
        case "View Roles":
          await viewAll("roles"); // View all roles
          break;
        case "View Departments":
          await viewAll("departments"); // View all departments
          break;
        case "Add Employee":
          await addEmployee(); // Add a new employee
          break;
        case "Add Role":
          await addRole(); // Add a new role
          break;
        case "Add Department":
          await addDepartment(); // Add a new department
          break;
        case "Update Employee Role":
          await updateEmployee(); // Update an employee's role
          break;
        case "Delete Employee":
          await deleteEntry("employee", "employeeId", "Which employee would you like to delete?"); // Delete an employee
          break;
        case "Delete Role":
          await deleteEntry("role", "roleId", "Which role would you like to delete?"); // Delete a role
          break;
        case "Delete Department":
          await deleteEntry("department", "departmentId", "Which department would you like to delete?"); // Delete a department
          break;
        case "Quit":
          return quit(); // Exit the application
      }
      // After processing the user's choice, restart the application
      start();
    });
}

// Function to view all data (employees, roles, or departments) based on user input
async function viewAll(entity) {
  const data = await dbQueries["viewAll" + entity[0].toUpperCase() + entity.slice(1)]();
  console.table(data); // Display the data in a table format
}

// Function to add a new department
async function addDepartment() {
  const department = await inquirer.prompt({
    type: "input",
    message: "What is the name of the department?",
    name: "name",
  });
  await dbQueries.createDepartment(department); // Add the new department to the database
}

// Function to add a new employee
async function addEmployee() {
  // Get the available roles and managers from the database
  const rolesPrompt = await dbQueries.viewAllRoles();
  const managerPrompt = await dbQueries.getAllEmployees();

  const employeeToAdd = await inquirer.prompt([
    {
      type: "input",
      message: "What's the first name of the employee?",
      name: "first_name",
    },
    {
      type: "input",
      message: "What's the last name of the employee?",
      name: "last_name",
    },
  ]);

  // Create a list of role choices for the user to select from
  const roleListChoices = rolesPrompt.map(({ id, title }) => ({ name: title, value: id }));
  const { roleId } = await inquirer.prompt({
    type: "list",
    name: "roleId",
    message: "What is this new employee's role?",
    choices: roleListChoices,
  });

  // Create a list of manager choices for the user to select from
  const managerChoicesList = managerPrompt.map(({ first_name, last_name, id }) => ({
    name: first_name + " " + last_name,
    value: id,
  }));

  // Prompt the user to select the new employee's manager (if available)
  if (managerChoicesList && managerChoicesList.length > 0) {
    const { managerId } = await inquirer.prompt({
      type: "list",
      name: "managerId",
      message: "Please select this new employee's manager:",
      choices: managerChoicesList,
    });
    employeeToAdd.manager_id = managerId;
  }

  employeeToAdd.role_id = roleId;

  await dbQueries.createEmployee(employeeToAdd); // Add the new employee to the database
}

// Function to add a new role
async function addRole() {
  const departments = await dbQueries.viewAllDepartments();
  const departmentsList = departments.map(({ id, name }) => ({ name: name, value: id }));

  const roleToAdd = await inquirer.prompt([
    {
      type: "input",
      message: "What's the name of the role?",
      name: "title",
    },
    {
      type: "input",
      message: "What is the salary for this role?",
      name: "salary",
    },
    {
      type: "list",
      message: "What is the department id number?",
      name: "department_id",
      choices: departmentsList,
    },
  ]);

  await dbQueries.addRole(roleToAdd); // Add the new role to the database
}

// Function to update an employee's role
async function updateEmployee() {
  // Get the list of employees and roles for the user to select from
  const employeePrompt = await dbQueries.getAllEmployees();
  const rolesPrompt = await dbQueries.viewAllRoles();

  const employeePromptToSelect = employeePrompt.map(({ id, first_name, last_name }) => ({
    name: first_name + " " + last_name,
    value: id,
  }));

  const rolesPromptToSelect = rolesPrompt.map(({ id, title }) => ({
    name: title,
    value: id,
  }));

  // Prompt the user to select the employee and the new role
  const { employeeId } = await inquirer.prompt([
    {
      type: "list",
      name: "employeeId",
      message: "Select the employee whose role you wish to change:",
      choices: employeePromptToSelect,
    },
  ]);

  const { roleId } = await inquirer.prompt([
    {
      type: "list",
      name: "roleId",
      message: "What new role would you like to assign to this employee?",
      choices: rolesPromptToSelect,
    },
  ]);

  await dbQueries.updateEmployeeRole(employeeId, roleId); // Update the employee's role in the database
}

// Function to delete an employee, role, or department
async function deleteEntry(entity, entityIdName, message) {
  const data = await dbQueries["getAll" + entity[0].toUpperCase() + entity.slice(1)]();

  const dataToSelect = data.map(({ id, first_name, last_name }) => ({
    name: first_name + " " + last_name,
    value: id,
  }));

  // Prompt the user to select the entry to delete
  const { [entityIdName]: entityId } = await inquirer.prompt([
    {
      type: "list",
      name: entityIdName,
      message: message,
      choices: dataToSelect,
    },
  ]);

  // Call the respective function to remove the selected entry
  await dbQueries["remove" + entity[0].toUpperCase() + entity.slice(1)](entityId);
}

//
