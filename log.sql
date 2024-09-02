-- 1. Creating a table
CREATE TABLE employees (
    employee_id INT PRIMARY KEY,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    email VARCHAR(100),
    hire_date DATE,
    salary DECIMAL(10, 2)
);

-- 2. Inserting data
INSERT INTO employees (employee_id, first_name, last_name, email, hire_date, salary)
VALUES (1, 'John', 'Doe', 'john.doe@example.com', '2023-01-15', 50000.00),
       (2, 'Jane', 'Smith', 'jane.smith@example.com', '2023-02-01', 55000.00),
       (3, 'Mike', 'Johnson', 'mike.johnson@example.com', '2023-03-10', 52000.00);

-- 3. Querying data
-- Basic SELECT
SELECT * FROM employees;

-- Filtered SELECT
SELECT first_name, last_name, salary FROM employees WHERE salary > 52000;

-- Ordered SELECT
SELECT * FROM employees ORDER BY hire_date DESC;

-- 4. Updating records
UPDATE employees
SET salary = 56000.00
WHERE employee_id = 2;

-- 5. Deleting records
DELETE FROM employees
WHERE employee_id = 3;

-- 6. Creating another table for demonstration
CREATE TABLE departments (
    department_id INT PRIMARY KEY,
    department_name VARCHAR(50)
);

INSERT INTO departments (department_id, department_name)
VALUES (1, 'HR'), (2, 'IT'), (3, 'Finance');

-- Adding a department_id column to employees table
ALTER TABLE employees
ADD COLUMN department_id INT;

UPDATE employees
SET department_id = 2
WHERE employee_id IN (1, 2);

-- 7. Joining tables
SELECT e.first_name, e.last_name, d.department_name
FROM employees e
JOIN departments d ON e.department_id = d.department_id;

-- 8. Aggregate functions
SELECT department_id, AVG(salary) as avg_salary
FROM employees
GROUP BY department_id;

-- 9. Subquery
SELECT *
FROM employees
WHERE salary > (SELECT AVG(salary) FROM employees);

-- 10. Creating a view
CREATE VIEW employee_details AS
SELECT e.employee_id, e.first_name, e.last_name, d.department_name
FROM employees e
JOIN departments d ON e.department_id = d.department_id;

-- Using the view
SELECT * FROM employee_details;

-- 11. Creating an index
CREATE INDEX idx_last_name ON employees(last_name);

-- 12. Transaction
BEGIN;
UPDATE employees SET salary = salary * 1.1 WHERE department_id = 2;
UPDATE departments SET department_name = 'Information Technology' WHERE department_id = 2;
COMMIT;

-- 13. Creating a stored procedure (syntax may vary depending on the database system)
DELIMITER //
CREATE PROCEDURE give_raise(IN emp_id INT, IN raise_amount DECIMAL(10, 2))
BEGIN
    UPDATE employees
    SET salary = salary + raise_amount
    WHERE employee_id = emp_id;
END //
DELIMITER ;

-- Calling the stored procedure
CALL give_raise(1, 2000.00);
