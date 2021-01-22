const spaRouter = require("./spa.router");
const apiRouter = require("./resource.router");

const ROUTES = [
  {
    path: '/api',
    router: apiRouter,
  },
  {
    path: '/*',
    router: spaRouter,
  },
];

module.exports = ROUTES;
