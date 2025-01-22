// src/components/ui/card.jsx
import React from 'react';

const Card = ({ className = '', children, ...props }) => (
  <div
    className={`rounded-lg border bg-white shadow-sm ${className}`}
    {...props}
  >
    {children}
  </div>
);

const CardContent = ({ className = '', children, ...props }) => (
  <div
    className={`p-6 ${className}`}
    {...props}
  >
    {children}
  </div>
);

export { Card, CardContent };