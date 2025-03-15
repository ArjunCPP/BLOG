import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { db, authInstance as auth } from '../context/firebase'; 

import { firestore } from '../context/firebase';

interface Notification {
  id: string;
  type: 'new_blog' | 'follow' | 'comment' | 'like';
  title: string;
  message: string;
  read: boolean;
  createdAt: any; 
  contentId?: string;
  userId: string;
}

const NotificationScreen = () => {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    const unsubscribe = loadNotifications();
    return () => unsubscribe && unsubscribe();
  }, []);

  const loadNotifications = () => {
    if (!auth.currentUser) return;

    try {
      const notificationsRef = db.collection('notifications');
      const q = notificationsRef
        .where('userId', '==', auth.currentUser.uid)
        .orderBy('createdAt', 'desc');

      return q.onSnapshot((querySnapshot) => {
        const notificationsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data() as Omit<Notification, 'id'>,
        }));

        setNotifications(notificationsList);
        setUnreadCount(notificationsList.filter(n => !n.read).length);
        setLoading(false);
        setRefreshing(false);
      }, (error) => {
        console.log('Error fetching notifications:', error);
        setLoading(false);
        setRefreshing(false);
      });
    } catch (error) {
      console.log('Error setting up notifications listener:', error);
      setLoading(false);
      setRefreshing(false);
      return () => {};
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const notificationRef = db.collection('notifications').doc(notificationId);
      await notificationRef.update({ read: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (unreadCount === 0) return;

    try {
      const batch = db.batch();
      notifications.forEach(notification => {
        if (!notification.read) {
          const notificationRef = db.collection('notifications').doc(notification.id);
          batch.update(notificationRef, { read: true });
        }
      });
      await batch.commit();
    } catch (error) {
      console.error('Error marking all as read:', error);
      Alert.alert('Error', 'Failed to mark all notifications as read');
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await db.collection('notifications').doc(notificationId).delete();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleNotificationPress = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    if (notification.contentId) {
      switch (notification.type) {
        case 'new_blog':
        case 'comment':
        case 'like':
          navigation.navigate('BlogDetail' as never, { blogId: notification.contentId } as never);
          break;
        case 'follow':
          navigation.navigate('AuthorProfile' as never, { authorId: notification.contentId } as never);
          break;
      }
    }
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp?.toDate) return 'Just now';

    const date = timestamp.toDate();
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 30) return `${diffDays}d ago`;
    
    const month = date.toLocaleString('default', { month: 'short' });
    const day = date.getDate();
    return `${month} ${day}`;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_blog': return '📄';
      case 'follow': return '👤';
      case 'comment': return '💬';
      case 'like': return '❤️';
      default: return '🔔';
    }
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[styles.notificationItem, !item.read && styles.unread]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={[styles.iconContainer, { backgroundColor: getTypeColor(item.type) }]}>
        <Text>{getNotificationIcon(item.type)}</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.message}>{item.message}</Text>
        <Text style={styles.time}>{formatTimestamp(item.createdAt)}</Text>
      </View>
      
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => deleteNotification(item.id)}
      >
        <Text>✕</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const getTypeColor = (type: string) => {
    const colors: {[key: string]: string} = {
      'new_blog': '#E3F2FD',
      'follow': '#E8F5E9', 
      'comment': '#FFF3E0',
      'like': '#FCE4EC'
    };
    return colors[type] || '#F3E5F5';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Notifications</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6200EE" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllAsRead}>
            <Text style={styles.markAllButton}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadNotifications();
            }}
            colors={["#6200EE"]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyText}>No notifications yet</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#000',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  markAllButton: {
    color: '#fff',
    fontSize: 14,
  },
  listContainer: {
    padding: 12,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
  },
  unread: {
    backgroundColor: '#f0f8ff',
    borderLeftWidth: 3,
    borderLeftColor: '#6200EE',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  time: {
    fontSize: 12,
    color: '#999',
  },
  deleteButton: {
    padding: 6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  }
});

export default NotificationScreen;