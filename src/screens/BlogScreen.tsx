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
  TextInput
} from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Picker } from '@react-native-picker/picker';
import { db } from '../context/firebase';
import { BottomTabParamList, RootStackParamList } from '../types/navigation';

type BlogScreenProps = CompositeScreenProps<
  BottomTabScreenProps<BottomTabParamList, 'Blog'>,
  NativeStackScreenProps<RootStackParamList>
>;

const BLOGS_PER_PAGE = 10;

const BlogScreen: React.FC<BlogScreenProps> = ({ navigation }) => {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [authors, setAuthors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<any | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAuthor, setSelectedAuthor] = useState('all');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setLastDoc(null);
      fetchBlogs();
    });

    return unsubscribe;
  }, [navigation]);

  const fetchCategories = async () => {
    try {
      const querySnapshot = await db.collection('categories').get();

      const categoriesList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log('Categories:', categoriesList);
      setCategories(categoriesList);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [selectedCategory, selectedAuthor]);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      let baseQuery = db.collection('blogs');

      const conditions = [];

      conditions.push(baseQuery.orderBy('timestamp', 'desc'));

      if (selectedCategory !== 'all') {
        conditions.push(baseQuery.where('categoryId', '==', selectedCategory));
      }

      if (selectedAuthor !== 'all') {
        conditions.push(baseQuery.where('authorId', '==', selectedAuthor));
      }

      const finalQuery = baseQuery.limit(BLOGS_PER_PAGE);

      const querySnapshot = await finalQuery.get();

      const blogsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
      setLastDoc(lastVisible);
      setBlogs(blogsList);
      setHasMore(querySnapshot.docs.length === BLOGS_PER_PAGE);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMoreBlogs = async () => {
    if (!lastDoc || loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      let blogsQuery = db.collection('blogs')
        .orderBy('timestamp', 'desc')
        .startAfter(lastDoc)
        .limit(BLOGS_PER_PAGE);

      if (selectedCategory !== 'all') {
        blogsQuery = blogsQuery.where('categoryId', '==', selectedCategory);
      }

      if (selectedAuthor !== 'all') {
        blogsQuery = blogsQuery.where('authorId', '==', selectedAuthor);
      }

      const querySnapshot = await blogsQuery.get();

      const newBlogs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
      setLastDoc(lastVisible);
      setBlogs([...blogs, ...newBlogs]);
      setHasMore(querySnapshot.docs.length === BLOGS_PER_PAGE);
    } catch (error) {
      console.error('Error fetching more blogs:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSearch = () => {
    setLastDoc(null);
    fetchBlogs();
  };

  const renderBlogItem = ({ item }: { item: any }) => (
    <View
      style={styles.blogItem}
    >
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.blogImage}
      />
      <View style={styles.blogInfo}>
        <Text style={styles.blogCategory}>{item.category}</Text>
        <Text style={styles.blogTitle}>{item.title}</Text>
        <Text style={styles.blogDescription} numberOfLines={2}>
          {item.description}
        </Text>
      </View>
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return <ActivityIndicator size="small" color="#6200EE" style={styles.loadingMore} />;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Blogs</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search blogs..."
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={handleSearch}
        />
      </View>

      <View style={styles.filtersContainer}>
        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>Category:</Text>
          <Picker
            selectedValue={selectedCategory}
            style={styles.picker}
            onValueChange={(itemValue) => setSelectedCategory(itemValue)}
          >
            <Picker.Item label="All Categories" value="all" />
            {categories.map(category => (
              <Picker.Item
                key={category.id}
                label={category.name}
                value={category.id}
              />
            ))}
          </Picker>
        </View>

        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>Author:</Text>
          <Picker
            selectedValue={selectedCategory}
            style={[styles.picker, { color: '#fff' }]} 
            onValueChange={(itemValue) => setSelectedCategory(itemValue)}
          >
            <Picker.Item label="All Categories" value="all" />
            {categories.map((category) => (
              <Picker.Item
                key={category.id}
                label={category.name}
                value={category.id}
              />
            ))}
          </Picker>

        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6200EE" />
        </View>
      ) : blogs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No blogs found</Text>
        </View>
      ) : (
        <FlatList
          data={blogs}
          renderItem={renderBlogItem}
          keyExtractor={(item, index) => item.id || index.toString()}
          contentContainerStyle={styles.listContainer}
          onEndReached={fetchMoreBlogs}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
        />
      )}

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => navigation.navigate('CreateBlog')}
      >
        <Text style={styles.floatingButtonText}>+</Text>
      </TouchableOpacity>
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
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'gray',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  filtersContainer: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  pickerContainer: {
    flex: 1,
    marginRight: 8,
  },
  pickerLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  picker: {
    height: 50,
    backgroundColor: 'gray',
    color: '#fff'
  },
  listContainer: {
    padding: 16,
  },
  blogItem: {
    flexDirection: 'row',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 16,
  },
  blogImage: {
    width: 100,
    height: 100,
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
  blogAuthor: {
    fontSize: 12,
    color: '#777',
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
  },
  emptyText: {
    fontSize: 16,
    color: '#555',
  },
  loadingMore: {
    marginVertical: 16,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'gray',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  floatingButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default BlogScreen;