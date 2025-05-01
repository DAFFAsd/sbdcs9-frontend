import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import Card from '../components/Card';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!registerData.name) {
      newErrors.name = 'Name is required';
    }
    
    if (!registerData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(registerData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!registerData.password) {
      newErrors.password = 'Password is required';
    } else if (registerData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/.test(registerData.password)) {
      newErrors.password = 'Password must contain at least one number and one special character';
    }
    
    if (registerData.confirmPassword !== registerData.password) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsLoading(true);
    
    try {
      await register(registerData.name, registerData.email, registerData.password);
      toast.success('Registration successful!');
      navigate('/');
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Display specific error message from the server if available
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 w-full">
      <Card className="max-w-md w-full p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Create Account</h1>
          <p className="mt-2 text-sm text-gray-600">
            Or{' '}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              sign in to your account
            </Link>
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            id="name"
            name="name"
            type="text"
            label="Full Name"
            autoComplete="name"
            value={registerData.name}
            onChange={handleChange}
            error={errors.name}
            disabled={isLoading}
            required
          />
          
          <Input
            id="email"
            name="email"
            type="email"
            label="Email address"
            autoComplete="email"
            value={registerData.email}
            onChange={handleChange}
            error={errors.email}
            disabled={isLoading}
            required
          />
          
          <Input
            id="password"
            name="password"
            type="password"
            label="Password"
            autoComplete="new-password"
            value={registerData.password}
            onChange={handleChange}
            error={errors.password}
            disabled={isLoading}
            required
          />
          
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            label="Confirm Password"
            autoComplete="new-password"
            value={registerData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            disabled={isLoading}
            required
          />
          
          <div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default RegisterPage; 