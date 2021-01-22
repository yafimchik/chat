const spaRouter = require("./spa.router");
const apiRouter = require("./resource.router");

const ROUTES = [
  {
    path: '/api',
    router: apiRouter,
  },
  {
    path: '/app',
    router: spaRouter,
  },
];

module.exports = ROUTES;
