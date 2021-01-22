const path = require('path');

const spaRouter = require('express').Router();

spaRouter.get('*', (req, res) => {
  console.log(path.resolve(__dirname, '..', '..', 'frontend', 'dist','index.html'));
  res.sendFile(path.resolve(__dirname, '..', '..', 'frontend', 'dist','index.html'));
});

module.exports = spaRouter;
