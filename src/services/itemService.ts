import api from './api';

interface ItemData {
  id?: number | string;
  store_id: number | string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  image?: File | null;
}

export const getAllItems = async () => {
  try {
    const response = await api.get('/item');
    // Check if response has a payload property and it's an array
    if (response.data && response.data.payload && Array.isArray(response.data.payload)) {
      return response.data.payload;
    }
    // Fallback to old behavior or empty array
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Error fetching all items:', error);
    return [];
  }
};

export const getItemById = async (id: number | string) => {
  try {
    const response = await api.get(`/item/byId/${id}`);
    // Check if response has a payload property
    if (response.data && response.data.payload) {
      return response.data.payload;
    }
    // Fallback to old behavior
    return response.data;
  } catch (error) {
    console.error(`Error fetching item ${id}:`, error);
    throw error;
  }
};

export const getItemsByStoreId = async (storeId: number | string) => {
  try {
    const response = await api.get(`/item/byStoreId/${storeId}`);
    // Check if response has a payload property and it's an array
    if (response.data && response.data.payload && Array.isArray(response.data.payload)) {
      return response.data.payload;
    }
    // Fallback to old behavior or empty array
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error(`Error fetching items for store ${storeId}:`, error);
    return [];
  }
};

export const createItem = async (data: ItemData) => {
  const formData = new FormData();
  formData.append('store_id', data.store_id.toString());
  formData.append('name', data.name);
  if (data.description) formData.append('description', data.description);
  formData.append('price', data.price.toString());
  formData.append('stock', data.stock.toString());
  if (data.image) formData.append('image', data.image);
  
  try {
    const response = await api.post('/item/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating item:', error);
    throw error;
  }
};

export const updateItem = async (data: ItemData) => {
  const formData = new FormData();
  if (data.id) formData.append('id', data.id.toString());
  formData.append('store_id', data.store_id.toString());
  formData.append('name', data.name);
  if (data.description) formData.append('description', data.description);
  formData.append('price', data.price.toString());
  formData.append('stock', data.stock.toString());
  if (data.image) formData.append('image', data.image);
  
  try {
    const response = await api.put('/item', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating item:', error);
    throw error;
  }
};

export const deleteItem = async (id: number | string) => {
  try {
    const response = await api.delete(`/item/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting item ${id}:`, error);
    throw error;
  }
}; 