import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import BottomTabNavigator from './BottomNavigation';

import { useAuth } from '../context/AuthContext';

export type HomeDrawerParamList = {
    MainHome: undefined;
    SavedBlog: undefined;
    Notifications: undefined;
    Profile: undefined;
    Logout: undefined;
};

const Drawer = createDrawerNavigator<HomeDrawerParamList>();

const CustomDrawerContent = ({ navigation }: any) => {
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
        });
    };

    return (
        <View style={styles.drawerContainer}>
            <View style={styles.drawerHeader}>
                <Text style={styles.drawerTitle}>BLOG</Text>
            </View>

            <TouchableOpacity
                style={styles.drawerItem}
                onPress={() => {
                    navigation.navigate('BottomTab', { screen: 'Home' });
                    navigation.closeDrawer();
                }}
            >
                <Text style={styles.drawerItemText}>Home</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.drawerItem}
                onPress={() => {
                    navigation.navigate('SavedBlogs')
                    navigation.closeDrawer()
                }}
            >
                <Text style={styles.drawerItemText}>Saved Blog</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.drawerItem}
                onPress={() => {
                    navigation.navigate('BottomTab', { screen: 'Notifications' });
                    navigation.closeDrawer();
                }}
            >
                <Text style={styles.drawerItemText}>Notifications</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.drawerItem}
                onPress={() => {
                    navigation.navigate('BottomTab', { screen: 'Profile' });
                    navigation.closeDrawer();
                }}
            >
                <Text style={styles.drawerItemText}>Profile</Text>
            </TouchableOpacity>

            <View style={styles.separator} />

            <TouchableOpacity
                style={styles.drawerItem}
                onPress={handleLogout}
            >
                <Text style={styles.drawerItemText}>Logout</Text>
            </TouchableOpacity>
        </View>
    );
};

const DrawerNavigator = () => {
    return (
        <Drawer.Navigator
            initialRouteName="BottomTab"
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={{
                headerShown: false,
                drawerStyle: {
                    backgroundColor: '#fff',
                    width: 280,
                },
            }}
        >
            <Drawer.Screen name="BottomTab" component={BottomTabNavigator} />
        </Drawer.Navigator>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    drawerContainer: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 50,
    },
    drawerHeader: {
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f4f4f4',
        marginBottom: 20,
    },
    drawerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
    },
    drawerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 20,
    },
    drawerItemText: {
        fontSize: 16,
        marginLeft: 20,
        color: '#333',
    },
    separator: {
        height: 1,
        backgroundColor: '#f4f4f4',
        marginVertical: 15,
    },
});

export default DrawerNavigator;