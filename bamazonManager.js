// Require mysql
var mysql = require("mysql");

// Require inquirer
var inquirer = require("inquirer");

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
    displayOptions();
});

// Function displays options
function displayOptions() {

    // Variable made to look better in prompt
    var promptChoices = ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"];

    inquirer.prompt([
        {
            name: "options",
            message: "Pick a option",
            type: "list",
            choices: promptChoices
        }
    ]).then(function (answer) {

        switch (answer.options) {

            case "View Products for Sale":
                return viewProducts();
            case "View Low Inventory":
                return viewLowInventory();
            case "Add to Inventory":
                return addInventory();
            case "Add New Product":
                return addProduct();
        }

        connection.end();
    });

}

// Function to view all the products for sale
function viewProducts() {
    // Select all the items in the products table
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;

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
        // Back to main menu
        displayOptions();
    });
}

// Function to view the low inventory
function viewLowInventory() {
    connection.query("SELECT * FROM products WHERE stock_quantity <= 5", function (err, res) {
        if (err) throw err;

        // Display inventory
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
        displayOptions();
    });
}

// Function to add to inventory
function addInventory() {
    // Select all the items in the products table
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;

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


        // Ask user what they want to add
        inquirer.prompt([
            {
                name: "id",
                message: "Which item would you like to add? (choose by id)"
            },
            {
                name: "units",
                message: "How many units would you like to add?"
            }
        ]).then(function (answer) {
            // Get all items
            connection.query("SELECT * FROM products", function (err, res) {
                if (err) throw err;
                // Loop to find the item the user wants to add
                for (var i = 0; i < res.length; i++) {
                    // If item in table matched the user choice id, then run update
                    if (res[i].item_id === parseInt(answer.id)) {
                        console.log(res[i].item_id);
                        console.log(parseInt(answer.id));
                        console.log(parseInt(answer.units));

                        // Update database with new quantity
                        connection.query("UPDATE products SET ? WHERE ?",
                            [
                                {
                                    stock_quantity: parseInt(answer.units) + res[i].stock_quantity
                                },
                                {
                                    item_id: parseInt(answer.id)
                                }
                            ],
                            function (err, res) {
                                console.log("Product updated...\n\n");
                                displayOptions();
                            }
                        );
                    }
                }
            });
        });
    });
}

// Function to add new product
function addProduct() {
    // Ask user details on the product they prefer to add
    inquirer.prompt([
        {
            name: "name",
            message: "What is the product you'd like to add?"
        },
        {
            name: "price",
            message: "How much does this product cost?"
        },
        {
            name: "department",
            message: "Which department is this product in?"
        },
        {
            name: "quantity",
            message: "How many would you like to add?"
        }
    ]).then(function (newProduct) {
        // INSERT new product into table
        connection.query("INSERT INTO products SET ?",
            {
                product_name: newProduct.name,
                price: parseInt(newProduct.price),
                department_name: newProduct.department,
                stock_quantity: parseInt(newProduct.quantity)
            },
            function (err, res) {
                console.log("Added " + newProduct.name + " to the inventory...\n\n");
                displayOptions();
            }
        );

    });
}
