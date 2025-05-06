require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/sequelize');
const routes = require('./routes');

const app = express();

app.use(cors());
app.use(express.json());

sequelize.sync()
  .then(() => console.log('Connected to MySQL Database'))
  .catch((err) => console.error('MySQL connection error:', err));

app.use('/api', routes);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Cron job
require('./lib/jobs');
