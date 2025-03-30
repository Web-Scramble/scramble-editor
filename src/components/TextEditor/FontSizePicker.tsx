
import React from 'react';

const FONT_SIZES = [
  { label: 'Small', size: '10px' },
  { label: 'Medium', size: '16px' },
  { label: 'Large', size: '24px' },
  { label: 'X-Large', size: '32px' }
];

interface FontSizePickerProps {
  onSelect: (size: string) => void;
}

export const FontSizePicker: React.FC<FontSizePickerProps> = ({ onSelect }) => {
  return (
    <div className="font-size-picker">
      {FONT_SIZES.map(({ label, size }) => (
        <div
          key={size}
          className="font-size-option"
          onClick={() => onSelect(size)}
          data-size={size}
        >
          {label}
        </div>
      ))}
    </div>
  );
};
