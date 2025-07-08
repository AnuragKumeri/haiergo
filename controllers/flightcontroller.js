const Flight = require('../models/Flight');

const getFlights = async (req, res) => {
  const flights = await Flight.find();
  res.json(flights);
};

const addFlight = async (req, res) => {
  const flight = new Flight(req.body);
  await flight.save();
  res.status(201).json(flight);
};

module.exports = { getFlights, addFlight };
