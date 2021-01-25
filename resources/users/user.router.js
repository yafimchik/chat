const userRouter = require('express').Router();
const loginService = require('../../common/login.service');
const BadLoginError = require('../../errors/bad-login.error');
const asyncHandler = require('../../app/middlewares/async-handler.middleware');
const { hasToken } = require('../../app/middlewares/auth.middleware');
const serviceFabric = require('../service.fabric');

// userRouter.route('/').get(
//   // asyncHandler(hasToken),
//   asyncHandler(
//     async (req, res) => {
//       let users = await serviceFabric.create('user').getAll([]);
//       if (!users) {
//         res.json([]);
//         return;
//       }
//       users.forEach(user => {
//         delete user.password;
//       });
//       users = users.map(user => ({
//         ...user,
//         _id: user._id.toString(),
//         virtualServers: user.virtualServers.map(vs => vs.toString()),
//       }));
//       res.json(users);
//     },
//   ),
// );

userRouter.route('/login').post(
  asyncHandler(
    async (req, res) => {
      const { username, password } = req.body;

      const token = await loginService.login(username, password);

      const user = loginService.getUser(token);

      if (user.virtualServers) {
        user.virtualServers = await serviceFabric.create('virtualServer')
          .getMany(user.virtualServers);
      }

      if (!user) {
        throw new BadLoginError();
      }

      res.json({ user, token });
    },
  ),
);

userRouter.route('/register').post(
  asyncHandler(
    async (req, res) => {
      const { username, password } = req.body;

      const virtualServers = ['60019757576dda55bbe9196c']; // mock virtualserver

      await serviceFabric.create('user')
        .create({ username, password, virtualServers });

      const token = await loginService.login(username, password);

      const user = loginService.getUser(token);

      if (user.virtualServers) {
        user.virtualServers = serviceFabric.create('virtualServer')
          .getMany(user.virtualServers);
      }

      // req.session.token = token;
      // req.session.isAuthorized = true;
      // req.session.save((err) => {
      //   if (err) throw new Error();

      // });
      res.json({ user, token });
    },
  ),
);

userRouter.route('/logout').get(
  asyncHandler(
    async (req, res) => {
      // req.session.destroy(() => {
      //   res.redirect('/login');
      // });
    },
  ),
);

module.exports = userRouter;
