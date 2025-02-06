import { Schema , model } from "mongoose";

const salesSchema = new Schema(
  {
    item: {
      type: Schema.Types.ObjectId,
      ref: "Inventory",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"],
    },
    pricePerUnit: {
      type: Number,
      // required: true,
      min: [0, "Price per unit must be at least 0"],
    },
    total: {
      type: Number,
    },
    customer: {
      name: {
        type: String,
        // required: true,
        trim: true,
      },
      email: {
        type: String,
        trim: true,
        validate: {
          validator: function (email) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
          },
          message: "Please enter a valid email address",
        },
      },
      phone: {
        type: String,
        trim: true,
        validate: {
          validator: function (phone) {
            return /^\d{10}$/.test(phone); // Simple validation for 10-digit numbers
          },
          message: "Phone number must be 10 digits",
        },
      },
    },
    saleDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

salesSchema.pre("save", function (next) {
  this.total = this.quantity * this.pricePerUnit;
  next();
});

const Sales = model("Sale", salesSchema);

export default Sales;
