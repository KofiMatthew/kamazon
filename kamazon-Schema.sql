CREATE database kamazon;

USE kamazon;

CREATE TABLE products(
    item_id INT NOT NULL,
    product_name VARCHAR(45) NOT NULL,
    department_name VARCHAR(20) NOT NULL,
    price FLOAT(7,2) NOT NULL,
    stock_quantity INT NOT NULL,
    PRIMARY KEY (item_id)
)

CREATE TABLE departments(
    department_id INT NOT NULL,
    department_name VARCHAR(20) NOT NULL,
    over_head_costs FLOAT(7,2) NOT NULL
)