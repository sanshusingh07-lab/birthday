import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  type UserProfile, 
  getStoredUser, 
  getAuthToken, 
  setAuthToken, 
  setStoredUser, 
  removeAuthToken, 
  removeStoredUser, 
  loginUser, 
  registerUser, 
  fetchCurrentUser 
} from '../utils/api';
import { sound } from '../utils/audio';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'register';
  openAuthModal: (tab?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(getStoredUser());
  const [token, setToken] = useState<string | null>(getAuthToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = getAuthToken();
      if (storedToken) {
        try {
          const profile = await fetchCurrentUser();
          if (profile) {
            setUser(profile);
            setToken(storedToken);
          } else {
            setUser(null);
            setToken(null);
          }
        } catch {
          // fallback to stored user
          setUser(getStoredUser());
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const openAuthModal = (tab: 'login' | 'register' = 'login') => {
    sound.playClick();
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const login = async (email: string, password: string) => {
    const res = await loginUser(email, password);
    setToken(res.token);
    setUser(res.user);
    sound.playSparkle();
    closeAuthModal();
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await registerUser(name, email, password);
    setToken(res.token);
    setUser(res.user);
    sound.playSparkle();
    closeAuthModal();
  };

  const logout = () => {
    sound.playClick();
    removeAuthToken();
    removeStoredUser();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user && token),
        isLoading,
        isAuthModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

