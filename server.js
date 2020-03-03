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

app.use(express());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/api/products', function (req, res) {
    
    Products.findAll().then((results) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(results));
    }).catch(function (e) {
        console.log(e);
        res.status(434).send('error retrieving products');
    })
});

app.get('/api/products/:id', function (req, res) {

    let id = req.params.id;
    
    Products.findOne({ where: {id: id} }).then((results) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(results));
    }).catch(function (e) {
        console.log(e);
        res.status(434).send('error retrieving product info');
    })
});

app.get('/api/users', function (req, res) {
    
    Users.findAll().then((results) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(results));
    }).catch(function (e) {
        console.log(e);
        res.status(434).send('error retrieving users');
    })
});

app.get('/api/users/:id', function (req, res) {

    let id = req.params.id;
    
    Users.findOne({ where: {id: id} }).then((results) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(results));
    }).catch(function (e) {
        console.log(e);
        res.status(434).send('error retrieving user info');
    })
});

app.post('/api/products', function (req, res) {
    
    let data = {
        name: req.body.name,
        category: req.body.category,
        price: req.body.price,
        description: req.body.description,
        available_quantity: req.body.available_quantity,
        image: req.body.image
    };
    
    Products.create(data).then(function (product) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(product));
    }).catch(function (e) {
        res.status(434).send('unable to list product')
    })

});





    app.post('/api/register', function (req, res) {
        console.log(req.body)
    
        let data = {
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            is_admin: req.body.is_admin,
            address_line1: req.body.address_line1,
            address_line2: req.address_line2,
            city: req.body.city,
            state: req.body.state,
            zip: req.body.zip
        };
        console.log(data)
        if (data.name && data.email && data.password && data.address_line1 && data.city && data.state && data.zip) {
            console.log(data)
            var salt = bcrypt.genSaltSync(10);
            var hash = bcrypt.hashSync(data.password, salt);
            data['password'] = hash;
            
    
            Users.create(data).then(function (user) {
                console.log(user)
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(user));
            });
    
        } else {
            
            res.status(434).send('Name, email, password, and address is required to register')
        }
        
    });




app.post('/api/login', function (req, res) {
    
    let email = req.body.email;
    let password = req.body.password;
    console.log(email)
    if (email && password) {
        Users.findOne({
            where: {
                email: email
            },
        }).then((results) => {
            console.log(results)
            bcrypt.compare(password, results.password).then(function (matched) {
                if (matched) {
                    // req.session.user = results.id;
                    // req.session.name = results.name;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(results));
                } else {
                    res.status(434).send('Email/Password combination did not match')
                }
            });
        }).catch((e) => {
            res.status(434).send('Email does not exist in the database')
        });
    } else {
        res.status(434).send('Both email and password is required to login')
    }
    
});




app.listen(3001);
console.log('Ostrich is ready');