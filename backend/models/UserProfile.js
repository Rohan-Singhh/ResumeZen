const mongoose = require('mongoose');

const UserProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserAuth',
    required: true,
    unique: true,
  },
  phoneNumber: String,
  occupation: String,
  graduationYear: String,
}, { timestamps: true });

module.exports = mongoose.model('UserProfile', UserProfileSchema); 