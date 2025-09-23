import api from './api';

interface SignInCredentials {
  email: string;
  password: string;
}

interface SignUpData {
  name: string;
  email: string;
  password: string;
}

interface AuthResponse {
  message: string;
  data?: {
    token: string;
    user: any;
  };
}

class AuthService {
  async signIn(credentials: SignInCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/login', credentials);      
      // Store token and user data
      if (response.data?.data?.token) {
        localStorage.setItem('authToken', response.data.data.token);
        console.log('Token stored successfully');
      }
      if (response.data?.data?.user) {
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        console.log('User data stored successfully');
      }
      
      return {
        message: response.data?.message || 'Sign in successful',
        data: response.data?.data
      };
    } catch (error: any) {
      console.error('Sign in error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          baseURL: error.config?.baseURL,
          method: error.config?.method
        }
      });
      
      const message = error.response?.data?.message || 
                     error.response?.data?.error || 
                     `Sign in failed: ${error.message}`;
      throw new Error(message);
    }
  }

  async signUp(userData: SignUpData): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/signup', userData);
      
      console.log('Sign up response:', response.data);
      
      // Store token and user if returned
      if (response.data?.data?.token) {
        localStorage.setItem('authToken', response.data.data.token);
        console.log('Token stored after signup');
      }
      if (response.data?.data?.user) {
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        console.log('User data stored after signup');
      }
      
      return {
        message: response.data?.message || 'Sign up successful',
        data: response.data?.data
      };
    } catch (error: any) {
      console.error('Sign up error details:', error.response?.data);
      const message = error.response?.data?.message || 
                     error.response?.data?.error || 
                     'Sign up failed';
      throw new Error(message);
    }
  }

  async getGoogleAuthUrl() {
    try {
      const response = await api.get('/auth/google/auth-url');
      return { url: response.data.data.authUrl };
    } catch (error: any) {
      console.error('Google auth URL error:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to get Google auth URL');
    }
  }

  async getFacebookAuthUrl() {
    try {
      const response = await api.get('/auth/facebook/auth-url');
      return { url: response.data.data.authUrl };
    } catch (error: any) {
      console.error('Facebook auth URL error:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to get Facebook auth URL');
    }
  }

  async forgotPassword(email: string) {
    try {
      const response = await api.post('/auth/forget-password/send-mail', { email });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to send reset email');
    }
  }

  async verifyOTP(data: { email: string; otp: string }) {
    try {
      const response = await api.post('/auth/forget-password/verify-otp', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'OTP verification failed');
    }
  }

  async resetPassword(data: { email: string; newPassword: string; confirmPassword: string }) {
    try {
      const response = await api.post('/auth/forget-password/reset-password', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Password reset failed');
    }
  }

  signOut() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/signin';
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
}

export default new AuthService();