
import React from 'react';

const COLORS = [
  '#000000', '#e60000', '#ff9900', '#ffff00',
  '#008a00', '#0066cc', '#9933ff', '#ffffff',
  '#cccccc', '#4c0000', '#663300', '#808000',
  '#004d00', '#000080', '#4c0080'
];

interface ColorPickerProps {
  onSelect: (color: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ onSelect }) => {
  return (
    <div className="color-picker">
      {COLORS.map((color) => (
        <div
          key={color}
          className="color-option"
          style={{ backgroundColor: color, border: color === '#ffffff' ? '1px solid #ccc' : 'none' }}
          onClick={() => onSelect(color)}
          data-color={color}
        />
      ))}
    </div>
  );
};
