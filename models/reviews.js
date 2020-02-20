'use strict';
module.exports = (sequelize, DataTypes) => {
  const reviews = sequelize.define('reviews', {
    user_id: DataTypes.INTEGER,
    product_id: DataTypes.INTEGER,
    content: DataTypes.STRING,
    date_left: DataTypes.DATE,
    rating: DataTypes.INTEGER
  }, {});
  reviews.associate = function(models) {
    // associations can be defined here
  };
  return reviews;
};