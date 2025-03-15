import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import BottomTabNavigator from './BottomNavigation';
import CreateBlogScreen from '../screens/CreateBlogScreen';
import DrawerNavigator from './Drawernavigator';
import SavedBlogsScreen from '../screens/SavedBlogsScreen';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  BottomTab: undefined;
  CreateBlog: undefined;
  Drawer: undefined;
  SavedBlogs: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const StackNavigation = () => {
  return (
    <Stack.Navigator 
      initialRouteName="Login"
      screenOptions={{ 
        headerShown: false,
        contentStyle: { backgroundColor: '#f4f4f4' }
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="BottomTab" component={BottomTabNavigator} />
      <Stack.Screen name="CreateBlog" component={CreateBlogScreen} />
      <Stack.Screen name="Drawer" component={DrawerNavigator} />
      <Stack.Screen name="SavedBlogs" component={SavedBlogsScreen} />
    </Stack.Navigator>
  );
};

export default StackNavigation;