import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import { getAllItems } from '../services/itemService';
import { getAllStores } from '../services/storeService';
import { getImageUrl } from '../utils/imageHelper';

interface Item {
  id: number | string;
  store_id: number | string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url: string;
}

interface Store {
  id: number | string;
  name: string;
  address: string;
}

const HomePage = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemsData, storesData] = await Promise.all([
          getAllItems(),
          getAllStores()
        ]);
        setItems(Array.isArray(itemsData) ? itemsData : []);
        setStores(Array.isArray(storesData) ? storesData : []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Find store name by id
  const getStoreName = (storeId: number | string) => {
    const store = stores.find(s => s.id == storeId); // Using loose equality for comparing string/number
    return store ? store.name : 'Unknown Store';
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 py-8">
      <section className="mb-10">
        <div className="bg-indigo-700 text-white rounded-lg p-8 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Welcome to Toko 👨🏿‍🌾🌾</h1>
          <p className="text-lg md:text-xl mb-6">Discover amazing "products" from various stores</p>
          <Link to="/stores" className="inline-block bg-white text-indigo-700 font-medium px-6 py-3 rounded-md hover:bg-indigo-50 transition">
            Explore Stores
          </Link>
        </div>
      </section>
      
      <section>
        <h2 className="text-2xl font-bold mb-6">Featured Products</h2>
        
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : items.length === 0 ? (
          <p className="text-center text-gray-500">No products available yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.slice(0, 8).map((item) => (
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
                  <p className="text-sm text-indigo-600 mb-1">{getStoreName(item.store_id)}</p>
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

        {items.length > 8 && (
          <div className="mt-8 text-center">
            <Link 
              to="/items"
              className="inline-block text-indigo-600 border border-indigo-600 font-medium px-6 py-2 rounded-md hover:bg-indigo-50 transition"
            >
              View All Products
            </Link>
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage; 