var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "yourRootPassword",
  database: "kamazon"
});

connection.connect(function(err) {
  if (err) throw err;
  managerPortal();
});

function managerPortal() {
  inquirer
    .prompt([
      {
        type: "list",
        message: "Choose an operation:",
        choices: [
          "View Products for Sale",
          "View Low Inventory",
          "Add to Inventory",
          "Add New Product"
        ],
        name: "operation",
        default: "View Products for Sale"
      }
    ])
    .then(res => {
      const operation = res.operation;
      switch (operation) {
        case "View Products for Sale":
          inventory();
          break;
        case "View Low Inventory":
          lowInventory();
          break;
        case "Add to Inventory":
          restock();
          break;
        case "Add New Product":
          newItem();
          break;
      }
    });
}

function inventory() {
  var query = "SELECT * FROM products";
  connection.query(query, function(err, res) {
    for (var i = 0; i < res.length; i++) {
      console.log(
        "Id: " +
          res[i].item_id +
          " || In-Stock: " +
          res[i].stock_quantity +
          " || Price: " +
          res[i].price +
          " || Department: " +
          res[i].department_name +
          " || Item: " +
          res[i].product_name
      );
    }
    continueManaging();
  });
}

function lowInventory() {
  var query = "SELECT * FROM products WHERE stock_quantity BETWEEN ? AND ?";
  connection.query(query, [-1, 6], function(err, res) {
    for (var i = 0; i < res.length; i++) {
      console.log(
        "Id: " +
          res[i].item_id +
          " || In-Stock: " +
          res[i].stock_quantity +
          " || Price: " +
          res[i].price +
          " || Department: " +
          res[i].department_name +
          " || Item: " +
          res[i].product_name
      );
    }
    continueManaging();
  });
}

function restock() {
  inquirer
    .prompt([
      {
        name: "po_id",
        type: "input",
        message: "Which item ID are you restocking?",
        validate: function(value) {
          if (isNaN(parseFloat(value)) === false) {
            return true;
          }
          return false;
        }
      },
      {
        name: "restock_quantity",
        type: "input",
        message: "Quantity of items received?",
        validate: function(value) {
          if (isNaN(parseFloat(value)) === false) {
            return true;
          }
          return false;
        }
      }
    ])
    .then(function(answer) {
      var id = parseFloat(answer.po_id);
      var restock = parseFloat(answer.restock_quantity);
      console.log(
        "You are adding " + restock + " to product #" + id + " in inventory."
      );

      var query = "SELECT * FROM products WHERE ?";
      connection.query(query, { item_id: id }, function(err, res) {
        var newQuantity = res[0].stock_quantity + restock;
        update(id, newQuantity);
      });

      function update(id, newQuantity) {
        connection.query(
          "UPDATE products SET ? WHERE ?",
          [
            {
              stock_quantity: newQuantity
            },
            {
              item_id: id
            }
          ],
          function(err, res) {
            console.log(
              "Item #" +
                id +
                " has received " +
                restock +
                " and now has " +
                newQuantity +
                " in stock."
            );
            continueManaging();
          }
        );
      }
    });
}

function newItem() {
  console.log(
    "Please provide all the information to add the new product to inventory."
  );
  inquirer
    .prompt([
      {
        //build a function to grab the largest ID of the existing set & add 1
        name: "new_id",
        type: "input",
        message: "What is the ID# for the item you are adding?",
        validate: function(value) {
          if (isNaN(parseFloat(value)) === false) {
            return true;
          }
          return false;
        }
      },
      {
        name: "new_name",
        type: "input",
        message: "What is the name of the product?",
        validate: function(value) {
          if (value !== "") {
            return true;
          }
          return false;
        }
      },
      {
        name: "new_department",
        type: "list",
        message: "Which department will be selling this product?",
        choices: [
          "arts & crafts",
          "automotive",
          "beauty & personal care",
          "books",
          "clothing",
          "electronics",
          "garden",
          "home goods",
          "kitchen",
          "outdoors",
          "tools",
          "other"
        ],
        defualt: "home goods"
      },
      {
        name: "new_price",
        type: "input",
        message: "What is the sales price for one unit?",
        validate: function(value) {
          if (isNaN(parseFloat(value)) === false) {
            return true;
          }
          return false;
        }
      },
      {
        name: "new_stock_quantity",
        type: "input",
        message: "How many are you adding to inventory?",
        validate: function(value) {
          if (isNaN(parseFloat(value)) === false) {
            return true;
          }
          return false;
        }
      }
    ])
    .then(function(answer) {
      var query = "INSERT INTO products SET ?";
      connection.query(
        query,
        {
          item_id: answer.new_id,
          product_name: answer.new_name,
          department_name: answer.new_department,
          price: answer.new_price,
          stock_quantity: answer.new_stock_quantity
        },
        function(err, res) {
          console.log(res.affectedRows + " product inserted!\n");
          continueManaging();
        }
      );
    });
}

function continueManaging() {
  inquirer
    .prompt([
      {
        name: "continue",
        type: "confirm",
        message: "Would you like to keep working?",
        default: true
      }
    ])
    .then(function(answer) {
      if (answer.continue) {
        managerPortal();
      } else {
        console.log("Thank you for your time.");
        connection.end();
        return;
      }
    });
}
