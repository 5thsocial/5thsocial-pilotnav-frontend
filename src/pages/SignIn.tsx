import React from 'react';
import { useNavigate } from 'react-router-dom';
import SignInForm from '../components/forms/SignInForm';
import AuthLayout from '../layouts/AuthLayout';
import authService from '../services/authService';
import toast from 'react-hot-toast';

const SignIn = () => {
  const navigate = useNavigate();

  const handleSignIn = async (credentials: { email: string; password: string }) => {
    try {
      const response = await authService.signIn(credentials);
      toast.success('Sign in successful');
      
      setTimeout(() => {
        navigate('/', { replace: true });
        window.location.reload();
      }, 100);
      
    } catch (error: any) {
      toast.error(error.message || 'Sign in failed');
      throw error;
    }
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  const handleSwitchToSignUp = () => {
    navigate('/signup');
  };

  const handleGoogleSignIn = async () => {
    try {
      const { url } = await authService.getGoogleAuthUrl();
      window.open(url, '_blank', 'width=500,height=600');
    } catch (error: any) {
      toast.error(error.message || 'Google sign in failed');
    }
  };

  const handleFacebookSignIn = async () => {
    try {
      const { url } = await authService.getFacebookAuthUrl();
      window.open(url, '_blank', 'width=500,height=600');
    } catch (error: any) {
      toast.error(error.message || 'Facebook sign in failed');
    }
  };

  return (
    <AuthLayout>
      <SignInForm
        onSignIn={handleSignIn}
        onForgotPassword={handleForgotPassword}
        onGoogleSignIn={handleGoogleSignIn}
        onFacebookSignIn={handleFacebookSignIn}
        onSwitchToSignUp={handleSwitchToSignUp}
      />
    </AuthLayout>
  );
};

export default SignIn;