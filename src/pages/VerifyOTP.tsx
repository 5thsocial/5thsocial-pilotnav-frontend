import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/button';
// import { Input } from '../components/ui/input';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout';
import authService from '../services/authService';
import toast from 'react-hot-toast';

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!email) {
      toast.error('Please request a reset link first');
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      setError('OTP is required');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await authService.verifyOTP({ email: email!, otp: otp.trim() });
      toast.success('OTP verified successfully');
      navigate('/forgot-password/verify-otp/reset-password', { state: { email } });
    } catch (err: any) {
      setError(err.message || 'Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToForgot = () => {
    navigate('/forgot-password', { state: { email } });
  };

  if (!email) return null;

  return (
    <AuthLayout>
      <div className="mx-auto w-full max-w-xl">
        <div className="p-8 rounded-lg border shadow-lg bg-card border-border">
          <div className="mb-8 text-center">
            <h2 className="mb-2 text-2xl font-bold font-heading text-foreground">Verify OTP</h2>
            <p className="text-muted-foreground">Enter the code sent to <span className="font-medium">{email}</span></p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="otp" className="text-sm font-medium text-foreground">OTP Code</label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring ${error ? 'border-destructive' : 'border-input'}`}
                placeholder="Enter 6-digit code"
                maxLength={6}
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? 'Verifying...' : <><span>Verify OTP</span><ArrowRight className="ml-2 w-4 h-4" /></>}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <button onClick={handleBackToForgot} className="text-sm text-primary hover:underline flex items-center justify-center mx-auto">
              <ArrowLeft className="mr-1 w-4 h-4" /> Back to Reset Request
            </button>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default VerifyOTP;