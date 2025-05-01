import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserTransactions } from '../services/transactionService';
import { toast } from 'react-hot-toast';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [storeLoggedIn, setStoreLoggedIn] = useState<{id: string, name: string} | null>(null);
  
  useEffect(() => {
    // Check if a store is logged in
    const checkStoreLogin = () => {
      const storeId = localStorage.getItem('storeId');
      const storeName = localStorage.getItem('storeName');
      
      if (storeId && storeName) {
        setStoreLoggedIn({ id: storeId, name: storeName });
      } else {
        setStoreLoggedIn(null);
      }
    };
    
    // Check immediately when component mounts or page changes
    checkStoreLogin();
    
    // Add event listener for localStorage changes
    window.addEventListener('storage', checkStoreLogin);
    
    // Add event listener for custom storage update event
    window.addEventListener('storageUpdate', checkStoreLogin);
    
    // Set up interval to periodically check for changes
    const intervalId = setInterval(checkStoreLogin, 1000);
    
    return () => {
      window.removeEventListener('storage', checkStoreLogin);
      window.removeEventListener('storageUpdate', checkStoreLogin);
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const fetchCartItems = async () => {
      if (user) {
        try {
          const transactions = await getUserTransactions(user.id);
          const pendingCount = transactions.filter(t => t.status === 'pending').length;
          setCartItemCount(pendingCount);
        } catch (error) {
          console.error('Error fetching cart count:', error);
        }
      }
    };

    fetchCartItems();
    // Set up interval to refresh cart count every minute
    const intervalId = setInterval(fetchCartItems, 60000);
    
    return () => clearInterval(intervalId);
  }, [user]);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleStoreLogout = () => {
    localStorage.removeItem('storeId');
    localStorage.removeItem('storeName');
    setStoreLoggedIn(null);
    toast.success('Logged out from store');
  };
  
  return (
    <nav className="bg-indigo-600 py-4 px-6 shadow-md w-full">
      <div className="w-full max-w-[1440px] mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-xl font-bold">Toko 👨🏿‍🌾🌾</Link>
        
        {/* Mobile menu button */}
        <button 
          className="md:hidden text-white focus:outline-none"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
        
        {/* Desktop menu */}
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-white hover:text-indigo-200 transition">Home</Link>
          <Link to="/stores" className="text-white hover:text-indigo-200 transition">Stores</Link>
          
          {storeLoggedIn ? (
            <Link 
              to={`/store/dashboard/${storeLoggedIn.id}`} 
              className="text-white hover:text-indigo-200 transition"
            >
              Store Dashboard
            </Link>
          ) : (
            <Link to="/store/login" className="text-white hover:text-indigo-200 transition">Store Login</Link>
          )}
          
          {user && (
            <Link to="/cart" className="text-white hover:text-indigo-200 transition relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemCount > 9 ? '9+' : cartItemCount}
                </span>
              )}
            </Link>
          )}
          
          {user ? (
            <div className="relative">
              <button 
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center space-x-2 text-white hover:text-indigo-200 focus:outline-none transition"
              >
                <div className="bg-indigo-300 text-indigo-800 rounded-full h-8 w-8 flex items-center justify-center font-medium">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span>{user.name}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                  <div className="py-3 px-4 border-b">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-600 truncate">{user.email}</p>
                    <p className="text-sm font-medium text-indigo-600 mt-1">Balance: {user.balance.toLocaleString()} IDR</p>
                  </div>
                  <div className="py-1">
                    <Link 
                      to="/profile" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      My Profile
                    </Link>
                    <Link 
                      to="/cart" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      Cart {cartItemCount > 0 && `(${cartItemCount})`}
                    </Link>
                    <Link 
                      to="/topup" 
                      className="block px-4 py-2 text-sm text-indigo-600 hover:bg-gray-100"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      Add Balance
                    </Link>
                    <Link 
                      to="#"
                      onClick={() => {
                        handleLogout();
                        setIsProfileDropdownOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Logout
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link 
                to="/login"
                className="text-white hover:text-indigo-200 transition"
              >
                Login
              </Link>
              <Link 
                to="/register"
                className="bg-white text-indigo-600 hover:bg-indigo-100 px-4 py-2 rounded-md transition"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden mt-4 flex flex-col space-y-3 bg-indigo-700 p-4 rounded-md w-full max-w-[1440px] mx-auto">
          <Link to="/" className="text-white hover:text-indigo-200 transition">Home</Link>
          <Link to="/stores" className="text-white hover:text-indigo-200 transition">Stores</Link>
          
          {storeLoggedIn ? (
            <>
              <Link 
                to={`/store/dashboard/${storeLoggedIn.id}`}
                className="text-white hover:text-indigo-200 transition"
              >
                Store Dashboard
              </Link>
              <button 
                onClick={handleStoreLogout}
                className="text-white hover:text-indigo-200 transition text-left"
              >
                Logout from Store
              </button>
            </>
          ) : (
            <Link to="/store/login" className="text-white hover:text-indigo-200 transition">Store Login</Link>
          )}
          
          {user && (
            <Link to="/cart" className="text-white hover:text-indigo-200 transition flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Cart {cartItemCount > 0 && <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">{cartItemCount}</span>}
            </Link>
          )}
          
          {user ? (
            <>
              <div className="border-t border-indigo-500 pt-3 mb-2">
                <div className="flex items-center space-x-2 text-white mb-3">
                  <div className="bg-indigo-300 text-indigo-800 rounded-full h-8 w-8 flex items-center justify-center font-medium">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-indigo-200">{user.email}</p>
                  </div>
                </div>
                <p className="text-white mb-3">Balance: <span className="font-medium">{user.balance.toLocaleString()} IDR</span></p>
              </div>
              <Link to="/profile" className="text-white hover:text-indigo-200 transition">
                My Profile
              </Link>
              <Link to="/topup" className="text-white hover:text-indigo-200 transition">
                Add Balance
              </Link>
              <button 
                onClick={handleLogout}
                className="bg-white text-indigo-600 hover:bg-indigo-100 px-4 py-2 rounded-md transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link 
                to="/login"
                className="text-white hover:text-indigo-200 transition"
              >
                Login
              </Link>
              <Link 
                to="/register"
                className="bg-white text-indigo-600 hover:bg-indigo-100 px-4 py-2 rounded-md transition text-center"
              >
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar; 