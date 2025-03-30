
import React, { useState, useRef } from 'react';
import { Toolbar } from './Toolbar';
import { ContentArea } from './ContentArea';
import './TextEditor.css';

export const TextEditor = () => {
  const [editorState, setEditorState] = useState({
    currentColor: '#000000',
    currentFontSize: '16px',
    showColorPicker: false,
    showFontSizePicker: false,
    showEmojiPicker: false,
  });
  
  const contentRef = useRef<HTMLDivElement>(null);

  const execCommand = (command: string, showUI = false, value = null) => {
    document.execCommand(command, showUI, value);
    contentRef.current?.focus();
  };

  const handleColorChange = (color: string) => {
    setEditorState({
      ...editorState,
      currentColor: color,
      showColorPicker: false
    });
    execCommand('foreColor', false, color);
  };

  const handleFontSizeChange = (size: string) => {
    setEditorState({
      ...editorState,
      currentFontSize: size,
      showFontSizePicker: false
    });
    document.execCommand('fontSize', false, '7');
    const selectedElements = document.querySelectorAll('font[size="7"]');
    selectedElements.forEach(el => {
      el.removeAttribute('size');
      (el as HTMLElement).style.fontSize = size;
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

  const toggleDropdown = (dropdown: 'color' | 'fontSize' | 'emoji') => {
    const updatedState = {
      ...editorState,
      showColorPicker: dropdown === 'color' ? !editorState.showColorPicker : false,
      showFontSizePicker: dropdown === 'fontSize' ? !editorState.showFontSizePicker : false,
      showEmojiPicker: dropdown === 'emoji' ? !editorState.showEmojiPicker : false
    };
    setEditorState(updatedState);
  };

  const insertCodeBlock = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const selectedText = range.toString();
      
      if (selectedText) {
        const codeBlock = document.createElement('div');
        codeBlock.className = 'code-block animate-in';
        codeBlock.textContent = selectedText;
        
        range.deleteContents();
        range.insertNode(codeBlock);
        
        // Clear selection
        selection.removeAllRanges();
      }
    }
  };

  const insertEquation = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const selectedText = range.toString() || 'E = mc²';
      
      const equation = document.createElement('span');
      equation.className = 'equation animate-in';
      equation.textContent = selectedText;
      equation.contentEditable = 'true';
      
      range.deleteContents();
      range.insertNode(equation);
      
      // Clear selection
      selection.removeAllRanges();
    }
  };

  const insertImage = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);
    
    fileInput.addEventListener('change', function() {
      if (this.files && this.files[0]) {
        const file = this.files[0];
        const reader = new FileReader();
        
        reader.onload = function(e) {
          const img = document.createElement('img');
          img.src = e.target?.result as string;
          img.className = 'inserted-image animate-in';
          img.style.maxWidth = '100%';
          
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(img);
          }
        };
        
        reader.readAsDataURL(file);
      }
      
      document.body.removeChild(fileInput);
    });
    
    fileInput.click();
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

  return (
    <div className="editor-container animate-in">
      <Toolbar 
        execCommand={execCommand}
        editorState={editorState}
        onColorChange={handleColorChange}
        onFontSizeChange={handleFontSizeChange}
        onEmojiSelect={handleEmojiSelect}
        toggleDropdown={toggleDropdown}
        insertCodeBlock={insertCodeBlock}
        insertEquation={insertEquation}
        insertImage={insertImage}
        handleAttachment={handleAttachment}
        insertDivider={insertDivider}
      />
      <ContentArea ref={contentRef} />
    </div>
  );
};

export default TextEditor;
