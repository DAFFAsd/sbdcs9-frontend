import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { getUserTransactions, payTransaction, deleteTransaction } from '../services/transactionService';
import { format } from 'date-fns';
import { getImageUrl } from '../utils/imageHelper';

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

const CartPage = () => {
  const navigate = useNavigate();
  const { user, refreshUserData } = useAuth();
  const [cartItems, setCartItems] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cancellingItemId, setCancellingItemId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchCartItems();
    }
  }, [user]);

  const fetchCartItems = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const transactions = await getUserTransactions(user.id);
      // Filter only pending transactions for the cart
      const pendingTransactions = transactions.filter(t => t.status === 'pending');
      setCartItems(pendingTransactions);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      toast.error('Failed to load cart items');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelectItem = (id: string | number) => {
    const idStr = id.toString();
    if (selectedItems.includes(idStr)) {
      setSelectedItems(selectedItems.filter(itemId => itemId !== idStr));
    } else {
      setSelectedItems([...selectedItems, idStr]);
    }
  };

  const selectAllItems = () => {
    if (selectedItems.length === cartItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map(item => item.id.toString()));
    }
  };

  const getTotalAmount = () => {
    return cartItems
      .filter(item => selectedItems.includes(item.id.toString()))
      .reduce((total, item) => total + item.total, 0);
  };

  const handleCancelItem = async (id: string | number) => {
    if (isProcessing) return;
    
    const idStr = id.toString();
    setCancellingItemId(idStr);
    
    try {
      await deleteTransaction(id);
      
      // Remove item from selected items if it was selected
      if (selectedItems.includes(idStr)) {
        setSelectedItems(selectedItems.filter(itemId => itemId !== idStr));
      }
      
      // Remove item from cart items
      setCartItems(cartItems.filter(item => item.id.toString() !== idStr));
      
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Error removing item from cart:', error);
      toast.error('Failed to remove item from cart');
    } finally {
      setCancellingItemId(null);
    }
  };

  const handleCheckout = async () => {
    if (selectedItems.length === 0) {
      toast.error('Please select at least one item to checkout');
      return;
    }

    const totalAmount = getTotalAmount();
    
    if (user && user.balance < totalAmount) {
      toast.error('Insufficient balance. Please top up first.');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Pay each selected transaction one by one - pass IDs as strings to preserve UUID format
      // Don't convert to Number as it makes UUIDs into NaN
      const payPromises = selectedItems.map(id => payTransaction(id));
      await Promise.all(payPromises);
      
      // Refresh user data to update balance
      await refreshUserData();
      
      toast.success('Payment successful!');
      
      // Refresh cart items
      await fetchCartItems();
      
      // Clear selected items
      setSelectedItems([]);
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to complete payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Format date from ISO string
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy, HH:mm');
    } catch (error) {
      return dateString;
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">My Cart</h1>
        <Link to="/" className="text-indigo-600 hover:text-indigo-800">
          Continue Shopping
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : cartItems.length === 0 ? (
        <Card className="p-12 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h2 className="text-2xl font-semibold text-gray-700 mt-4 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Looks like you haven't added any items to your cart yet.</p>
          <Link to="/">
            <Button>Browse Products</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Cart Items ({cartItems.length})</h2>
                <button 
                  onClick={selectAllItems}
                  className="text-sm text-indigo-600 hover:text-indigo-800"
                >
                  {selectedItems.length === cartItems.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              
              <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        <input 
                          type="checkbox" 
                          checked={cartItems.length > 0 && selectedItems.length === cartItems.length}
                          onChange={selectAllItems}
                          className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Product
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Price
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Quantity
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Total
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {cartItems.map((item) => (
                      <tr key={item.id} className={selectedItems.includes(item.id.toString()) ? "bg-indigo-50" : ""}>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <input 
                            type="checkbox" 
                            checked={selectedItems.includes(item.id.toString())}
                            onChange={() => toggleSelectItem(item.id)}
                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center">
                            {item.item_image ? (
                              <div className="flex-shrink-0 h-16 w-16 mr-4">
                                <img 
                                  className="h-16 w-16 rounded-md object-cover" 
                                  src={getImageUrl(item.item_image)} 
                                  alt="" 
                                />
                              </div>
                            ) : (
                              <div className="flex-shrink-0 h-16 w-16 bg-gray-200 rounded-md mr-4 flex items-center justify-center">
                                <span className="text-xs text-gray-500">No img</span>
                              </div>
                            )}
                            <div>
                              <Link 
                                to={`/items/${item.item_id}`}
                                className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                              >
                                {item.item_name}
                              </Link>
                              <p className="text-xs text-gray-500 mt-1">
                                Added on {formatDate(item.created_at)}
                              </p>
                              <p className="text-xs text-gray-500">
                                Sold by: <Link to={`/stores/${item.store_id}`} className="hover:text-indigo-600">{item.store_name}</Link>
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {(item.total / item.quantity).toLocaleString()} IDR
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.total.toLocaleString()} IDR
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            onClick={() => handleCancelItem(item.id)}
                            disabled={isProcessing || cancellingItemId === item.id.toString()}
                            className="text-red-600 hover:text-red-800 transition flex items-center"
                          >
                            {cancellingItemId === item.id.toString() ? (
                              <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Removing...
                              </span>
                            ) : (
                              <span className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Remove
                              </span>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
          
          <div className="md:col-span-1">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="border-t border-b py-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Selected Items:</span>
                  <span className="font-medium">{selectedItems.length}</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold">
                  <span className="text-gray-900">Total:</span>
                  <span className="text-indigo-600">{getTotalAmount().toLocaleString()} IDR</span>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Current Balance: {user?.balance?.toLocaleString() || 0} IDR
                </div>
              </div>
              
              <Button
                onClick={handleCheckout}
                disabled={isProcessing || selectedItems.length === 0}
                className="w-full"
              >
                {isProcessing ? 'Processing...' : 'Checkout'}
              </Button>
              
              <div className="mt-4">
                <p className="text-xs text-gray-500 mb-2">
                  Need more funds?
                </p>
                <Link to="/topup">
                  <Button variant="secondary" className="w-full text-sm">
                    Top Up Balance
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage; 