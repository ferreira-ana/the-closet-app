const mongoose = require('mongoose');

const predefinedCategories = ['winter', 'spring', 'autumn', 'summer'];

const closetSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'A title is required.'] },
    categories: {
      type: [String], // Array of strings
      validate: {
        validator: function (arr) {
          return arr.every((cat) => predefinedCategories.includes(cat));
        },
        message:
          'Categories must be one or more of the following: winter, spring, autumn, summer.',
      },
      default: [], // Default to an empty array if not provided
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User
    photo: {
      type: String,
      required: [true, 'An image is required.'],
    },
    colors: {
      type: [String], // Array of strings
      validate: {
        validator: function (arr) {
          return arr.every(
            (color) => typeof color === 'string' && color.trim().length > 0,
          );
        },
        message: 'Colors must be non-empty strings.',
      },
      default: [], // Default to an empty array if not provided
    },
  },

  { timestamps: true },
);

module.exports = mongoose.model('Closet', closetSchema);
