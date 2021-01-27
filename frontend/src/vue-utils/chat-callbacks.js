import store from '../store';

export default function onUpdateCallback({ message, virtualServer }) {
  if (message.error) {
    console.log('error!!! ', message.error);
    const notification = {
      error: message.error,
      serverError: !!message.serverError,
      message: undefined,
      title: undefined,
    };
    store.commit('postNotification', notification);
    return;
  }
  if (message.contactsOnline) {
    store.commit('updateContactsOnline', {
      virtualServer,
      contactsOnline: message.contactsOnline,
    });
  }
  if (message.text) {
    store.commit('addMessage', message);
  }
  if (message.status) {
    store.commit('updateStatus', {
      virtualServer,
      status: message.status,
    });
  }
}
