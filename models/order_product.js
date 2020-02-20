'use strict';
module.exports = (sequelize, DataTypes) => {
  const order_product = sequelize.define('order_product', {
    order_id: DataTypes.INTEGER,
    product_id: DataTypes.INTEGER,
    quantity: DataTypes.INTEGER
  }, {});
  order_product.associate = function(models) {
    // associations can be defined here
  };
  return order_product;
};