import store from './store';

export default function onUpdateCallback({ message, virtualServer }) {
  console.log('update ! ! ! ', message);
  if (message.error) {
    console.log('error!!! ', message.error);
    // TODO modal form send about Error
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

  // store.commit('addMessage', {text, user, date, chatId});
}
