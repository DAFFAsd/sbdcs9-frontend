import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { getUserTransactions } from '../services/transactionService';
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

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  const fetchTransactions = async () => {
    if (!user) return;
    
    setIsLoadingTransactions(true);
    try {
      const data = await getUserTransactions(user.id);
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load purchase history');
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  // Format date from ISO string
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy, HH:mm');
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Info */}
        <div className="md:col-span-2">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <div className="text-lg text-gray-900">{user.name}</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="text-lg text-gray-900">{user.email}</div>
              </div>
            </div>
            
            <hr className="my-6" />
            
            <div className="flex flex-col md:flex-row gap-4">
              <Button 
                variant="danger" 
                onClick={() => {
                  if (window.confirm('Are you sure you want to logout?')) {
                    logout();
                    navigate('/login');
                  }
                }}
                className="md:w-auto"
              >
                Logout
              </Button>
            </div>
          </Card>
        </div>
        
        {/* Account Balance */}
        <div>
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Balance</h2>
            
            <div className="text-3xl font-bold text-indigo-600 mb-6">
              {user.balance.toLocaleString()} IDR
            </div>
            
            <Link to="/topup">
              <Button className="w-full">
                Add Balance
              </Button>
            </Link>
            
            <div className="mt-4 text-sm text-gray-600">
              Add funds to your balance to make purchases in our marketplace.
            </div>
          </Card>
        </div>
        
        {/* Purchase History */}
        <div className="md:col-span-3">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Purchase History</h2>
            
            {isLoadingTransactions ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : transactions.length === 0 ? (
              <p className="text-gray-600 py-4">You haven't made any purchases yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Transaction ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Item
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Store
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          #{transaction.id.toString().substring(0, 8)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(transaction.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {transaction.item_image ? (
                              <div className="flex-shrink-0 h-10 w-10 mr-4">
                                <img 
                                  className="h-10 w-10 rounded-full object-cover" 
                                  src={getImageUrl(transaction.item_image)} 
                                  alt="" 
                                />
                              </div>
                            ) : (
                              <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full mr-4 flex items-center justify-center">
                                <span className="text-xs text-gray-500">No img</span>
                              </div>
                            )}
                            <Link 
                              to={`/items/${transaction.item_id}`}
                              className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                            >
                              {transaction.item_name}
                            </Link>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link 
                            to={`/stores/${transaction.store_id}`}
                            className="text-sm text-gray-500 hover:text-indigo-600"
                          >
                            {transaction.store_name}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {transaction.total.toLocaleString()} IDR
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            transaction.status === 'paid' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {transaction.status === 'paid' ? 'Completed' : 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 