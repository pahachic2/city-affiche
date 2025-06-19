'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Интерфейс пользователя (без пароля для клиента)
export interface User {
  _id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
}

// Интерфейс состояния авторизации
interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Интерфейс контекста
interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, name: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

// Создаем контекст
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Константы для localStorage
const TOKEN_KEY = 'city-affiche-token';
const USER_KEY = 'city-affiche-user';

// Базовый URL API
const API_BASE = '/api/auth';

// Провайдер контекста
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Функция для выполнения API запросов
  const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();
    return { response, data };
  };

  // Функция для сохранения данных в localStorage
  const saveAuthData = (token: string, user: User) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    setState({
      user,
      token,
      isLoading: false,
      isAuthenticated: true,
    });
  };

  // Функция для очистки данных авторизации
  const clearAuthData = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setState({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
    });
  };

  // Функция входа
  const login = async (email: string, password: string) => {
    try {
      const { response, data } = await apiRequest('/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (response.ok && data.token && data.user) {
        saveAuthData(data.token, data.user);
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Ошибка входа' };
      }
    } catch (error) {
      console.error('Ошибка входа:', error);
      return { success: false, error: 'Сетевая ошибка' };
    }
  };

  // Функция регистрации
  const register = async (email: string, name: string, password: string) => {
    try {
      const { response, data } = await apiRequest('/register', {
        method: 'POST',
        body: JSON.stringify({ email, name, password }),
      });

      if (response.ok && data.token && data.user) {
        saveAuthData(data.token, data.user);
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Ошибка регистрации' };
      }
    } catch (error) {
      console.error('Ошибка регистрации:', error);
      return { success: false, error: 'Сетевая ошибка' };
    }
  };

  // Функция выхода
  const logout = () => {
    // Отправляем запрос на сервер (опционально, поскольку JWT stateless)
    apiRequest('/logout', { method: 'POST' }).catch(console.error);
    
    // Очищаем локальные данные
    clearAuthData();
  };

  // Функция проверки авторизации
  const checkAuth = async () => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const userStr = localStorage.getItem(USER_KEY);

      if (!token || !userStr) {
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      // Проверяем токен на сервере
      const { response, data } = await apiRequest('/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok && data.user) {
        setState({
          user: data.user,
          token,
          isLoading: false,
          isAuthenticated: true,
        });
      } else {
        // Токен недействителен, очищаем данные
        clearAuthData();
      }
    } catch (error) {
      console.error('Ошибка проверки авторизации:', error);
      clearAuthData();
    }
  };

  // Проверяем авторизацию при монтировании
  useEffect(() => {
    checkAuth();
  }, []);

  const contextValue: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Хук для использования контекста
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth должен использоваться внутри AuthProvider');
  }
  return context;
} 