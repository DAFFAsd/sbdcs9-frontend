import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getItemById, createItem, updateItem } from '../services/itemService';
import { getStoreById } from '../services/storeService';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { getImageUrl } from '../utils/imageHelper';

interface ItemFormData {
  id?: string | number;
  store_id: string | number;
  name: string;
  price: string;
  stock: string;
  image: File | null;
}

const ItemFormPage = () => {
  const { storeId, itemId } = useParams<{ storeId?: string; itemId?: string }>();
  const navigate = useNavigate();
  const isEditMode = !!itemId;
  
  const [formData, setFormData] = useState<ItemFormData>({
    store_id: storeId || '',
    name: '',
    price: '',
    stock: '',
    image: null
  });
  
  const [storeName, setStoreName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    // In edit mode, we need to fetch the item first to get its store ID
    if (isEditMode && itemId) {
      fetchItemData(itemId);
    } else {
      // In create mode, check store authentication immediately
      checkStoreAuthentication(storeId);
    }
  }, [storeId, itemId, isEditMode]);

  // Separate authentication check function
  const checkStoreAuthentication = (idToCheck?: string) => {
    if (!idToCheck) return;

    const storedStoreId = localStorage.getItem('storeId');
    if (storedStoreId !== idToCheck) {
      toast.error('You need to login as this store first');
      navigate('/store/login');
      return false;
    }

    const storeName = localStorage.getItem('storeName');
    if (storeName) {
      setStoreName(storeName);
    } else {
      // Fetch store data if name not in localStorage
      fetchStoreData(idToCheck);
    }
    
    return true;
  };

  const fetchStoreData = async (id?: string) => {
    if (!id) return;
    
    try {
      const storeData = await getStoreById(id);
      setStoreName(storeData.name);
    } catch (error) {
      console.error('Error fetching store data:', error);
      toast.error('Failed to load store data');
    }
  };

  const fetchItemData = async (id: string) => {
    setIsLoading(true);
    try {
      const itemData = await getItemById(id);
      
      // Now that we have the item data, check store authentication
      const itemStoreId = itemData.store_id.toString();
      const isAuthenticated = checkStoreAuthentication(itemStoreId);
      
      if (!isAuthenticated) {
        return; // Stop if authentication failed
      }

      // Update form data with the fetched item
      setFormData({
        id: itemData.id,
        store_id: itemData.store_id,
        name: itemData.name,
        price: itemData.price.toString(),
        stock: itemData.stock.toString(),
        image: null
      });
      
      // Set image preview if available
      if (itemData.image_url) {
        setImagePreview(getImageUrl(itemData.image_url));
      }
    } catch (error) {
      console.error('Error fetching item data:', error);
      toast.error('Failed to load item data');
      navigate('/store/login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Allow only numbers for price and stock
    if ((name === 'price' || name === 'stock') && value !== '') {
      // Only allow digits and decimals for price
      if (name === 'price' && !/^\d*\.?\d*$/.test(value)) return;
      
      // Only allow digits for stock
      if (name === 'stock' && !/^\d*$/.test(value)) return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    setFormData(prev => ({
      ...prev,
      image: file
    }));
    
    // Create preview URL
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.name.trim()) {
      toast.error('Product name is required');
      return;
    }
    
    // Convert price and stock to numbers for validation
    const priceValue = formData.price === '' ? 0 : parseFloat(formData.price);
    const stockValue = formData.stock === '' ? 0 : parseInt(formData.stock);
    
    if (priceValue <= 0) {
      toast.error('Price must be greater than 0');
      return;
    }
    
    if (stockValue < 0) {
      toast.error('Stock cannot be negative');
      return;
    }
    
    // Check store authentication again before submitting
    const storeIdToCheck = formData.store_id.toString();
    const storedStoreId = localStorage.getItem('storeId');
    
    if (storedStoreId !== storeIdToCheck) {
      toast.error('You need to login as this store first');
      navigate('/store/login');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare data for API with numeric values
      const apiData = {
        ...formData,
        price: priceValue,
        stock: stockValue
      };
      
      if (isEditMode) {
        await updateItem(apiData);
        toast.success('Item updated successfully');
      } else {
        await createItem(apiData);
        toast.success('Item created successfully');
      }
      
      // Use the store ID from the form data for redirection
      navigate(`/store/dashboard/${formData.store_id}`);
    } catch (error) {
      console.error('Error saving item:', error);
      toast.error(isEditMode ? 'Failed to update item' : 'Failed to create item');
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

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditMode ? 'Edit Item' : 'Add New Item'}
        </h1>
        <p className="text-gray-600 mt-1">Store: {storeName}</p>
      </div>
      
      <Card className="p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="mb-4">
                <Input
                  id="name"
                  name="name"
                  label="Product Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter product name"
                  required
                />
              </div>
              
              <div className="mb-4">
                <Input
                  id="price"
                  name="price"
                  type="text"
                  label="Price (IDR)"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0"
                  required
                />
              </div>
              
              <div className="mb-4">
                <Input
                  id="stock"
                  name="stock"
                  type="text"
                  label="Stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  placeholder="0"
                  required
                />
              </div>
            </div>
            
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Image
                </label>
                <input
                  type="file"
                  id="image"
                  name="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {isEditMode ? 'Upload a new image to replace the current one' : 'Upload a product image (optional)'}
                </p>
              </div>
              
              {imagePreview && (
                <div className="mt-4 mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image Preview
                  </label>
                  <div className="w-full h-48 bg-gray-100 rounded-md overflow-hidden">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-end space-x-4 mt-8">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(`/store/dashboard/${formData.store_id}`)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : (isEditMode ? 'Update Item' : 'Create Item')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ItemFormPage; 