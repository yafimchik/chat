const userRouter = require('express').Router();
const loginService = require('../../common/login.service');
const BadLoginError = require('../../errors/bad-login.error');
const asyncHandler = require('../../app/middlewares/async-handler.middleware');
const serviceFabric = require('../service.fabric');
const FRONTEND_CONFIG = require('../../configs/frontend.config');

userRouter.route('/login').post(
  asyncHandler(
    async (req, res) => {
      const { username, password } = req.body;

      const token = await loginService.login(username, password);

      const user = loginService.getUser(token);

      if (!user) {
        throw new BadLoginError();
      }

      if (user.virtualServers) {
        user.virtualServers = await serviceFabric.create('virtualServer')
          .getMany(user.virtualServers);
      }
      res.json({ user, token, config: FRONTEND_CONFIG });
    },
  ),
);

userRouter.route('/register').post(
  asyncHandler(
    async (req, res) => {
      const { username, password } = req.body;

      const virtualServers = ['60019757576dda55bbe9196c']; // TODO virtualservers / mock

      await serviceFabric.create('user')
        .create({ username, password, virtualServers });

      const token = await loginService.login(username, password);

      const user = loginService.getUser(token);

      if (!user) {
        throw new BadLoginError();
      }

      if (user.virtualServers) {
        user.virtualServers = await serviceFabric.create('virtualServer')
          .getMany(user.virtualServers);
      }
      res.json({ user, token, config: FRONTEND_CONFIG });
    },
  ),
);

module.exports = userRouter;
