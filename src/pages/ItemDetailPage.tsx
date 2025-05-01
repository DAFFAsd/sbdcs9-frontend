import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { getItemById } from '../services/itemService';
import { getStoreById } from '../services/storeService';
import { createTransaction, payTransaction, getUserTransactions, deleteTransaction } from '../services/transactionService';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { getImageUrl } from '../utils/imageHelper';

interface Item {
  id: string | number;
  store_id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url: string;
}

interface Store {
  id: number;
  name: string;
  address: string;
}

const ItemDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, refreshUserData } = useAuth();
  const [item, setItem] = useState<Item | null>(null);
  const [store, setStore] = useState<Store | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchItemData = async () => {
      if (!id) return;
      
      try {
        const itemData = await getItemById(id);
        setItem(itemData);
        
        if (itemData.store_id) {
          const storeData = await getStoreById(itemData.store_id);
          setStore(storeData);
        }
      } catch (error) {
        console.error('Error fetching item data:', error);
        toast.error('Failed to load product data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchItemData();
  }, [id]);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (isNaN(value) || value < 1) {
      setQuantity(1);
    } else if (item && value > item.stock) {
      setQuantity(item.stock);
    } else {
      setQuantity(value);
    }
  };

  const handlePurchase = async (shouldPayImmediately = true) => {
    if (!user) {
      toast.error('Please log in to purchase items');
      navigate('/login');
      return;
    }
    
    if (!item || !quantity) return;
    
    const totalPrice = item.price * quantity;
    
    if (shouldPayImmediately && user.balance < totalPrice) {
      toast.error('Insufficient balance. Please top up first.');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      if (!shouldPayImmediately) {
        // Check if item already exists in cart
        const userTransactions = await getUserTransactions(user.id);
        const pendingTransactions = userTransactions.filter(t => t.status === 'pending');
        const existingCartItem = pendingTransactions.find(t => t.item_id == item.id);
        
        if (existingCartItem) {
          // Calculate new quantity
          const newQuantity = Number(existingCartItem.quantity) + Number(quantity);
          
          // Check if the new quantity exceeds the available stock
          if (newQuantity > item.stock) {
            toast.error(`Cannot add ${quantity} more items in cart. Only ${item.stock} available in stock (with ${existingCartItem.quantity} already in cart).`);
            setIsProcessing(false);
            return;
          }
          
          // Item exists in cart, delete the existing transaction first
          await deleteTransaction(existingCartItem.id);
          
          // Calculate total price for new quantity
          const newTotalPrice = item.price * newQuantity;
          
          // Create a new transaction with updated quantity
          const transactionData = {
            user_id: user.id,
            item_id: item.id,
            quantity: newQuantity,
            total_price: newTotalPrice
          };
          
          await createTransaction(transactionData);
          
          toast.success('Cart updated successfully!');
          navigate('/cart');
          setIsProcessing(false);
          return;
        }
      }
      
      // Create transaction
      const transactionData = {
        user_id: user.id,
        item_id: item.id,
        quantity: quantity,
        total_price: totalPrice
      };
      
      const createResponse = await createTransaction(transactionData);
      
      if (!createResponse || !createResponse.payload || !createResponse.payload.id) {
        throw new Error('Failed to create transaction');
      }
      
      if (shouldPayImmediately) {
        // Pay transaction
        await payTransaction(createResponse.payload.id);
        
        // Refresh user data to update balance
        await refreshUserData();
        
        toast.success('Purchase successful!');
      } else {
        toast.success('Item added to cart!');
        navigate('/cart');
      }
      
      // Refresh item data - pass id directly as a string
      if (id) {
        const updatedItem = await getItemById(id);
        setItem(updatedItem);
        setQuantity(1);
      }
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error(shouldPayImmediately 
        ? 'Failed to complete purchase. Please try again.'
        : 'Failed to add item to cart. Please try again.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-[1440px] mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="w-full max-w-[1440px] mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl text-gray-600 mb-4">Product not found.</h2>
          <Link to="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 py-8">
      <div className="mb-8">
        <Link to={store ? `/stores/${store.id}` : '/stores'} className="inline-flex items-center text-indigo-600 hover:text-indigo-800 transition mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to {store ? store.name : 'Stores'}
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2 h-64 md:h-auto">
            {item.image_url ? (
              <img 
                src={getImageUrl(item.image_url)} 
                alt={item.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <span className="text-gray-500">No image</span>
              </div>
            )}
          </div>
          
          <div className="p-6 md:w-1/2">
            <div className="mb-4">
              {store && (
                <Link to={`/stores/${store.id}`} className="text-sm text-indigo-600 hover:text-indigo-800 transition">
                  {store.name}
                </Link>
              )}
              <h1 className="text-2xl font-bold mt-2 text-gray-900">{item.name}</h1>
              <p className="text-gray-600 mt-4">{item.description}</p>
            </div>
            
            <div className="mb-6">
              <p className="text-3xl font-bold text-indigo-600">{item.price.toLocaleString()} IDR</p>
              <p className="text-sm text-gray-600 mt-2">
                Stock: {item.stock === 0 ? (
                  <span className="text-red-600 font-medium">Out of stock</span>
                ) : (
                  <span>{item.stock} available</span>
                )}
              </p>
            </div>
            
            {item.stock > 0 && (
              <Card className="bg-gray-50 p-4 mb-6">
                <div className="flex items-center mb-4">
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    label="Quantity"
                    value={quantity}
                    onChange={handleQuantityChange}
                    min="1"
                    max={item.stock}
                    disabled={isProcessing}
                    className="w-24"
                  />
                  
                  <div className="ml-6">
                    <p className="text-sm text-gray-600">Total:</p>
                    <p className="font-bold text-lg text-gray-900">{(item.price * quantity).toLocaleString()} IDR</p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => handlePurchase(false)}
                    disabled={isProcessing || !user}
                    variant="secondary"
                    className="flex-1"
                  >
                    {isProcessing ? 'Processing...' : 'Add to Cart'}
                  </Button>
                  
                  <Button
                    onClick={() => handlePurchase(true)}
                    disabled={isProcessing || !user}
                    className="flex-1"
                  >
                    {isProcessing ? 'Processing...' : 'Buy Now'}
                  </Button>
                </div>
                
                {!user && (
                  <p className="text-sm text-red-600 mt-2">
                    Please <Link to="/login" className="underline">login</Link> to purchase this item
                  </p>
                )}
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetailPage; 