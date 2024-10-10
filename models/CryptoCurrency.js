const mongoose = require('mongoose');

const cryptoCurrencySchema = new mongoose.Schema({
  coinId: { type: String, required: true },
  priceUSD: { type: Number, required: true },
  marketCapUSD: { type: Number, required: true },
  change24h: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('CryptoCurrency', cryptoCurrencySchema);