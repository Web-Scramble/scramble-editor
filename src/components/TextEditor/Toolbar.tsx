
import React, { useState } from 'react';
import { 
  Bold, Italic, Underline, Strikethrough, 
  AlignLeft, AlignCenter, AlignRight, AlignJustify, 
  Code, Link2, List, ListOrdered, Image, Table, Paperclip,
  Type, Smile, Undo, Redo, Heading1, Heading2, Heading3, 
  Quote, Minus, File, ChevronDown
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
    showTextStylePicker?: boolean;
    showParagraphStylePicker?: boolean;
  };
  onColorChange: (color: string) => void;
  onFontSizeChange: (size: string) => void;
  onEmojiSelect: (emoji: string) => void;
  toggleDropdown: (dropdown: 'color' | 'fontSize' | 'emoji' | 'textStyle' | 'paragraphStyle') => void;
  insertCodeBlock: () => void;
  insertEquation: () => void;
  insertImage: () => void;
  handleAttachment: () => void;
  insertDivider: () => void;
  applyTextStyle: (style: string) => void;
  applyParagraphStyle: (style: string) => void;
  insertTable: (rows: number, cols: number) => void;
  handleUndo: () => void;
  handleRedo: () => void;
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
  insertDivider,
  applyTextStyle,
  applyParagraphStyle,
  insertTable,
  handleUndo,
  handleRedo
}) => {
  const [showTableDialog, setShowTableDialog] = useState(false);
  const [tableRows, setTableRows] = useState(2);
  const [tableCols, setTableCols] = useState(2);

  const handleButtonClick = (e: React.MouseEvent, command: string, value: any = null) => {
    e.preventDefault();
    execCommand(command, false, value);
  };

  const handleTableInsert = (e: React.MouseEvent) => {
    e.preventDefault();
    insertTable(tableRows, tableCols);
    setShowTableDialog(false);
  };
  
  // Helper function to prevent events from bubbling up
  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="toolbar">
      <div className="toolbar-group">
        <button className="btn" title="Undo" onClick={handleUndo}>
          <Undo size={16} />
        </button>
        <button className="btn" title="Redo" onClick={handleRedo}>
          <Redo size={16} />
        </button>
      </div>

      <div className="toolbar-divider"></div>

      <div className="toolbar-group">
        <div className="dropdown">
          <button 
            className="dropdown-btn" 
            title="Text Style" 
            onClick={() => toggleDropdown('textStyle')}
          >
            <Type size={16} />
            <span className="dropdown-label">Normal text</span>
            <ChevronDown size={12} className="dropdown-arrow" />
          </button>
          {editorState.showTextStylePicker && (
            <div className="dropdown-menu text-style-picker" onClick={stopPropagation}>
              <div className="dropdown-item" onClick={() => applyTextStyle('normal')}>
                Normal text
              </div>
              <div className="dropdown-item" onClick={() => applyTextStyle('h1')}>
                <Heading1 size={16} className="mr-2" /> Heading 1
              </div>
              <div className="dropdown-item" onClick={() => applyTextStyle('h2')}>
                <Heading2 size={16} className="mr-2" /> Heading 2
              </div>
              <div className="dropdown-item" onClick={() => applyTextStyle('h3')}>
                <Heading3 size={16} className="mr-2" /> Heading 3
              </div>
              <div className="dropdown-item" onClick={() => applyTextStyle('pre')}>
                <Code size={16} className="mr-2" /> Code
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="toolbar-divider"></div>

      <div className="toolbar-group">
        <div className="dropdown">
          <button 
            className="dropdown-btn" 
            title="Paragraph Style"
            onClick={() => toggleDropdown('paragraphStyle')}
          >
            <List size={16} />
            <ChevronDown size={12} className="dropdown-arrow" />
          </button>
          {editorState.showParagraphStylePicker && (
            <div className="dropdown-menu paragraph-style-picker" onClick={stopPropagation}>
              <div className="dropdown-item" onClick={() => applyParagraphStyle('paragraph')}>
                <File size={16} className="mr-2" /> Paragraph
              </div>
              <div className="dropdown-item" onClick={() => applyParagraphStyle('blockquote')}>
                <Quote size={16} className="mr-2" /> Blockquote
              </div>
              <div className="dropdown-item" onClick={() => applyParagraphStyle('ul')}>
                <List size={16} className="mr-2" /> Bullet List
              </div>
              <div className="dropdown-item" onClick={() => applyParagraphStyle('ol')}>
                <ListOrdered size={16} className="mr-2" /> Numbered List
              </div>
            </div>
          )}
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
        <button 
          className="btn" 
          title="Insert Table" 
          onClick={() => setShowTableDialog(prev => !prev)}
        >
          <Table size={16} />
          {showTableDialog && (
            <div className="table-dialog" onClick={stopPropagation}>
              <div className="table-dialog-header">Insert Table</div>
              <div className="table-dialog-content">
                <div className="table-dialog-row">
                  <label>Rows:</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="20" 
                    value={tableRows} 
                    onChange={(e) => setTableRows(Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
                  />
                </div>
                <div className="table-dialog-row">
                  <label>Columns:</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="10" 
                    value={tableCols} 
                    onChange={(e) => setTableCols(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
                  />
                </div>
                <div className="table-dialog-buttons">
                  <button 
                    className="table-dialog-button cancel" 
                    onClick={() => setShowTableDialog(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="table-dialog-button insert" 
                    onClick={handleTableInsert}
                  >
                    Insert
                  </button>
                </div>
              </div>
            </div>
          )}
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
            <ChevronDown size={12} className="dropdown-arrow" />
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
            <ChevronDown size={12} className="dropdown-arrow" />
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
          <Minus size={16} />
        </button>
      </div>
    </div>
  );
};
