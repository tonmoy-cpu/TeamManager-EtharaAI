const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  tid: { type: String, unique: true, sparse: true }
}, { timestamps: true });

teamSchema.pre('save', function() {
  if (!this.tid) {
    this.tid = 'T-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  }
});

module.exports = mongoose.model('Team', teamSchema);
