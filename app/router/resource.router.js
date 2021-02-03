const resourceRouter = require('express').Router();
const userRouter = require('../../resources/users/user.router');
const audioRouter = require('../../resources/audios/audio.router');
const fileRouter = require('../../resources/files/file.router');

resourceRouter.use('/users', userRouter);
resourceRouter.use('/audios', audioRouter);
resourceRouter.use('/files', fileRouter);

resourceRouter.get('/wss*', () => {});

module.exports = resourceRouter;
