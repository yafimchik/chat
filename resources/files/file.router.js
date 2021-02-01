const fileRouter = require('express').Router();
const asyncHandler = require('../../app/middlewares/async-handler.middleware');
const serviceFabric = require('../service.fabric');
const { verifyToken } = require('../../app/middlewares/auth.middleware');
const mime = require('mime-types');

fileRouter.route('/:id').post(
  asyncHandler(verifyToken),
  asyncHandler(
    async (req, res) => {
      const { id } = req.params;
      console.log('audio id = ', id);

      const fileRecord = await serviceFabric.create('file').getById(id);

      const message = await serviceFabric.create('message').getById(fileRecord.message);
      const chat = await serviceFabric.create('chat').getById(message.chat);
      if (!req.user.virtualServers.includes(chat.virtualServer)) throw new BadPermissionError();

      let contentType = mime.lookup(fileRecord.filename);
      if (!contentType) contentType = 'application/octet-stream';
      const { size } = fileRecord.file;
      const filename = fileRecord.filename;

      res.set({
        'Cache-Control': 'no-cache',
        'Content-Type': contentType,
        'Content-Length': size,
        'Content-Disposition': `attachment; filename=${filename}`,
      });
      res.send(fileRecord.file);
    },
  ),
);

module.exports = fileRouter;
