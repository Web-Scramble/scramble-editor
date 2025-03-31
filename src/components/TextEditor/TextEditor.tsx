import React, { useState, useRef, useEffect } from 'react';
import { Toolbar } from './Toolbar';
import { ContentArea } from './ContentArea';
import './TextEditor.css';
import { GripVertical, Minimize, Plus, Image, Video, File } from 'lucide-react';
import { useIsMobile } from '../../hooks/use-mobile';
import { toast } from "sonner";

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
      showTextStyleMenu: false
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

  const handleImageUpload = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);
    
    fileInput.addEventListener('change', function() {
      if (this.files && this.files[0]) {
        const file = this.files[0];
        const reader = new FileReader();
        
        toast.info(`Uploading image: ${file.name}...`);
        
        reader.onload = function(e) {
          const imageUrl = e.target?.result as string;
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            
            const imgContainer = document.createElement('div');
            imgContainer.className = 'media-container image-container animate-in';
            imgContainer.style.width = '100%';
            imgContainer.style.marginLeft = 'auto';
            imgContainer.style.marginRight = 'auto';
            
            const img = document.createElement('img');
            img.src = imageUrl;
            img.alt = file.name;
            img.className = 'editor-image';
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
            img.style.display = 'block';
            
            const controls = document.createElement('div');
            controls.className = 'media-controls';
            
            const smallBtn = document.createElement('button');
            smallBtn.className = 'media-control-btn';
            smallBtn.textContent = 'S';
            smallBtn.dataset.action = 'resize-small';
            smallBtn.title = 'Small size (25%)';
            
            const mediumBtn = document.createElement('button');
            mediumBtn.className = 'media-control-btn';
            mediumBtn.textContent = 'M';
            mediumBtn.dataset.action = 'resize-medium';
            mediumBtn.title = 'Medium size (50%)';
            
            const largeBtn = document.createElement('button');
            largeBtn.className = 'media-control-btn';
            largeBtn.textContent = 'L';
            largeBtn.dataset.action = 'resize-large';
            largeBtn.title = 'Large size (100%)';
            
            const leftBtn = document.createElement('button');
            leftBtn.className = 'media-control-btn';
            leftBtn.textContent = '◀';
            leftBtn.dataset.action = 'align-left';
            leftBtn.title = 'Align left';
            
            const centerBtn = document.createElement('button');
            centerBtn.className = 'media-control-btn';
            centerBtn.textContent = '■';
            centerBtn.dataset.action = 'align-center';
            centerBtn.title = 'Align center';
            
            const rightBtn = document.createElement('button');
            rightBtn.className = 'media-control-btn';
            rightBtn.textContent = '▶';
            rightBtn.dataset.action = 'align-right';
            rightBtn.title = 'Align right';
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'media-control-btn media-delete-btn';
            deleteBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>';
            deleteBtn.dataset.action = 'delete';
            deleteBtn.title = 'Delete';
            
            const editBtn = document.createElement('button');
            editBtn.className = 'media-control-btn media-edit-btn';
            editBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path><path d="m15 5 4 4"></path></svg>';
            editBtn.dataset.action = 'edit';
            editBtn.title = 'Edit';
            
            const cropBtn = document.createElement('button');
            cropBtn.className = 'media-control-btn media-crop-btn';
            cropBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2v14a2 2 0 0 0 2 2h14"></path><path d="M18 22V8a2 2 0 0 0-2-2H2"></path></svg>';
            cropBtn.dataset.action = 'crop';
            cropBtn.title = 'Crop';
            
            controls.appendChild(smallBtn);
            controls.appendChild(mediumBtn);
            controls.appendChild(largeBtn);
            controls.appendChild(leftBtn);
            controls.appendChild(centerBtn);
            controls.appendChild(rightBtn);
            controls.appendChild(deleteBtn);
            controls.appendChild(editBtn);
            controls.appendChild(cropBtn);
            
            imgContainer.appendChild(img);
            imgContainer.appendChild(controls);
            
            range.deleteContents();
            range.insertNode(imgContainer);
            
            imgContainer.classList.add('media-active');
            setTimeout(() => {
              imgContainer.classList.remove('media-active');
            }, 2000);
            
            const setupNewMediaControls = () => {
              imgContainer.addEventListener('click', function(e) {
                if ((e.target as Element).closest('.media-controls')) return;
                
                const wasActive = imgContainer.classList.contains('media-active');
                
                document.querySelectorAll('.media-container').forEach(mc => {
                  mc.classList.remove('media-active');
                });
                
                if (!wasActive) {
                  imgContainer.classList.add('media-active');
                }
              });
              
              const buttons = controls.querySelectorAll('.media-control-btn');
              buttons.forEach(btn => {
                btn.addEventListener('click', function(e) {
                  e.preventDefault();
                  e.stopPropagation();
                  
                  const action = (btn as HTMLElement).dataset.action;
                  
                  switch(action) {
                    case 'resize-small':
                      imgContainer.style.width = '25%';
                      break;
                    case 'resize-medium':
                      imgContainer.style.width = '50%';
                      break;
                    case 'resize-large':
                      imgContainer.style.width = '100%';
                      break;
                    case 'align-left':
                      imgContainer.style.marginLeft = '0';
                      imgContainer.style.marginRight = 'auto';
                      break;
                    case 'align-center':
                      imgContainer.style.marginLeft = 'auto';
                      imgContainer.style.marginRight = 'auto';
                      break;
                    case 'align-right':
                      imgContainer.style.marginLeft = 'auto';
                      imgContainer.style.marginRight = '0';
                      break;
                    case 'delete':
                      if (confirm('Are you sure you want to delete this image?')) {
                        imgContainer.remove();
                      }
                      break;
                    case 'edit':
                      alert('Edit functionality will be implemented based on your requirements. Currently supports resize and alignment.');
                      break;
                    case 'crop':
                      alert('Crop functionality will be implemented based on your specific requirements.');
                      break;
                  }
                });
              });
            };
            
            setupNewMediaControls();
            
            toast.success(`Image added successfully!`);
            
            range.setStartAfter(imgContainer);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
          }
        };
        
        reader.readAsDataURL(file);
      }
      
      document.body.removeChild(fileInput);
    });
    
    fileInput.click();
  };

  const handleVideoUpload = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'video/*';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);
    
    fileInput.addEventListener('change', function() {
      if (this.files && this.files[0]) {
        const file = this.files[0];
        const reader = new FileReader();
        
        toast.info(`Uploading video: ${file.name}...`);
        
        reader.onload = function(e) {
          const videoUrl = e.target?.result as string;
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            
            const videoContainer = document.createElement('div');
            videoContainer.className = 'media-container video-container animate-in';
            videoContainer.style.width = '100%';
            videoContainer.style.marginLeft = 'auto';
            videoContainer.style.marginRight = 'auto';
            
            const video = document.createElement('video');
            video.src = videoUrl;
            video.controls = true;
            video.autoplay = false;
            video.className = 'editor-video';
            video.style.maxWidth = '100%';
            video.style.height = 'auto';
            video.style.display = 'block';
            
            const controls = document.createElement('div');
            controls.className = 'media-controls';
            
            const smallBtn = document.createElement('button');
            smallBtn.className = 'media-control-btn';
            smallBtn.textContent = 'S';
            smallBtn.dataset.action = 'resize-small';
            smallBtn.title = 'Small size (25%)';
            
            const mediumBtn = document.createElement('button');
            mediumBtn.className = 'media-control-btn';
            mediumBtn.textContent = 'M';
            mediumBtn.dataset.action = 'resize-medium';
            mediumBtn.title = 'Medium size (50%)';
            
            const largeBtn = document.createElement('button');
            largeBtn.className = 'media-control-btn';
            largeBtn.textContent = 'L';
            largeBtn.dataset.action = 'resize-large';
            largeBtn.title = 'Large size (100%)';
            
            const leftBtn = document.createElement('button');
            leftBtn.className = 'media-control-btn';
            leftBtn.textContent = '◀';
            leftBtn.dataset.action = 'align-left';
            leftBtn.title = 'Align left';
            
            const centerBtn = document.createElement('button');
            centerBtn.className = 'media-control-btn';
            centerBtn.textContent = '■';
            centerBtn.dataset.action = 'align-center';
            centerBtn.title = 'Align center';
            
            const rightBtn = document.createElement('button');
            rightBtn.className = 'media-control-btn';
            rightBtn.textContent = '▶';
            rightBtn.dataset.action = 'align-right';
            rightBtn.title = 'Align right';
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'media-control-btn media-delete-btn';
            deleteBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>';
            deleteBtn.dataset.action = 'delete';
            deleteBtn.title = 'Delete';
            
            const editBtn = document.createElement('button');
            editBtn.className = 'media-control-btn media-edit-btn';
            editBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path><path d="m15 5 4 4"></path></svg>';
            editBtn.dataset.action = 'edit';
            editBtn.title = 'Edit';
            
            const cropBtn = document.createElement('button');
            cropBtn.className = 'media-control-btn media-crop-btn';
            cropBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2v14a2 2 0 0 0 2 2h14"></path><path d="M18 22V8a2 2 0 0 0-2-2H2"></path></svg>';
            cropBtn.dataset.action = 'crop';
            cropBtn.title = 'Crop';
            
            controls.appendChild(smallBtn);
            controls.appendChild(mediumBtn);
            controls.appendChild(largeBtn);
            controls.appendChild(leftBtn);
            controls.appendChild(centerBtn);
            controls.appendChild(rightBtn);
            controls.appendChild(deleteBtn);
            controls.appendChild(editBtn);
            controls.appendChild(cropBtn);
            
            videoContainer.appendChild(video);
            videoContainer.appendChild(controls);
            
            range.deleteContents();
            range.insertNode(videoContainer);
            
            videoContainer.classList.add('media-active');
            setTimeout(() => {
              videoContainer.classList.remove('media-active');
            }, 2000);
            
            const setupNewMediaControls = () => {
              videoContainer.addEventListener('click', function(e) {
                if ((e.target as Element).closest('.media-controls')) return;
                
                const wasActive = videoContainer.classList.contains('media-active');
                
                document.querySelectorAll('.media-container').forEach(mc => {
                  mc.classList.remove('media-active');
                });
                
                if (!wasActive) {
                  videoContainer.classList.add('media-active');
                }
              });
              
              const buttons = controls.querySelectorAll('.media-control-btn');
              buttons.forEach(btn => {
                btn.addEventListener('click', function(e) {
                  e.preventDefault();
                  e.stopPropagation();
                  
                  const action = (btn as HTMLElement).dataset.action;
                  
                  switch(action) {
                    case 'resize-small':
                      videoContainer.style.width = '25%';
                      break;
                    case 'resize-medium':
                      videoContainer.style.width = '50%';
                      break;
                    case 'resize-large':
                      videoContainer.style.width = '100%';
                      break;
                    case 'align-left':
                      videoContainer.style.marginLeft = '0';
                      videoContainer.style.marginRight = 'auto';
                      break;
                    case 'align-center':
                      videoContainer.style.marginLeft = 'auto';
                      videoContainer.style.marginRight = 'auto';
                      break;
                    case 'align-right':
                      videoContainer.style.marginLeft = 'auto';
                      videoContainer.style.marginRight = '0';
                      break;
                    case 'delete':
                      if (confirm('Are you sure you want to delete this video?')) {
                        videoContainer.remove();
                      }
                      break;
                    case 'edit':
                      alert('Edit functionality will be implemented based on your requirements. Currently supports resize and alignment.');
                      break;
                    case 'crop':
                      alert('Crop functionality will be implemented based on your specific requirements.');
                      break;
                  }
                });
              });
            };
            
            setupNewMediaControls();
            
            toast.success(`Video added successfully!`);
            
            range.setStartAfter(videoContainer);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
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
        const file = this.files[0];
        const fileName = file.name;
        const fileType = file.type;
        const fileSize = (file.size / 1024).toFixed(2) + ' KB';
        
        toast.info(`Uploading file: ${fileName}...`);
        
        const reader = new FileReader();
        
        reader.onload = function(e) {
          const fileUrl = e.target?.result as string;
          const selection = window.getSelection();
          
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            
            const attachment = document.createElement('div');
            attachment.className = 'attachment animate-in';
            
            let iconSvg = '';
            
            if (fileType.startsWith('image/')) {
              iconSvg = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
              `;
            } else if (fileType.startsWith('video/')) {
              iconSvg = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="23 7 16 12 23 17 23 7"></polygon>
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                </svg>
              `;
            } else if (fileType.startsWith('application/pdf')) {
              iconSvg = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              `;
            } else {
              iconSvg = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                  <polyline points="13 2 13 9 20 9"></polyline>
                </svg>
              `;
            }
            
            const icon = document.createElement('span');
            icon.className = 'attachment-icon';
            icon.innerHTML = iconSvg;
            
            const nameSpan = document.createElement('span');
            nameSpan.className = 'attachment-name';
            nameSpan.textContent = fileName;
            
            const sizeSpan = document.createElement('span');
            sizeSpan.className = 'attachment-size';
            sizeSpan.textContent = fileSize;
            
            const previewButton = document.createElement('button');
            previewButton.className = 'attachment-preview-btn';
            previewButton.textContent = 'Preview';
            
            previewButton.addEventListener('click', (e) => {
              e.preventDefault();
              
              const modal = document.createElement('div');
              modal.className = 'attachment-preview-modal';
              
              const modalContent = document.createElement('div');
              modalContent.className = 'attachment-preview-content';
              
              const closeBtn = document.createElement('span');
              closeBtn.className = 'attachment-preview-close';
              closeBtn.innerHTML = '&times;';
              closeBtn.addEventListener('click', () => {
                document.body.removeChild(modal);
              });
              
              modalContent.appendChild(closeBtn);
              
              if (fileType.startsWith('image/')) {
                const img = document.createElement('img');
                img.src = fileUrl;
                img.className = 'attachment-preview-image';
                modalContent.appendChild(img);
              } else if (fileType.startsWith('video/')) {
                const video = document.createElement('video');
                video.src = fileUrl;
                video.controls = true;
                video.autoplay = false;
                video.className = 'attachment-preview-video';
                modalContent.appendChild(video);
              } else if (fileType.startsWith('application/pdf')) {
                const embed = document.createElement('embed');
                embed.src = fileUrl;
                embed.type = 'application/pdf';
                embed.className = 'attachment-preview-pdf';
                modalContent.appendChild(embed);
              } else {
                const message = document.createElement('div');
                message.className = 'attachment-preview-message';
                message.textContent = `Preview not available for ${fileName}`;
                modalContent.appendChild(message);
              }
              
              modal.appendChild(modalContent);
              document.body.appendChild(modal);
            });
            
            const deleteButton = document.createElement('button');
            deleteButton.className = 'attachment-delete-btn';
            deleteButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>';
            deleteButton.title = 'Delete';
            
            deleteButton.addEventListener('click', (e) => {
              e.preventDefault();
              if (confirm('Are you sure you want to delete this attachment?')) {
                attachment.remove();
              }
            });
            
            attachment.appendChild(icon);
            attachment.appendChild(nameSpan);
            attachment.appendChild(sizeSpan);
            attachment.appendChild(previewButton);
            attachment.appendChild(deleteButton);
            
            range.deleteContents();
            range.insertNode(attachment);
            
            toast.success(`File attached successfully!`);
            
            range.setStartAfter(attachment);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
          }
        };
        
        reader.readAsDataURL(file);
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
            handleImageUpload={handleImageUpload}
            handleVideoUpload={handleVideoUpload}
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
