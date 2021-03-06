var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "yourRootPassword",
    database: "kamazon"
})

connection.connect(function(err){
    if (err) throw err;
    storeFront();
})

function storeFront(){
   var query = "SELECT * FROM products";
   connection.query(query, function(err, res) {
       for (var i = 0; i < res.length; i++){
           console.log("Id: " + res[i].item_id + " || Item: " + res[i].product_name + " || Price: " + res[i].price);
       }    
   purchaseOrder();
   })
}

function purchaseOrder(){
    inquirer.prompt([
        {
            name: "po_id",
            type: "input",
            message: "Enter the ID for the item you'd like to purchase.",
            validate: function(value) {
                if (isNaN(parseFloat(value)) === false) {
                    return true;
                  }
                  return false;
            }
        },{
            name: "po_quantity",
            type: "input",
            message: "How many would you like to buy?",
            validate: function(value) {
                if (isNaN(parseFloat(value)) === false) {
                    return true;
                  }
                  return false;
            }
        }
    ])
    .then(
        function(answer){
            var po_id = parseFloat(answer.po_id);
            var po_quantity = parseFloat(answer.po_quantity)
            console.log("You have selected " + po_quantity + " of item: " + po_id);
        var query = "SELECT * FROM products WHERE ?";
        connection.query(query, {item_id: po_id}, function(err, res){
        var stockQuantity = res[0].stock_quantity;
            var stockTest = ((po_quantity > 0) && (po_quantity < res[0].stock_quantity))
            if (stockTest){
                var po_price = (res[0].price * po_quantity).toFixed(2);
                updateProduct(po_id, stockQuantity, po_quantity, po_price)
            } else {
                console.log("Insufficient Quantity!");
                keepShopping();
            }
        })
    })
}

function updateProduct(id, stockQuant, po_quantity, price) {
    var newQuantity = stockQuant-po_quantity;
    connection.query("UPDATE products SET ? WHERE ?",[
        {
            stock_quantity: newQuantity
        },
        {
            item_id: id
        }
    ],
    function(err, res) {
        console.log("Your purchase total is: $" + price);
        console.log("Purchase complete.");
        keepShopping()        
    }
    );
}

function keepShopping() {
    inquirer.prompt([
        {
            name: "continue",
            type: "confirm",
            message: "Would you like to continue shopping?",
            default: true
        }
    ])
    .then(function(answer){
        if (answer.continue){
            storeFront();
        } 
        else {
            console.log("Thank you for shopping with Kamazon!")
            connection.end();
            return;
        }
    })
}

