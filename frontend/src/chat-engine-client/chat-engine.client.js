import ClientError from './errors/client.error';
import ChatEngineClientConnection from './chat-engine.client.connection';
import ServerError from './errors/server.error';
import ConnectionError from './errors/connection.error';

class ChatEngineClient {
  constructor(apiUrl, onUpdateCallback) {
    this.apiUrl = apiUrl;
    this.user = undefined;
    this.servers = {};
    this.token = undefined;
    this.onUpdateCallback = onUpdateCallback;
  }

  async login(username) {
    const body = JSON.stringify({ username, password: 'sss' }); // MOCK PSWD

    try {
      const response = await fetch(`${this.apiUrl}/users/login`, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
        body,
      });
      const result = await response.json();

      return this.initializeAuth(result);
    } catch (e) {
      this.onException(e);
      return undefined;
    }
  }

  async register(username) {
    const body = JSON.stringify({ username, password: 'sss' }); // MOCK PSWD
    try {
      const response = await fetch(`${this.apiUrl}/users/register`, {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'post',
        body,
      });
      const result = await response.json();

      return this.initializeAuth(result);
    } catch (e) {
      this.onException(e);
      return undefined;
    }
  }

  initializeAuth(authResponse) {
    if (!authResponse) return null;
    if (!authResponse.user) return null;
    this.user = { ...authResponse.user };
    this.token = authResponse.token;

    this.servers = {};
    authResponse.user.virtualServers.forEach((vs) => {
      const url = `${this.apiUrl}/wss/${vs._id}`
        .replace('http', 'ws');
      const id = vs._id;
      this.servers[id] = {
        url,
        id,
        client: new ChatEngineClientConnection(
          url, this.token, id,
          this.onMessage.bind(this),
          this.onError.bind(this),
        ),
      };
    });

    const virtualServers = [...authResponse.user.virtualServers];
    const user = { ...authResponse.user };
    delete user.virtualServers;
    const token = authResponse.token.slice();

    return { user, token, virtualServers };
  }

  async connect() {
    try {
      const serversArray = Object.values(this.servers);
      if (!serversArray.length) return false;
      const results = await Promise.all(
        serversArray.map((server) => server.client.connectToServer()),
      );
      return !results.some((result) => !result);
    } catch (e) {
      this.onException(e);
      return false;
    }
  }

  async disconnect() {
    try {
      const serversArray = Object.values(this.servers);
      const results = await Promise.all(serversArray.map((server) => server.client.disconnect()));
      return !results.some((result) => !result);
    } catch (e) {
      this.onException(e);
      return false;
    }
  }

  async getAllChats() {
    try {
      const results = await Promise.all(this.virtualServers.map((vsId) => this.getChats(vsId)));
      const chatsFromServer = results.flat();
      const chats = {};
      chatsFromServer.forEach((chat) => {
        if (!chats[chat.virtualServer]) chats[chat.virtualServer] = [];
        chats[chat.virtualServer].push(chat);
      });
      return chats;
    } catch (e) {
      this.onException(e);
      return {};
    }
  }

  async getAllHistory(chatsArray) {
    try {
      const result = await Promise.all(
        chatsArray.map((chat) => this.getHistory(chat.virtualServer, chat._id, 0)),
      );
      if (!result) return [];
      return result.flat();
    } catch (e) {
      this.onException(e);
      return [];
    }
  }

  onMessage(virtualServer, message) {
    if (message.error) {
      const event = { ...message };
      event.serverError = true;
      this.onError(virtualServer, event);
      return;
    }
    const answer = { message, virtualServer };
    if (this.onUpdateCallback) this.onUpdateCallback(answer);
  }

  onError(virtualServer, event) {
    console.log('client error vs: ', virtualServer);
    console.log('client error event: ', event);

    if (this.onUpdateCallback) {
      this.onUpdateCallback({
        virtualServer,
        message: {
          error: event,
        },
      });
    }
  }

  sendStatus(virtualServer, status) {
    const result = undefined;
    const connection = this.getClient(virtualServer);
    if (!connection) return result;
    try {
      return connection.sendStatus(status);
    } catch (e) {
      this.onException(e);
      return result;
    }
  }

  async sendToken(virtualServer) {
    const result = undefined;
    const connection = this.getClient(virtualServer);
    if (!connection) return result;
    try {
      return await connection.sendToken();
    } catch (e) {
      this.onException(e);
      return result;
    }
  }

  async sendText(virtualServer, chat, text) {
    const result = undefined;
    const connection = this.getClient(virtualServer);
    if (!connection) return result;
    try {
      return await connection.sendText(chat, text);
    } catch (e) {
      this.onException(e);
      return result;
    }
  }

  async sendFullMessage(virtualServer, chat, messageObject) {
    const result = undefined;
    const connection = this.getClient(virtualServer);
    if (!connection) return result;
    try {
      return await connection.sendFullMessage(chat, messageObject);
    } catch (e) {
      this.onException(e);
      return result;
    }
  }

  async getHistory(virtualServer, chat, offset) {
    const result = [];
    const connection = this.getClient(virtualServer);
    if (!connection) return result;
    try {
      return (await connection.getHistory(chat, offset)).history;
    } catch (e) {
      this.onException(e);
      return result;
    }
  }

  async getChats(virtualServer) {
    const result = [];
    const connection = this.getClient(virtualServer);
    if (!connection) return result;
    try {
      return (await connection.getChats()).chats;
    } catch (e) {
      this.onException(e);
      return result;
    }
  }

  async getContacts() {
    const result = [];
    const connection = this.getRandomClient();
    if (!connection) return result;
    try {
      return (await connection.getContacts()).contacts;
    } catch (e) {
      this.onException(e);
      return result;
    }
  }

  // async sendInvitesToServer(virtualServer, contacts) {
  //   return await this.socket.sendAsync(
  //     new ChatMessage(virtualServer, { contacts }, this.token, ACTIONS.getHistory)
  //   );
  // }
  //
  // async sendFriendshipInvite(invite, contact) {
  //   return await this.socket.sendAsync(
  //     new ChatMessage(invite, { contact }, this.token, ACTIONS.friendshipInvite)
  //   );
  // }

  // async confirmInvite(invite) {
  //   return await this.socket.sendAsync(
  //     new ChatMessage(invite, undefined, this.token, ACTIONS.confirmInvite)
  //   );
  // }

  // async leaveServer({ virtualServer }) {
  //   return await this.socket.sendAsync(
  //     new ChatMessage({ virtualServer }, undefined, this.token, ACTIONS.leaveServer)
  //   );
  // }

  get virtualServers() {
    if (!this.user) return [];
    if (!this.user.virtualServers) return []; // eslint-disable-next-line
    return this.user.virtualServers.map((vs) => vs._id);
  }

  getClient(virtualServer) {
    return this.servers[virtualServer].client;
  }

  getRandomClient() {
    const serversArray = Object.values(this.servers);
    if (!serversArray) return undefined;
    const index = Math.round(Math.random() * (serversArray.length - 1));
    return serversArray[index].client;
  }

  onException(error, fromClient = false) {
    let clientError = error instanceof ClientError;
    const serverError = error instanceof ServerError;
    const connectionError = error instanceof ConnectionError;
    if (fromClient) clientError = true;
    const event = {
      error,
      clientError,
      serverError,
      connectionError,
    };
    this.onError(undefined, event);
  }
}

export default ChatEngineClient;
