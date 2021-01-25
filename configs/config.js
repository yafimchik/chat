const dotenv = require('dotenv');
const path = require('path');

dotenv.config({
  path: path.resolve(__dirname, '..', '.env'),
});

const CONFIG = {
  PORT: process.env.PORT,
  KEY_PATH: process.env.KEY_PATH,
  CERT_PATH: process.env.CERT_PATH,
  NODE_ENV: process.env.NODE_ENV,
  MONGO_CONNECTION_STRING: process.env.MONGO_CONNECTION_STRING,
  JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
  SALT_ROUNDS: parseInt(process.env.SALT_ROUNDS),
  AUTH_MODE: process.env.AUTH_MODE === 'true',
};

module.exports = CONFIG;
