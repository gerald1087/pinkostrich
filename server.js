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
// Get All orders 
app.get('/api/orders', function (req, res) {
    Orders.findAll().then((results) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(results));
    }).catch(function (e) {
        console.log(e);
        res.status(434).send('error retrieving orders');
    })
});
//Get all orders for one user *NOT YET WORKING
app.get('/api/users/orders/:id', function(req, res) {
  let id = req.params.id;
    Orders.query('SELECT * FROM orders JOIN users on orders.user_id = users.id WHERE users.id=$1', [id])
     .then(results => {
        res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify(results));
               })
    .catch(function (e) {
        console.log(e);
        res.status(434).send('error retrieving info on group');
    })
});

//GET single order for a single user (join with products.id and users.id)


//USERS *******
//GET all users
app.get('/api/users', function (req, res) {
    Users.findAll().then((results) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(results));
    }).catch(function (e) {
        console.log(e);
        res.status(434).send('error retrieving users');
    })
});
//GET user profile info
//POST user profile info
//PUT/update user profile info?
//Delete user profile


//CATEGORIES *************
//GET all categories
app.get('/api/catgeories', function (req, res) {
    Categories.findAll().then((results) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(results));
    }).catch(function (e) {
        console.log(e);
        res.status(434).send('error retrieving categories');
    })
});
//GET all products
app.get('/api/products', function (req, res) {
    Products.findAll().then((results) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(results));
    }).catch(function (e) {
        console.log(e);
        res.status(434).send('error retrieving users');
    })
});
//PRODUCTS ****************
//(Admin) Post a product
//(Admin) PUT/update a product
//(Admin) Delete a product

app.listen(3001);
console.log('Ostrich is ready');