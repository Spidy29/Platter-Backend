const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize("project_db", "root", "1234", {
  host: "localhost",
  dialect: "mysql",
  logging: false, // Disable logging
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

module.exports = sequelize;
