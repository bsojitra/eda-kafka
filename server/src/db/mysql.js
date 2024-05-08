const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize({
  dialect: "mysql",
  host: "localhost",
  port: "3307",
  database: "your_database",
  username: "your_username",
  password: "your_password",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  { timestamps: true }
);

const initialize = async () => {
  await sequelize.authenticate();
  await sequelize.sync({ alter: true });
};

const db = {
  User,
};

module.exports = { db, initialize };
