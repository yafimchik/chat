const fs = require('fs');
const http = require('http');
const WebSocket = require('ws');

const server = http.createServer();
const wss = new WebSocket.Server({ server });

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
  });

  console.log('connected');
  ws.on('close', () => {
    console.log('closed');
  });
  ws.on('error', () => {
    console.log('error');
  });
});

server.listen(80);
