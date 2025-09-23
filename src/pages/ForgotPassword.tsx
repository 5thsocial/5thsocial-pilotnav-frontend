import React from 'react';
import { useNavigate } from 'react-router-dom';
import ForgotPasswordForm from '../components/forms/ForgotPasswordForm';
import AuthLayout from '../layouts/AuthLayout';
import authService from '../services/authService';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const navigate = useNavigate();

  const handleResetPassword = async (email: string) => {
    try {
      await authService.forgotPassword(email);
      toast.success('Reset link sent to your email');
      navigate('/forgot-password/verify-otp', { state: { email } });
    } catch (error: any) {
      console.error('Password reset failed:', error);
      throw error;
    }
  };

  const handleBackToSignIn = () => {
    navigate('/signin');
  };

  return (
    <AuthLayout>
      <ForgotPasswordForm
        onResetPassword={handleResetPassword}
        onBackToSignIn={handleBackToSignIn}
      />
    </AuthLayout>
  );
};

export default ForgotPassword;