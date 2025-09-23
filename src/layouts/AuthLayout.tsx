// File: src/layouts/AuthLayout.tsx
// Simple AuthLayout (centered layout)
import React from 'react';

const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4">
      {children}
    </div>
  );
};

export default AuthLayout;