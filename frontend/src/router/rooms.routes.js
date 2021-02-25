import Rooms from '@/views/rooms/Rooms.vue';
import CreateRoom from '@/views/rooms/create-room/CreateRoom.vue';
import Room from '@/views/room/Room.vue';
import Chat from '@/views/room/chat/Chat.vue';
import CloseRoom from '@/views/rooms/close-room/CloseRoom.vue';

export const roomsRoutes = [
  {
    path: '/rooms',
    component: Rooms,
    name: 'rooms',
    meta: { requiresAuth: true },
    children: [
      {
        path: '/rooms/create',
        name: 'createRoom',
        component: CreateRoom,
        meta: { requiresAuth: true },
      },
      {
        path: '/rooms/:roomId/delete',
        name: 'closeRoom',
        component: CloseRoom,
        meta: { requiresAuth: true },
      },
    ],
  },
  {
    path: '/rooms/:roomId',
    component: Room,
    name: 'room',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'chat',
        component: Chat,
        name: 'chat',
      },
    ],
  },
];
