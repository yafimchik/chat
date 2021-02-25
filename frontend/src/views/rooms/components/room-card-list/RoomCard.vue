<template>
  <div class="col-12">
    <button class="room-card" @click="onClick">
      <div class="d-flex">
        <div class="room-card-title">{{ voiceChannel.name }}</div>
        <div>
          <img src="/img/user.svg" width="24" height="24" alt="users" style="filter: invert(1)">
          {{ voiceChannelContacts.length }}
        </div>
      </div>
      <div class="d-flex justify-content-between w-100">
        <app-user-list :users="voiceChannelContacts.slice(0, 5)"></app-user-list>
        <app-close-room-button :voiceChannel="voiceChannel"></app-close-room-button>
      </div>

    </button>
  </div>
</template>

<script>
import UserList from '@/components/user-list/UserList.vue';
import { mapGetters } from 'vuex';
import CloseRoomButton from '@/components/buttons/CloseRoomButton.vue';

export default {
  name: 'RoomCard',
  props: {
    voiceChannel: Object,
  },
  data() {
    return {};
  },
  components: {
    appUserList: UserList,
    appCloseRoomButton: CloseRoomButton,
  },
  computed: {
    ...mapGetters({
      currentVoiceChannelId: 'currentVoiceChannelId',
    }),
    voiceChannelContacts() {
      return this.$store.getters.getVoiceChannelContacts(this.voiceChannel._id);
    },
    isListening() {
      return (this.voiceChannel._id === this.currentVoiceChannelId);
    },
  },
  methods: {
    async onClick() {
      if (!this.isListening) {
        await this.$store.dispatch('connectToVoiceChannel', this.voiceChannel._id);
      }
      await this.$router.push({ name: 'room', params: { roomId: this.voiceChannel._id } });
    },
  },
};
</script>

<style scoped lang="scss">
.room-card-section {
  margin-top: 10px;
}

.room-card-section > div {
  margin-top: 15px;
}

.room-card {
  width: 100%;
  padding: 15px 25px;
  background-color: #333;
  border-radius: 9px;
  color: #fff;
  font-size: 16px;
  border: none;
}

.room-card:hover {
  background-color: #696969;
}

.room-card-title {
  flex: 1 1 0;
  text-align: left;
  font-size: 18px;
}
</style>
