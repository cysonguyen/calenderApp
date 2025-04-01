require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/sequelize');
const routes = require('./routes');
const { authenticateToken } = require('./middleware/auth');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MySQL and sync models
sequelize.sync()
  .then(() => console.log('Connected to MySQL Database'))
  .catch((err) => console.error('MySQL connection error:', err));

// Routes
app.use('/api', routes);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 