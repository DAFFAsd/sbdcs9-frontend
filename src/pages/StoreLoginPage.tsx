import { useState, useEffect } from 'react';
import { useNavigate} from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getStoreById, createStore } from '../services/storeService';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';

const StoreLoginPage = () => {
  const [storeId, setStoreId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [newStoreForm, setNewStoreForm] = useState({
    name: '',
    address: ''
  });
  const [isSubmittingNew, setIsSubmittingNew] = useState(false);

  // Check if a store is already logged in
  useEffect(() => {
    const storedStoreId = localStorage.getItem('storeId');
    const storeName = localStorage.getItem('storeName');
    
    if (storedStoreId && storeName) {
      // If store already logged in, redirect to dashboard
      toast.success(`Already logged in as ${storeName}`);
      navigate(`/store/dashboard/${storedStoreId}`);
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!storeId.trim()) {
      toast.error('Please enter a store ID');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Verify store exists
      const store = await getStoreById(storeId);
      
      if (store) {
        // Trigger a custom event to notify other components about store login
        const storageEvent = new Event('storageUpdate');
        
        // Store login information in localStorage
        localStorage.setItem('storeId', storeId.toString());
        localStorage.setItem('storeName', store.name);
        
        // Dispatch the custom event
        window.dispatchEvent(storageEvent);
        
        toast.success(`Logged in as ${store.name}`);
        navigate(`/store/dashboard/${storeId}`);
      } else {
        toast.error('Store not found');
      }
    } catch (error) {
      console.error('Store login error:', error);
      toast.error('Failed to login. Store not found.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateToggle = () => {
    setIsCreating(!isCreating);
    // Reset form when toggling
    setNewStoreForm({ name: '', address: '' });
  };

  const handleNewStoreInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewStoreForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to create a store');
      navigate('/login');
      return;
    }
    
    if (!newStoreForm.name.trim()) {
      toast.error('Store name is required');
      return;
    }
    
    if (!newStoreForm.address.trim()) {
      toast.error('Store address is required');
      return;
    }
    
    setIsSubmittingNew(true);
    
    try {
      const newStore = await createStore({
        user_id: user.id,
        name: newStoreForm.name,
        address: newStoreForm.address
      });
      
      if (newStore && newStore.id) {
        // Store login information in localStorage
        localStorage.setItem('storeId', newStore.id.toString());
        localStorage.setItem('storeName', newStore.name);
        
        // Trigger custom event to notify navbar
        const storageEvent = new Event('storageUpdate');
        window.dispatchEvent(storageEvent);
        
        toast.success(`Store "${newStore.name}" created successfully!`);
        navigate(`/store/dashboard/${newStore.id}`);
      } else {
        throw new Error('Failed to create store');
      }
    } catch (error) {
      console.error('Store creation error:', error);
      toast.error('Failed to create store. Please try again.');
    } finally {
      setIsSubmittingNew(false);
    }
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 py-16 flex flex-col items-center">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">
          {isCreating ? 'Create New Store' : 'Store Login'}
        </h1>
        
        <Card className="p-6">
          {!isCreating ? (
            <>
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <Input
                    id="storeId"
                    name="storeId"
                    label="Store ID"
                    value={storeId}
                    onChange={(e) => setStoreId(e.target.value)}
                    placeholder="Enter your store ID"
                    required
                  />
                </div>
                
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Logging in...' : 'Login to Store Dashboard'}
                </Button>
              </form>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 mb-4">
                  Don't have a store yet?
                </p>
                <Button 
                  variant="secondary" 
                  onClick={handleCreateToggle}
                  className="w-full"
                >
                  Create New Store
                </Button>
              </div>
            </>
          ) : (
            <>
              <form onSubmit={handleCreateStore}>
                <div className="space-y-4 mb-6">
                  <Input
                    id="name"
                    name="name"
                    label="Store Name"
                    value={newStoreForm.name}
                    onChange={handleNewStoreInputChange}
                    placeholder="Enter store name"
                    required
                  />
                  
                  <Input
                    id="address"
                    name="address"
                    label="Store Address"
                    value={newStoreForm.address}
                    onChange={handleNewStoreInputChange}
                    placeholder="Enter store address"
                    required
                  />
                </div>
                
                <div className="flex gap-3">
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={isSubmittingNew}
                  >
                    {isSubmittingNew ? 'Creating...' : 'Create Store'}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex-1"
                    onClick={handleCreateToggle}
                  >
                    Back to Login
                  </Button>
                </div>
              </form>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Create your own store to sell products
                </p>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default StoreLoginPage; 