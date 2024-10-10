const express = require('express');
const { getStats, getDeviation, updateCryptoData } = require('../controllers/cryptoController');
const CryptoCurrency = require('../models/CryptoCurrency');

const router = express.Router();

router.post('/update',updateCryptoData);
router.get('/stats', getStats);
router.get('/deviation', getDeviation);

// New debug endpoint
router.get('/debug', async (req, res) => {
  try {
    const counts = await CryptoCurrency.aggregate([
      { $group: { _id: '$coinId', count: { $sum: 1 } } }
    ]);
    const latestRecords = await CryptoCurrency.find().sort({ createdAt: -1 }).limit(3);
    res.json({ 
      message: 'Debug information',
      counts: counts,
      latestRecords: latestRecords 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;