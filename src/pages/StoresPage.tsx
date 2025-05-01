import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import { getAllStores } from '../services/storeService';
import { toast } from 'react-hot-toast';

interface Store {
  id: number | string;
  user_id: number;
  name: string;
  address: string;
}

const StoresPage = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const storesData = await getAllStores();
        setStores(storesData);
      } catch (error) {
        console.error('Error fetching stores:', error);
        toast.error('Failed to load stores. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, []);

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">All Stores</h1>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : stores.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl text-gray-600 mb-4">No stores available yet.</h2>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store) => (
            <Card key={store.id} className="flex flex-col h-full">
              <div className="p-6 flex flex-col flex-grow">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{store.name}</h2>
                <p className="text-gray-600 mb-4 flex-grow">{store.address}</p>
                <Link to={`/stores/${store.id}`}>
                  <Button className="w-full">View Store</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default StoresPage; 