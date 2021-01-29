const fileRouter = require('express').Router();
const asyncHandler = require('../../app/middlewares/async-handler.middleware');
const serviceFabric = require('../service.fabric');
const { hasToken } = require('../../app/middlewares/auth.middleware');
const mime = require('mime-types');

fileRouter.route('/:id').post(
  asyncHandler(hasToken),
  asyncHandler(
    async (req, res) => {
      const { id } = req.params;
      console.log('audio id = ', id);

      const fileRecord = await serviceFabric.create('file').getById(id);

      // TODO user chat security
      /*
      * get user virtualServers.
      * get chats of all servers.
      * get message of audio
      * check chat in chat-list
      * TODO file_length, content_type ???
      */

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
