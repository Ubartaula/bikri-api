const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    email: {
      type: String,
    },

    phoneNumber: {
      type: Number,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      default: "Customer",
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    lat: {
      type: Number,
    },

    lng: {
      type: Number,
    },

    resetCode: {
      type: Number,
    },

    resetTime: {
      type: Number,
    },
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
