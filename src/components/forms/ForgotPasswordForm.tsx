import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react';

interface ForgotPasswordFormProps {
  onResetPassword: (email: string) => Promise<void>;
  onBackToSignIn: () => void;
}

const ForgotPasswordForm = ({ onResetPassword, onBackToSignIn }: ForgotPasswordFormProps) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    setIsLoading(true);
    try {
      await onResetPassword(email.trim());
    } catch (err: any) {
      setError(err.message || 'Failed to send reset link');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="p-8 rounded-lg border shadow-lg bg-card border-border">
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-2xl font-bold font-heading text-foreground">
            Forgot Password
          </h2>
          <p className="text-muted-foreground">
            Enter your email to receive a reset link
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 w-4 h-4 transform -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={handleEmailChange}
                required
                className={`w-full pl-10 pr-4 py-3 border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors ${
                  error ? 'border-destructive' : 'border-input'
                }`}
                placeholder="Enter your email"
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
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
                <span>Sending reset link...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span>Send Reset Link</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            )}
          </Button>
        </form>

        {/* Back to Sign In Link */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={onBackToSignIn}
            className="flex justify-center items-center mx-auto text-sm font-medium transition-colors text-primary hover:underline"
          >
            <ArrowLeft className="mr-1 w-4 h-4" />
            Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;