const fileRouter = require('express').Router();
const asyncHandler = require('../../app/middlewares/async-handler.middleware');
const serviceFabric = require('../service.fabric');
const { verifyToken } = require('../../app/middlewares/auth.middleware');
const mime = require('mime-types');
const BadPermissionError = require('../../errors/bad-permission.error');
const { toArrayBuffer } = require('../../common/utils');

fileRouter.route('/:id').get(
  asyncHandler(verifyToken),
  asyncHandler(
    async (req, res) => {
      const { id } = req.params;
      console.log('file id = ', id);

      const fileRecord = await serviceFabric.create('file').getById(id);

      const message = await serviceFabric.create('message').getById(fileRecord.message);
      const chat = await serviceFabric.create('chat').getById(message.chat);
      if (!req.user.virtualServers.includes(chat.virtualServer)) throw new BadPermissionError();

      let contentType = mime.lookup(fileRecord.filename);
      if (!contentType) contentType = 'application/octet-stream';
      const { size } = fileRecord.size;
      const filename = fileRecord.filename;

      const arraybuffer = toArrayBuffer(fileRecord.file, fileRecord.size);

      res.set({
        'Cache-Control': 'no-cache',
        'Content-Type': contentType,
        'Content-Length': size,
        'Content-Disposition': `attachment; filename=${filename}`,
      });
      console.log('file buf ', arraybuffer);
      res.send(arraybuffer);
    },
  ),
);

module.exports = fileRouter;
