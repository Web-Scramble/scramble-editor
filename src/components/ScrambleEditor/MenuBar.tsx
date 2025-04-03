
import React from 'react';
import { Editor } from '@tiptap/react';
import { 
  Bold, 
  Italic, 
  Code, 
  List, 
  ListOrdered, 
  ImageIcon, 
  LinkIcon, 
  Smile 
} from './Icons';

interface MenuBarProps {
  editor: Editor;
  onImageUpload: () => void;
}

const MenuBar: React.FC<MenuBarProps> = ({ editor, onImageUpload }) => {
  if (!editor) {
    return null;
  }

  const addImage = () => {
    if (onImageUpload) {
      onImageUpload();
    } else {
      const url = window.prompt('URL');
      if (url) {
        editor.chain().focus().setImage({ src: url }).run();
      }
    }
  };

  const addCodeBlock = () => {
    editor.chain().focus().toggleCodeBlock().run();
  };

  const addLink = () => {
    const url = window.prompt('URL');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  return (
    <div className="flex flex-wrap gap-1 p-2 bg-white border-b border-gray-200">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`toolbar-button ${editor.isActive('bold') ? 'active' : ''}`}
        title="Bold"
      >
        <Bold size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`toolbar-button ${editor.isActive('italic') ? 'active' : ''}`}
        title="Italic"
      >
        <Italic size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={`toolbar-button ${editor.isActive('code') ? 'active' : ''}`}
        title="Inline Code"
      >
        <Code size={18} />
      </button>
      <button
        onClick={addLink}
        className={`toolbar-button ${editor.isActive('link') ? 'active' : ''}`}
        title="Add Link"
      >
        <LinkIcon size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`toolbar-button ${editor.isActive('bulletList') ? 'active' : ''}`}
        title="Bullet List"
      >
        <List size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`toolbar-button ${editor.isActive('orderedList') ? 'active' : ''}`}
        title="Ordered List"
      >
        <ListOrdered size={18} />
      </button>
      <button
        onClick={addCodeBlock}
        className={`toolbar-button ${editor.isActive('codeBlock') ? 'active' : ''}`}
        title="Code Block"
      >
        <Code size={18} />
      </button>
      <button
        onClick={addImage}
        className="toolbar-button"
        title="Add Image"
      >
        <ImageIcon size={18} />
      </button>
      <button
        onClick={() => {
          const emoji = window.prompt('Enter emoji');
          if (emoji) {
            editor.chain().focus().insertContent(emoji).run();
          }
        }}
        className="toolbar-button"
        title="Add Emoji"
      >
        <Smile size={18} />
      </button>
    </div>
  );
};

export default MenuBar;
