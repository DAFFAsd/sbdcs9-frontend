import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy loaded pages
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const StoresPage = lazy(() => import('./pages/StoresPage'));
const StoreDetailPage = lazy(() => import('./pages/StoreDetailPage'));
const ItemDetailPage = lazy(() => import('./pages/ItemDetailPage'));
const AllItemsPage = lazy(() => import('./pages/AllItemsPage'));
const TopUpPage = lazy(() => import('./pages/TopUpPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const StoreLoginPage = lazy(() => import('./pages/StoreLoginPage'));
const StoreDashboardPage = lazy(() => import('./pages/StoreDashboardPage'));
const ItemFormPage = lazy(() => import('./pages/ItemFormPage'));

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 w-full">
          <Navbar />
          <main className="w-full pb-10">
            <Suspense fallback={
              <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            }>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/cart" 
                  element={
                    <ProtectedRoute>
                      <CartPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/topup" 
                  element={
                    <ProtectedRoute>
                      <TopUpPage />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/stores" element={<StoresPage />} />
                <Route path="/stores/:id" element={<StoreDetailPage />} />
                <Route path="/items" element={<AllItemsPage />} />
                <Route path="/items/:id" element={<ItemDetailPage />} />
                
                {/* Store management routes */}
                <Route path="/store/login" element={<StoreLoginPage />} />
                <Route path="/store/dashboard/:id" element={<StoreDashboardPage />} />
                <Route path="/store/item/add/:storeId" element={<ItemFormPage />} />
                <Route path="/store/item/edit/:itemId" element={<ItemFormPage />} />
              </Routes>
            </Suspense>
          </main>
          <Toaster position="top-center" />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
