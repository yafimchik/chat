import ChatEngineClientConnection from './chat-engine.client.connection';

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
    const response = await fetch(`${this.apiUrl}/users/login`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
    });
    const result = await response.json();

    return this.initializeAuth(result);
  }

  async register(username) {
    const body = JSON.stringify({ username, password: 'sss' }); // MOCK PSWD
    const response = await fetch(`${this.apiUrl}/users/register`, {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'post',
      body,
    });
    const result = await response.json();

    return this.initializeAuth(result);
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
    const serversArray = Object.values(this.servers);
    if (!serversArray.length) return false;
    const results = await Promise.all(
      serversArray.map((server) => server.client.connectToServer()),
    );
    return !results.some((result) => !result);
  }

  async disconnect() {
    const serversArray = Object.values(this.servers);
    await Promise.all(serversArray.map((server) => server.client.disconnect()));
  }

  async getAllChats() {
    const results = await Promise.all(this.virtualServers.map((vsId) => this.getChats(vsId)));
    const chatsFromServer = results.flat();
    const chats = {};
    chatsFromServer.forEach((chat) => {
      if (!chats[chat.virtualServer]) chats[chat.virtualServer] = [];
      chats[chat.virtualServer].push(chat);
    });
    return chats;
  }

  async getAllHistory(chatsArray) {
    // const response = await fetch(`${this.apiUrl}/messages`, {
    //   headers: {
    //     'Content-Type': 'application/json',
    //     Authorization: `Bearer ${this.token}`,
    //   },
    //   method: 'get',
    // });
    // const result = await response.json();

    const result = await Promise.all( // eslint-disable-next-line
      chatsArray.map((chat) => this.getHistory(chat.virtualServer, chat._id)));
    if (!result) return undefined;

    return result.flat();

    // const history = {};
    //
    // result.forEach((chatHistory) => {
    //   history[chatHistory.chatId] = chatHistory.history;
    // });
    // return history;
  }

  onMessage(virtualServer, message) {
    if (message.error) {
      this.onError(virtualServer, message);
      return;
    }
    const answer = { message, virtualServer };

    this.onUpdateCallback(answer);
  }

  onError(virtualServer, event) {
    console.log(this.apiUrl);
    console.log('server ', virtualServer);
    console.log('error ', event);
  }

  sendStatus(virtualServer, status) {
    const connection = this.getClient(virtualServer);
    if (connection) return connection.sendStatus(status);
    return undefined;
  }

  async sendToken(virtualServer) {
    const connection = this.getClient(virtualServer);
    if (connection) return connection.sendToken();
    return undefined;
  }

  async sendText(virtualServer, chat, text) {
    const connection = this.getClient(virtualServer);
    if (connection) return connection.sendText(chat, text);
    return undefined;
  }

  async getHistory(virtualServer, chat) {
    const connection = this.getClient(virtualServer);
    if (!connection) return [];
    return (await connection.getHistory(chat)).history;
  }

  async getChats(virtualServer, offset) {
    const connection = this.getClient(virtualServer);
    if (!connection) return [];
    return (await connection.getChats(offset)).chats;
  }

  async getContactsOnline(virtualServer) {
    const connection = this.getClient(virtualServer);
    if (connection) return (await connection.getContactsOnline()).contactsOnline;
    return undefined;
  }

  async getContacts() {
    const serversArray = Object.values(this.servers);
    if (serversArray) {
      return (await serversArray[0].client.getContacts()).contacts;
    }
    return undefined;
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
}

export default ChatEngineClient;
