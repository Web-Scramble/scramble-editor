
import React, { useState, useEffect } from 'react';

interface NumberInputProps {
  initialValue: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
}

export const NumberInput: React.FC<NumberInputProps> = ({ 
  initialValue = 16, 
  min = 8, 
  max = 96, 
  step = 1,
  onChange 
}) => {
  const [value, setValue] = useState(initialValue);

  // Update local state when initialValue prop changes
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    if (!isNaN(newValue)) {
      updateValue(newValue);
    }
  };

  const handleIncrement = () => {
    updateValue(value + step);
  };

  const handleDecrement = () => {
    updateValue(value - step);
  };

  const updateValue = (newValue: number) => {
    const clampedValue = Math.min(Math.max(newValue, min), max);
    setValue(clampedValue);
    onChange(clampedValue);
  };

  return (
    <div className="flex items-center h-8 border border-gray-300 rounded bg-white">
      <button 
        className="px-2 h-full text-gray-600 hover:bg-gray-100 border-r border-gray-300"
        onClick={handleDecrement}
        disabled={value <= min}
        aria-label="Decrease"
      >
        −
      </button>
      <input
        type="text"
        className="w-10 h-full text-center focus:outline-none"
        value={value}
        onChange={handleChange}
        aria-label="Font size"
      />
      <button 
        className="px-2 h-full text-gray-600 hover:bg-gray-100 border-l border-gray-300"
        onClick={handleIncrement}
        disabled={value >= max}
        aria-label="Increase"
      >
        +
      </button>
    </div>
  );
};
