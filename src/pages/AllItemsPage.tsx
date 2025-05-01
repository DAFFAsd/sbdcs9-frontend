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
  description?: string;
  price: number;
  stock: number;
  image_url?: string;
}

interface Store {
  id: number | string;
  name: string;
  address: string;
}

type SortOption = 'name_asc' | 'name_desc' | 'price_asc' | 'price_desc';

const AllItemsPage = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('name_asc');
  const [selectedStore, setSelectedStore] = useState<string | number>('all');

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

  const getStoreName = (storeId: number | string) => {
    const store = stores.find(s => s.id == storeId);
    return store ? store.name : 'Unknown Store';
  };

  // Filter items based on search term and selected store
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStore = selectedStore === 'all' || item.store_id == selectedStore;
    return matchesSearch && matchesStore;
  });

  // Sort filtered items based on sort option
  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortOption) {
      case 'name_asc':
        return a.name.localeCompare(b.name);
      case 'name_desc':
        return b.name.localeCompare(a.name);
      case 'price_asc':
        return Number(a.price) - Number(b.price);
      case 'price_desc':
        return Number(b.price) - Number(a.price);
      default:
        return 0;
    }
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(e.target.value as SortOption);
  };

  const handleStoreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStore(e.target.value);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedStore('all');
    setSortOption('name_asc');
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">All Products</h1>
        <p className="text-gray-600 mt-2">Browse all available products from our stores</p>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-grow">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search Products
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search by product name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="w-full md:w-48">
            <label htmlFor="store" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Store
            </label>
            <select
              id="store"
              value={selectedStore}
              onChange={handleStoreChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Stores</option>
              {stores.map(store => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </select>
          </div>
          <div className="w-full md:w-48">
            <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <select
              id="sort"
              value={sortOption}
              onChange={handleSortChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="name_asc">Name (A-Z)</option>
              <option value="name_desc">Name (Z-A)</option>
              <option value="price_asc">Price (Low to High)</option>
              <option value="price_desc">Price (High to Low)</option>
            </select>
          </div>
        </div>
        
        {(searchTerm || selectedStore !== 'all' || sortOption !== 'name_asc') && (
          <div className="flex justify-end">
            <button
              onClick={resetFilters}
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : sortedItems.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg shadow-sm">
          <h2 className="text-xl text-gray-600 mb-4">
            {items.length === 0 ? "No products available yet." : "No products match your filters."}
          </h2>
          {items.length > 0 && (
            <button 
              onClick={resetFilters}
              className="text-indigo-600 hover:text-indigo-800"
            >
              Clear all filters
            </button>
          )}
          {items.length === 0 && (
            <Link to="/" className="text-indigo-600 hover:text-indigo-800">
              Return to Home
            </Link>
          )}
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-600 mb-4">Showing {sortedItems.length} of {items.length} products</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {sortedItems.map((item) => (
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
                  <div className="mb-1">
                    <span className="text-sm text-indigo-600">{getStoreName(item.store_id)}</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">{item.name}</h3>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-grow">
                    {item.description || 'No description available.'}
                  </p>
                  <div className="mt-auto">
                    <p className="text-lg font-bold text-gray-900 mb-2">Rp {Number(item.price).toLocaleString()}</p>
                    <Link 
                      to={`/items/${item.id}`}
                      className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AllItemsPage; 