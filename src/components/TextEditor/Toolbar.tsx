
import React from 'react';
import { 
  Bold, Italic, Underline, Strikethrough, 
  AlignLeft, AlignCenter, AlignRight, AlignJustify, 
  Code, Link2, List, ListOrdered, Table, Paperclip,
  Smile, Undo, Redo, ChevronDown, CodeSquare
} from 'lucide-react';
import { ColorPicker } from './ColorPicker';
import { NumberInput } from './NumberInput';
import { EmojiPicker } from './EmojiPicker';

interface ToolbarProps {
  execCommand: (command: string, showUI?: boolean, value?: any) => void;
  editorState: {
    currentColor: string;
    currentHighlightColor: string;
    currentFontSize: string;
    showColorPicker: boolean;
    showHighlightPicker: boolean;
    showFontSizePicker: boolean;
    showEmojiPicker: boolean;
    showParagraphStyleMenu: boolean;
    showTextStyleMenu: boolean;
    showMediaUploadMenu: boolean;
  };
  onColorChange: (color: string) => void;
  onHighlightChange: (color: string) => void;
  onFontSizeChange: (size: number) => void;
  onEmojiSelect: (emoji: string) => void;
  toggleDropdown: (dropdown: 'color' | 'highlight' | 'fontSize' | 'emoji' | 'paragraphStyle' | 'textStyle' | 'mediaUpload', e: React.MouseEvent) => void;
  insertCodeBlock: () => void;
  insertInlineCode: () => void;
  insertEquation: () => void;
  handleAttachment: () => void;
  insertDivider: () => void;
  onParagraphStyle: (command: string) => void;
  onTextStyle: (command: string) => void;
  isMobile?: boolean;
  activeTab?: string;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  execCommand,
  editorState,
  onColorChange,
  onHighlightChange,
  onFontSizeChange,
  onEmojiSelect,
  toggleDropdown,
  insertCodeBlock,
  insertInlineCode,
  insertEquation,
  handleAttachment,
  insertDivider,
  onParagraphStyle,
  onTextStyle,
  isMobile = false,
  activeTab = 'format'
}) => {
  const handleButtonClick = (e: React.MouseEvent, command: string, value: any = null) => {
    e.preventDefault();
    execCommand(command, false, value);
  };

  // Check if a group should be active based on the current tab
  const isGroupActive = (group: string) => {
    if (!isMobile) return true;
    return group === activeTab;
  };

  return (
    <div className="toolbar">
      {/* History Controls */}
      <div className={`toolbar-group ${isGroupActive('format') ? 'active' : ''}`}>
        <button className="btn" title="Undo" onClick={(e) => handleButtonClick(e, 'undo')}>
          <Undo size={16} />
        </button>
        <button className="btn" title="Redo" onClick={(e) => handleButtonClick(e, 'redo')}>
          <Redo size={16} />
        </button>
      </div>

      {/* Text Style Dropdown */}
      <div className={`toolbar-group ${isGroupActive('format') ? 'active' : ''}`}>
        <div className="dropdown">
          <button 
            className="dropdown-btn" 
            title="Text Style"
            onClick={(e) => toggleDropdown('textStyle', e)}
          >
            Normal text
            <ChevronDown size={12} className="ml-1" />
          </button>
          {editorState.showTextStyleMenu && (
            <div className="text-style-menu">
              <div className="text-style-option" onClick={() => onTextStyle('formatBlock,<p>')}>
                <p className="text-sm">Normal text</p>
              </div>
              <div className="text-style-option" onClick={() => onTextStyle('formatBlock,<h1>')}>
                <h1 className="text-xl font-bold">Heading 1</h1>
              </div>
              <div className="text-style-option" onClick={() => onTextStyle('formatBlock,<h2>')}>
                <h2 className="text-lg font-bold">Heading 2</h2>
              </div>
              <div className="text-style-option" onClick={() => onTextStyle('formatBlock,<h3>')}>
                <h3 className="text-base font-bold">Heading 3</h3>
              </div>
              <div className="text-style-option" onClick={() => onTextStyle('formatBlock,<h4>')}>
                <h4 className="text-sm font-bold">Heading 4</h4>
              </div>
              <div className="text-style-option" onClick={() => onTextStyle('formatBlock,<pre>')}>
                <pre className="text-xs">Preformatted</pre>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Paragraph Alignment */}
      <div className={`toolbar-group ${isGroupActive('paragraph') ? 'active' : ''}`}>
        <div className="dropdown">
          <button 
            className="dropdown-btn" 
            title="Paragraph Style"
            onClick={(e) => toggleDropdown('paragraphStyle', e)}
          >
            <AlignLeft size={16} />
            <ChevronDown size={12} className="ml-1" />
          </button>
          {editorState.showParagraphStyleMenu && (
            <div className="paragraph-style-menu">
              <div className="paragraph-option" onClick={() => onParagraphStyle('justifyLeft')}>
                <AlignLeft size={16} />
              </div>
              <div className="paragraph-option" onClick={() => onParagraphStyle('justifyCenter')}>
                <AlignCenter size={16} />
              </div>
              <div className="paragraph-option" onClick={() => onParagraphStyle('justifyRight')}>
                <AlignRight size={16} />
              </div>
              <div className="paragraph-option" onClick={() => onParagraphStyle('justifyFull')}>
                <AlignJustify size={16} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Text Formatting */}
      <div className={`toolbar-group ${isGroupActive('format') ? 'active' : ''}`}>
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

      {/* Link */}
      <div className={`toolbar-group ${isGroupActive('insert') ? 'active' : ''}`}>
        <button className="btn" title="Link" onClick={(e) => {
          const url = prompt('Enter URL:');
          if (url) handleButtonClick(e, 'createLink', url);
        }}>
          <Link2 size={16} />
        </button>
      </div>

      {/* Lists */}
      <div className={`toolbar-group ${isGroupActive('paragraph') ? 'active' : ''}`}>
        <button className="btn" title="Bullet List" onClick={(e) => handleButtonClick(e, 'insertUnorderedList')}>
          <List size={16} />
        </button>
        <button className="btn" title="Numbered List" onClick={(e) => handleButtonClick(e, 'insertOrderedList')}>
          <ListOrdered size={16} />
        </button>
      </div>

      {/* Tables and Attachments */}
      <div className={`toolbar-group ${isGroupActive('insert') ? 'active' : ''}`}>
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
      
      {/* Text Styling Tools */}
      <div className={`toolbar-group ${isGroupActive('style') ? 'active' : ''}`}>
        <div className="dropdown" id="font-size-dropdown">
          <div className="font-size-container">
            <NumberInput initialValue={16} min={8} max={96} onChange={onFontSizeChange} />
          </div>
        </div>
        
        <div className="dropdown" id="color-dropdown">
          <button 
            className="dropdown-btn text-color-btn" 
            title="Font Color"
            onClick={(e) => toggleDropdown('color', e)}
          >
            <span className="text-color-icon">A</span>
            <div 
              className="color-bar" 
              style={{ backgroundColor: editorState.currentColor }} 
            ></div>
          </button>
          {editorState.showColorPicker && (
            <ColorPicker onSelect={onColorChange} type="foreColor" />
          )}
        </div>

        <div className="dropdown" id="highlight-dropdown">
          <button 
            className="dropdown-btn highlight-btn" 
            title="Highlight Color"
            onClick={(e) => toggleDropdown('highlight', e)}
          >
            <span className="highlight-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 19l7-7 3 3-7 7-3-3z" />
                <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                <path d="M2 2l7.586 7.586" />
                <path d="M11 11l2 2" />
              </svg>
            </span>
          </button>
          {editorState.showHighlightPicker && (
            <ColorPicker onSelect={onHighlightChange} type="hiliteColor" />
          )}
        </div>
        
        <div className="dropdown" id="emoji-dropdown">
          <button 
            className="dropdown-btn" 
            title="Insert Emoji"
            onClick={(e) => toggleDropdown('emoji', e)}
          >
            <Smile size={16} />
          </button>
          {editorState.showEmojiPicker && (
            <EmojiPicker onSelect={onEmojiSelect} />
          )}
        </div>
      </div>

      {/* Special Format Options */}
      <div className={`toolbar-group ${isGroupActive('insert') ? 'active' : ''}`}>
        <button className="btn" title="Add Inline Code" onClick={insertInlineCode}>
          <Code size={16} />
        </button>
        <button className="btn" title="Add Code Block" onClick={insertCodeBlock}>
          <CodeSquare size={16} />
        </button>
        <button className="btn" title="Insert Equation" onClick={insertEquation}>
          <span className="math-icon">∫</span>
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
