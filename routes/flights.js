const express = require('express');
const router = express.Router();
const { getFlights, addFlight } = require('../controllers/flightController');

router.get('/', getFlights);
router.post('/', addFlight);

module.exports = router;
