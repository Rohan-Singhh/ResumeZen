const mongoose = require('mongoose');

const UserLinksSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserAuth',
    required: true,
    unique: true,
  },
  linkedin: String,
  github: String,
  website: String,
  bio: String,
}, { timestamps: true });

module.exports = mongoose.model('UserLinks', UserLinksSchema); 