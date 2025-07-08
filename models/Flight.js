const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema({
  airline: String,
  origin: String,
  destination: String,
  date: Date,
  price: Number,
});

module.exports = mongoose.model('Flight', flightSchema);
