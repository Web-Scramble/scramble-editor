
import React from "react";

const AspectRatio = ({ 
  ratio = 16 / 9, 
  children, 
  className = ""
}: { 
  ratio?: number;
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div 
      className={`relative ${className}`}
      style={{ paddingBottom: `${(1 / ratio) * 100}%` }}
    >
      <div className="absolute inset-0">
        {children}
      </div>
    </div>
  );
};

export { AspectRatio };
