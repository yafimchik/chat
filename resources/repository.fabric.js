const MongodbRepositoryFabric = require('./prototype/mongodb.repository.fabric');
const mongodbResourceConfig = require("./mongodb.resource.config");

const repositoryFabric = new MongodbRepositoryFabric(mongodbResourceConfig);

module.exports = repositoryFabric;
