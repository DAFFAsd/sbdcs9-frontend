import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import { getStoreById } from '../services/storeService';
import { getItemsByStoreId } from '../services/itemService';
import { toast } from 'react-hot-toast';
import { getImageUrl } from '../utils/imageHelper';

interface Store {
  id: number | string;
  user_id: number;
  name: string;
  address: string;
}

interface Item {
  id: number | string;
  store_id: number | string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url: string;
}

const StoreDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [store, setStore] = useState<Store | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStoreData = async () => {
      if (!id) return;
      
      try {
        const [storeData, itemsData] = await Promise.all([
          getStoreById(id),
          getItemsByStoreId(id)
        ]);
        
        setStore(storeData);
        setItems(Array.isArray(itemsData) ? itemsData : []);
      } catch (error) {
        console.error('Error fetching store data:', error);
        toast.error('Failed to load store data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchStoreData();
  }, [id]);

  if (loading) {
    return (
      <div className="w-full max-w-[1440px] mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="w-full max-w-[1440px] mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl text-gray-600 mb-4">Store not found.</h2>
          <Link to="/stores">
            <Button>Back to Stores</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 py-8">
      <div className="mb-8">
        <Link to="/stores" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 transition mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Stores
        </Link>
        
        <h1 className="text-3xl font-bold text-gray-900">{store.name}</h1>
        <p className="text-gray-600 mt-2">{store.address}</p>
      </div>
      
      <div className="mb-10">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Products</h2>
        
        {items.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <h3 className="text-xl text-gray-600 mb-4">This store doesn't have any products yet.</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((item) => (
              <Card key={item.id} className="h-full flex flex-col">
                <div className="h-48 overflow-hidden bg-gray-100">
                  {item.image_url ? (
                    <img 
                      src={getImageUrl(item.image_url)} 
                      alt={item.name} 
                      className="w-full h-full object-cover transition-transform hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <span className="text-gray-500">No image</span>
                    </div>
                  )}
                </div>
                <div className="p-4 flex-grow flex flex-col">
                  <h3 className="font-semibold text-lg mb-2 text-gray-900">{item.name}</h3>
                  <p className="text-gray-600 text-sm mb-3 flex-grow line-clamp-2">{item.description}</p>
                  <div className="flex justify-between items-center mt-auto">
                    <span className="font-bold text-lg text-gray-900">{item.price.toLocaleString()} IDR</span>
                    <Link 
                      to={`/items/${item.id}`}
                      className="text-sm bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 transition"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreDetailPage; 