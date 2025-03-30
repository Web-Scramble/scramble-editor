
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
    <div className="emoji-picker grid grid-cols-6 gap-2 p-2 bg-white rounded shadow-lg border border-gray-200 max-w-[240px]">
      {EMOJIS.map((emoji) => (
        <div
          key={emoji}
          className="emoji-option flex items-center justify-center p-1 hover:bg-gray-100 rounded cursor-pointer text-xl"
          onClick={() => onSelect(emoji)}
        >
          {emoji}
        </div>
      ))}
    </div>
  );
};
