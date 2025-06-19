const mongoose = require('mongoose');

const SuggestionSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  empName: String,
  empID: String,
  department: String,
  suggestion: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Suggestion', SuggestionSchema);