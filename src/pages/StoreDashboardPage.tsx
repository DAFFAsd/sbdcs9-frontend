import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getStoreById, updateStore } from '../services/storeService';
import { getItemsByStoreId, deleteItem } from '../services/itemService';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { getImageUrl } from '../utils/imageHelper';

interface Store {
  id: number | string;
  name: string;
  address: string;
  user_id?: number;
}

interface Item {
  id: number | string;
  store_id: number | string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  image_url?: string;
}

const StoreDashboardPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [store, setStore] = useState<Store | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeletingId, setIsDeletingId] = useState<string | number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<{name: string, address: string}>({
    name: '',
    address: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Check if user is logged in as this store
    const storedStoreId = localStorage.getItem('storeId');
    if (storedStoreId !== id) {
      toast.error('You need to login as this store first');
      navigate('/store/login');
      return;
    }
    
    fetchStoreData();
  }, [id, navigate]);

  const fetchStoreData = async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      const storeData = await getStoreById(id);
      setStore(storeData);
      
      const itemsData = await getItemsByStoreId(id);
      setItems(itemsData);
    } catch (error) {
      console.error('Error fetching store data:', error);
      toast.error('Failed to load store data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteItem = async (itemId: number | string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    setIsDeletingId(itemId);
    try {
      await deleteItem(itemId);
      toast.success('Item deleted successfully');
      // Refresh the items list
      fetchStoreData();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    } finally {
      setIsDeletingId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('storeId');
    localStorage.removeItem('storeName');
    
    // Trigger custom event to notify navbar
    const storageEvent = new Event('storageUpdate');
    window.dispatchEvent(storageEvent);
    
    toast.success('Logged out successfully');
    navigate('/store/login');
  };

  const handleEditToggle = () => {
    if (!isEditing) {
      // Initialize form with current store data
      if (store) {
        setEditForm({
          name: store.name,
          address: store.address
        });
      }
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStoreUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!store) return;
    
    if (!editForm.name.trim()) {
      toast.error('Store name is required');
      return;
    }
    
    if (!editForm.address.trim()) {
      toast.error('Store address is required');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const updatedStore = await updateStore({
        id: store.id,
        user_id: store.user_id || 0, // Use existing user_id or default to 0
        name: editForm.name,
        address: editForm.address
      });
      
      // Update store name in localStorage to keep it in sync
      localStorage.setItem('storeName', editForm.name);
      
      // Trigger custom event to notify navbar of store name change
      const storageEvent = new Event('storageUpdate');
      window.dispatchEvent(storageEvent);
      
      // Update local state
      setStore(updatedStore);
      setIsEditing(false);
      toast.success('Store information updated successfully');
    } catch (error) {
      console.error('Error updating store:', error);
      toast.error('Failed to update store information');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
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
          <Link to="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        {!isEditing ? (
          <>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{store?.name} Dashboard</h1>
              <p className="text-gray-600 mt-1">{store?.address}</p>
            </div>
            
            <div className="flex gap-4 mt-4 md:mt-0">
              <Button onClick={handleEditToggle}>
                Edit Store
              </Button>
              <Link to={`/store/item/add/${store?.id}`}>
                <Button>Add New Item</Button>
              </Link>
              <Button variant="secondary" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </>
        ) : (
          <Card className="p-6 w-full">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Edit Store Information</h2>
            <form onSubmit={handleStoreUpdate}>
              <div className="space-y-4">
                <Input
                  id="name"
                  name="name"
                  label="Store Name"
                  value={editForm.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter store name"
                />
                
                <Input
                  id="address"
                  name="address"
                  label="Store Address"
                  value={editForm.address}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter store address"
                />
                
                <div className="flex gap-3">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleEditToggle}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </form>
          </Card>
        )}
      </div>
      
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Products</h2>
        
        {items.length === 0 ? (
          <div className="text-center py-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <h3 className="text-lg font-medium text-gray-700 mt-4">No products yet</h3>
            <p className="text-gray-500 mb-6">Start by adding your first product to your store</p>
            <Link to={`/store/item/add/${store.id}`}>
              <Button>Add Your First Item</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {item.image_url ? (
                          <div className="flex-shrink-0 h-10 w-10 mr-4">
                            <img 
                              className="h-10 w-10 rounded-full object-cover" 
                              src={getImageUrl(item.image_url)} 
                              alt={item.name} 
                            />
                          </div>
                        ) : (
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full mr-4 flex items-center justify-center">
                            <span className="text-xs text-gray-500">No img</span>
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.price.toLocaleString()} IDR</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        item.stock > 10 
                          ? 'bg-green-100 text-green-800' 
                          : item.stock > 0 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {item.stock} in stock
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <Link to={`/store/item/edit/${item.id}`}>
                          <Button variant="secondary" size="sm">
                            Edit
                          </Button>
                        </Link>
                        <Button 
                          variant="danger" 
                          size="sm"
                          disabled={isDeletingId === item.id}
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          {isDeletingId === item.id ? 'Deleting...' : 'Delete'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default StoreDashboardPage; 