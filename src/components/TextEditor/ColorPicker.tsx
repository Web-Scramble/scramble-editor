
import React from 'react';

// Define a more extensive color palette
const COLORS = [
  // Row 1 - Black to white
  '#000000', '#404040', '#606060', '#808080', '#A0A0A0', '#C0C0C0', '#E0E0E0', '#FFFFFF',
  // Row 2 - Reds and pinks
  '#FF0000', '#FF4040', '#FF8080', '#FFC0C0', 
  // Row 3 - Oranges and yellows
  '#FF8000', '#FFA040', '#FFC080', '#FFE0C0',
  // Row 4 - Yellows and light greens  
  '#FFFF00', '#FFFF40', '#FFFF80', '#FFFFC0',
  // Row 5 - Greens
  '#00FF00', '#40FF40', '#80FF80', '#C0FFC0',
  // Row 6 - Greens and teals
  '#00FF80', '#40FFA0', '#80FFC0', '#C0FFE0',
  // Row 7 - Cyans and light blues
  '#00FFFF', '#40FFFF', '#80FFFF', '#C0FFFF',
  // Row 8 - Blues
  '#0080FF', '#40A0FF', '#80C0FF', '#C0E0FF',
  // Row 9 - Blues and purples
  '#0000FF', '#4040FF', '#8080FF', '#C0C0FF',
  // Row 10 - Purples and magentas
  '#8000FF', '#A040FF', '#C080FF', '#E0C0FF',
  // Row 11 - Magentas and pinks
  '#FF00FF', '#FF40FF', '#FF80FF', '#FFC0FF',
  // Row 12 - Reds and browns
  '#FF0080', '#FF40A0', '#FF80C0', '#FFC0E0'
];

interface ColorPickerProps {
  onSelect: (color: string) => void;
  type: 'foreColor' | 'hiliteColor';
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ onSelect, type }) => {
  return (
    <div className="color-picker">
      <div className="color-grid">
        {COLORS.map((color) => (
          <div
            key={`${type}-${color}`}
            className="color-option"
            style={{ 
              backgroundColor: color, 
              border: color === '#FFFFFF' ? '1px solid #ccc' : 'none' 
            }}
            onClick={() => onSelect(color)}
            data-color={color}
          />
        ))}
      </div>
      <div className="color-footer">
        <div className="custom-color">CUSTOM</div>
        <div className="color-tools">
          <button className="color-tool">
            <span className="plus-icon">+</span>
          </button>
          <button className="color-tool">
            <span className="dropper-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 16l4-4-8-8-4 4" />
                <path d="M10 10l-8 8 4 4 8-8" />
              </svg>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
