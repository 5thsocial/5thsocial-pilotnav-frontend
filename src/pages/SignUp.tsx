import React from 'react';
import { useNavigate } from 'react-router-dom';
import SignUpForm from '../components/forms/SignUpForm';
import AuthLayout from '../layouts/AuthLayout';
import authService from '../services/authService';
import toast from 'react-hot-toast';

const SignUp = () => {
  const navigate = useNavigate();

  const handleSignUp = async (userData: { name: string; email: string; password: string }) => {
    try {
      const response = await authService.signUp(userData);
      
      // Store token and user if returned (now does after backend fix)
      if (response.data?.token) {
        localStorage.setItem('authToken', response.data.token);
      }
      if (response.data?.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      toast.success(response.message || 'Sign up successful. Redirecting...');
      navigate('/signin');
    } catch (error: any) {
      toast.error(error.message || 'Sign up failed');
      throw error;
    }
  };

  const handleSwitchToSignIn = () => {
    navigate('/signin');
  };

  const handleGoogleSignUp = async () => {
    try {
      const { url } = await authService.getGoogleAuthUrl();
      window.open(url, '_blank', 'width=500,height=600');
    } catch (error: any) {
      toast.error(error.message || 'Google sign up failed');
    }
  };

  const handleFacebookSignUp = async () => {
    try {
      const { url } = await authService.getFacebookAuthUrl();
      window.open(url, '_blank', 'width=500,height=600');
    } catch (error: any) {
      toast.error(error.message || 'Facebook sign up failed');
    }
  };

  return (
    <AuthLayout>
      <SignUpForm
        onSignUp={handleSignUp}
        onGoogleSignUp={handleGoogleSignUp}
        onFacebookSignUp={handleFacebookSignUp}
        onSwitchToSignIn={handleSwitchToSignIn}
      />
    </AuthLayout>
  );
};

export default SignUp;