require('dotenv').config();
const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const gpRoutes = require('./routes/gp');
const connectDB = require('./db/mongo');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api', routes);
app.use('/api/gp', gpRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'swasthya-backend' });
});

const startServer = async () => {
  // Connect to MongoDB before starting the server
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
  });
};

startServer();
