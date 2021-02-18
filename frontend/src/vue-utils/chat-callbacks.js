import store from '../store';

export async function onUpdateCallback({ message, virtualServer }) {
  if (message.error) {
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
  if ((message.text || message.files || message.audio) && message.date) {
    await store.dispatch('addMessage', message);
  }
  if (message.status) {
    await store.dispatch('updateStatus', {
      virtualServer,
      status: message.status,
    });
  }
}

export async function onInputStreamCallback(contact, stream) {
  if (stream) {
    store.commit('setContactStream', {
      contact,
      stream,
    });
  } else store.commit('deleteContactStream', contact);
}

export async function onCloseConnectionCallback(contact) {
  store.commit('deleteContactStream', contact);
}

export async function onVoiceDetectionEventCallback({ contact, value }) {
  store.commit('setContactVoiceState', { contact, value });
}
