const Joi = require("joi");

const hotelRegistrationSchema = Joi.object({
  // Basic Information
  businessName: Joi.string().required().min(3).max(100),
  tradeName: Joi.string().required().min(3).max(100),
  ownerName: Joi.string().required().min(3).max(100),
  ownerPhone: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required(),
  businessPhone: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required(),

  // Legal Documents
  gstNumber: Joi.string()
    .pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid GST number format",
    }),
  gstCertificate: Joi.string().required(),
  fssaiLicenseNumber: Joi.string().required(),
  fssaiLicense: Joi.string().required(),
  fssaiExpiryDate: Joi.date().greater("now").required(),
  panNumber: Joi.string()
    .pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid PAN number format",
    }),
  panCard: Joi.string().required(),

  // Location
  address: Joi.string().required().min(10).max(255),
  locality: Joi.string().required(),
  city: Joi.string().required(),
  state: Joi.string().required(),
  pincode: Joi.string()
    .pattern(/^[0-9]{6}$/)
    .required(),
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),

  // Business Details
  establishmentType: Joi.string()
    .valid(
      "RESTAURANT",
      "CAFE",
      "FAST_FOOD",
      "FINE_DINING",
      "CLOUD_KITCHEN",
      "FOOD_TRUCK",
      "DHABA",
      "OTHER"
    )
    .required(),
  cuisineTypes: Joi.array().items(Joi.string()).min(1).required(),
  openingHours: Joi.object()
    .pattern(
      /^/,
      Joi.object({
        open: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        close: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        closed: Joi.boolean(),
      })
    )
    .required(),
  seatingCapacity: Joi.number().integer().min(0),
  averageDailyOrders: Joi.number().integer().min(0).required(),

  // Banking Details
  bankName: Joi.string().required(),
  bankAccountNumber: Joi.string().required(),
  ifscCode: Joi.string()
    .pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid IFSC code format",
    }),
  upiId: Joi.string().optional(),

  // Optional device info will be captured automatically
});

module.exports = {
  hotelRegistrationSchema,
};
