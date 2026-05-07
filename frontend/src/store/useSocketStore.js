import { create } from 'zustand';
import { io } from 'socket.io-client';
import { useAuthStore } from './useAuthStore';

const SOCKET_URL = import.meta.env.PROD ? '/' : 'http://localhost:5000';

export const useSocketStore = create((set, get) => ({
  socket: null,
  connectSocket: () => {
    const user = useAuthStore.getState().user;
    if (!user || get().socket) return;

    const socket = io(SOCKET_URL);

    socket.on('connect', () => {
      console.log('Connected to socket server');
      socket.emit('setup', user._id);
    });

    set({ socket });
  },
  disconnectSocket: () => {
    if (get().socket) {
      get().socket.disconnect();
      set({ socket: null });
    }
  }
}));
