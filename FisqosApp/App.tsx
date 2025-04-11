import React, { useEffect } from 'react';
import { StatusBar, LogBox, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Contexts
import { AuthProvider } from './src/contexts/AuthContext';
import { SocketProvider } from './src/contexts/SocketContext';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import { LocaleProvider, useLocale } from './src/contexts/LocaleContext';
import { ToastProvider } from './src/contexts/ToastContext';
import { LoadingProvider } from './src/contexts/LoadingContext';
import { DialogProvider } from './src/contexts/DialogContext';

// Navigation
import AppNavigator from './src/navigation/AppNavigator';

// Ignore specific warnings
LogBox.ignoreLogs([
  'ViewPropTypes will be removed',
  'ColorPropType will be removed',
  'Require cycle:',
]);

// Main app content with theme and locale
const AppContent = () => {
  const { theme } = useTheme();
  const { locale, t } = useLocale();

  // Set status bar based on theme
  useEffect(() => {
    StatusBar.setBarStyle(theme.isDark ? 'light-content' : 'dark-content');
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(theme.colors.background.default);
    }
  }, [theme]);

  return (
    <NavigationContainer>
      <StatusBar
        backgroundColor={theme.colors.background.default}
        barStyle={theme.isDark ? 'light-content' : 'dark-content'}
      />
      <AppNavigator />
    </NavigationContainer>
  );
};

// Root component with all providers
const App = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <LocaleProvider>
            <ToastProvider>
              <LoadingProvider>
                <DialogProvider>
                  <AuthProvider>
                    <SocketProvider>
                      <AppContent />
                    </SocketProvider>
                  </AuthProvider>
                </DialogProvider>
              </LoadingProvider>
            </ToastProvider>
          </LocaleProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
