const express = require('express');
// const expressWs = require('express-ws');
// const session = require('express-session');
// const MongoStore = require('connect-mongodb-session')(session);
mongoose = require('mongoose');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const ChatEngine = require("./chat-engine-server/chat-engine.server");



class HttpServer {
  constructor(keyPath, certPath, port, routes, mongodbString) {
    this.expressApp = undefined;
    this.expressWs = undefined;
    this.initExpress(routes);
    this.chatEngine = undefined;
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
    this.expressApp.use(express.static(path.resolve(__dirname, '..', '..', 'frontend', 'dist')));
    this.expressApp.use(express.urlencoded({ extended: true }));

    // const sessionStore = new MongoStore({
    //   collection: 'sessions',
    //   uri: MONGO_CONNECTION_STRING,
    // });

    // this.expressApp.use(
    //   session(
    //     {
    //       secret: JWT_SECRET_KEY,
    //       resave: false,
    //       saveUninitialized: false,
    //       store: sessionStore,
    //     },
    //   ),
    // );
    // this.expressApp.use(errorHandler);

    this.initRoutes(routes);
  }

  initRoutes(routes = []) {
    if (!routes.length) return;
    routes.forEach(route => {
      // console.log(`path use ${route.path} router`);
      // console.log(route.router);
      this.expressApp.use(route.path, route.router);
    });
  }

  async start(keyPath = this.keyPath, certPath = this.certPath, port = this.port) {
    await this.connectDb();
    const key = fs.readFileSync(keyPath);
    const cert = fs.readFileSync(certPath);

    // this.server = https.createServer({ key, cert }, this.expressApp);
    this.server = http.createServer(this.expressApp);
    // this.expressWs = expressWs(this.expressApp, this.server);

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
