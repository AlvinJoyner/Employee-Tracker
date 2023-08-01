// Dependencies required
const inquirer = require("inquirer");
const dbQueries = require("./db/dbQueries.js");
const connection = require("./db/connection");

// Start server after db connection
connection.connect((err) => {
  if (err) throw err;
  console.log("Database is connected.");
  console.log("WELCOME TO SQL-EMPLOYEE-TRACKER");
  start();
});

// Function to start the command-line application
function start() {
  inquirer
    .prompt([
      {
        // Beginning in the Command Line
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
      switch (answer.prompt) {
        // Call the respective functions based on the user's choice
        case "View Employees":
          await viewAll("employees");
          break;
        case "View Roles":
          await viewAll("roles");
          break;
        case "View Departments":
          await viewAll("departments");
          break;
        case "Add Employee":
          await addEmployee();
          break;
        case "Add Role":
          await addRole();
          break;
        case "Add Department":
          await addDepartment();
          break;
        case "Update Employee Role":
          await updateEmployee();
          break;
        case "Delete Employee":
          await deleteEntry("employee", "employeeId", "Which employee would you like to delete?");
          break;
        case "Delete Role":
          await deleteEntry("role", "roleId", "Which role would you like to delete?");
          break;
        case "Delete Department":
          await deleteEntry("department", "departmentId", "Which department would you like to delete?");
          break;
        case "Quit":
          return quit();
      }
      // After processing the user's choice, start the application again
      start();
    });
}

// Function to view all data (employees, roles, or departments) based on user input
async function viewAll(entity) {
  const data = await dbQueries["viewAll" + entity[0].toUpperCase() + entity.slice(1)]();
  console.table(data);
}

// Function to add a new department
async function addDepartment() {
  const department = await inquirer.prompt({
    type: "input",
    message: "What is the name of the department?",
    name: "name",
  });
  await dbQueries.createDepartment(department);
}

// Function to add a new employee
async function addEmployee() {
  // Get the available roles and managers
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
    message: "What is this new employee role?",
    choices: roleListChoices,
  });

  // Create a list of manager choices for the user to select from
  const managerChoicesList = managerPrompt.map(({ first_name, last_name, id }) => ({
    name: first_name + " " + last_name,
    value: id,
  }));

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

  await dbQueries.createEmployee(employeeToAdd);
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

  await dbQueries.addRole(roleToAdd);
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

  await dbQueries.updateEmployeeRole(employeeId, roleId);
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
