const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

class Hotel extends Model {}

Hotel.init(
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
    // Required fields for initial registration
    businessName: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Legal/registered name of the hotel/restaurant",
    },
    businessPhone: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        is: /^[0-9]{10}$/,
      },
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    pincode: {
      type: DataTypes.STRING(6),
      allowNull: false,
      validate: {
        is: /^[0-9]{6}$/,
      },
    },

    // Optional fields that can be added later
    tradeName: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Trading/brand name if different from business name",
    },
    gstNumber: {
      type: DataTypes.STRING(15),
      allowNull: true,
      unique: true,
      validate: {
        is: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
      },
    },
    gstCertificateUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    fssaiLicenseNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    fssaiLicenseUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    fssaiExpiryDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    panNumber: {
      type: DataTypes.STRING(10),
      allowNull: true,
      unique: true,
      validate: {
        is: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
      },
    },
    panCardUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    locality: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    pincode: {
      type: DataTypes.STRING(6),
      allowNull: true,
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true,
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
    },
    establishmentType: {
      type: DataTypes.ENUM(
        "RESTAURANT",
        "CAFE",
        "FAST_FOOD",
        "FINE_DINING",
        "CLOUD_KITCHEN",
        "FOOD_TRUCK",
        "DHABA",
        "OTHER"
      ),
      allowNull: true,
    },
    cuisineTypes: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    openingHours: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {},
    },
    seatingCapacity: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    averageDailyOrders: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    bankName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    bankAccountNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ifscCode: {
      type: DataTypes.STRING(11),
      allowNull: true,
      validate: {
        is: /^[A-Z]{4}0[A-Z0-9]{6}$/,
      },
    },
    upiId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    onboardingStep: {
      type: DataTypes.ENUM(
        "BASIC_INFO",
        "LOCATION_ADDED",
        "DOCUMENTS_UPLOADED",
        "MENU_ADDED",
        "BANKING_ADDED",
        "COMPLETED"
      ),
      defaultValue: "BASIC_INFO",
      allowNull: false,
    },
    verificationStatus: {
      type: DataTypes.ENUM("PENDING", "IN_REVIEW", "APPROVED", "REJECTED"),
      defaultValue: "PENDING",
      allowNull: false,
    },
    operationalStatus: {
      type: DataTypes.ENUM(
        "SETTING_UP",
        "ACTIVE",
        "TEMPORARILY_CLOSED",
        "PERMANENTLY_CLOSED",
        "SUSPENDED"
      ),
      defaultValue: "SETTING_UP",
      allowNull: false,
    },
    isKitchenPhotosUploaded: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isMenuUploaded: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    verificationComments: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Hotel",
    indexes: [
      {
        fields: ["userId"],
      },
      {
        fields: ["city", "state"],
      },
      {
        fields: ["verificationStatus"],
      },
      {
        fields: ["operationalStatus"],
      },
    ],
  }
);

// Relationship
Hotel.belongsTo(User, { foreignKey: "userId" });

module.exports = Hotel;
