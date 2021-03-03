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
  STUN_1_URL: process.env.STUN_1_URL,
  STUN_1_USER: process.env.STUN_1_USER,
  STUN_1_PASSWORD: process.env.STUN_1_PASSWORD,
  STUN_2_URL: process.env.STUN_2_URL,
  STUN_2_USER: process.env.STUN_2_USER,
  STUN_2_PASSWORD: process.env.STUN_2_PASSWORD,
  TURN_1_URL: process.env.TURN_1_URL,
  TURN_1_USER: process.env.TURN_1_USER,
  TURN_1_PASSWORD: process.env.TURN_1_PASSWORD,
  TURN_2_URL: process.env.TURN_2_URL,
  TURN_2_USER: process.env.TURN_2_USER,
  TURN_2_PASSWORD: process.env.TURN_2_PASSWORD,
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
};

module.exports = CONFIG;
