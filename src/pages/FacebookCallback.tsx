import React, { useEffect } from 'react';
import AuthLayout from '../layouts/AuthLayout';

const FacebookCallback = () => {
  useEffect(() => {
    // This component is a placeholder
    // The actual callback will be handled by a static HTML page
    // similar to google-success.html
    console.log('FacebookCallback component loaded');
  }, []);

  return (
    <AuthLayout>
      <div className="flex flex-col justify-center items-center min-h-screen bg-background">
        <div className="p-8 text-center">
          <div className="mb-4">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full border-4 border-blue-500 animate-spin border-t-transparent"></div>
          </div>
          <h2 className="mb-2 text-xl font-semibold text-foreground">
            Processing Facebook Authentication...
          </h2>
          <p className="text-muted-foreground">
            Please wait while we complete your sign in.
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default FacebookCallback;