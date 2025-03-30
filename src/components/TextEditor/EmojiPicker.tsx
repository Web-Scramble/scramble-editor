
import React from 'react';

// Common emojis
const EMOJIS = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
  '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
  '👍', '👎', '❤️', '🔥'
];

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelect }) => {
  return (
    <div className="emoji-picker">
      {EMOJIS.map((emoji) => (
        <div
          key={emoji}
          className="emoji-option"
          onClick={() => onSelect(emoji)}
        >
          {emoji}
        </div>
      ))}
    </div>
  );
};
