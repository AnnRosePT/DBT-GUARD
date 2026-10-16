import React from 'react';

export const AccentLine: React.FC = () => {
  return (
    <div
      className="h-[3px] w-full"
      style={{
        background: 'linear-gradient(90deg, #FF9933 0%, #FFFFFF 50%, #138808 100%)',
      }}
      role="presentation"
    />
  );
};
