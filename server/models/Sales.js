import mongoose from 'mongoose';

const salesSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inventory',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  pricePerUnit: {
    type: Number,
    required: true,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  customer: {
    name: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      validate: {
        validator: function(email) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        },
        message: "Please enter a valid email address"
      }
    },
    phone: {
      type: String,
      trim: true,
      validate: {
        validator: function(phone) {
          return /^\d{10}$/.test(phone);
        },
        message: "Phone number must be 10 digits"
      }
    }
  },
  saleDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Calculate total before saving
salesSchema.pre('save', function(next) {
  if (this.isModified('quantity') || this.isModified('pricePerUnit')) {
    this.total = this.quantity * this.pricePerUnit;
  }
  next();
});

export default mongoose.model('Sales', salesSchema);
