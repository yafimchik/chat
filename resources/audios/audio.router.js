const audioRouter = require('express').Router();
const asyncHandler = require('../../app/middlewares/async-handler.middleware');
const serviceFabric = require('../service.fabric');
const { hasToken } = require('../../app/middlewares/auth.middleware');
const mime = require('mime-types');

audioRouter.route('/:id').post(
  asyncHandler(hasToken),
  asyncHandler(
    async (req, res, next) => {
      const { id } = req.params;
      console.log('audio id = ', id);

      const audioRecord = await serviceFabric.create('audio').getById(id);

      // TODO user chat security
      /*
      * get user virtualServers.
      * get chats of all servers.
      * get message of audio
      * check chat in chat-list
      * TODO file_length, content_type ???
      */
      const type = audioRecord.type;
      let contentType = mime.lookup(type);
      if (!contentType) contentType = 'audio/mpeg';
      const size = mime.lookup(audioRecord.audio.size);

      res.set({
        'Cache-Control': 'no-cache',
        'Content-Type': contentType,
        'Content-Length': size,
        'Content-Disposition': `attachment; filename=${id}.${type ? type : 'mp3'}`,
      });
      res.send(audioRecord.audio);
    },
  ),
);

module.exports = audioRouter;

async function get(req, res, next) {
  try {

  } catch (err) {
    next(err);
  }
}
