import store from '../store';

export async function onUpdateCallback({ message, virtualServer }) {
  // console.log('input message ', message);
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
    store.commit('addMessage', message);
  }
  if (message.status) {
    await store.dispatch('updateStatus', {
      virtualServer,
      status: message.status,
    });
    // store.commit('updateStatus', {
    //   virtualServer,
    //   status: message.status,
    // });
  }
}

export async function onInputStreamCallback(contact, stream) {
  console.log('contact ', contact);
  console.log('stream ', stream);
  if (stream) {
    store.commit('setContactStream', {
      contact,
      stream,
    });
  } else store.commit('deleteContactStream', contact);
}
