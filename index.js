const CONFIG = require('./configs/config');
const HttpServer = require("./app/http-server");
const ROUTES = require("./app/router/routes");

console.log('CONFIG=', CONFIG);

const httpServer = new HttpServer(CONFIG.KEY_PATH, CONFIG.CERT_PATH, CONFIG.PORT, ROUTES, CONFIG.MONGO_CONNECTION_STRING);

httpServer.start();
