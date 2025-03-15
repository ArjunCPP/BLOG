import { db, firestore } from './firebase';

/**
 * @param blog 
 * @param authorId 
 */

export const sendNewBlogNotifications = async (blog: any, authorId: string) => {
  try {
    const usersRef = db.collection('users');
    const usersQuery = usersRef.where('uid', '!=', authorId);
    const userSnapshot = await usersQuery.get();
    
    if (userSnapshot.empty) {
      console.log('No users found to notify');
      return;
    }
    
    const authorRef = db.collection('users');
    const authorQuery = authorRef.where('uid', '==', authorId);
    const authorSnapshot = await authorQuery.get();
    const authorData = authorSnapshot.docs[0]?.data();
    const authorName = authorData?.displayName || 'A writer';
    const authorImage = authorData?.photoURL || null;
    
    const batch = db.batch();
    
    userSnapshot.docs.forEach((userDoc) => {
      const userId = userDoc.data().uid;
      
      const newNotificationRef = db.collection('notifications').doc();
      batch.set(newNotificationRef, {
        userId: userId,
        type: 'new_blog',
        title: 'New Blog Published',
        message: `${authorName} just published "${blog.title}"`,
        senderName: authorName,
        senderImage: authorImage,
        contentId: blog.id,
        contentType: 'blog',
        read: false,
        createdAt: firestore.FieldValue.serverTimestamp()
      });
    });
    
    await batch.commit();
    console.log('Blog notifications sent successfully to', userSnapshot.size, 'users');
    
  } catch (error) {
    console.error('Error sending blog notifications:', error);
  }
};

/**
 * @param blog 
 * @param authorId 
 */
export const sendFollowerNotifications = async (blog: any, authorId: string) => {
  try {
    const followersRef = db.collection('follows');
    const followersQuery = followersRef.where('followingId', '==', authorId);
    const followersSnapshot = await followersQuery.get();
    
    if (followersSnapshot.empty) {
      console.log('No followers found');
      return;
    }
    
    const authorRef = db.collection('users');
    const authorQuery = authorRef.where('uid', '==', authorId);
    const authorSnapshot = await authorQuery.get();
    const authorData = authorSnapshot.docs[0]?.data();
    const authorName = authorData?.displayName || 'A writer';
    const authorImage = authorData?.photoURL || null;
    
    const batch = db.batch();
    
    followersSnapshot.docs.forEach((followerDoc) => {
      const followerId = followerDoc.data().followerId;
      
      const newNotificationRef = db.collection('notifications').doc();
      batch.set(newNotificationRef, {
        userId: followerId,
        type: 'new_blog',
        title: 'New Post from ' + authorName,
        message: `${authorName} just published a new blog: "${blog.title}"`,
        senderName: authorName,
        senderImage: authorImage,
        contentId: blog.id,
        contentType: 'blog',
        read: false,
        createdAt: firestore.FieldValue.serverTimestamp()
      });
    });
    
    await batch.commit();
    console.log('Follower notifications sent successfully to', followersSnapshot.size, 'followers');
    
  } catch (error) {
    console.error('Error sending follower notifications:', error);
  }
};

/**
 * @param blogId 
 * @param blogTitle 
 * @param authorId 
 * @param likerId 
 * @param likerName 
 * @param likerImage 
 */
export const sendLikeNotification = async (
  blogId: string,
  blogTitle: string,
  authorId: string,
  likerId: string,
  likerName: string,
  likerImage: string | null
) => {
  if (likerId === authorId) return;
  
  try {
    await db.collection('notifications').add({
      userId: authorId,
      type: 'like',
      title: 'New Like on Your Blog',
      message: `${likerName} liked your blog "${blogTitle}"`,
      senderName: likerName,
      senderImage: likerImage,
      contentId: blogId,
      contentType: 'blog',
      read: false,
      createdAt: firestore.FieldValue.serverTimestamp()
    });
    
    console.log('Like notification sent successfully');
  } catch (error) {
    console.error('Error sending like notification:', error);
  }
};

/**
 * @param blogId 
 * @param blogTitle 
 * @param authorId 
 * @param commenterId 
 * @param commenterName 
 * @param commenterImage 
 * @param commentText 
 */
export const sendCommentNotification = async (
  blogId: string,
  blogTitle: string,
  authorId: string,
  commenterId: string,
  commenterName: string,
  commenterImage: string | null,
  commentText: string
) => {
  if (commenterId === authorId) return;
  
  try {
    const commentPreview = commentText.length > 50 
      ? commentText.substring(0, 50) + '...' 
      : commentText;
    
    await db.collection('notifications').add({
      userId: authorId,
      type: 'comment',
      title: 'New Comment on Your Blog',
      message: `${commenterName} commented: "${commentPreview}" on your blog "${blogTitle}"`,
      senderName: commenterName,
      senderImage: commenterImage,
      contentId: blogId,
      contentType: 'blog',
      read: false,
      createdAt: firestore.FieldValue.serverTimestamp()
    });
    
    console.log('Comment notification sent successfully');
  } catch (error) {
    console.error('Error sending comment notification:', error);
  }
};

/**
 * @param followerId 
 * @param followerName 
 * @param followerImage 
 * @param followedId 
 */
export const sendFollowNotification = async (
  followerId: string,
  followerName: string,
  followerImage: string | null,
  followedId: string
) => {
  try {
    await db.collection('notifications').add({
      userId: followedId,
      type: 'follow',
      title: 'New Follower',
      message: `${followerName} started following you`,
      senderName: followerName,
      senderImage: followerImage,
      contentId: followerId, 
      contentType: 'user',
      read: false,
      createdAt: firestore.FieldValue.serverTimestamp()
    });
    
    console.log('Follow notification sent successfully');
  } catch (error) {
    console.error('Error sending follow notification:', error);
  }
};