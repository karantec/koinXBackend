const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const CryptoCurrency = require('../src/models/CryptoCurrency');
const { getStats, getDeviation } = require('../src/controllers/cryptoController');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Crypto Controller', () => {
  beforeEach(async () => {
    await CryptoCurrency.deleteMany({});
  });

  test('getStats should return latest crypto data', async () => {
    const mockCrypto = new CryptoCurrency({
      coinId: 'bitcoin',
      priceUSD: 50000,
      marketCapUSD: 1000000000000,
      change24h: 2.5,
    });
    await mockCrypto.save();

    const req = { query: { coin: 'bitcoin' } };
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    await getStats(req, res);

    expect(res.json).toHaveBeenCalledWith({
      price: 50000,
      marketCap: 1000000000000,
      "24hChange": 2.5,
    });
  });

  test('getDeviation should calculate standard deviation', async () => {
    const prices = [100, 200, 300];
    for (const price of prices) {
      await CryptoCurrency.create({
        coinId: 'bitcoin',
        priceUSD: price,
        marketCapUSD: 1000000000000,
        change24h: 0,
      });
    }

    const req = { query: { coin: 'bitcoin' } };
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    await getDeviation(req, res);

    expect(res.json).toHaveBeenCalledWith({
      deviation: 81.65,
    });
  });
});