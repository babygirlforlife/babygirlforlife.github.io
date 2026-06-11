// ENHANCED — Milestone Four: Databases
// Changes from original:
//   1. length and perPerson corrected from String to Number
//   2. Compound index on { start, resort } for date-range queries
//   3. Virtual field priceFormatted for display-layer use
//   4. Strict schema mode (default true — made explicit for clarity)
//   5. timestamps option added for createdAt / updatedAt audit fields

const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Trip code is required'],
      unique: true,
      trim: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Trip name is required'],
      trim: true,
      index: true
    },
    // FIXED: was String — numeric type enables range queries and aggregation math
    length: {
      type: Number,
      required: [true, 'Trip length (in nights) is required'],
      min: [1, 'Length must be at least 1 night']
    },
    start: {
      type: Date,
      required: [true, 'Start date is required']
    },
    resort: {
      type: String,
      required: [true, 'Resort name is required'],
      trim: true
    },
    // FIXED: was String — numeric type enables aggregation (avg, min, max price)
    perPerson: {
      type: Number,
      required: [true, 'Per-person price is required'],
      min: [0, 'Price cannot be negative']
    },
    image: {
      type: String,
      required: [true, 'Image filename is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Trip description is required'],
      trim: true
    }
  },
  {
    strict: true,             // reject fields not declared in schema
    timestamps: true          // adds createdAt and updatedAt automatically
  }
);

// Compound index: supports queries like "trips at this resort starting after date X"
tripSchema.index({ start: 1, resort: 1 });

// Virtual: formatted price string for display — never stored in DB
tripSchema.virtual('priceFormatted').get(function () {
  return `$${this.perPerson.toFixed(2)}`;
});

const Trip = mongoose.model('trips', tripSchema);
module.exports = Trip;
