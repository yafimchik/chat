const resourceRouter = require('express').Router();
const userRouter = require('../../resources/users/user.router');

resourceRouter.use('/users', userRouter);

resourceRouter.get('/wss*', () => {});

module.exports = resourceRouter;
