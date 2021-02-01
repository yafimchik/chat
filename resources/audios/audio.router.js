const audioRouter = require('express').Router();
const asyncHandler = require('../../app/middlewares/async-handler.middleware');
const serviceFabric = require('../service.fabric');
const mime = require('mime-types');
const BadPermissionError = require('../../errors/bad-permission.error');
const { verifyToken } = require('../../app/middlewares/auth.middleware');

audioRouter.route('/:id').post(
  asyncHandler(verifyToken),
  asyncHandler(
    async (req, res, next) => {
      const { id } = req.params;
      console.log('audio id = ', id);

      const audioRecord = await serviceFabric.create('audio').getById(id);

      const message = await serviceFabric.create('message').getById(audioRecord.message);
      const chat = await serviceFabric.create('chat').getById(message.chat);
      if (!req.user.virtualServers.includes(chat.virtualServer)) throw new BadPermissionError();

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
