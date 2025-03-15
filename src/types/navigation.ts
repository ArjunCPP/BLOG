// types/navigation.ts
export type HomeDrawerParamList = {
  MainHome: { userId?: string; welcomeMessage?: string } | undefined;
  SavedBlogs: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Home: undefined;
  Blog: undefined;
  Profile: undefined;
  Drawer: undefined;
  BottomTab: undefined;
  BlogDetail: { blogId: string };
  AuthorProfile: { authorId: string };
  Category: { categoryId: string };
  Auth: undefined;
  Login: undefined;
  Register: undefined;
  CreateBlog: undefined; 
};

export type BottomTabParamList = {
  Home: undefined;
  Blog: undefined;
  Notifications: undefined;
  Profile: undefined;
};