require('dotenv').config();
const express = require('express');
const connectDB = require('./config/database');
const cryptoRoutes = require('./routes/cryptoRoutes');

const app = express();
const PORT = process.env.PORT || 3000;


connectDB();
const cron = require('node-cron');
const { updateCryptoData } = require('./controllers/cryptoController');
cron.schedule('0 */2 * * *', updateCryptoData);


app.use(express.json());
app.use('/api', cryptoRoutes);


app.get('/', (req, res) => {
  res.json({ message: 'KoinX Backend API' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});