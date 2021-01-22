const Mongoose = require('mongoose').Mongoose;

class MongodbConnection {
  constructor(connectionString) {
    this.connectionString = connectionString;
    this.connectionConstructor = Mongoose;
    this.connection = null;
  }

  async connect(connectionString) {
    if (connectionString) this.connectionString = connectionString;
    this.connection = new this.connectionConstructor();
    return await this.connection.connect(this.connectionString, {
      useNewUrlParser: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    });
  }

  async disconnect() {
    return await this.connection.disconnect();
  }
}

module.exports = MongodbConnection;
