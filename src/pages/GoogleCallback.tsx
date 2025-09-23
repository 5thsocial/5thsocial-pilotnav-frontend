// File: src/pages/GoogleCallback.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import toast from 'react-hot-toast';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        if (window.opener) {
          const pageContent = document.body.innerText || document.body.textContent;
          
          try {
            // Parse the JSON response from the backend
            const authData = JSON.parse(pageContent);
            
            if (authData.success && authData.data) {
              const { user, token } = authData.data;
              
              // Store auth data in parent window's localStorage
              window.opener.localStorage.setItem('authToken', token);
              window.opener.localStorage.setItem('user', JSON.stringify(user));
              
              // Notify parent window of success
              window.opener.postMessage({
                type: 'GOOGLE_AUTH_SUCCESS',
                data: { user, token, message: authData.message }
              }, window.location.origin);
              
              // Close popup
              window.close();
              return;
            }
          } catch (parseError) {
            console.error('Error parsing auth response:', parseError);
          }
          
          // If we get here, authentication failed
          window.opener.postMessage({
            type: 'GOOGLE_AUTH_ERROR',
            error: 'Authentication failed'
          }, window.location.origin);
          
          window.close();
          
        } else {
          // This is not a popup - redirect to signin
          toast.info('Google authentication completed. Please sign in.');
          navigate('/signin');
        }

      } catch (error: any) {
        console.error('Google callback error:', error);
        
        if (window.opener) {
          window.opener.postMessage({
            type: 'GOOGLE_AUTH_ERROR',
            error: error.message || 'Google authentication failed'
          }, window.location.origin);
          window.close();
        } else {
          toast.error(error.message || 'Google authentication failed');
          navigate('/signin');
        }
      } finally {
        setIsProcessing(false);
      }
    };

    // Small delay to ensure page content is loaded
    setTimeout(handleGoogleCallback, 500);
  }, [navigate]);

  return (
    <AuthLayout>
      <div className="mx-auto w-full max-w-xl">
        <div className="p-8 rounded-lg border shadow-lg bg-card border-border">
          <div className="text-center">
            {isProcessing ? (
              <>
                <div className="mx-auto mb-4 w-8 h-8 rounded-full border-4 animate-spin border-brand border-t-transparent"></div>
                <h2 className="mb-2 text-xl font-semibold text-foreground">
                  Processing Google Authentication...
                </h2>
                <p className="text-muted-foreground">
                  Please wait while we complete your authentication.
                </p>
              </>
            ) : (
              <>
                <div className="flex justify-center items-center mx-auto mb-4 w-12 h-12 bg-green-100 rounded-full dark:bg-green-900/20">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="mb-2 text-xl font-semibold text-foreground">
                  Authentication Processed
                </h2>
                <p className="text-muted-foreground">
                  Redirecting you back to sign in...
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default GoogleCallback;