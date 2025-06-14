const { Model, DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");
const sequelize = require("../config/database");

class User extends Model {
  static async hashPassword(password) {
    return await bcrypt.hash(password, 10);
  }

  async validatePassword(password) {
    return await bcrypt.compare(password, this.password);
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true, // null when using Google OAuth
    },
    userType: {
      type: DataTypes.ENUM("HOTEL", "CUSTOMER"),
      allowNull: false,
    },
    googleId: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isEmailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    refreshToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lastLogin: {
      type: DataTypes.DATE,
    },
    status: {
      type: DataTypes.ENUM("ACTIVE", "INACTIVE", "SUSPENDED"),
      defaultValue: "ACTIVE",
    },
  },
  {
    sequelize,
    modelName: "User",
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await User.hashPassword(user.password);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed("password")) {
          user.password = await User.hashPassword(user.password);
        }
      },
    },
  }
);

module.exports = User;
