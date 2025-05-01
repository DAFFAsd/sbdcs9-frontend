import api from './api';

interface TransactionData {
  user_id: number | string;
  item_id: number | string;
  quantity: number;
  total_price: number;
}

interface Transaction {
  id: number | string;
  user_id: number | string;
  item_id: number | string;
  quantity: number;
  total: number;
  status: string;
  created_at: string;
  item_name: string;
  item_image: string | null;
  store_id: number | string;
  store_name: string;
}

export const createTransaction = async (data: TransactionData) => {
  const response = await api.post('/transaction/create', data);
  return response.data;
};

export const payTransaction = async (id: number | string) => {
  const response = await api.post(`/transaction/pay/${id}`);
  return response.data;
};

export const deleteTransaction = async (id: number | string) => {
  const response = await api.delete(`/transaction/${id}`);
  return response.data;
};

export const getUserTransactions = async (userId: number | string) => {
  try {
    const response = await api.get(`/transaction/user/${userId}`);
    if (response.data && response.data.payload) {
      return response.data.payload as Transaction[];
    }
    return [];
  } catch (error) {
    console.error('Error fetching user transactions:', error);
    return [];
  }
}; 