const VirtualServer = require("./virtual-server/virtual-server");
// const serviceFabric = require("../../resources/service.fabric");

class ChatEngineServer {
  constructor(server) {
    this.server = server;
    this.virtualServers = [];

    this.server.on('upgrade', this.onServerUpgrade.bind(this));
  }

  async onServerUpgrade(request, socket, head) {
    // const uuid = new URL(request.url).pathname; // TODO get uuid from pathname
    // console.log(new URL(request.url).pathname);
    const id = '60019757576dda55bbe9196c';

    // let virtualServerInfo;
    // try {
    //   virtualServerInfo = await serviceFabric.create('virtualServer').getById(id);
    // } catch(e) {
    //   if (!(e instanceof NotFoundError)) {
    //     return;
    //   }
    // }

    let virtualServer = this.virtualServers.find(vs => vs.id === id);
    if (!virtualServer) virtualServer = new VirtualServer(id);

    // TODO virtual server get from db and save to db
    // await virtualServer.save(); // save по команде

    if (virtualServer) {
      virtualServer.handleServerUpgrade(request, socket, head);
      this.virtualServers.push(virtualServer);
    } else {
      socket.destroy();
    }

    // TODO authorization;
    // authenticate(request, (err, client) => {
    //   if (err || !client) {
    //     socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
    //     socket.destroy();
    //     return;
    //   }
    //
    //   wss.handleUpgrade(request, socket, head, function done(ws) {
    //     wss.emit('connection', ws, request, client);
    //   });
    // });
  }
}

module.exports = ChatEngineServer;
