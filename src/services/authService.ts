import api from './api';

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface UserData {
  id?: number;
  name: string;
  email: string;
  balance?: number;
}

export const login = async (data: LoginData) => {
  const response = await api.post('/user/login', data);
  return response.data;
};

export const register = async (data: RegisterData) => {
  const response = await api.post('/user/register', data);
  return response.data;
};

export const getUserByEmail = async (email: string) => {
  const response = await api.get(`/user/${email}`);
  // Extract user data from the payload array (backend returns an array in the payload)
  if (response.data && response.data.payload && Array.isArray(response.data.payload) && response.data.payload.length > 0) {
    return response.data.payload[0];
  }
  // Fallback to the old response format
  return response.data;
};

export const updateUser = async (data: UserData) => {
  const response = await api.put('/user', data);
  return response.data;
};

export const topUp = async (data: { email: string, amount: number }) => {
  const response = await api.post('/user/topUp', data);
  return response.data;
}; 