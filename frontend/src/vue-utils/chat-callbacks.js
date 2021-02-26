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
  if (message.voiceChannel) {
    store.commit('addVoiceChannel', {
      virtualServer,
      voiceChannel: message.voiceChannel,
    });
  }
  if (message.chat) {
    store.commit('addChat', {
      virtualServer,
      chat: message.chat,
    });
  }
  if (message.voiceChannelId) {
    await store.dispatch('deleteVoiceChannel', {
      virtualServer,
      voiceChannelId: message.voiceChannelId,
    });
  }
  if ((message.text || message.files || message.audio) && message.date) {
    await store.dispatch('addMessage', message);
  }
  if (message.status) {
    console.log('status ', message.status);
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
