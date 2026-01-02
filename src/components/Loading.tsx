import React from 'react';

const Loading: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
  <div className="p-4 text-sm text-gray-600">{message}</div>
);

export default Loading;