import React from 'react';
import { render } from '@testing-library/react-native';
import App from '../App';

// Mock the context providers
jest.mock('../src/contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  useAuth: () => ({
    token: null,
    user: null,
    isLoading: false,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    updateUser: jest.fn(),
  }),
}));

jest.mock('../src/contexts/SocketContext', () => ({
  SocketProvider: ({ children }: { children: React.ReactNode }) => children,
  useSocket: () => ({
    socket: null,
    isConnected: false,
    connect: jest.fn(),
    disconnect: jest.fn(),
  }),
}));

jest.mock('../src/contexts/ThemeContext', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
  useTheme: () => ({
    theme: {
      colors: {
        primary: '#7289da',
        background: {
          default: '#f5f5f5',
        },
        text: {
          primary: '#333',
        },
      },
    },
    isDark: false,
    toggleTheme: jest.fn(),
    setDarkMode: jest.fn(),
  }),
}));

jest.mock('../src/contexts/LocaleContext', () => ({
  LocaleProvider: ({ children }: { children: React.ReactNode }) => children,
  useLocale: () => ({
    locale: 'en',
    locales: [
      { name: 'English', code: 'en' },
      { name: 'Türkçe', code: 'tr' },
    ],
    t: (key: string) => key,
    changeLocale: jest.fn(),
  }),
}));

// Mock the navigation
jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }: { children: React.ReactNode }) => children,
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
}));

describe('App', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(<App />);
    expect(toJSON()).toBeTruthy();
  });
});
