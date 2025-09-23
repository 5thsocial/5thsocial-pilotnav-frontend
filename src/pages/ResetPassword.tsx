// File: src/pages/ResetPassword.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Lock, Eye, EyeOff, ArrowRight, ArrowLeft, Mail } from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout';
import authService from '../services/authService';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if no email provided
  useEffect(() => {
    if (!email) {
      toast.error('Please complete OTP verification first');
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const validateForm = () => {
    if (!formData.newPassword) {
      setError('Please enter your new password');
      return false;
    }
    
    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    
    if (!formData.confirmPassword) {
      setError('Please confirm your new password');
      return false;
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const response = await authService.resetPassword({
        email: email!,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword
      });
      
      toast.success(response.message || 'Password reset successfully');
      
      // Navigate to signin page
      navigate('/signin');
      
    } catch (error: any) {
      console.error('Password reset error:', error);
      setError(error.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToOTP = () => {
    navigate('/forgot-password/verify-otp', { 
      state: { email: email } 
    });
  };

  if (!email) {
    return null;
  }

  return (
    <AuthLayout>
      <div className="mx-auto w-full max-w-xl">
        <div className="p-8 rounded-lg border shadow-lg bg-card border-border">
          <div className="mb-8 text-center">
            <h2 className="mb-2 text-2xl font-bold font-heading text-foreground">
              Reset Password
            </h2>
            <p className="text-muted-foreground">
              Create a new password for <span className="font-medium">{email}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password Field */}
            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-sm font-medium text-foreground">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 w-4 h-4 transform -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  required
                  className={`w-full pl-10 pr-12 py-3 border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors ${
                    error ? 'border-destructive' : 'border-input'
                  }`}
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transition-colors transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 w-4 h-4 transform -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className={`w-full pl-10 pr-12 py-3 border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors ${
                    error ? 'border-destructive' : 'border-input'
                  }`}
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transition-colors transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Reset Password Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 text-base font-medium bg-brand hover:bg-brand/90"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full border-2 border-current animate-spin border-t-transparent"></div>
                  <span>Reset Password</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span>Reset Password</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </Button>
          </form>

          {/* Back to OTP Link */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={handleBackToOTP}
              className="flex justify-center items-center mx-auto text-sm font-medium transition-colors text-primary hover:underline"
            >
              <ArrowLeft className="mr-1 w-4 h-4" />
              Back to OTP Verification
            </button>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default ResetPassword;