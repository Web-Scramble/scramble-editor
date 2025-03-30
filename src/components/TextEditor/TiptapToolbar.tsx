
import React, { useRef, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import { 
  Bold, Italic, Underline, Strikethrough, 
  AlignLeft, AlignCenter, AlignRight, AlignJustify, 
  Code, Link2, List, ListOrdered, Image, Table, Paperclip,
  Type, Smile, Undo, Redo, Heading1, Heading2, Heading3, 
  Quote, Minus, File, ChevronDown
} from 'lucide-react';
import { toast } from 'sonner';

interface TiptapToolbarProps {
  editor: Editor;
  showTableSelector: boolean;
  setShowTableSelector: (show: boolean) => void;
  hoveredCells: { rows: number, cols: number };
  onTableCellHover: (rows: number, cols: number) => void;
  onTableCellClick: (rows: number, cols: number) => void;
}

export const TiptapToolbar: React.FC<TiptapToolbarProps> = ({
  editor,
  showTableSelector,
  setShowTableSelector,
  hoveredCells,
  onTableCellHover,
  onTableCellClick
}) => {
  const tableGridRef = useRef<HTMLDivElement>(null);
  const MAX_GRID_SIZE = 10;

  useEffect(() => {
    // Close table selector when clicking outside
    const handleClickOutside = (e: MouseEvent) => {
      if (tableGridRef.current && !tableGridRef.current.contains(e.target as Node)) {
        setShowTableSelector(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setShowTableSelector]);

  // Helper function to prevent events from bubbling up
  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const generateTableGrid = () => {
    const grid = [];
    
    for (let i = 0; i < MAX_GRID_SIZE; i++) {
      const row = [];
      for (let j = 0; j < MAX_GRID_SIZE; j++) {
        const isHighlighted = i < hoveredCells.rows && j < hoveredCells.cols;
        
        row.push(
          <div
            key={`${i}-${j}`}
            className={`table-grid-cell ${isHighlighted ? 'highlighted' : ''}`}
            onMouseOver={() => onTableCellHover(i + 1, j + 1)}
            onClick={() => onTableCellClick(i + 1, j + 1)}
          />
        );
      }
      grid.push(<div key={i} className="table-grid-row">{row}</div>);
    }
    
    return grid;
  };

  const insertImage = () => {
    const url = window.prompt('Enter the URL of the image:');
    
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
      toast('Image inserted');
    }
  };

  return (
    <div className="toolbar">
      <div className="toolbar-group">
        <button 
          className={`btn`} 
          title="Undo" 
          onClick={() => editor.commands.undo()}
          disabled={!editor.isActive('history') || !editor.commands.undo}
        >
          <Undo size={16} />
        </button>
        <button 
          className={`btn`} 
          title="Redo" 
          onClick={() => editor.commands.redo()}
          disabled={!editor.isActive('history') || !editor.commands.redo}
        >
          <Redo size={16} />
        </button>
      </div>

      <div className="toolbar-divider"></div>

      <div className="toolbar-group">
        <div className="dropdown">
          <button 
            className="dropdown-btn" 
            title="Text Style"
          >
            <Type size={16} />
            <span className="dropdown-label">
              {editor.isActive('heading', { level: 1 }) ? 'Heading 1' : 
               editor.isActive('heading', { level: 2 }) ? 'Heading 2' : 
               editor.isActive('heading', { level: 3 }) ? 'Heading 3' : 
               editor.isActive('codeBlock') ? 'Code Block' : 'Normal text'}
            </span>
            <ChevronDown size={12} className="dropdown-arrow" />
          </button>
          <div className="dropdown-menu text-style-picker" onClick={stopPropagation}>
            <div 
              className={`dropdown-item ${editor.isActive('paragraph') && !editor.isActive('heading') ? 'active' : ''}`}
              onClick={() => editor.chain().focus().setParagraph().run()}
            >
              Normal text
            </div>
            <div 
              className={`dropdown-item ${editor.isActive('heading', { level: 1 }) ? 'active' : ''}`}
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            >
              <Heading1 size={16} className="mr-2" /> Heading 1
            </div>
            <div 
              className={`dropdown-item ${editor.isActive('heading', { level: 2 }) ? 'active' : ''}`}
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            >
              <Heading2 size={16} className="mr-2" /> Heading 2
            </div>
            <div 
              className={`dropdown-item ${editor.isActive('heading', { level: 3 }) ? 'active' : ''}`}
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            >
              <Heading3 size={16} className="mr-2" /> Heading 3
            </div>
            <div 
              className={`dropdown-item ${editor.isActive('codeBlock') ? 'active' : ''}`}
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            >
              <Code size={16} className="mr-2" /> Code Block
            </div>
          </div>
        </div>
      </div>

      <div className="toolbar-divider"></div>

      <div className="toolbar-group">
        <div className="dropdown">
          <button 
            className="dropdown-btn" 
            title="Paragraph Style"
          >
            <List size={16} />
            <ChevronDown size={12} className="dropdown-arrow" />
          </button>
          <div className="dropdown-menu paragraph-style-picker" onClick={stopPropagation}>
            <div 
              className={`dropdown-item ${editor.isActive('paragraph') && !editor.isActive('blockquote') ? 'active' : ''}`}
              onClick={() => editor.chain().focus().setParagraph().run()}
            >
              <File size={16} className="mr-2" /> Paragraph
            </div>
            <div 
              className={`dropdown-item ${editor.isActive('blockquote') ? 'active' : ''}`}
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
            >
              <Quote size={16} className="mr-2" /> Blockquote
            </div>
            <div 
              className={`dropdown-item ${editor.isActive('bulletList') ? 'active' : ''}`}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
              <List size={16} className="mr-2" /> Bullet List
            </div>
            <div 
              className={`dropdown-item ${editor.isActive('orderedList') ? 'active' : ''}`}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
              <ListOrdered size={16} className="mr-2" /> Numbered List
            </div>
          </div>
        </div>
      </div>

      <div className="toolbar-divider"></div>

      <div className="toolbar-group">
        <button 
          className={`btn ${editor.isActive('bold') ? 'active' : ''}`} 
          title="Bold" 
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold size={16} />
        </button>
        <button 
          className={`btn ${editor.isActive('italic') ? 'active' : ''}`} 
          title="Italic" 
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic size={16} />
        </button>
        <button 
          className={`btn ${editor.isActive('underline') ? 'active' : ''}`} 
          title="Underline" 
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <Underline size={16} />
        </button>
        <button 
          className={`btn ${editor.isActive('strike') ? 'active' : ''}`} 
          title="Strikethrough" 
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough size={16} />
        </button>
      </div>

      <div className="toolbar-divider"></div>

      <div className="toolbar-group">
        <button 
          className={`btn ${editor.isActive({ textAlign: 'left' }) ? 'active' : ''}`} 
          title="Align Left" 
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
        >
          <AlignLeft size={16} />
        </button>
        <button 
          className={`btn ${editor.isActive({ textAlign: 'center' }) ? 'active' : ''}`} 
          title="Align Center" 
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
        >
          <AlignCenter size={16} />
        </button>
        <button 
          className={`btn ${editor.isActive({ textAlign: 'right' }) ? 'active' : ''}`} 
          title="Align Right" 
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
        >
          <AlignRight size={16} />
        </button>
        <button 
          className={`btn ${editor.isActive({ textAlign: 'justify' }) ? 'active' : ''}`} 
          title="Justify" 
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
        >
          <AlignJustify size={16} />
        </button>
      </div>

      <div className="toolbar-divider"></div>

      <div className="toolbar-group">
        <button 
          className={`btn ${editor.isActive('code') ? 'active' : ''}`} 
          title="Inline Code" 
          onClick={() => editor.chain().focus().toggleCode().run()}
        >
          <Code size={16} />
        </button>
        <button 
          className={`btn ${editor.isActive('link') ? 'active' : ''}`} 
          title="Link" 
          onClick={() => {
            const url = prompt('Enter URL:');
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }}
        >
          <Link2 size={16} />
        </button>
      </div>

      <div className="toolbar-divider"></div>

      <div className="toolbar-group">
        <button 
          className={`btn ${editor.isActive('bulletList') ? 'active' : ''}`} 
          title="Bullet List" 
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List size={16} />
        </button>
        <button 
          className={`btn ${editor.isActive('orderedList') ? 'active' : ''}`} 
          title="Numbered List" 
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered size={16} />
        </button>
      </div>

      <div className="toolbar-divider"></div>

      <div className="toolbar-group">
        <button 
          className="btn" 
          title="Insert Image" 
          onClick={insertImage}
        >
          <Image size={16} />
        </button>
        
        <div className="table-button-container">
          <button 
            className={`btn ${editor.isActive('table') ? 'active' : ''}`} 
            title="Insert Table" 
            onClick={() => setShowTableSelector(!showTableSelector)}
          >
            <Table size={16} />
          </button>
          
          {showTableSelector && (
            <div className="table-selector" ref={tableGridRef} onClick={stopPropagation}>
              <div className="table-selector-header">
                {hoveredCells.rows > 0 && hoveredCells.cols > 0 ? (
                  `${hoveredCells.rows} × ${hoveredCells.cols} Table`
                ) : 'Insert Table'}
              </div>
              <div className="table-grid-container">
                {generateTableGrid()}
              </div>
            </div>
          )}
        </div>
        
        <button 
          className="btn" 
          title="Attach File" 
          onClick={() => toast('File attachment feature coming soon!')}
        >
          <Paperclip size={16} />
        </button>
      </div>

      <div className="toolbar-divider"></div>

      <div className="toolbar-group">
        <button 
          className={`btn ${editor.isActive('codeBlock') ? 'active' : ''}`} 
          title="Add Code Block" 
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          <Code size={16} />
        </button>
        <button 
          className={`btn ${editor.isActive('blockquote') ? 'active' : ''}`} 
          title="Insert Quote" 
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <span className="quote-icon">"</span>
        </button>
        <button 
          className="btn" 
          title="Divider" 
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <Minus size={16} />
        </button>
      </div>
    </div>
  );
};
