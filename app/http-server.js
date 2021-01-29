const express = require('express');
mongoose = require('mongoose');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const ChatEngine = require('./chat-engine-server/chat-engine.server');
const errorHandler = require('./middlewares/error-handler.middleware');
const CHAT_ENGINE_CONSTANTS = require('./chat-engine-server/chat-engine.constants');

class HttpServer {
  constructor(
    connectionType = CHAT_ENGINE_CONSTANTS.CONNECTION_TYPES.http,
    keyPath,
    certPath,
    port = 80,
    routes,
    mongodbString,
  ) {
    this.connectionType = connectionType;
    this.initExpress(routes);
    this.keyPath = keyPath;
    this.certPath = certPath;
    this.port = port;
    this.mongodbString = mongodbString;
  }

  async connectDb(connectionString = this.mongodbString) {
    return await mongoose.connect(
        connectionString,
        {
          useUnifiedTopology: true,
          useNewUrlParser: true,
          useFindAndModify: false,
          useCreateIndex: true,
        });
  }

  initExpress(routes) {
    this.expressApp = express();
    this.expressApp.use(express.json());
    this.expressApp.use(express.static(path.resolve(__dirname, '..', 'frontend', 'dist')));
    this.expressApp.use(express.urlencoded({ extended: true }));
    this.expressApp.get('/', function(req, res) {
      res.redirect('/app');
    });

    this.initRoutes(routes);

    this.expressApp.use(errorHandler);
  }

  initRoutes(routes = []) {
    if (!routes.length) return;
    routes.forEach(route => {
      this.expressApp.use(route.path, route.router);
    });
  }

  async start(keyPath = this.keyPath, certPath = this.certPath, port = this.port) {
    await this.connectDb();
    const key = fs.readFileSync(keyPath);
    const cert = fs.readFileSync(certPath);

    if (this.connectionType === CHAT_ENGINE_CONSTANTS.CONNECTION_TYPES.http) {
      this.server = http.createServer(this.expressApp);
    } else {
      this.server = https.createServer({ key, cert }, this.expressApp);
    }

    this.server.listen(port, err => {
      if (err) {
        console.log('Well, this didn\'t work...');
        process.exit();
      }
      this.chatEngine = new ChatEngine(this.server);
      console.log('HttpServer is listening on port ' + port);
    });
  }
}

module.exports = HttpServer;
