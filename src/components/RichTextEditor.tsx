
import React, { useState, useRef, useEffect } from 'react';
import { Toolbar } from './TextEditor/Toolbar';
import { ContentArea } from './TextEditor/ContentArea';
import { useIsMobile } from '../hooks/use-mobile';
import { GripVertical, Minimize, Plus } from 'lucide-react';
import { toast } from '../hooks/use-toast';
import './TextEditor/TextEditor.css';

export interface RichTextEditorProps {
  initialValue?: string;
  onChange?: (content: string) => void;
  onImageUpload?: (file: File) => Promise<string>;
  placeholder?: string;
  height?: string;
  editorClassName?: string;
  toolbarClassName?: string;
  floatingToolbar?: boolean;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  initialValue = '',
  onChange,
  onImageUpload,
  placeholder,
  height = '300px',
  editorClassName = '',
  toolbarClassName = '',
  floatingToolbar = true
}) => {
  const [editorState, setEditorState] = useState({
    currentColor: '#000000',
    currentHighlightColor: '#FFFF00',
    currentFontSize: '16px',
    showColorPicker: false,
    showHighlightPicker: false,
    showFontSizePicker: false,
    showEmojiPicker: false,
    showParagraphStyleMenu: false,
    showTextStyleMenu: false,
    showMediaUploadMenu: false,
  });
  
  const [activeTab, setActiveTab] = useState('format');
  const isMobile = useIsMobile();
  
  const contentRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);
  
  const [toolbarPosition, setToolbarPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    if (initialValue && contentRef.current) {
      contentRef.current.innerHTML = initialValue;
    }
  }, [initialValue]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if ((event.target as Element)?.closest('.dropdown, .dropdown-btn')) {
        return;
      }
      closeAllDropdowns();
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isMobile) {
      closeAllDropdowns();
    }
  }, [activeTab, isMobile]);

  useEffect(() => {
    if (onChange && contentRef.current) {
      const handleInput = () => {
        onChange(contentRef.current?.innerHTML || '');
      };
      
      contentRef.current.addEventListener('input', handleInput);
      return () => {
        contentRef.current?.removeEventListener('input', handleInput);
      };
    }
  }, [onChange]);

  const closeAllDropdowns = () => {
    setEditorState(prev => ({
      ...prev,
      showColorPicker: false,
      showHighlightPicker: false,
      showFontSizePicker: false,
      showEmojiPicker: false,
      showParagraphStyleMenu: false,
      showTextStyleMenu: false,
      showMediaUploadMenu: false
    }));
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      const toolbarRect = toolbarRef.current?.getBoundingClientRect();
      if (toolbarRect) {
        const maxX = window.innerWidth - toolbarRect.width;
        const maxY = window.innerHeight - toolbarRect.height;
        
        setToolbarPosition({
          x: Math.max(0, Math.min(newX, maxX)),
          y: Math.max(0, Math.min(newY, maxY))
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

  const handleDragStart = (e: React.MouseEvent) => {
    if (e.target === dragHandleRef.current || (e.target as Element).closest('.drag-handle')) {
      const toolbarRect = toolbarRef.current?.getBoundingClientRect();
      if (toolbarRect) {
        setIsDragging(true);
        setDragOffset({
          x: e.clientX - toolbarRect.left,
          y: e.clientY - toolbarRect.top
        });
      }
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

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

  const toggleDropdown = (dropdown: 'color' | 'highlight' | 'fontSize' | 'emoji' | 'paragraphStyle' | 'textStyle' | 'mediaUpload', e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedState = {
      ...editorState,
      showColorPicker: dropdown === 'color' ? !editorState.showColorPicker : false,
      showHighlightPicker: dropdown === 'highlight' ? !editorState.showHighlightPicker : false,
      showFontSizePicker: dropdown === 'fontSize' ? !editorState.showFontSizePicker : false,
      showEmojiPicker: dropdown === 'emoji' ? !editorState.showEmojiPicker : false,
      showParagraphStyleMenu: dropdown === 'paragraphStyle' ? !editorState.showParagraphStyleMenu : false,
      showTextStyleMenu: dropdown === 'textStyle' ? !editorState.showTextStyleMenu : false,
      showMediaUploadMenu: dropdown === 'mediaUpload' ? !editorState.showMediaUploadMenu : false,
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
      
      // Add a paragraph after the code block if it's at the end
      if (!codeBlock.nextSibling) {
        const p = document.createElement('p');
        p.innerHTML = '<br>';
        codeBlock.parentNode?.appendChild(p);
      }
      
      selection.removeAllRanges();
      
      toast({
        title: "Code Block Added",
        description: "A code block has been inserted into your document.",
      });
    }
  };

  const insertInlineCode = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const selectedText = range.toString();
      
      if (selectedText) {
        // If there's selected text, wrap it in inline code
        const codeElement = document.createElement('code');
        codeElement.className = 'inline-code';
        codeElement.textContent = selectedText;
        
        range.deleteContents();
        range.insertNode(codeElement);
      } else {
        // If no selection, insert a placeholder inline code
        const codeElement = document.createElement('code');
        codeElement.className = 'inline-code';
        codeElement.textContent = 'code';
        
        range.insertNode(codeElement);
        
        // Select the placeholder text to make it easy to replace
        const newRange = document.createRange();
        newRange.selectNodeContents(codeElement);
        selection.removeAllRanges();
        selection.addRange(newRange);
      }
      
      toast({
        title: "Inline Code Added",
        description: "Inline code has been added to your document.",
      });
    }
  };

  const insertEquation = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const selectedText = range.toString() || '\\int_{a}^{b} f(x) \\, dx';
      
      const equation = document.createElement('div');
      equation.className = 'equation animate-in';
      
      let latexContent = selectedText;
      if (!latexContent.startsWith('$') && !latexContent.endsWith('$')) {
        latexContent = '$' + latexContent + '$';
      }
      
      equation.textContent = latexContent;
      equation.contentEditable = 'true';
      equation.setAttribute('data-latex', 'true');
      
      range.deleteContents();
      range.insertNode(equation);
      
      equation.addEventListener('dblclick', function() {
        const range = document.createRange();
        range.selectNodeContents(this);
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
          selection.addRange(range);
        }
        equation.classList.remove('equation-rendered');
      });
      
      equation.addEventListener('blur', function() {
        equation.classList.add('equation-rendered');
      });
      
      selection.removeAllRanges();
    }
  };

  const handleAttachment = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*,video/*,application/pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);
    
    fileInput.addEventListener('change', function() {
      if (this.files && this.files[0]) {
        const file = this.files[0];
        handleMediaUpload(file);
      }
      
      document.body.removeChild(fileInput);
    });
    
    fileInput.click();
    closeAllDropdowns();
  };

  const handleMediaUpload = async (file: File) => {
    const fileType = file.type.split('/')[0]; // image, video, application, etc.
    
    if (onImageUpload && fileType === 'image') {
      try {
        const url = await onImageUpload(file);
        insertImage(url);
      } catch (error) {
        toast({
          title: "Upload Failed",
          description: "Could not upload image. Please try again.",
        });
      }
    } else {
      // Default behavior without custom upload handler
      if (fileType === 'image') {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            insertImage(e.target.result.toString());
          }
        };
        reader.readAsDataURL(file);
      } else {
        // Handle other file types
        const fileSubType = file.type.split('/')[1]; // jpeg, png, mp4, pdf, etc.
        const fileName = file.name;
        const fileSize = (file.size / 1024).toFixed(1) + ' KB';
        
        if (fileType === 'video') {
          insertVideo(file);
        } else {
          insertDocument(fileName, fileSubType.toUpperCase(), fileSize);
        }
      }
    }
  };

  const insertImage = (src: string) => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && contentRef.current) {
      const range = selection.getRangeAt(0);
      
      const imgContainer = document.createElement('div');
      imgContainer.className = 'media-element media-align-center';
      
      const img = document.createElement('img');
      img.src = src;
      img.alt = "Uploaded image";
      img.className = "uploaded-image";
      
      imgContainer.appendChild(img);
      
      range.deleteContents();
      range.insertNode(imgContainer);
      
      // Add a paragraph after the image
      const p = document.createElement('p');
      p.innerHTML = '<br>';
      if (imgContainer.nextSibling) {
        imgContainer.parentNode?.insertBefore(p, imgContainer.nextSibling);
      } else {
        imgContainer.parentNode?.appendChild(p);
      }
      
      // Move cursor after the image
      const newRange = document.createRange();
      newRange.setStartAfter(imgContainer);
      selection.removeAllRanges();
      selection.addRange(newRange);
      
      toast({
        title: "Image Added",
        description: "Image has been added to your document.",
      });
    }
  };

  const insertVideo = (file: File) => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && contentRef.current) {
      const range = selection.getRangeAt(0);
      
      const videoContainer = document.createElement('div');
      videoContainer.className = 'media-element media-align-center';
      
      const video = document.createElement('video');
      video.controls = true;
      video.className = "uploaded-video";
      
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          video.src = e.target.result.toString();
        }
      };
      reader.readAsDataURL(file);
      
      videoContainer.appendChild(video);
      
      range.deleteContents();
      range.insertNode(videoContainer);
      
      // Add a paragraph after the video
      const p = document.createElement('p');
      p.innerHTML = '<br>';
      if (videoContainer.nextSibling) {
        videoContainer.parentNode?.insertBefore(p, videoContainer.nextSibling);
      } else {
        videoContainer.parentNode?.appendChild(p);
      }
      
      toast({
        title: "Video Added",
        description: "Video has been added to your document.",
      });
    }
  };

  const insertDocument = (fileName: string, fileType: string, fileSize: string) => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && contentRef.current) {
      const range = selection.getRangeAt(0);
      
      const docContainer = document.createElement('div');
      docContainer.className = 'media-element';
      
      docContainer.innerHTML = `
        <div class="document-preview">
          <div class="document-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
          </div>
          <div class="document-info">
            <div class="document-title">${fileName}</div>
            <div class="document-meta">${fileType} Document • ${fileSize}</div>
          </div>
        </div>
      `;
      
      range.deleteContents();
      range.insertNode(docContainer);
      
      // Add a paragraph after the document
      const p = document.createElement('p');
      p.innerHTML = '<br>';
      if (docContainer.nextSibling) {
        docContainer.parentNode?.insertBefore(p, docContainer.nextSibling);
      } else {
        docContainer.parentNode?.appendChild(p);
      }
      
      toast({
        title: "Document Added",
        description: `${fileName} has been added to your document.`,
      });
    }
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
    <div className={`editor-container ${editorClassName}`} style={{ height }}>
      {floatingToolbar ? (
        <div 
          ref={toolbarRef}
          className={`floating-toolbar-container animate-in ${isMinimized ? 'minimized' : ''} ${toolbarClassName}`}
          style={{ 
            left: `${toolbarPosition.x}px`,
            top: `${toolbarPosition.y}px`
          }}
        >
          <div 
            className="drag-handle" 
            ref={dragHandleRef}
            onMouseDown={handleDragStart}
            onTouchStart={(e) => {
              const touch = e.touches[0];
              const target = e.currentTarget;
              const rect = target.getBoundingClientRect();
              setIsDragging(true);
              setDragOffset({
                x: touch.clientX - rect.left,
                y: touch.clientY - rect.top
              });
            }}
          >
            <GripVertical size={16} />
            <div className="drag-handle-text">
              {isMinimized ? "Editor" : "Drag to move toolbar"}
            </div>
            <div className="toolbar-controls">
              <button 
                className="minimize-btn" 
                onClick={toggleMinimize} 
                title={isMinimized ? "Expand" : "Minimize"}
              >
                {isMinimized ? <Plus size={16} /> : <Minimize size={16} />}
              </button>
            </div>
          </div>
          
          {!isMinimized && isMobile && (
            <div className="mobile-toolbar-tabs">
              <div 
                className={`mobile-tab ${activeTab === 'format' ? 'active' : ''}`}
                onClick={() => setActiveTab('format')}
              >
                Format
              </div>
              <div 
                className={`mobile-tab ${activeTab === 'insert' ? 'active' : ''}`}
                onClick={() => setActiveTab('insert')}
              >
                Insert
              </div>
              <div 
                className={`mobile-tab ${activeTab === 'style' ? 'active' : ''}`}
                onClick={() => setActiveTab('style')}
              >
                Style
              </div>
              <div 
                className={`mobile-tab ${activeTab === 'paragraph' ? 'active' : ''}`}
                onClick={() => setActiveTab('paragraph')}
              >
                Paragraph
              </div>
            </div>
          )}
          
          {!isMinimized && (
            <Toolbar 
              execCommand={execCommand}
              editorState={editorState}
              onColorChange={handleColorChange}
              onHighlightChange={handleHighlightChange}
              onFontSizeChange={handleFontSizeChange}
              onEmojiSelect={handleEmojiSelect}
              toggleDropdown={toggleDropdown}
              insertCodeBlock={insertCodeBlock}
              insertInlineCode={insertInlineCode}
              insertEquation={insertEquation}
              handleAttachment={handleAttachment}
              insertDivider={insertDivider}
              onParagraphStyle={handleParagraphStyle}
              onTextStyle={handleTextStyle}
              isMobile={isMobile}
              activeTab={activeTab}
            />
          )}
        </div>
      ) : (
        <div className={`fixed-toolbar-container ${toolbarClassName}`}>
          <Toolbar 
            execCommand={execCommand}
            editorState={editorState}
            onColorChange={handleColorChange}
            onHighlightChange={handleHighlightChange}
            onFontSizeChange={handleFontSizeChange}
            onEmojiSelect={handleEmojiSelect}
            toggleDropdown={toggleDropdown}
            insertCodeBlock={insertCodeBlock}
            insertInlineCode={insertInlineCode}
            insertEquation={insertEquation}
            handleAttachment={handleAttachment}
            insertDivider={insertDivider}
            onParagraphStyle={handleParagraphStyle}
            onTextStyle={handleTextStyle}
            isMobile={isMobile}
            activeTab={activeTab}
          />
        </div>
      )}
      
      <ContentArea 
        ref={contentRef} 
        onPaste={(e) => {
          // Let the component handle the paste event
          const items = e.clipboardData?.items;
          if (!items) return;
          
          for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
              e.preventDefault();
              const file = items[i].getAsFile();
              if (file) {
                handleMediaUpload(file);
                return;
              }
            }
          }
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          
          if (contentRef.current) {
            contentRef.current.classList.remove('drag-over');
          }
          
          const files = e.dataTransfer?.files;
          if (!files || files.length === 0) return;
          
          const file = files[0];
          handleMediaUpload(file);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (contentRef.current) {
            contentRef.current.classList.add('drag-over');
          }
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (contentRef.current) {
            contentRef.current.classList.remove('drag-over');
          }
        }}
      />
    </div>
  );
};

export default RichTextEditor;
