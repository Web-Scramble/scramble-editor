
import React, { useState } from 'react';

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
    <div className="number-input-container">
      <button 
        className="number-btn decrement"
        onClick={handleDecrement}
        disabled={value <= min}
      >
        −
      </button>
      <input
        type="text"
        className="number-input"
        value={value}
        onChange={handleChange}
      />
      <button 
        className="number-btn increment"
        onClick={handleIncrement}
        disabled={value >= max}
      >
        +
      </button>
    </div>
  );
};
