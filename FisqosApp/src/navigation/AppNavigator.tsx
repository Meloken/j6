import React, { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Splash Screen
import SplashScreen from '../screens/SplashScreen';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// Main Screens
import HomeScreen from '../screens/main/HomeScreen';
import GroupsScreen from '../screens/main/GroupsScreen';
import GroupDetailScreen from '../screens/main/GroupDetailScreen';
import ChannelScreen from '../screens/main/ChannelScreen';
import VoiceChannelScreen from '../screens/main/VoiceChannelScreen';
import DirectMessagesScreen from '../screens/main/DirectMessagesScreen';
import ChatScreen from '../screens/main/ChatScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
import FriendsScreen from '../screens/main/FriendsScreen';

// Context
import { useAuth } from '../contexts/AuthContext';

// Stack Navigator Types
export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainStackParamList = {
  MainTabs: undefined;
  GroupDetail: { groupId: string; groupName: string };
  Channel: { channelId: string; channelName: string; isVoiceChannel: boolean };
  VoiceChannel: { channelId: string; channelName: string };
  Chat: { userId: string; username: string };
};

export type MainTabParamList = {
  Home: undefined;
  Groups: undefined;
  DirectMessages: undefined;
  Friends: undefined;
  Profile: undefined;
};

// Create navigators
const RootStack = createStackNavigator<RootStackParamList>();
const AuthStack = createStackNavigator<AuthStackParamList>();
const MainStack = createStackNavigator<MainStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();

// Auth Navigator
const AuthNavigator = () => {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </AuthStack.Navigator>
  );
};

// Main Tab Navigator
const MainTabNavigator = () => {
  return (
    <MainTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = '';

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Groups') {
            iconName = 'group';
          } else if (route.name === 'DirectMessages') {
            iconName = 'chat';
          } else if (route.name === 'Friends') {
            iconName = 'people';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
      })}
    >
      <MainTab.Screen name="Home" component={HomeScreen} />
      <MainTab.Screen name="Groups" component={GroupsScreen} />
      <MainTab.Screen name="DirectMessages" component={DirectMessagesScreen} />
      <MainTab.Screen name="Friends" component={FriendsScreen} />
      <MainTab.Screen name="Profile" component={ProfileScreen} />
    </MainTab.Navigator>
  );
};

// Main Navigator
const MainNavigator = () => {
  return (
    <MainStack.Navigator>
      <MainStack.Screen
        name="MainTabs"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <MainStack.Screen
        name="GroupDetail"
        component={GroupDetailScreen}
        options={({ route }) => ({
          title: route.params?.groupName || 'Group',
        })}
      />
      <MainStack.Screen
        name="Channel"
        component={ChannelScreen}
        options={({ route }) => ({
          title: route.params?.channelName || 'Channel',
        })}
      />
      <MainStack.Screen
        name="VoiceChannel"
        component={VoiceChannelScreen}
        options={({ route }) => ({
          title: route.params?.channelName || 'Voice Channel',
        })}
      />
      <MainStack.Screen
        name="Chat"
        component={ChatScreen}
        options={({ route }) => ({
          title: route.params?.username || 'Chat',
        })}
      />
    </MainStack.Navigator>
  );
};

// Root Navigator
const AppNavigator = () => {
  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="Splash" component={SplashScreen} />
      <RootStack.Screen name="Auth" component={AuthNavigator} />
      <RootStack.Screen name="Main" component={MainNavigator} />
    </RootStack.Navigator>
  );
};

export default AppNavigator;
