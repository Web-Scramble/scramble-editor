
import React, { useState, useRef, useEffect } from 'react';
import { Toolbar } from './Toolbar';
import { ContentArea } from './ContentArea';
import './TextEditor.css';
import { X } from 'lucide-react';

interface TextEditorProps {
  onClose: () => void;
}

export const TextEditor: React.FC<TextEditorProps> = ({ onClose }) => {
  const [editorState, setEditorState] = useState({
    currentColor: '#000000',
    currentHighlightColor: '#FFFF00', // Default highlight color
    currentFontSize: '16px',
    showColorPicker: false,
    showHighlightPicker: false,
    showFontSizePicker: false,
    showEmojiPicker: false,
    showParagraphStyleMenu: false,
    showTextStyleMenu: false,
  });
  
  // State for dragging functionality
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const contentRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  // Handle dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  // Start dragging
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (editorRef.current) {
      const rect = editorRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsDragging(true);
    }
  };

  useEffect(() => {
    // Close dropdowns when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      // Don't close if clicking inside a dropdown or button
      if ((event.target as Element)?.closest('.dropdown, .dropdown-btn')) {
        return;
      }
      
      setEditorState(prev => ({
        ...prev,
        showColorPicker: false,
        showHighlightPicker: false,
        showFontSizePicker: false,
        showEmojiPicker: false,
        showParagraphStyleMenu: false,
        showTextStyleMenu: false
      }));
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const execCommand = (command: string, showUI = false, value: any = null) => {
    document.execCommand(command, showUI, value);
    if (contentRef.current) {
      contentRef.current.focus();
    }
  };

  const handleColorChange = (color: string) => {
    setEditorState({
      ...editorState,
      currentColor: color,
      showColorPicker: false
    });
    execCommand('foreColor', false, color);
  };

  const handleHighlightChange = (color: string) => {
    setEditorState({
      ...editorState,
      currentHighlightColor: color,
      showHighlightPicker: false
    });
    execCommand('hiliteColor', false, color);
  };

  const handleFontSizeChange = (size: number) => {
    const sizeInPx = `${size}px`;
    setEditorState({
      ...editorState,
      currentFontSize: sizeInPx,
      showFontSizePicker: false
    });
    
    document.execCommand('fontSize', false, '7');
    const selectedElements = document.querySelectorAll('font[size="7"]');
    selectedElements.forEach(el => {
      el.removeAttribute('size');
      (el as HTMLElement).style.fontSize = sizeInPx;
    });
  };

  const handleEmojiSelect = (emoji: string) => {
    setEditorState({
      ...editorState,
      showEmojiPicker: false
    });
    
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(emoji));
    }
  };

  const toggleDropdown = (dropdown: 'color' | 'highlight' | 'fontSize' | 'emoji' | 'paragraphStyle' | 'textStyle', e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedState = {
      ...editorState,
      showColorPicker: dropdown === 'color' ? !editorState.showColorPicker : false,
      showHighlightPicker: dropdown === 'highlight' ? !editorState.showHighlightPicker : false,
      showFontSizePicker: dropdown === 'fontSize' ? !editorState.showFontSizePicker : false,
      showEmojiPicker: dropdown === 'emoji' ? !editorState.showEmojiPicker : false,
      showParagraphStyleMenu: dropdown === 'paragraphStyle' ? !editorState.showParagraphStyleMenu : false,
      showTextStyleMenu: dropdown === 'textStyle' ? !editorState.showTextStyleMenu : false,
    };
    setEditorState(updatedState);
  };

  const insertCodeBlock = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const selectedText = range.toString() || '// Add your code here';
      
      const codeBlock = document.createElement('div');
      codeBlock.className = 'code-block animate-in';
      codeBlock.textContent = selectedText;
      
      range.deleteContents();
      range.insertNode(codeBlock);
      
      // Clear selection
      selection.removeAllRanges();
    }
  };

  const insertEquation = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const selectedText = range.toString() || '\\int_{a}^{b} f(x) \\, dx';
      
      // Create the equation container
      const equation = document.createElement('div');
      equation.className = 'equation animate-in';
      
      // Create the LaTeX markdown format
      let latexContent = selectedText;
      if (!latexContent.startsWith('$') && !latexContent.endsWith('$')) {
        latexContent = '$' + latexContent + '$';
      }
      
      equation.textContent = latexContent;
      equation.contentEditable = 'true';
      equation.setAttribute('data-latex', 'true');
      
      range.deleteContents();
      range.insertNode(equation);
      
      // Setup equation for editing
      equation.addEventListener('dblclick', function() {
        // Place cursor inside the equation for easy editing
        const range = document.createRange();
        range.selectNodeContents(this);
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
          selection.addRange(range);
        }
        equation.classList.remove('equation-rendered');
      });
      
      // Add blur event to render the equation
      equation.addEventListener('blur', function() {
        equation.classList.add('equation-rendered');
      });
      
      // Clear selection
      selection.removeAllRanges();
    }
  };

  const handleAttachment = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);
    
    fileInput.addEventListener('change', function() {
      if (this.files && this.files[0]) {
        const fileName = this.files[0].name;
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const attachment = document.createElement('div');
          attachment.className = 'attachment animate-in';
          
          const icon = document.createElement('span');
          icon.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
              <polyline points="13 2 13 9 20 9"></polyline>
            </svg>
          `;
          
          const nameSpan = document.createElement('span');
          nameSpan.textContent = fileName;
          
          attachment.appendChild(icon);
          attachment.appendChild(nameSpan);
          
          range.deleteContents();
          range.insertNode(attachment);
        }
      }
      
      document.body.removeChild(fileInput);
    });
    
    fileInput.click();
  };

  const insertDivider = () => {
    const hr = document.createElement('hr');
    hr.className = 'editor-divider animate-in';
    
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(hr);
      
      // Add a paragraph after the divider to continue typing
      const p = document.createElement('p');
      p.appendChild(document.createElement('br'));
      hr.parentNode?.insertBefore(p, hr.nextSibling);
      
      // Set cursor to the new paragraph
      const newRange = document.createRange();
      newRange.setStart(p, 0);
      selection.removeAllRanges();
      selection.addRange(newRange);
    }
  };

  const handleParagraphStyle = (command: string) => {
    execCommand(command);
    setEditorState({
      ...editorState,
      showParagraphStyleMenu: false
    });
  };
  
  const handleTextStyle = (command: string) => {
    execCommand(command);
    setEditorState({
      ...editorState,
      showTextStyleMenu: false
    });
  };

  return (
    <div className="floating-editor-backdrop">
      <div 
        ref={editorRef}
        className="floating-editor-container animate-in" 
        style={{ 
          left: `${position.x}px`, 
          top: `${position.y}px` 
        }}
      >
        <div className="floating-editor-header" onMouseDown={handleMouseDown}>
          <div className="drag-handle">Drag me</div>
          <button 
            className="close-button" 
            onClick={onClose}
            aria-label="Close editor"
          >
            <X size={16} />
          </button>
        </div>
        <div className="editor-container">
          <Toolbar 
            execCommand={execCommand}
            editorState={editorState}
            onColorChange={handleColorChange}
            onHighlightChange={handleHighlightChange}
            onFontSizeChange={handleFontSizeChange}
            onEmojiSelect={handleEmojiSelect}
            toggleDropdown={toggleDropdown}
            insertCodeBlock={insertCodeBlock}
            insertEquation={insertEquation}
            handleAttachment={handleAttachment}
            insertDivider={insertDivider}
            onParagraphStyle={handleParagraphStyle}
            onTextStyle={handleTextStyle}
          />
          <ContentArea ref={contentRef} />
        </div>
      </div>
    </div>
  );
};

export default TextEditor;
