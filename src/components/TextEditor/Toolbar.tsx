
import React from 'react';
import { 
  Bold, Italic, Underline, Strikethrough, 
  AlignLeft, AlignCenter, AlignRight, AlignJustify, 
  Code, Link2, List, ListOrdered, Image, Table, Paperclip,
  Type, Smile, Undo, Redo
} from 'lucide-react';
import { ColorPicker } from './ColorPicker';
import { FontSizePicker } from './FontSizePicker';
import { EmojiPicker } from './EmojiPicker';

interface ToolbarProps {
  execCommand: (command: string, showUI?: boolean, value?: any) => void;
  editorState: {
    currentColor: string;
    currentFontSize: string;
    showColorPicker: boolean;
    showFontSizePicker: boolean;
    showEmojiPicker: boolean;
  };
  onColorChange: (color: string) => void;
  onFontSizeChange: (size: string) => void;
  onEmojiSelect: (emoji: string) => void;
  toggleDropdown: (dropdown: 'color' | 'fontSize' | 'emoji') => void;
  insertCodeBlock: () => void;
  insertEquation: () => void;
  insertImage: () => void;
  handleAttachment: () => void;
  insertDivider: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  execCommand,
  editorState,
  onColorChange,
  onFontSizeChange,
  onEmojiSelect,
  toggleDropdown,
  insertCodeBlock,
  insertEquation,
  insertImage,
  handleAttachment,
  insertDivider
}) => {
  const handleButtonClick = (e: React.MouseEvent, command: string, value: any = null) => {
    e.preventDefault();
    execCommand(command, false, value);
  };

  return (
    <div className="toolbar">
      <div className="toolbar-group">
        <button className="btn" title="Undo" onClick={(e) => handleButtonClick(e, 'undo')}>
          <Undo size={16} />
        </button>
        <button className="btn" title="Redo" onClick={(e) => handleButtonClick(e, 'redo')}>
          <Redo size={16} />
        </button>
      </div>

      <div className="toolbar-divider"></div>

      <div className="toolbar-group">
        <div className="dropdown">
          <button className="dropdown-btn" title="Text Style">
            Normal text
            <span className="arrow">▼</span>
          </button>
        </div>
      </div>

      <div className="toolbar-divider"></div>

      <div className="toolbar-group">
        <div className="dropdown">
          <button className="dropdown-btn" title="Paragraph Style">
            <List size={16} />
            <span className="arrow">▼</span>
          </button>
        </div>
      </div>

      <div className="toolbar-divider"></div>

      <div className="toolbar-group">
        <button className="btn" title="Bold" onClick={(e) => handleButtonClick(e, 'bold')}>
          <Bold size={16} />
        </button>
        <button className="btn" title="Italic" onClick={(e) => handleButtonClick(e, 'italic')}>
          <Italic size={16} />
        </button>
        <button className="btn" title="Underline" onClick={(e) => handleButtonClick(e, 'underline')}>
          <Underline size={16} />
        </button>
        <button className="btn" title="Strikethrough" onClick={(e) => handleButtonClick(e, 'strikeThrough')}>
          <Strikethrough size={16} />
        </button>
      </div>

      <div className="toolbar-divider"></div>

      <div className="toolbar-group">
        <button className="btn" title="Align Left" onClick={(e) => handleButtonClick(e, 'justifyLeft')}>
          <AlignLeft size={16} />
        </button>
        <button className="btn" title="Align Center" onClick={(e) => handleButtonClick(e, 'justifyCenter')}>
          <AlignCenter size={16} />
        </button>
        <button className="btn" title="Align Right" onClick={(e) => handleButtonClick(e, 'justifyRight')}>
          <AlignRight size={16} />
        </button>
        <button className="btn" title="Justify" onClick={(e) => handleButtonClick(e, 'justifyFull')}>
          <AlignJustify size={16} />
        </button>
      </div>

      <div className="toolbar-divider"></div>

      <div className="toolbar-group">
        <button className="btn" title="Code" onClick={(e) => handleButtonClick(e, 'formatBlock', '<pre>')}>
          <Code size={16} />
        </button>
        <button className="btn" title="Link" onClick={(e) => {
          const url = prompt('Enter URL:');
          if (url) handleButtonClick(e, 'createLink', url);
        }}>
          <Link2 size={16} />
        </button>
      </div>

      <div className="toolbar-divider"></div>

      <div className="toolbar-group">
        <button className="btn" title="Bullet List" onClick={(e) => handleButtonClick(e, 'insertUnorderedList')}>
          <List size={16} />
        </button>
        <button className="btn" title="Numbered List" onClick={(e) => handleButtonClick(e, 'insertOrderedList')}>
          <ListOrdered size={16} />
        </button>
      </div>

      <div className="toolbar-divider"></div>

      <div className="toolbar-group">
        <button className="btn" title="Insert Image" onClick={insertImage}>
          <Image size={16} />
        </button>
        <button className="btn" title="Insert Table" onClick={(e) => {
          const html = '<table style="width:100%; border-collapse: collapse;"><tr><td style="border: 1px solid #ccc; padding: 8px;"></td><td style="border: 1px solid #ccc; padding: 8px;"></td></tr><tr><td style="border: 1px solid #ccc; padding: 8px;"></td><td style="border: 1px solid #ccc; padding: 8px;"></td></tr></table><p></p>';
          execCommand('insertHTML', false, html);
        }}>
          <Table size={16} />
        </button>
        <button className="btn" title="Attach File" onClick={handleAttachment}>
          <Paperclip size={16} />
        </button>
      </div>

      <div className="toolbar-divider"></div>
      
      <div className="toolbar-group">
        <div className="dropdown" id="font-size-dropdown">
          <button 
            className="dropdown-btn" 
            title="Font Size" 
            onClick={() => toggleDropdown('fontSize')}
          >
            <Type size={16} />
            <span className="arrow">▼</span>
          </button>
          {editorState.showFontSizePicker && (
            <FontSizePicker onSelect={onFontSizeChange} />
          )}
        </div>
        
        <div className="dropdown" id="color-dropdown">
          <button 
            className="dropdown-btn" 
            title="Font Color"
            onClick={() => toggleDropdown('color')}
          >
            <span 
              className="color-preview" 
              style={{ backgroundColor: editorState.currentColor }} 
            ></span>
            <span className="arrow">▼</span>
          </button>
          {editorState.showColorPicker && (
            <ColorPicker onSelect={onColorChange} />
          )}
        </div>
        
        <div className="dropdown" id="emoji-dropdown">
          <button 
            className="dropdown-btn" 
            title="Insert Emoji"
            onClick={() => toggleDropdown('emoji')}
          >
            <Smile size={16} />
          </button>
          {editorState.showEmojiPicker && (
            <EmojiPicker onSelect={onEmojiSelect} />
          )}
        </div>
      </div>

      <div className="toolbar-divider"></div>

      <div className="toolbar-group">
        <button className="btn" title="Add Code Block" onClick={insertCodeBlock}>
          <Code size={16} />
        </button>
        <button className="btn" title="Insert Equation" onClick={insertEquation}>
          <span className="math-icon">∑</span>
        </button>
        <button className="btn" title="Insert Quote" onClick={(e) => handleButtonClick(e, 'formatBlock', '<blockquote>')}>
          <span className="quote-icon">"</span>
        </button>
        <button className="btn" title="Divider" onClick={insertDivider}>
          <span className="divider-icon">—</span>
        </button>
      </div>
    </div>
  );
};
