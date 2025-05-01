import api from './api';

interface StoreData {
  id?: number | string;
  user_id: number;
  name: string;
  address: string;
}

export const getAllStores = async () => {
  try {
    const response = await api.get('/store/getAll');
    // Check if response has a payload property and it's an array
    if (response.data && response.data.payload && Array.isArray(response.data.payload)) {
      return response.data.payload;
    }
    // Fallback to old behavior or empty array
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Error fetching all stores:', error);
    return [];
  }
};

export const getStoreById = async (id: number | string) => {
  try {
    const response = await api.get(`/store/${id}`);
    // If payload exists and is an array, return first item
    if (response.data && response.data.payload) {
      if (Array.isArray(response.data.payload) && response.data.payload.length > 0) {
        return response.data.payload[0];
      }
      return response.data.payload;
    }
    return response.data;
  } catch (error) {
    console.error(`Error fetching store ${id}:`, error);
    throw error;
  }
};

export const createStore = async (data: StoreData) => {
  try {
    const response = await api.post('/store/create', data);
    return response.data.payload || response.data;
  } catch (error) {
    console.error('Error creating store:', error);
    throw error;
  }
};

export const updateStore = async (data: StoreData) => {
  try {
    const response = await api.put('/store', data);
    return response.data.payload || response.data;
  } catch (error) {
    console.error('Error updating store:', error);
    throw error;
  }
};

export const deleteStore = async (id: number | string) => {
  try {
    const response = await api.delete(`/store/${id}`);
    return response.data.payload || response.data;
  } catch (error) {
    console.error(`Error deleting store ${id}:`, error);
    throw error;
  }
}; 