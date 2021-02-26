export const STATUSES = {
  connecting: 0,
  open: 1,
  closing: 2,
  closed: 3,
};

export const EVENT_TYPES = {
  error: 'error',
  message: 'message',
  open: 'open',
  close: 'close',
};

export const ASYNC_TIME_LIMIT = 5000;
export const CLIENT_ANSWER_TIME_LIMIT = 10000;
export const ASYNC_BINARY_TIME_LIMIT = 20000;
