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




// router.get('/register', function(req, res) {
    app.post('/api/register', function (req, res) {
    
        let data = {
            name: req.body.name.trim(),
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
// })








app.listen(3001);
console.log('Ostrich is ready');