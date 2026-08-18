import { useEffect } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../store/AuthContext';

/** Connects to Socket.IO while logged in and surfaces real-time notifications. */
export default function useSocket() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated) return undefined;
    const token = localStorage.getItem('bb_token');
    const socket = io('/', { auth: { token }, transports: ['websocket', 'polling'] });

    socket.on('notification', (notification) => {
      toast(notification.title, { icon: '🔔', duration: 5000 });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    });

    return () => socket.disconnect();
  }, [isAuthenticated, queryClient]);
}
