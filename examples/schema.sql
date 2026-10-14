CREATE TABLE customers (
  id INT,
  email VARCHAR(255),
  password VARCHAR(255),
  created_at VARCHAR(50)
);

CREATE TABLE orders (
  id INT,
  customer_id INT,
  reference VARCHAR(255),
  total FLOAT
);

SELECT *
FROM orders o, customers c
WHERE o.customer_id = c.id;

UPDATE customers SET password = 'changeme';
