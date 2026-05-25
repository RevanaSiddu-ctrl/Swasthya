require('dotenv').config();
const express = require('express');
const cors = require('cors');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api', routes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'swasthya-backend' });
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
