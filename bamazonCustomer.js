// Require mysql
var mysql = require("mysql");

// Require inquirer
var inquirer = require("inquirer");

// Require cli-table, use this to display products
// var Table = require("cli-table");

// Connect to MySQL database
var connection = mysql.createConnection({
    host: "localhost",

    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "root",

    // Database
    database: "bamazon"
});

// Connect to database
connection.connect(function (err) {
    if (err) throw err;
    //console.log("connected");
    displayStore();
});


// Function to display the items in the store
function displayStore() {
    console.log("Which item would you like to purchase?");

    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        
        // var idArray = [];
        // var productArray = [];
        // var departmentArray = [];
        // var priceArray = [];
        // var quantityArray = [];
            
        // // Put id's in array
        // for (var i = 0; i < res.length; i++) {
        //     idArray.push(res[i].item_id);
        // }

        // // Put product names in array
        // for (var i = 0; i < res.length; i++) {
        //     productArray.push(res[i].product_name);
        // }

        // // Put department in array
        // for (var i = 0; i < res.length; i++) {
        //     departmentArray.push(res[i].department_name);
        // }

        // // Put price in array
        // for (var i = 0; i < res.length; i++) {
        //     priceArray.push(res[i].price);
        // }

        // // Put stock quantity in array
        // for (var i = 0; i < res.length; i++) {
        //     quantityArray.push(res[i].stock_quantity);
        // }

        

        // // Display products
        // var productObject;
        // var table = new Table({ head: ["", "Product Name", "Department", "Price", "Quantity"] });
 
        // for (var i = 0; i < res.length; i++) {

        //     table.push(res[i]);

        // }

        // console.log(table.toString());

        // console.log(res[0]);


        // Display products
        for (var i = 0; i < res.length; i++) {
            console.log(
                "========================================\n"
                + "Id: " + res[i].item_id + "\n"
                + "Product: " + res[i].product_name + "\n"
                + "Department: " + res[i].department_name + "\n"
                + "Price: $" + res[i].price + "\n"
                + "Quantity: " + res[i].stock_quantity + "\n"
                + "========================================\n"
            );
        }
        buyProduct();
    });
};

// Function to prompt clients with two messages
function buyProduct() {
    // Ask client the ID of product they want to buy
    inquirer.prompt([
        {
            name: "id",
            message: "What's the ID of the product you want to buy?"
        },
        {
            name: "units",
            message: "Amount that you want to buy?"
        }
    ]).then(function (answer) {

        // Variable to SELECT all items in products table
        var query = "SELECT * FROM products WHERE ?";

        // Search for the item the user wants to buy
        connection.query(query, { item_id: parseInt(answer.id) }, function (err, res) {
            if (err) throw err;

            // Checks if there's enough items in the inventory
            if (res[0].stock_quantity - answer.units > 0) {

                // If there's enough items in inventory, UPDATE database to reflect the remaining quantity
                connection.query(
                    "UPDATE products SET ? WHERE ?",
                    [
                        {
                            stock_quantity: res[0].stock_quantity - answer.units
                        },
                        {
                            item_id: parseInt(answer.id)
                        }
                    ],
                    function (err, res) {
                        if (err) throw err;

                        // SELECT all items in products table so you can display the update to the console
                        connection.query(
                            query,
                            {
                                item_id: parseInt(answer.id)
                            },
                            function (err, res) {
                                if (err) throw err;
                                // Display the product, quantity and total cost of the client's order
                                console.log("Id: " + res[0].item_id + "\n"
                                    + "Product: " + res[0].product_name + "\n"
                                    + "Department: " + res[0].department_name + "\n"
                                    + "Quantity: " + answer.units + "\n"
                                    + "Total Price: $" + res[0].price * answer.units + "\n"
                                );
                                connection.end();
                            }
                        );
                    }
                );
            }
            else {
                // If there's not enough of the product in the inventory
                console.log("Insufficient quantity!");
                displayStore();
            }
        });
    });

};
