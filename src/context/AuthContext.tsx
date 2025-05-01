import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { login as apiLogin, register as apiRegister, getUserByEmail } from '../services/authService';

interface User {
  id: number;
  name: string;
  email: string;
  balance: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on page load
    const loadUserFromStorage = async () => {
      const token = localStorage.getItem('token');
      const userEmail = localStorage.getItem('userEmail');
      
      if (token && userEmail) {
        try {
          const userData = await getUserByEmail(userEmail);
          setUser(userData);
        } catch (error) {
          console.error('Failed to load user data', error);
          localStorage.removeItem('token');
          localStorage.removeItem('userEmail');
        }
      }
      setLoading(false);
    };

    loadUserFromStorage();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiLogin({ email, password });
      // Check if response contains the payload with user data
      if (response && response.payload) {
        localStorage.setItem('token', 'dummy-token'); // Set a dummy token since backend doesn't provide one
        localStorage.setItem('userEmail', email);
        // Use the payload data directly
        setUser(response.payload);
      } else if (response.token) { // Fallback to old token-based format
        localStorage.setItem('token', response.token);
        localStorage.setItem('userEmail', email);
        const userData = await getUserByEmail(email);
        setUser(userData);
      }
    } catch (error) {
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      await apiRegister({ name, email, password });
      await login(email, password);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    setUser(null);
  };

  const refreshUserData = async () => {
    if (user && user.email) {
      try {
        const userData = await getUserByEmail(user.email);
        setUser(userData);
      } catch (error) {
        console.error('Failed to refresh user data', error);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUserData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 