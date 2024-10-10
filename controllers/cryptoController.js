const { default: axios } = require("axios");
const CryptoCurrency = require("../models/CryptoCurrency");

const fetchCryptoData = async (coinId) => {
  const response = await axios.get(
    `https://api.coingecko.com/api/v3/coins/${coinId}`
  );
  const { market_data } = response.data;

  return {
    coinId,
    priceUSD: market_data.current_price.usd,
    marketCapUSD: market_data.market_cap.usd,
    change24h: market_data.price_change_percentage_24h,
  };
};

exports.updateCryptoData = async (req,res) => {
  const coins = ["bitcoin", "matic-network", "ethereum"];
  for (const coin of coins) {
    try {
      const data = await fetchCryptoData(coin);
      await CryptoCurrency.create(data);
       
      console.log(`Updated data for ${coin}`);
    } catch (error) {
      console.error(`Error updating ${coin}:`, error.message);
    }
  }
  res.status(201).json({

    success: true,
    message: "Crypto data updated successfully",
  })
};




exports.getStats = async (req, res) => {
  const { coin } = req.query;
  console.log(`Fetching stats for ${coin}...`);
  try {
    const latestData = await CryptoCurrency.findOne({ coinId: coin }).sort({
      createdAt: -1,
    });
    console.log(`Latest data for ${coin}:`, latestData);
    if (!latestData) {
      console.log(`No data found for ${coin}`);
      return res.status(404).json({ error: "Coin not found" });
    }
    res.json({
      price: latestData.priceUSD,
      marketCap: latestData.marketCapUSD,
      "24hChange": latestData.change24h,
    });
  } catch (error) {
    console.error(`Error fetching stats for ${coin}:`, error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getDeviation = async (req, res) => {
  const { coin } = req.query;
  console.log(`Calculating deviation for ${coin}...`);
  try {
    const prices = await CryptoCurrency.find({ coinId: coin })
      .sort({ createdAt: -1 })
      .limit(100)
      .select("priceUSD");

    console.log(`Found ${prices.length} price records for ${coin}`);

    if (prices.length === 0) {
      console.log(`No data found for ${coin}`);
      return res.status(404).json({ error: "No data found for the coin" });
    }

    const priceValues = prices.map((p) => p.priceUSD);
    const mean =
      priceValues.reduce((sum, price) => sum + price, 0) / priceValues.length;
    const squaredDifferences = priceValues.map((price) =>
      Math.pow(price - mean, 2)
    );
    const variance =
      squaredDifferences.reduce((sum, sqDiff) => sum + sqDiff, 0) /
      priceValues.length;
    const standardDeviation = Math.sqrt(variance);

    console.log(`Calculated deviation for ${coin}: ${standardDeviation}`);
    res.json({ deviation: parseFloat(standardDeviation.toFixed(2)) });
  } catch (error) {
    console.error(`Error calculating deviation for ${coin}:`, error);
    res.status(500).json({ error: "Server error" });
  }
};
