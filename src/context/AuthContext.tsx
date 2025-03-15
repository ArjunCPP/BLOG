import React, { createContext, useState, useContext, useEffect } from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

enum AuthErrorCode {
  InvalidEmail = 'auth/invalid-email',
  UserDisabled = 'auth/user-disabled',
  UserNotFound = 'auth/user-not-found',
  WrongPassword = 'auth/wrong-password',
  EmailAlreadyInUse = 'auth/email-already-in-use',
  OperationNotAllowed = 'auth/operation-not-allowed',
  WeakPassword = 'auth/weak-password'
}

class AuthError extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
  }
}

type AuthContextType = {
  user: FirebaseAuthTypes.User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  clearError: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(
      (currentUser) => {
        setUser(currentUser);
        setLoading(false);
      }, 
      // (authError) => {
      //   console.error('Auth State Change Error:', authError);
      //   setError(authError.message);
      //   setLoading(false);
      // }
    );
    return () => {
      // subscriber();
    };
  }, []);

  

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 6;
  };

  const handleAuthError = (error: any): AuthError => {
    let errorMessage = 'An unknown error occurred';
    let errorCode = error.code || error.name;

    switch (errorCode) {
      case AuthErrorCode.InvalidEmail:
      case 'ValidationError':
        errorMessage = 'Invalid email address';
        break;
      case AuthErrorCode.UserDisabled:
        errorMessage = 'User account has been disabled';
        break;
      case AuthErrorCode.UserNotFound:
        errorMessage = 'No user found with this email';
        break;
      case AuthErrorCode.WrongPassword:
        errorMessage = 'Incorrect password';
        break;
      case AuthErrorCode.EmailAlreadyInUse:
        errorMessage = 'Email is already registered';
        break;
      case AuthErrorCode.OperationNotAllowed:
        errorMessage = 'Email/password accounts are not enabled';
        break;
      case AuthErrorCode.WeakPassword:
      case 'PasswordValidationError':
        errorMessage = 'Password is too weak';
        break;
      default:
        errorMessage = error.message || 'Authentication failed';
    }

    return new AuthError(errorMessage, errorCode);
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      if (!email || !password) {
        throw new AuthError('Email and password are required', 'ValidationError');
      }

      if (!validateEmail(email)) {
        throw new AuthError('Invalid email format', AuthErrorCode.InvalidEmail);
      }

      await auth().signInWithEmailAndPassword(email, password);
    } catch (error: any) {
      console.error('Login Error:', error);
      
      const authError = handleAuthError(error);
      setError(authError.message);
      throw authError;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      if (!email || !password) {
        throw new AuthError('Email and password are required', 'ValidationError');
      }

      if (!validateEmail(email)) {
        throw new AuthError('Invalid email format', AuthErrorCode.InvalidEmail);
      }

      if (!validatePassword(password)) {
        throw new AuthError('Password must be at least 6 characters long', 'PasswordValidationError');
      }

      await auth().createUserWithEmailAndPassword(email, password);
    } catch (error: any) {
      console.error('Registration Error:', error);
      
      const authError = handleAuthError(error);
      setError(authError.message);
      throw authError;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);
    try {
      await auth().signOut();
    } catch (error: any) {
      console.error('Logout Error:', error);
      
      const logoutError = new AuthError(
        error.message || 'Logout failed', 
        'LogoutError'
      );
      
      setError(logoutError.message);
      throw logoutError;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        error, 
        login, 
        register, 
        logout, 
        clearError 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);