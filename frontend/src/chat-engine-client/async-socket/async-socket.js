import { ASYNC_TIME_LIMIT, EVENT_TYPES, STATUSES } from './socket-constants';
import WsMessage from './ws-message';
import TimeoutError from '../errors/timeout.error';

class AsyncSocket {
  constructor(
    {
      url,
      connect,
      onOpenCallback,
      onMessageCallback,
      onCloseCallback,
      onErrorCallback,
    },
  ) {
    this.url = url;
    this.socket = null;

    this.onOpenCallback = onOpenCallback;
    this.onMessageCallback = onMessageCallback;
    this.onCloseCallback = onCloseCallback;
    this.onErrorCallback = onErrorCallback;

    this.tasks = [];

    if (connect) {
      this.connect();
    }
  }

  send(data) {
    // TODO sort data types for string and binary
    if (this.status === STATUSES.open) {
      const message = new WsMessage(data);
      this.socket.send(message);
    } else throw new Error('connection is not opened!');
  }

  async sendAsync(data) {
    // TODO sort data types for string and binary
    return new Promise((resolve, reject) => {
      const message = new WsMessage(data);
      const watchDogTimeout = setTimeout(() => {
        reject(new TimeoutError());
      }, ASYNC_TIME_LIMIT);
      this.addTask((event, eventType) => {
        if (eventType === EVENT_TYPES.error) {
          clearTimeout(watchDogTimeout);
          setTimeout(() => resolve(null), 0);
          return true;
        }
        if (eventType === EVENT_TYPES.message) {
          if (typeof event.data !== 'string') return false;
          const answer = WsMessage.fromEvent(event);
          if (message.uuid !== answer.uuid) return false;
          clearTimeout(watchDogTimeout);
          setTimeout(() => resolve(answer.payload), 0);
          return true;
        }
        return false;
      });
      this.socket.send(message);
    });
  }

  get status() {
    if (this.socket) return this.socket.readyState;
    return null;
  }

  startTasks(event, eventType) {
    if (this.tasks.length) {
      const taskResults = this.tasks
        .map((task) => ({ task, result: task(event, eventType) }));
      this.tasks = taskResults
        .filter((taskResult) => !taskResult.result)
        .map((taskResult) => taskResult.task);
    }
  }

  addTask(taskFunction) {
    if (taskFunction) this.tasks.push(taskFunction);
  }

  onOpen(event) {
    this.startTasks(event, EVENT_TYPES.open);
    if (this.onOpenCallback) this.onOpenCallback(event);
  }

  onMessage(event) {
    this.startTasks(event, EVENT_TYPES.message);
    const message = WsMessage.fromEvent(event);
    if (this.onMessageCallback) this.onMessageCallback(message.payload);
  }

  onClose(event) {
    this.startTasks(event, EVENT_TYPES.close);
    if (this.onCloseCallback) this.onCloseCallback(event);
  }

  onError(event) {
    this.startTasks(event, EVENT_TYPES.error);
    if (this.onErrorCallback) this.onErrorCallback(event);
  }

  setSocketCallbacks() {
    if (this.socket) {
      this.socket.onopen = this.onOpen.bind(this);
      this.socket.onmessage = this.onMessage.bind(this);
      this.socket.onclose = this.onClose.bind(this);
      this.socket.onerror = this.onError.bind(this);
    } else throw new Error('AsyncSocket was not created! AsyncSocket Init error!');
  }

  connect(url = this.url) {
    if (url) {
      this.socket = new WebSocket(url);
    } else throw new Error('Bad url for websocket connection!');
    this.setSocketCallbacks();
  }

  connectAsync(url) {
    return new Promise((resolve) => {
      const watchDogTimeout = setTimeout(() => {
        resolve(false);
      }, ASYNC_TIME_LIMIT);
      this.addTask((event, eventType) => {
        if (eventType === EVENT_TYPES.error) {
          clearTimeout(watchDogTimeout);
          setTimeout(() => resolve(false), 0);
          return true;
        }
        if (eventType === EVENT_TYPES.open) {
          clearTimeout(watchDogTimeout);
          setTimeout(() => resolve(true), 0);
          return true;
        }
        return false;
      });
      this.connect(url);
    });
  }

  disconnect(code, reason) {
    this.socket.close(code, reason);
  }

  disconnectAsync(code, reason) {
    return new Promise((resolve) => {
      const watchDogTimeout = setTimeout(() => {
        resolve(true);
      }, ASYNC_TIME_LIMIT);
      this.addTask((event, eventType) => {
        if (eventType === EVENT_TYPES.error) {
          clearTimeout(watchDogTimeout);
          setTimeout(() => resolve(true), 0);
          return true;
        }
        if (eventType === EVENT_TYPES.close) {
          clearTimeout(watchDogTimeout);
          setTimeout(() => resolve(true), 0);
          return true;
        }
        return false;
      });
      this.disconnect(code, reason);
    });
  }
}

export default AsyncSocket;
