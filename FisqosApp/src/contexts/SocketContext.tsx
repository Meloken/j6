import React, { createContext, useState, useContext, useEffect } from 'react';
import { AppState } from 'react-native';
import io, { Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { API_URL } from '../config';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { token, user } = useAuth();

  // Handle app state changes (foreground/background)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        // App came to foreground
        if (token && !isConnected) {
          connect();
        }
      } else if (nextAppState === 'background') {
        // App went to background
        // You can choose to disconnect here or keep the connection
        // disconnect();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [token, isConnected]);

  // Connect/disconnect based on auth state
  useEffect(() => {
    if (token && !socket) {
      connect();
    } else if (!token && socket) {
      disconnect();
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [token]);

  const connect = () => {
    if (!token || socket) return;

    const newSocket = io(API_URL, {
      transports: ['websocket'],
      autoConnect: true,
      auth: {
        token
      }
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
      
      // Identify user to the server
      if (user) {
        newSocket.emit('identify', { userId: user.id, username: user.username });
      }
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    setSocket(newSocket);
  };

  const disconnect = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }
  };

  return (
    <SocketContext.Provider value={{ socket, isConnected, connect, disconnect }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
