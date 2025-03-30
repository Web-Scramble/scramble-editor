
import React, { useState, useRef, useEffect } from 'react';
import { Toolbar } from './Toolbar';
import { ContentArea } from './ContentArea';
import './TextEditor.css';

export const TextEditor = () => {
  const [editorState, setEditorState] = useState({
    currentColor: '#000000',
    currentHighlightColor: '#FFFF00', // Default highlight color
    currentFontSize: '16px',
    showColorPicker: false,
    showHighlightPicker: false,
    showFontSizePicker: false,
    showEmojiPicker: false,
    showParagraphStyleMenu: false,
  });
  
  const contentRef = useRef<HTMLDivElement>(null);

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
        showParagraphStyleMenu: false
      }));
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const execCommand = (command: string, showUI = false, value: any = null) => {
    document.execCommand(command, showUI, value);
    if (contentRef.current) {
      contentRef.current.focus();
    }
    
    // Log for debugging
    console.log(`Executed command: ${command} with value: ${value}`);
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
    
    // Set font size for selected text
    if (window.getSelection()?.rangeCount) {
      // Use execCommand with a temporary size to identify the elements
      document.execCommand('fontSize', false, '7');
      
      // Find all elements with size="7" and set their font-size style
      const selectedElements = document.querySelectorAll('font[size="7"]');
      selectedElements.forEach(el => {
        el.removeAttribute('size');
        (el as HTMLElement).style.fontSize = sizeInPx;
      });
    } else {
      // If no selection, wrap new span around the cursor position
      const span = document.createElement('span');
      span.style.fontSize = sizeInPx;
      span.textContent = '\u200B'; // Zero-width space
      
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.insertNode(span);
        
        // Place cursor after the inserted span
        range.setStartAfter(span);
        range.setEndAfter(span);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
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
      
      // Move cursor after emoji
      range.setStartAfter(range.endContainer);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  };

  const toggleDropdown = (dropdown: 'color' | 'highlight' | 'fontSize' | 'emoji' | 'paragraphStyle', e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedState = {
      ...editorState,
      showColorPicker: dropdown === 'color' ? !editorState.showColorPicker : false,
      showHighlightPicker: dropdown === 'highlight' ? !editorState.showHighlightPicker : false,
      showFontSizePicker: dropdown === 'fontSize' ? !editorState.showFontSizePicker : false,
      showEmojiPicker: dropdown === 'emoji' ? !editorState.showEmojiPicker : false,
      showParagraphStyleMenu: dropdown === 'paragraphStyle' ? !editorState.showParagraphStyleMenu : false,
    };
    setEditorState(updatedState);
  };

  const insertCodeBlock = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const selectedText = range.toString() || '// Add your code here';
      
      const codeBlock = document.createElement('pre');
      codeBlock.className = 'code-block';
      codeBlock.style.backgroundColor = '#f5f5f5';
      codeBlock.style.padding = '10px';
      codeBlock.style.borderRadius = '4px';
      codeBlock.style.fontFamily = 'monospace';
      codeBlock.style.whiteSpace = 'pre';
      codeBlock.style.overflowX = 'auto';
      codeBlock.textContent = selectedText;
      
      range.deleteContents();
      range.insertNode(codeBlock);
      
      // Add a paragraph after the code block
      const p = document.createElement('p');
      p.appendChild(document.createElement('br'));
      if (codeBlock.parentNode) {
        codeBlock.parentNode.insertBefore(p, codeBlock.nextSibling);
      }
      
      // Clear selection and place cursor at end of inserted paragraph
      selection.removeAllRanges();
      const newRange = document.createRange();
      newRange.setStart(p, 0);
      selection.addRange(newRange);
      
      if (contentRef.current) {
        contentRef.current.focus();
      }
    }
  };

  const insertEquation = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const selectedText = range.toString() || '\\int_{a}^{b} f(x) \\, dx';
      
      // Create the equation container
      const equation = document.createElement('div');
      equation.className = 'equation';
      equation.style.backgroundColor = '#f9f9f9';
      equation.style.padding = '8px';
      equation.style.margin = '8px 0';
      equation.style.borderRadius = '4px';
      equation.style.border = '1px solid #ddd';
      equation.style.fontFamily = 'serif';
      
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
      
      // Add a paragraph after the equation
      const p = document.createElement('p');
      p.appendChild(document.createElement('br'));
      if (equation.parentNode) {
        equation.parentNode.insertBefore(p, equation.nextSibling);
      }
      
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
      
      // Clear selection and place cursor in the new paragraph
      selection.removeAllRanges();
      const newRange = document.createRange();
      newRange.setStart(p, 0);
      selection.addRange(newRange);
      
      if (contentRef.current) {
        contentRef.current.focus();
      }
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
          attachment.className = 'attachment';
          attachment.style.display = 'inline-flex';
          attachment.style.alignItems = 'center';
          attachment.style.gap = '4px';
          attachment.style.backgroundColor = '#f0f0f0';
          attachment.style.padding = '4px 8px';
          attachment.style.borderRadius = '4px';
          attachment.style.margin = '2px 0';
          
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
          
          // Place cursor after the attachment
          range.setStartAfter(attachment);
          selection.removeAllRanges();
          selection.addRange(range);
          
          if (contentRef.current) {
            contentRef.current.focus();
          }
        }
      }
      
      document.body.removeChild(fileInput);
    });
    
    fileInput.click();
  };

  const insertDivider = () => {
    const hr = document.createElement('hr');
    hr.className = 'editor-divider';
    hr.style.border = 'none';
    hr.style.borderTop = '1px solid #ddd';
    hr.style.margin = '12px 0';
    
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(hr);
      
      // Add a paragraph after the divider to continue typing
      const p = document.createElement('p');
      p.appendChild(document.createElement('br'));
      if (hr.parentNode) {
        hr.parentNode.insertBefore(p, hr.nextSibling);
      }
      
      // Set cursor to the new paragraph
      const newRange = document.createRange();
      newRange.setStart(p, 0);
      selection.removeAllRanges();
      selection.addRange(newRange);
      
      if (contentRef.current) {
        contentRef.current.focus();
      }
    }
  };

  const handleParagraphStyle = (command: string) => {
    execCommand(command);
    setEditorState({
      ...editorState,
      showParagraphStyleMenu: false
    });
  };

  return (
    <div className="editor-container bg-white border border-gray-300 rounded-md shadow-sm">
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
      />
      <ContentArea ref={contentRef} />
    </div>
  );
};

export default TextEditor;
