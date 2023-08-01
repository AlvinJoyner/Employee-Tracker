USE employee_db;


INSERT INTO department (name)
VALUES 
     ("Management"),
     ("Sales"),
     ("Engineering"),
     ("Finance"),
     ("Legal");
    
    

INSERT INTO role
    (title, salary, department_id)
VALUES
    ("CEO", 750000,1),
    ("Lead Engineer", 190000, 2),
    ("Software Engineer", 200000, 3),
    ("Accountant", 225000, 4),
    ("Legal Team Lead", 250000,5),
    ("Sales Lead", 220000, 6);


INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES 
    ("Bob", "Straight",1,1),
    ("John", "Hopenmindeed",2,1),
    ("Arthur", "Freeze",5,3),
    ("Kevin", "Tupik",4,3),
    ("Kunal", "Singh",3,2),
    ("Mary", "Queen",2,1);
    
   