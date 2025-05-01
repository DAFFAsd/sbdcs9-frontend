import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { topUp } from '../services/authService';
import { toast } from 'react-hot-toast';

const TopUpPage = () => {
  const navigate = useNavigate();
  const { user, refreshUserData } = useAuth();
  const [topUpAmount, setTopUpAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [transactionHistory, setTransactionHistory] = useState<{ amount: number, date: Date }[]>([]);

  // Predefined amounts
  const presetAmounts = [
    { value: 10000, label: '10,000' },
    { value: 50000, label: '50,000' },
    { value: 100000, label: '100,000' },
    { value: 500000, label: '500,000' }
  ];

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handlePresetAmountClick = (amount: number) => {
    setTopUpAmount(amount.toString());
  };

  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseInt(topUpAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await topUp({ email: user!.email, amount });
      toast.success(`Successfully added ${amount.toLocaleString()} IDR to your balance!`);
      
      // Update transaction history (simulated)
      setTransactionHistory(prev => [
        { amount, date: new Date() },
        ...prev
      ].slice(0, 5)); // Keep only the most recent 5 entries
      
      await refreshUserData();
      setTopUpAmount('');
    } catch (error) {
      console.error('Top-up error:', error);
      toast.error('Failed to top up balance. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Top Up Balance</h1>
        <Link to="/profile" className="text-indigo-600 hover:text-indigo-800 transition">
          Back to Profile
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Current Balance */}
        <Card className="p-6 md:col-span-1">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Balance</h2>
          <div className="text-3xl font-bold text-indigo-600 mb-4">
            {user.balance.toLocaleString()} IDR
          </div>
          <p className="text-sm text-gray-600">
            Your available balance for shopping
          </p>
        </Card>
        
        {/* Top Up Form */}
        <Card className="p-6 md:col-span-2">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Add Balance</h2>
          
          <form onSubmit={handleTopUp}>
            <div className="mb-6">
              <Input
                id="topUpAmount"
                name="topUpAmount"
                type="number"
                label="Amount (IDR)"
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(e.target.value)}
                min="1"
                disabled={isLoading}
                required
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quick Select
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {presetAmounts.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    className={`py-2 px-4 rounded border ${
                      parseInt(topUpAmount) === preset.value
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    } transition-colors`}
                    onClick={() => handlePresetAmountClick(preset.value)}
                  >
                    {preset.label} IDR
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">
                • Top up is processed instantly<br/>
                • Minimum amount is 1 IDR<br/>
                • Funds will be available immediately for transactions
              </p>
            </div>
            
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Add Balance'}
            </Button>
          </form>
        </Card>
        
        {/* Recent Activity */}
        <Card className="p-6 md:col-span-3">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          
          {transactionHistory.length === 0 ? (
            <p className="text-gray-600">No recent top-up activity</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
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
                  {transactionHistory.map((transaction, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.date.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        Top Up
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        +{transaction.amount.toLocaleString()} IDR
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Completed
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
  );
};

export default TopUpPage; 