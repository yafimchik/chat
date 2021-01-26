const CONFIG = require('./configs/config');
const HttpServer = require("./app/http-server");
const ROUTES = require("./app/router/routes");
const CHAT_ENGINE_CONSTANTS = require("./app/chat-engine-server/chat-engine.constants");

console.log('CONFIG=', CONFIG);

const httpServer = new HttpServer(
  CHAT_ENGINE_CONSTANTS.CONNECTION_TYPES.http,
  CONFIG.KEY_PATH,
  CONFIG.CERT_PATH,
  CONFIG.PORT,
  ROUTES,
  CONFIG.MONGO_CONNECTION_STRING,
);

httpServer.start();
