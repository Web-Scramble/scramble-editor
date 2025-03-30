
import React, { useState, useRef, useEffect } from 'react';
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
    showTextStylePicker: false,
    showParagraphStylePicker: false
  });
  
  const contentRef = useRef<HTMLDivElement>(null);
  // Track history states for undo/redo functionality
  const [historyStates, setHistoryStates] = useState<string[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);
  const [isUndoRedo, setIsUndoRedo] = useState(false);

  // Save initial state on mount
  useEffect(() => {
    if (contentRef.current) {
      const initialHtml = contentRef.current.innerHTML;
      setHistoryStates([initialHtml]);
      setCurrentHistoryIndex(0);
    }
  }, []);

  // Track content changes for undo/redo
  const handleContentChange = () => {
    if (isUndoRedo) {
      setIsUndoRedo(false);
      return;
    }
    
    if (contentRef.current) {
      const currentHtml = contentRef.current.innerHTML;
      
      // Only save if content has changed
      if (currentHistoryIndex >= 0 && currentHtml !== historyStates[currentHistoryIndex]) {
        const newStates = historyStates.slice(0, currentHistoryIndex + 1);
        newStates.push(currentHtml);
        
        // Limit history size to prevent memory issues
        if (newStates.length > 50) {
          newStates.shift();
        }
        
        setHistoryStates(newStates);
        setCurrentHistoryIndex(newStates.length - 1);
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        editorState.showColorPicker || 
        editorState.showFontSizePicker || 
        editorState.showEmojiPicker ||
        editorState.showTextStylePicker ||
        editorState.showParagraphStylePicker
      ) {
        const target = event.target as HTMLElement;
        const isDropdownClick = target.closest('.dropdown');
        
        if (!isDropdownClick) {
          setEditorState(prev => ({
            ...prev,
            showColorPicker: false,
            showFontSizePicker: false,
            showEmojiPicker: false,
            showTextStylePicker: false,
            showParagraphStylePicker: false
          }));
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [editorState]);

  const execCommand = (command: string, showUI = false, value = null) => {
    document.execCommand(command, showUI, value);
    contentRef.current?.focus();
    handleContentChange();
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
    handleContentChange();
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
      handleContentChange();
    }
  };

  const toggleDropdown = (dropdown: 'color' | 'fontSize' | 'emoji' | 'textStyle' | 'paragraphStyle') => {
    const updatedState = {
      ...editorState,
      showColorPicker: dropdown === 'color' ? !editorState.showColorPicker : false,
      showFontSizePicker: dropdown === 'fontSize' ? !editorState.showFontSizePicker : false,
      showEmojiPicker: dropdown === 'emoji' ? !editorState.showEmojiPicker : false,
      showTextStylePicker: dropdown === 'textStyle' ? !editorState.showTextStylePicker : false,
      showParagraphStylePicker: dropdown === 'paragraphStyle' ? !editorState.showParagraphStylePicker : false
    };
    setEditorState(updatedState);
  };

  const applyTextStyle = (style: string) => {
    if (!contentRef.current) return;
    
    switch(style) {
      case 'normal':
        execCommand('formatBlock', false, 'p');
        break;
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6':
        execCommand('formatBlock', false, style);
        break;
      case 'pre':
        execCommand('formatBlock', false, 'pre');
        break;
    }
    
    setEditorState({
      ...editorState,
      showTextStylePicker: false
    });
  };

  const applyParagraphStyle = (style: string) => {
    if (!contentRef.current) return;
    
    switch(style) {
      case 'paragraph':
        execCommand('formatBlock', false, 'p');
        break;
      case 'blockquote':
        execCommand('formatBlock', false, 'blockquote');
        break;
      case 'ul':
        execCommand('insertUnorderedList', false, null);
        break;
      case 'ol':
        execCommand('insertOrderedList', false, null);
        break;
    }
    
    setEditorState({
      ...editorState,
      showParagraphStylePicker: false
    });
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
      } else {
        const codeBlock = document.createElement('div');
        codeBlock.className = 'code-block animate-in';
        codeBlock.textContent = '// Code here';
        
        range.insertNode(codeBlock);
        
        range.selectNodeContents(codeBlock);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      
      handleContentChange();
    }
  };

  const insertEquation = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      let equationContent = range.toString();
      
      const equation = document.createElement('span');
      equation.className = 'equation animate-in editing';
      
      if (!equationContent) {
        equationContent = '$\\LaTeX$';
      } else if (!equationContent.startsWith('$')) {
        equationContent = `$${equationContent}$`;
      }
      
      equation.textContent = equationContent;
      equation.setAttribute('data-latex', equationContent);
      
      range.deleteContents();
      range.insertNode(equation);
      
      range.selectNodeContents(equation);
      selection.removeAllRanges();
      selection.addRange(range);
      
      handleContentChange();
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
            handleContentChange();
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
          handleContentChange();
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
      
      const p = document.createElement('p');
      p.appendChild(document.createElement('br'));
      hr.parentNode?.insertBefore(p, hr.nextSibling);
      
      const newRange = document.createRange();
      newRange.setStart(p, 0);
      selection.removeAllRanges();
      selection.addRange(newRange);
      
      handleContentChange();
    }
  };

  const insertTable = (rows: number, cols: number) => {
    if (!contentRef.current) return;
    
    const table = document.createElement('table');
    table.className = 'editor-table';
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.marginBottom = '1em';
    
    const tbody = document.createElement('tbody');
    
    for (let i = 0; i < rows; i++) {
      const tr = document.createElement('tr');
      
      for (let j = 0; j < cols; j++) {
        const td = document.createElement('td');
        td.style.border = '1px solid #ccc';
        td.style.padding = '8px';
        td.style.position = 'relative';
        td.appendChild(document.createElement('br'));
        tr.appendChild(td);
      }
      
      tbody.appendChild(tr);
    }
    
    table.appendChild(tbody);
    
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(table);
      
      // Add an empty paragraph after the table
      const p = document.createElement('p');
      p.appendChild(document.createElement('br'));
      
      if (table.parentNode) {
        table.parentNode.insertBefore(p, table.nextSibling);
      }
      
      handleContentChange();
    }
  };

  const handleUndo = () => {
    if (currentHistoryIndex > 0) {
      setIsUndoRedo(true);
      const newIndex = currentHistoryIndex - 1;
      setCurrentHistoryIndex(newIndex);
      
      if (contentRef.current && historyStates[newIndex]) {
        contentRef.current.innerHTML = historyStates[newIndex];
      }
    }
  };

  const handleRedo = () => {
    if (currentHistoryIndex < historyStates.length - 1) {
      setIsUndoRedo(true);
      const newIndex = currentHistoryIndex + 1;
      setCurrentHistoryIndex(newIndex);
      
      if (contentRef.current && historyStates[newIndex]) {
        contentRef.current.innerHTML = historyStates[newIndex];
      }
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
        applyTextStyle={applyTextStyle}
        applyParagraphStyle={applyParagraphStyle}
        insertTable={insertTable}
        handleUndo={handleUndo}
        handleRedo={handleRedo}
      />
      <ContentArea ref={contentRef} onContentChange={handleContentChange} />
    </div>
  );
};

export default TextEditor;
