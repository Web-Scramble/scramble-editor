
import React from 'react';

// Common emojis
const EMOJIS = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
  '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
  '👍', '👎', '❤️', '🔥', '👋', '👏', '🙌', '🤝', '👀', '🎉',
  '✨', '⭐', '🌟', '💯', '💪', '🤔', '🤭', '🤫', '🤨', '😐'
];

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelect }) => {
  return (
    <div className="emoji-picker bg-white border border-gray-200 rounded shadow-lg p-2 w-64">
      <div className="emoji-grid grid grid-cols-8 gap-1">
        {EMOJIS.map((emoji) => (
          <div
            key={emoji}
            className="emoji-option w-7 h-7 flex items-center justify-center cursor-pointer hover:bg-gray-100 rounded"
            onClick={() => onSelect(emoji)}
          >
            {emoji}
          </div>
        ))}
      </div>
    </div>
  );
};
