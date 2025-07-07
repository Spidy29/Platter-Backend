const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

class Viewer extends Model {}

Viewer.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    dateOfBirth: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    preferredCuisines: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    dietaryPreferences: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    spiceTolerance: {
      type: DataTypes.ENUM("LOW", "MEDIUM", "HIGH"),
      allowNull: true,
    },
    favoriteDishTypes: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    averageOrderValue: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    defaultAddress: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    savedAddresses: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
  },
  {
    sequelize,
    modelName: "Viewer",
    indexes: [
      {
        fields: ["userId"],
      },
    ],
  }
);

// Relationship
Viewer.belongsTo(User, { foreignKey: "userId" });

module.exports = Viewer;
