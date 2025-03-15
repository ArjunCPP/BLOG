import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SavedBlogsScreen: React.FC = () => {
  const [savedBlogs, setSavedBlogs] = useState<any[]>([]);
  const navigation = useNavigation();

  useEffect(() => {
    loadSavedBlogs();
  }, []);

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

  const removeBlog = async (id: string) => {
    const updatedBlogs = savedBlogs.filter((blog) => blog.id !== id);
    setSavedBlogs(updatedBlogs);
    await AsyncStorage.setItem('savedBlogs', JSON.stringify(updatedBlogs));
  };

  const renderBlogItem = ({ item }: { item: any }) => (
    <View style={styles.blogItem}>
      <Image source={{ uri: item.imageUrl }} style={styles.blogImage} />
      <View style={styles.blogInfo}>
        <Text style={styles.blogCategory}>{item.category}</Text>
        <Text style={styles.blogTitle}>{item.title}</Text>
        <Text style={styles.blogDescription} numberOfLines={2}>
          {item.description}
        </Text>
      </View>
      <TouchableOpacity onPress={() => removeBlog(item.id)}>
        <Text style={styles.removeButton}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Saved Blogs</Text>

      {savedBlogs.length === 0 ? (
        <Text style={styles.emptyText}>No saved blogs</Text>
      ) : (
        <FlatList
          data={savedBlogs}
          renderItem={renderBlogItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  backButton: {
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 18,
    color: '#000',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 20,
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
  removeButton: {
    fontSize: 18,
    color: '#FF0000',
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default SavedBlogsScreen;
