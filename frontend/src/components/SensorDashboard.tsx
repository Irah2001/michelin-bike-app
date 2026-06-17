import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export function SensorDashboard() {
  const backendUrl = (import.meta.env.VITE_BACKEND_URL as string | undefined) ?? 'http://localhost:3001';
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(backendUrl, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('sensor_reading', (data: unknown) => {
      console.log('[sensor_reading]', data);
    });
    socket.on('ride_reading', (data: unknown) => {
      console.log('[ride_reading]', data);
    });

    return () => { socket.disconnect(); };
  }, [backendUrl]);

  return null;
}
