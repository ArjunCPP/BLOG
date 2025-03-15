import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DrawerScreenProps } from '@react-navigation/drawer';
import { HomeDrawerParamList } from '../types/navigation';
import { db } from '../context/firebase';

type HomeScreenProps = DrawerScreenProps<HomeDrawerParamList, 'MainHome'>;

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [savedBlogs, setSavedBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
    loadSavedBlogs();

    const unsubscribe = navigation.addListener('focus', () => {
      fetchBlogs();
      loadSavedBlogs();
    });

    return unsubscribe;
  }, [navigation]);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const querySnapshot = await db
        .collection('blogs')
        .orderBy('timestamp', 'desc')
        .limit(5)
        .get();

      const blogsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setBlogs(blogsList);
    } catch (error) {
      console.error('Error fetching blogs for home page:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSavedBlogs = async () => {
    try {
      const savedData = await AsyncStorage.getItem('savedBlogs');
      if (savedData) {
        setSavedBlogs(JSON.parse(savedData));
      }
    } catch (error) {
      console.error('Error loading saved blogs:', error);
    }
  };

  const toggleSaveBlog = async (blog: any) => {
    const isSaved = savedBlogs.some((item) => item.id === blog.id);
    let updatedSavedBlogs;

    if (isSaved) {
      updatedSavedBlogs = savedBlogs.filter((item) => item.id !== blog.id);
    } else {
      updatedSavedBlogs = [...savedBlogs, blog];
    }

    setSavedBlogs(updatedSavedBlogs);
    await AsyncStorage.setItem('savedBlogs', JSON.stringify(updatedSavedBlogs));
  };

  const renderBlogItem = ({ item }: { item: any }) => {
    const isSaved = savedBlogs.some((blog) => blog.id === item.id);

    return (
      <View style={styles.blogItem}>
        <Image source={{ uri: item.imageUrl }} style={styles.blogImage} />
        <View style={styles.blogInfo}>
          <Text style={styles.blogCategory}>{item.category}</Text>
          <Text style={styles.blogTitle}>{item.title}</Text>
          <Text style={styles.blogDescription} numberOfLines={2}>
            {item.description}
          </Text>
        </View>
        <TouchableOpacity onPress={() => toggleSaveBlog(item)}>
          <Text style={[styles.saveIcon, isSaved && styles.saved]}>
            {isSaved ? '★' : '☆'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.drawerButton}
        onPress={() => navigation.openDrawer()}
      >
        <Text style={styles.drawerButtonText}>☰</Text>
        <Text style={styles.sectionTitle}>Latest Blogs</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#6200EE" />
        ) : blogs.length === 0 ? (
          <Text style={styles.emptyText}>No blogs available</Text>
        ) : (
          <FlatList
            data={blogs}
            renderItem={renderBlogItem}
            keyExtractor={(item, index) => item.id || index.toString()}
            contentContainerStyle={styles.listContainer}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  drawerButton: {
    padding: 15,
    alignSelf: 'flex-start',
    flexDirection: 'row',
  },
  drawerButtonText: {
    color: '#000',
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    marginLeft: 30,
  },
  listContainer: {
    paddingVertical: 10,
  },
  blogItem: {
    flexDirection: 'row',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 16,
  },
  blogImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  blogInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  blogCategory: {
    fontSize: 12,
    color: '#6200EE',
    marginBottom: 4,
  },
  blogTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  blogDescription: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  saveIcon: {
    fontSize: 24,
    color: '#555',
  },
  saved: {
    color: '#FFD700',
  },
  emptyText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default HomeScreen;
