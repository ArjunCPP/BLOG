import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Platform
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { Picker } from '@react-native-picker/picker';
import { db, firestore, authInstance } from '../context/firebase';
import { launchImageLibrary } from 'react-native-image-picker';
import { sendNewBlogNotifications, sendFollowerNotifications } from '../context/NotificationService';
import RNFS from 'react-native-fs';
import { firebase } from '@react-native-firebase/storage';

type CreateBlogScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'CreateBlog'>;
};

const CreateBlogScreen: React.FC<CreateBlogScreenProps> = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [image, setImage] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingCategories, setFetchingCategories] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const querySnapshot = await db.collection('categories').get();

        const categoriesList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));

        console.log('Categories:', categoriesList);
        setCategories(categoriesList);

        if (categoriesList.length > 0) {
          setCategoryId(categoriesList[0].id);
        }
      } catch (error) {
        console.log('Error fetching categories:', error);
        Alert.alert('Error', 'Failed to load categories');
      } finally {
        setFetchingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const validateForm = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return false;
    }
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return false;
    }
    if (!content.trim()) {
      Alert.alert('Error', 'Please enter content');
      return false;
    }
    if (!categoryId) {
      Alert.alert('Error', 'Please select a category');
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    try {
      const options = {
        mediaType: 'photo',
        includeBase64: true,
        quality: 0.8,
        maxWidth: 1200,
        maxHeight: 1200,
      };

      const result = await launchImageLibrary(options);

      if (result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];

        if (!selectedImage.uri || !selectedImage.base64) {
          Alert.alert('Error', 'Could not get image data');
          return;
        }

        const base64Size = (selectedImage.base64.length * 3) / 4 / 1024 / 1024;

        if (base64Size > 1) {
          Alert.alert('Error', 'Selected image exceeds 1 MB size limit');
          setImage(null);
          return;
        }

        console.log('DEBUG: Image selected with URI and base64:', selectedImage.uri);
        setImage(selectedImage);
      }
    } catch (error) {
      console.log('DEBUG: Image picker error:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const uploadImage = async () => {
    if (!image || !image.base64) {
      console.log('DEBUG: No image selected or base64 data missing');
      return null;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const timestamp = Date.now();
      const filename = `blog_images/image_${timestamp}.jpg`;

      const storageRef = firebase.storage().ref(filename);

      const snapshot = await storageRef.putString(image.base64, 'base64', {
        contentType: 'image/jpeg',
      });

      console.log('DEBUG: Upload completed:', snapshot);

      const downloadURL = await storageRef.getDownloadURL();
      console.log('DEBUG: Download URL:', downloadURL);

      setIsUploading(false);
      return downloadURL;
    } catch (error) {
      setIsUploading(false);
      console.log('DEBUG: Upload error:', error);
      Alert.alert('Upload Error', 'Could not upload image. Please try again.');
      return null;
    }
  };

  const handleCreateBlog = async () => {
    if (!validateForm()) return;

    if (!authInstance.currentUser) {
      Alert.alert('Error', 'You must be logged in to create a blog post');
      return;
    }

    setLoading(true);

    try {
      let imageUrl = 'https://www.hubspot.com/hs-fs/hubfs/parts-url_1.webp?width=595&name=parts-url_1.webp';

      if (image && image.base64) {
        imageUrl = await uploadImage() || imageUrl;
      }

      const category = categories.find((cat) => cat.id === categoryId);

      const blogData = {
        title,
        description,
        content,
        categoryId,
        category: category?.name || '',
        imageUrl,
        authorId: authInstance.currentUser.uid,
        authorName: authInstance.currentUser.displayName || 'Anonymous',
        timestamp: firestore.FieldValue.serverTimestamp(),
        likes: 0,
        comments: 0,
        views: 0,
      };

      const blogRef = await db.collection('blogs').add(blogData);
      console.log('DEBUG: Blog created with ID:', blogRef.id);

      Alert.alert('Success', 'Blog post created successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.log('DEBUG: Blog creation error:', error);
      Alert.alert('Error', 'Failed to create blog post. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  if (fetchingCategories) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6200EE" />
          <Text style={styles.loadingText}>Loading categories...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Blog Post</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.formContainer}>
        <TouchableOpacity
          style={styles.imagePickerContainer}
          onPress={pickImage}
          disabled={isUploading}
        >
          {image ? (
            <>
              <Image source={{ uri: image.uri }} style={styles.pickedImage} />
              {isUploading && (
                <View style={styles.uploadProgressContainer}>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={styles.uploadProgressText}>
                    {`Uploading... ${Math.round(uploadProgress)}%`}
                  </Text>
                </View>
              )}
            </>
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>Tap to select image</Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Enter title"
        />

        <Text style={styles.label}>Category</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={categoryId}
            style={styles.picker}
            onValueChange={(itemValue) => setCategoryId(itemValue)}
          >
            {categories.map(category => (
              <Picker.Item
                key={category.id}
                label={category.name}
                value={category.id}
              />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Short Description</Text>
        <TextInput
          style={styles.input}
          value={description}
          onChangeText={setDescription}
          placeholder="Enter short description"
          multiline
          numberOfLines={3}
        />

        <Text style={styles.label}>Content</Text>
        <TextInput
          style={styles.contentInput}
          value={content}
          onChangeText={setContent}
          placeholder="Write your blog content here"
          multiline
          numberOfLines={10}
        />

        <TouchableOpacity
          style={[
            styles.createButton,
            (loading || isUploading) ? styles.createButtonDisabled : null
          ]}
          onPress={handleCreateBlog}
          disabled={loading || isUploading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.createButtonText}>Publish</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
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
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 24,
    color: '#fff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
  },
  imagePickerContainer: {
    width: '100%',
    height: 200,
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    position: 'relative',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    color: '#777',
    fontSize: 16,
  },
  pickedImage: {
    width: '100%',
    height: '100%',
  },
  uploadProgressContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadProgressText: {
    color: '#fff',
    marginTop: 8,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    marginBottom: 16,
  },
  picker: {
    height: 50,
    backgroundColor: 'gray',
    color: '#fff'
  },
  contentInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 12,
    marginBottom: 24,
    fontSize: 16,
    height: 200,
    textAlignVertical: 'top',
  },
  createButton: {
    backgroundColor: 'gray',
    padding: 16,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 32,
  },
  createButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#555',
  },
});

export default CreateBlogScreen;