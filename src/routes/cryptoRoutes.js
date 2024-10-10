const express = require('express');
const { getStats, getDeviation, updateCryptoData } = require('../controllers/cryptoController');
const CryptoCurrency = require('../models/CryptoCurrency');

const router = express.Router();

router.post('/update',updateCryptoData);
router.get('/stats', getStats);
router.get('/deviation', getDeviation);


module.exports = router;