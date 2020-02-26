require('dotenv').config();

const config = {

    host: process.env.DB_HOST,
    port: 5432,
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
};

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const Sequelize = require('sequelize')
const router = express.Router();
const pgp = require('pg-promise')();
const db = pgp(config);
const bodyParser = require('body-parser');

const ProductsModel = require('./models/products');
const UsersModel = require('./models/users');
const OrdersModel = require('./models/orders');
const CategoryModel = require('./models/category');
const ReviewsModel = require('./models/reviews');
const OrderProductsModel = require('./models/order_product');


const connectionString = `postgres://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}`
const sequelize = new Sequelize(process.env.DATABASE_URL || connectionString, {

    dialect: 'postgres',
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
    }

});

const Users = UsersModel(sequelize, Sequelize);
const Products = ProductsModel(sequelize, Sequelize);
const Orders = OrdersModel(sequelize, Sequelize);
const Category = CategoryModel(sequelize, Sequelize);
const Reviews = ReviewsModel(sequelize, Sequelize);
const OrderProduct = OrderProductsModel(sequelize, Sequelize);

const app = express();

app.use(express.static('public'));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));



//REGISTRATION ************
// router.get('/register', function(req, res) {
    app.post('/api/register', function (req, res) {
    
        let data = {
            name: req.body.name,
            email: req.body.email.toLowerCase().trim(),
            password: req.body.password,
            is_admin: req.body.is_admin,
            address_line1: req.body.address_line1,
            address_line2: req.address_line2,
            city: req.body.city,
            state: req.body.state,
            zip: req.body.zip
        };
        
        if (data.name && data.email && data.password && data.address_line1 && data.city && data.state && data.zip) {
            
            var salt = bcrypt.genSaltSync(10);
            var hash = bcrypt.hashSync(data.password, salt);
            data['password_hash'] = hash;
    
            Users.create(data).then(function (user) {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(user));
            });
            // res.redirect('/login')
        } else {
            
            res.status(434).send('Name, email, password, and address is required to register')
        }
        res.redirect('/register')
    });
//LOGIN ************



//ORDERS ***********
// Get All orders /working
app.get('/api/orders', function (req, res) {
    Orders.findAll().then((results) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(results));
    }).catch(function (e) {
        console.log(e);
        res.status(434).send('error retrieving orders');
    })
});
//Get all orders for one user /WORKING
app.get('/api/users/orders/:id', function(req, res) {
  let id = req.params.id;
    db.query('SELECT * FROM orders JOIN users on orders.user_id = users.id WHERE users.id= orders.user_id')
     .then(results => {
        res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify(results));
               })
    .catch(function (e) {
        console.log(e);
        res.status(434).send('error retrieving info on group');
    })
});

//GET single order for a single user /working
app.get('/api/users/:id', function(req, res) {
    let id = req.params.id;
      db.query('SELECT * FROM orders JOIN users on orders.user_id = users.id WHERE users.id= orders.user_id', [id])
      
       .then(results => {
          res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(results));
                 })
      .catch(function (e) {
          console.log(e);
          res.status(434).send('error retrieving info on group');
      })
  });
// Create an ORDER NOT WORKING
app.post('/api/orders', function (req, res) {
    let data = {
        user_id: req.body.user_id,
    };
    if(data.user_id) {
        Orders.create(data).then(function (post) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(post));
            console.log ("NEW order created") 
        }).catch(function(e){
            res.status(434).send('Unable to create  an order')
        });
    } else {
    res.status(434).send('Need to be logged in to create an order')
    }
    
});

//ORDER_PRODUCTS *********
//GET all product orders /working
app.get('/api/orderproduct', function (req, res) {
    OrderProduct.findAll().then((results) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(results));
    }).catch(function (e) {
        console.log(e);
        res.status(434).send('error retrieving orders');
    })
});
//GET single product order for a single user /working ~maybe will need tables with info to confim=rm
app.get('/api/order_producs/orders/:id', function(req, res) {
    let id = req.params.id;
      db.query('SELECT * FROM order_products JOIN orders on order_products.order_id = orders.id', [id])
      .then(results => {
          res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(results));
                 })
      .catch(function (e) {
          console.log(e);
          res.status(434).send('error retrieving info on group');
      })
  });
//Create Product Order /working
app.post('/api/orderproduct', function (req, res) {
    let data = {
        order_id: req.body.order_id,
        product_id: req.body.product_id,
        quantity: req.body.quantity
    };
    if(data.order_id && data.product_id && data.quantity) {
        OrderProduct.create(data).then(function (post) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(post));
        }).catch(function(e){
            res.status(434).send('Unable to create the an order')
        });
    } else {
    res.status(434).send('Need to add quantity that is available in order to create an order')
    }
});

//USERS *******
//GET all users /working
app.get('/api/users', function (req, res) {
    Users.findAll().then((results) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(results));
    }).catch(function (e) {
        console.log(e);
        res.status(434).send('error retrieving users');
    })
});
//GET a single user /working
app.get('/api/users/:id', function (req, res) {
    let id = req.params.id;
    db.one("SELECT * FROM posts users id=$1", [id])
        .then((results) => {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(results));
        })
        .catch((e) => {
            console.error(e);
        });
});
//GET user profile info needed? same as above?

//POST user profile info //register

// //Update user profile info /working
app.put('/api/users/:id', function (req, res) {
    let id = req.params.id;
    let data = {
        id: id,
        name: req.body.name,
        email: req.body.email,
        password: req.body.user_id,
        address_line1: req.body.address_line1,
        address_line2: req.body.address_line2,
        city: req.body.city,
        state: req.body.state,
        zip: req.body.zip
    };
    let query = "UPDATE users SET name=${name},email=${email},password=${password},address_line1=${address_line1},address_line2=${address_line2},city=${city},state=${state},zip=${zip} WHERE id=${id}";
    db.one(query, data)
        .then((result) => {
                    db.one("SELECT * FROM users WHERE categories.id=$1", [result.id])
                        .then((results) => {
                            res.setHeader('Content-Type', 'application/json');
                            res.end(JSON.stringify(results));
                        })
                        .catch((e) => {
                            console.error(e);
                        });
                })
                .catch((e) => {
                    console.error(e);
                });
       });


//Delete user profile //working
app.delete('/api/delete_user', function (req, res) {
    let data = {
        id: req.body.id
    };
    Users.destroy({ where: { id: data.id } }).then(function (group) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(group));
    }).catch(function (e) {
        res.status(434).send('unable to delete user')
    })
});
//CATEGORIES *************
//GET all categories /working
app.get('/api/category', function (req, res) {
    db.query('SELECT * FROM categories')
        .then((results) => {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(results));
        })
        .catch((e) => {
            console.error(e);
        });
});
//CREATE/post a Category /working
app.post('/api/categories', function (req, res) {
    let data = {
        name: req.body.name
    };
    if(data.name) {
        Categories.create(data).then(function (post) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(post));
        }).catch(function(e){
            res.status(434).send('Unable to create the category')
        });
    } else {
    res.status(434).send('Category name is required to making a post')
    }
});

//UPDATE/PUT a Category /working!
app.put('/api/categories/:id', function (req, res) {
    let id = req.params.id;
    let data = { 
        id: id,
        name: req.body.name
    };
    let query = "UPDATE categories SET name=${name}  WHERE id=${id}";

    db.one(query, data)
        .then((result) => {

            db.one("SELECT * FROM catgeories WHERE catgeories.id=$1", [result.id])
                .then((results) => {
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(results))
                })
                .catch((e) => {
                    console.error(e);
                });

        })
        .catch((e) => {
            console.error(e);
        });
});
//Delete a Category /working
app.delete('/api/deletecategory', function (req, res) {
    let data = {
        id: req.body.id
    };
    Category.destroy({ where: { id: data.id } }).then(function (group) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(group));
    }).catch(function (e) {
        res.status(434).send('unable to delete category')
    })
});
//GET all products /working
app.get('/api/products', function (req, res) {
    Products.findAll().then((results) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(results));
    }).catch(function (e) {
        console.log(e);
        res.status(434).send('error retrieving orders');
    })
});
//GET single product /working
app.get('/api/products/:id', function (req, res) {
    let id = req.params.id;
    db.one("SELECT * FROM products product id=$1", [id])
        .then((results) => {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(results));
        })
        .catch((e) => {
            console.error(e);
        });
});
//ADMIN PRODUCTS ****************
//(Admin) Post a product /Gerald has this

//(Admin) PUT/update a product /looks to be working
app.put('/api/products/:id', function (req, res) {
    let id = req.params.id;
    let data = {
        id: id,
        name: req.body.name,
        category: req.body.category,
        price: req.body.price,
        description: req.body.description,
        available_quantity: req.body.available_quantity,
        image: req.body.image
    };
    let query = "UPDATE products SET name=${name},category=${category},price=${price},description=${description},available_quantity=${available_quantity},image=${image} WHERE id=${id}";
    db.one(query, data)
        .then((result) => {
                    db.one("SELECT * FROM products JOIN categories ON products.category = categories.name", [result.id])
                        .then((results) => {
                            res.setHeader('Content-Type', 'application/json');
                            res.end(JSON.stringify(results));
                        })
                        .catch((e) => {
                            console.error(e);
                        });
                })
                .catch((e) => {
                    console.error(e);
                });
            })

//(Admin) Delete a product /working
app.delete('/api/deleteproduct', function (req, res) {
    let data = {
        id: req.body.id
    };
    Products.destroy({ where: { id: data.id } }).then(function (group) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(group));
    }).catch(function (e) {
        res.status(434).send('unable to delete product')
    })
});

app.listen(3001);
console.log('Ostrich is hungry and running, fast');