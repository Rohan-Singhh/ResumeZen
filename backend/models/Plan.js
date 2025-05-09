const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  // Add customId field for non-MongoDB ObjectId identifiers
  customId: {
    type: String,
    index: true,
    sparse: true
  },
  // String ID with format like 'plan_basic_123xyz'
  planId: {
    type: String,
    index: true,
    sparse: true
  },
  price: { 
    type: Number, 
    required: true,
    validate: {
      validator: function(v) {
        return v >= 0; // Price must be non-negative
      },
      message: props => `${props.value} is not a valid price - must be non-negative`
    } 
  },
  type: { 
    type: String, 
    enum: ['count', 'duration'], 
    required: true 
  },
  value: { 
    type: Number, 
    required: true,
    validate: {
      validator: function(v) {
        return v > 0; // Value must be positive
      },
      message: props => `${props.value} is not a valid value - must be positive`
    }
  },
  currency: {
    type: String,
    default: 'INR'
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  features: [{
    type: String
  }],
  active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Method to convert price to string with currency
planSchema.methods.getPriceString = function() {
  return `${this.currency} ${this.price}`;
};

// Static method to find active plans
planSchema.statics.findActive = function() {
  return this.find({ active: true });
};

// Find by custom ID or regular ID
planSchema.statics.findByAnyId = function(id) {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return this.findById(id);
  }
  return this.findOne({
    $or: [
      { customId: id },
      { planId: id },
      { name: id }
    ]
  });
};

module.exports = mongoose.model('Plan', planSchema); 