const userRouter = require('express').Router();
const loginService = require('../../common/login.service');
const BadLoginError = require('../../errors/bad-login.error');
const asyncHandler = require('../../app/middlewares/async-handler.middleware');
const serviceFabric = require('../service.fabric');
const FRONTEND_CONFIG = require('../../configs/frontend.config');
const turnService = require('../../common/turn.service');

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

      const config = {
        webRTCConfig: {
          iceServers: await turnService.getIceServers(),
        },
      };

      console.log('config ', config);

      res.json({ user, token, config });
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

      const config = {
        webRTCConfig: {
          iceServers: await turnService.getIceServers(),
        },
      };

      res.json({ user, token, config });
    },
  ),
);

module.exports = userRouter;
