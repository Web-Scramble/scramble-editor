
import React from 'react';
import { 
  Bold, Italic, Underline, Strikethrough, 
  AlignLeft, AlignCenter, AlignRight, AlignJustify, 
  Code, Link2, List, ListOrdered, Table, Paperclip,
  Smile, Undo, Redo
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
  };
  onColorChange: (color: string) => void;
  onHighlightChange: (color: string) => void;
  onFontSizeChange: (size: number) => void;
  onEmojiSelect: (emoji: string) => void;
  toggleDropdown: (dropdown: 'color' | 'highlight' | 'fontSize' | 'emoji' | 'paragraphStyle', e: React.MouseEvent) => void;
  insertCodeBlock: () => void;
  insertEquation: () => void;
  handleAttachment: () => void;
  insertDivider: () => void;
  onParagraphStyle: (command: string) => void;
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
  insertEquation,
  handleAttachment,
  insertDivider,
  onParagraphStyle
}) => {
  const handleButtonClick = (e: React.MouseEvent, command: string, value: any = null) => {
    e.preventDefault();
    execCommand(command, false, value);
  };

  // Array of text style options
  const textStyles = [
    { label: 'Normal text', command: 'formatBlock', value: 'p' },
    { label: 'Heading 1', command: 'formatBlock', value: 'h1' },
    { label: 'Heading 2', command: 'formatBlock', value: 'h2' },
    { label: 'Heading 3', command: 'formatBlock', value: 'h3' },
  ];

  // Track which text style is active - this would ideally be determined by the current selection
  const [activeTextStyle, setActiveTextStyle] = React.useState(textStyles[0]);

  const handleTextStyleChange = (style: typeof textStyles[0]) => {
    execCommand(style.command, false, style.value);
    setActiveTextStyle(style);
  };

  return (
    <div className="toolbar bg-white border-b border-gray-200 p-2 flex flex-wrap items-center gap-2">
      <div className="toolbar-group flex items-center gap-1">
        <button className="btn p-1 rounded hover:bg-gray-100" title="Undo" onClick={(e) => handleButtonClick(e, 'undo')}>
          <Undo size={16} />
        </button>
        <button className="btn p-1 rounded hover:bg-gray-100" title="Redo" onClick={(e) => handleButtonClick(e, 'redo')}>
          <Redo size={16} />
        </button>
      </div>

      <div className="toolbar-divider h-6 w-px bg-gray-300 mx-1"></div>

      <div className="toolbar-group relative">
        <div className="dropdown relative">
          <button 
            className="dropdown-btn flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100"
            title="Text Style"
            onClick={(e) => {
              e.preventDefault();
              const dropdown = document.getElementById('text-style-dropdown');
              dropdown?.classList.toggle('hidden');
            }}
          >
            {activeTextStyle.label}
            <span className="arrow text-xs">▼</span>
          </button>
          <div id="text-style-dropdown" className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded shadow-lg z-50 w-40 hidden">
            {textStyles.map((style, index) => (
              <div 
                key={index} 
                className="p-2 hover:bg-gray-100 cursor-pointer" 
                onClick={() => {
                  handleTextStyleChange(style);
                  document.getElementById('text-style-dropdown')?.classList.add('hidden');
                }}
              >
                {style.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="toolbar-divider h-6 w-px bg-gray-300 mx-1"></div>

      <div className="toolbar-group relative">
        <div className="dropdown relative">
          <button 
            className="dropdown-btn flex items-center gap-1 p-1 rounded hover:bg-gray-100" 
            title="Paragraph Style"
            onClick={(e) => toggleDropdown('paragraphStyle', e)}
          >
            <AlignLeft size={16} />
          </button>
          {editorState.showParagraphStyleMenu && (
            <div className="paragraph-style-menu absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded shadow-lg z-50 p-1 grid grid-cols-2 gap-1 w-24">
              <div className="paragraph-option p-2 hover:bg-gray-100 cursor-pointer rounded" onClick={() => onParagraphStyle('justifyLeft')}>
                <AlignLeft size={16} />
              </div>
              <div className="paragraph-option p-2 hover:bg-gray-100 cursor-pointer rounded" onClick={() => onParagraphStyle('justifyCenter')}>
                <AlignCenter size={16} />
              </div>
              <div className="paragraph-option p-2 hover:bg-gray-100 cursor-pointer rounded" onClick={() => onParagraphStyle('justifyRight')}>
                <AlignRight size={16} />
              </div>
              <div className="paragraph-option p-2 hover:bg-gray-100 cursor-pointer rounded" onClick={() => onParagraphStyle('justifyFull')}>
                <AlignJustify size={16} />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="toolbar-divider h-6 w-px bg-gray-300 mx-1"></div>

      <div className="toolbar-group flex items-center gap-1">
        <button className="btn p-1 rounded hover:bg-gray-100" title="Bold" onClick={(e) => handleButtonClick(e, 'bold')}>
          <Bold size={16} />
        </button>
        <button className="btn p-1 rounded hover:bg-gray-100" title="Italic" onClick={(e) => handleButtonClick(e, 'italic')}>
          <Italic size={16} />
        </button>
        <button className="btn p-1 rounded hover:bg-gray-100" title="Underline" onClick={(e) => handleButtonClick(e, 'underline')}>
          <Underline size={16} />
        </button>
        <button className="btn p-1 rounded hover:bg-gray-100" title="Strikethrough" onClick={(e) => handleButtonClick(e, 'strikeThrough')}>
          <Strikethrough size={16} />
        </button>
      </div>

      <div className="toolbar-divider h-6 w-px bg-gray-300 mx-1"></div>

      <div className="toolbar-group">
        <button className="btn p-1 rounded hover:bg-gray-100" title="Link" onClick={(e) => {
          const url = prompt('Enter URL:');
          if (url) handleButtonClick(e, 'createLink', url);
        }}>
          <Link2 size={16} />
        </button>
      </div>

      <div className="toolbar-divider h-6 w-px bg-gray-300 mx-1"></div>

      <div className="toolbar-group flex items-center gap-1">
        <button className="btn p-1 rounded hover:bg-gray-100" title="Bullet List" onClick={(e) => handleButtonClick(e, 'insertUnorderedList')}>
          <List size={16} />
        </button>
        <button className="btn p-1 rounded hover:bg-gray-100" title="Numbered List" onClick={(e) => handleButtonClick(e, 'insertOrderedList')}>
          <ListOrdered size={16} />
        </button>
      </div>

      <div className="toolbar-divider h-6 w-px bg-gray-300 mx-1"></div>

      <div className="toolbar-group flex items-center gap-1">
        <button className="btn p-1 rounded hover:bg-gray-100" title="Insert Table" onClick={(e) => {
          const html = '<table style="width:100%; border-collapse: collapse;"><tr><td style="border: 1px solid #ccc; padding: 8px;"></td><td style="border: 1px solid #ccc; padding: 8px;"></td></tr><tr><td style="border: 1px solid #ccc; padding: 8px;"></td><td style="border: 1px solid #ccc; padding: 8px;"></td></tr></table><p></p>';
          execCommand('insertHTML', false, html);
        }}>
          <Table size={16} />
        </button>
        <button className="btn p-1 rounded hover:bg-gray-100" title="Attach File" onClick={handleAttachment}>
          <Paperclip size={16} />
        </button>
      </div>

      <div className="toolbar-divider h-6 w-px bg-gray-300 mx-1"></div>
      
      <div className="toolbar-group flex items-center gap-2">
        <div className="dropdown relative">
          <div className="font-size-container flex items-center">
            <NumberInput initialValue={parseInt(editorState.currentFontSize, 10) || 16} min={8} max={96} onChange={onFontSizeChange} />
          </div>
        </div>
        
        <div className="dropdown relative">
          <button 
            className="dropdown-btn text-color-btn w-8 h-8 flex flex-col items-center justify-center rounded hover:bg-gray-100 relative" 
            title="Font Color"
            onClick={(e) => toggleDropdown('color', e)}
          >
            <span className="text-color-icon">A</span>
            <div 
              className="color-bar absolute bottom-0 left-1 right-1 h-1" 
              style={{ backgroundColor: editorState.currentColor }} 
            ></div>
          </button>
          {editorState.showColorPicker && (
            <div className="absolute left-0 top-full mt-1 z-50">
              <ColorPicker onSelect={onColorChange} type="foreColor" />
            </div>
          )}
        </div>

        <div className="dropdown relative">
          <button 
            className="dropdown-btn highlight-btn w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 relative" 
            title="Highlight Color"
            onClick={(e) => toggleDropdown('highlight', e)}
          >
            <span className="highlight-icon text-lg">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 19l7-7 3 3-7 7-3-3z" />
                <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                <path d="M2 2l7.586 7.586" />
                <path d="M11 11l2 2" />
              </svg>
            </span>
            <div 
              className="color-bar absolute bottom-0 left-1 right-1 h-1" 
              style={{ backgroundColor: editorState.currentHighlightColor }} 
            ></div>
          </button>
          {editorState.showHighlightPicker && (
            <div className="absolute left-0 top-full mt-1 z-50">
              <ColorPicker onSelect={onHighlightChange} type="hiliteColor" />
            </div>
          )}
        </div>
        
        <div className="dropdown relative">
          <button 
            className="dropdown-btn p-1 rounded hover:bg-gray-100" 
            title="Insert Emoji"
            onClick={(e) => toggleDropdown('emoji', e)}
          >
            <Smile size={16} />
          </button>
          {editorState.showEmojiPicker && (
            <div className="absolute left-0 top-full mt-1 z-50">
              <EmojiPicker onSelect={onEmojiSelect} />
            </div>
          )}
        </div>
      </div>

      <div className="toolbar-divider h-6 w-px bg-gray-300 mx-1"></div>

      <div className="toolbar-group flex items-center gap-1">
        <button className="btn p-1 rounded hover:bg-gray-100" title="Add Code Block" onClick={insertCodeBlock}>
          <Code size={16} />
        </button>
        <button className="btn p-1 rounded hover:bg-gray-100" title="Insert Equation" onClick={insertEquation}>
          <span className="math-icon text-lg">∫</span>
        </button>
        <button className="btn p-1 rounded hover:bg-gray-100" title="Insert Quote" onClick={(e) => handleButtonClick(e, 'formatBlock', '<blockquote>')}>
          <span className="quote-icon text-lg">"</span>
        </button>
        <button className="btn p-1 rounded hover:bg-gray-100" title="Divider" onClick={insertDivider}>
          <span className="divider-icon text-lg">—</span>
        </button>
      </div>
    </div>
  );
};
