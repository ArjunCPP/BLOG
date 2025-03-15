import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import ProfileScreen from '../screens/ProfileScreen';
import HomeScreen from '../screens/HomeScreen';
import BlogScreen from '../screens/BlogScreen';
import NotificationScreen from '../screens/NotificationScreen';

import HomeIcon from '../asset/HomeIcon';
import ProfileIcon from '../asset/ProfileIcon';
import BlogIcon from '../asset/BlogIcon';
import NotificationIcon from '../asset/NotificationIcon';
import { BottomTabParamList } from '../types/navigation';

const BottomTab = createBottomTabNavigator<BottomTabParamList>();

const BottomTabNavigator: React.FC = () => {
  return (
    <BottomTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const focusedColor = '#fff';
          const normalColor = 'gray';

          switch (route.name) {
            case 'Home':
              return <HomeIcon fill={focused ? focusedColor : normalColor} size={size} />;
            case 'Profile':
              return <ProfileIcon fill={focused ? focusedColor : normalColor} size={size} />;
            case 'Blog':
              return <BlogIcon fill={focused ? focusedColor : normalColor} size={size} />;
            case 'Notifications':
              return <NotificationIcon fill={focused ? focusedColor : normalColor} size={size} />;
            default:
              return null;
          }
        },
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'black',
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          marginBottom: 5,
        },
      })}
    >
      <BottomTab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Home' }}
      />
      <BottomTab.Screen
        name="Blog"
        component={BlogScreen}
        options={{ title: 'Blog' }}
      />
      <BottomTab.Screen
        name="Notifications"
        component={NotificationScreen} 
        options={{ title: 'Notifications' }}
      />
      <BottomTab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </BottomTab.Navigator>
  );
};

export default BottomTabNavigator;