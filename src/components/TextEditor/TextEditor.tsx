
import React, { useState, useRef, useEffect } from 'react';
import { Toolbar } from './Toolbar';
import { ContentArea } from './ContentArea';
import './TextEditor.css';
import { GripVertical, Minimize, Plus } from 'lucide-react';
import { useIsMobile } from '../../hooks/use-mobile';
import { toast } from '../../hooks/use-toast';
import { MediaToolbar, MediaEditPanel } from './MediaToolbar';

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
      
      selection.removeAllRanges();
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
        const fileType = file.type.split('/')[0]; // image, video, application, etc.
        const fileSubType = file.type.split('/')[1]; // jpeg, png, mp4, pdf, etc.
        const fileName = file.name;
        const fileSize = (file.size / 1024).toFixed(1) + ' KB';
        
        // Insert the appropriate media element based on the file type
        if (fileType === 'image') {
          insertMediaElement('image', file);
        } else if (fileType === 'video') {
          insertMediaElement('video', file);
        } else {
          insertDocumentElement(fileName, fileSubType.toUpperCase(), fileSize, file);
        }
      }
      
      document.body.removeChild(fileInput);
    });
    
    fileInput.click();
    closeAllDropdowns();
  };

  const insertMediaElement = (type: 'image' | 'video', file: File) => {
    if (!contentRef.current) return;
    
    const mediaElement = document.createElement('div');
    mediaElement.className = 'media-element media-align-center animate-in';
    
    const mediaContainer = document.createElement('div');
    mediaContainer.className = 'media-container';
    
    // Create the toolbar
    const toolbarDiv = document.createElement('div');
    toolbarDiv.className = 'media-toolbar';
    toolbarDiv.innerHTML = `
      <button class="media-toolbar-btn" title="Edit">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
      </button>
      <button class="media-toolbar-btn" title="Align (center)">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="10" x2="6" y2="10"/>
          <line x1="21" y1="6" x2="3" y2="6"/>
          <line x1="21" y1="14" x2="3" y2="14"/>
          <line x1="18" y1="18" x2="6" y2="18"/>
        </svg>
      </button>
      <button class="media-toolbar-btn" title="Delete">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          <line x1="10" y1="11" x2="10" y2="17"/>
          <line x1="14" y1="11" x2="14" y2="17"/>
        </svg>
      </button>
    `;
    
    // Create the content area with loading indicator
    const contentDiv = document.createElement('div');
    contentDiv.className = 'media-content';
    contentDiv.innerHTML = `
      <div class="loading-indicator">
        <div class="spinner"></div>
      </div>
    `;
    
    // Create the caption area
    const captionDiv = document.createElement('div');
    captionDiv.className = 'media-caption';
    captionDiv.contentEditable = 'true';
    captionDiv.textContent = `${type === 'image' ? 'Image' : 'Video'} caption - click to edit`;
    
    // Add the edit panel for images/videos
    const editPanel = document.createElement('div');
    editPanel.className = 'media-edit-panel';
    editPanel.innerHTML = `
      <h3>Edit ${type === 'image' ? 'Image' : 'Video'}</h3>
      <div class="cropper-container">
        <div class="crop-overlay" style="width: 80%; height: 80%; top: 10%; left: 10%;">
          <div class="resize-handle resize-handle-nw"></div>
          <div class="resize-handle resize-handle-ne"></div>
          <div class="resize-handle resize-handle-sw"></div>
          <div class="resize-handle resize-handle-se"></div>
        </div>
      </div>
      <div class="edit-controls">
        <button class="edit-btn" title="Crop">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 2v14a2 2 0 0 0 2 2h14"/>
            <path d="M18 22V8a2 2 0 0 0-2-2H2"/>
          </svg>
          Crop
        </button>
        <button class="edit-btn" title="Resize">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 3h6v6"/>
            <path d="M9 21H3v-6"/>
            <path d="M21 3l-7 7"/>
            <path d="M3 21l7-7"/>
          </svg>
          Resize
        </button>
        <button class="edit-btn edit-btn-primary" title="Apply">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Apply
        </button>
        <button class="edit-btn" title="Cancel">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
          Cancel
        </button>
      </div>
      <div class="alignment-controls">
        <button class="alignment-btn" title="Align Left">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="17" y1="10" x2="3" y2="10"/>
            <line x1="21" y1="6" x2="3" y2="6"/>
            <line x1="21" y1="14" x2="3" y2="14"/>
            <line x1="17" y1="18" x2="3" y2="18"/>
          </svg>
        </button>
        <button class="alignment-btn active" title="Align Center">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="10" x2="6" y2="10"/>
            <line x1="21" y1="6" x2="3" y2="6"/>
            <line x1="21" y1="14" x2="3" y2="14"/>
            <line x1="18" y1="18" x2="6" y2="18"/>
          </svg>
        </button>
        <button class="alignment-btn" title="Align Right">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="21" y1="10" x2="7" y2="10"/>
            <line x1="21" y1="6" x2="3" y2="6"/>
            <line x1="21" y1="14" x2="3" y2="14"/>
            <line x1="21" y1="18" x2="7" y2="18"/>
          </svg>
        </button>
      </div>
    `;
    
    // Assemble the elements
    mediaContainer.appendChild(toolbarDiv);
    mediaContainer.appendChild(contentDiv);
    mediaContainer.appendChild(captionDiv);
    mediaElement.appendChild(mediaContainer);
    
    // Insert the element at the current cursor position
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(mediaElement);
      
      // Add a paragraph after the media
      const p = document.createElement('p');
      p.innerHTML = '<br>';
      if (mediaElement.nextSibling) {
        mediaElement.parentNode?.insertBefore(p, mediaElement.nextSibling);
      } else {
        mediaElement.parentNode?.appendChild(p);
      }
    } else {
      contentRef.current.appendChild(mediaElement);
    }
    
    // Show a toast notification that the upload is in progress
    toast({
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Uploading`,
      description: "Please wait while your media is being processed...",
    });
    
    // Simulate loading and then display the image/video
    setTimeout(() => {
      const mediaContent = contentDiv;
      
      if (type === 'image') {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = document.createElement('img');
          img.src = e.target?.result as string;
          img.alt = "Uploaded image";
          img.className = "uploaded-image";
          
          mediaContent.innerHTML = '';
          mediaContent.appendChild(img);
          mediaContent.appendChild(editPanel);
          
          // Initialize event listeners on the new media element
          initializeMediaElement(mediaElement);
          
          toast({
            title: "Image Uploaded Successfully",
            description: "Your image has been added to the document.",
          });
        };
        reader.readAsDataURL(file);
      } else if (type === 'video') {
        const video = document.createElement('video');
        video.controls = true;
        video.className = "uploaded-video";
        
        const reader = new FileReader();
        reader.onload = (e) => {
          video.src = e.target?.result as string;
          
          mediaContent.innerHTML = '';
          mediaContent.appendChild(video);
          mediaContent.appendChild(editPanel);
          
          // Initialize event listeners on the new media element
          initializeMediaElement(mediaElement);
          
          toast({
            title: "Video Uploaded Successfully",
            description: "Your video has been added to the document.",
          });
        };
        reader.readAsDataURL(file);
      }
    }, 1000); // Simulate 1 second loading time
  };

  const insertDocumentElement = (fileName: string, fileType: string, fileSize: string, file: File) => {
    if (!contentRef.current) return;
    
    const mediaElement = document.createElement('div');
    mediaElement.className = 'media-element animate-in';
    
    const mediaContainer = document.createElement('div');
    mediaContainer.className = 'media-container';
    
    // Create the toolbar
    const toolbarDiv = document.createElement('div');
    toolbarDiv.className = 'media-toolbar';
    toolbarDiv.innerHTML = `
      <button class="media-toolbar-btn" title="Download">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
      </button>
      <button class="media-toolbar-btn" title="Delete">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          <line x1="10" y1="11" x2="10" y2="17"/>
          <line x1="14" y1="11" x2="14" y2="17"/>
        </svg>
      </button>
    `;
    
    // Create the content area with loading indicator
    const contentDiv = document.createElement('div');
    contentDiv.className = 'media-content';
    contentDiv.innerHTML = `
      <div class="loading-indicator">
        <div class="spinner"></div>
      </div>
    `;
    
    // Assemble the elements
    mediaContainer.appendChild(toolbarDiv);
    mediaContainer.appendChild(contentDiv);
    mediaElement.appendChild(mediaContainer);
    
    // Insert the element at the current cursor position
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(mediaElement);
      
      // Add a paragraph after the media
      const p = document.createElement('p');
      p.innerHTML = '<br>';
      if (mediaElement.nextSibling) {
        mediaElement.parentNode?.insertBefore(p, mediaElement.nextSibling);
      } else {
        mediaElement.parentNode?.appendChild(p);
      }
    } else {
      contentRef.current.appendChild(mediaElement);
    }
    
    // Show a toast notification that the upload is in progress
    toast({
      title: "Document Uploading",
      description: "Please wait while your document is being processed...",
    });
    
    // Simulate loading and then display the document preview
    setTimeout(() => {
      contentDiv.innerHTML = `
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
      
      // Initialize event listeners on the new media element
      initializeMediaElement(mediaElement);
      
      toast({
        title: "Document Uploaded Successfully",
        description: "Your document has been added to the editor.",
      });
    }, 1000); // Simulate 1 second loading time
  };

  const initializeMediaElement = (element: HTMLElement) => {
    // Get elements
    const editButton = element.querySelector('.media-toolbar-btn[title^="Edit"]');
    const alignButton = element.querySelector('.media-toolbar-btn[title^="Align"]');
    const deleteButton = element.querySelector('.media-toolbar-btn[title="Delete"]');
    const cancelButton = element.querySelector('.edit-btn[title="Cancel"]');
    const applyButton = element.querySelector('.edit-btn-primary');
    
    // Handle edit button
    if (editButton) {
      editButton.addEventListener('click', () => {
        const editPanel = element.querySelector('.media-edit-panel');
        if (editPanel) {
          editPanel.classList.add('active');
        }
      });
    }
    
    // Handle cancel button in edit panel
    if (cancelButton) {
      cancelButton.addEventListener('click', () => {
        const editPanel = element.querySelector('.media-edit-panel');
        if (editPanel) {
          editPanel.classList.remove('active');
        }
      });
    }
    
    // Handle apply button in edit panel
    if (applyButton) {
      applyButton.addEventListener('click', () => {
        const editPanel = element.querySelector('.media-edit-panel');
        if (editPanel) {
          editPanel.classList.remove('active');
          toast({
            title: "Changes Applied",
            description: "Your media has been updated successfully.",
          });
        }
      });
    }
    
    // Handle alignment button
    if (alignButton) {
      alignButton.addEventListener('click', () => {
        // Cycle through alignment classes
        if (element.classList.contains('media-align-left')) {
          element.classList.remove('media-align-left');
          element.classList.add('media-align-center');
          alignButton.setAttribute('title', 'Align (center)');
        } else if (element.classList.contains('media-align-center')) {
          element.classList.remove('media-align-center');
          element.classList.add('media-align-right');
          alignButton.setAttribute('title', 'Align (right)');
        } else if (element.classList.contains('media-align-right')) {
          element.classList.remove('media-align-right');
          element.classList.add('media-align-left');
          alignButton.setAttribute('title', 'Align (left)');
        } else {
          element.classList.add('media-align-center');
          alignButton.setAttribute('title', 'Align (center)');
        }
      });
    }
    
    // Handle delete button
    if (deleteButton) {
      deleteButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to delete this media?')) {
          element.remove();
          toast({
            title: "Media Deleted",
            description: "The media has been removed from the document.",
          });
        }
      });
    }
    
    // Handle alignment buttons in edit panel
    const alignmentButtons = element.querySelectorAll('.alignment-btn');
    if (alignmentButtons.length > 0) {
      alignmentButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          // Remove all alignment classes
          element.classList.remove('media-align-left', 'media-align-center', 'media-align-right');
          
          // Add the selected alignment class
          const title = btn.getAttribute('title');
          if (title?.includes('Left')) {
            element.classList.add('media-align-left');
          } else if (title?.includes('Center')) {
            element.classList.add('media-align-center');
          } else if (title?.includes('Right')) {
            element.classList.add('media-align-right');
          }
          
          // Update active state on buttons
          alignmentButtons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
        });
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
    <div className="editor-container">
      <div 
        ref={toolbarRef}
        className={`floating-toolbar-container animate-in ${isMinimized ? 'minimized' : ''}`}
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
      
      <ContentArea ref={contentRef} />
    </div>
  );
};

export default TextEditor;
