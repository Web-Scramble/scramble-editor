import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { MediaToolbar, MediaEditPanel } from './MediaToolbar';
import { useToast } from '../../hooks/use-toast';

interface ContentAreaProps {
  // Any props can be added here if needed
}

interface ResizeState {
  isResizing: boolean;
  element: HTMLElement | null;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
  handle: string | null;
}

export const ContentArea = forwardRef<HTMLDivElement, ContentAreaProps>(
  (props, ref) => {
    const contentRef = useRef<HTMLDivElement | null>(null);
    const { toast } = useToast();
    const [resizeState, setResizeState] = useState<ResizeState>({
      isResizing: false,
      element: null,
      startX: 0,
      startY: 0,
      startWidth: 0,
      startHeight: 0,
      handle: null
    });
    
    useEffect(() => {
      if (contentRef.current) {
        // Initialize with some content that demonstrates the rich text features
        contentRef.current.innerHTML = `
          <h1>Untitled</h1>
          
          <p>This is a <strong>rich text editor</strong> with support for <em>various</em> <u>formatting</u> options.</p>
          
          <p>You can create lists:</p>
          <ul>
            <li>Bullet point 1</li>
            <li>Bullet point 2</li>
            <li>Bullet point 3</li>
          </ul>
          
          <p>Or numbered lists:</p>
          <ol>
            <li>First item</li>
            <li>Second item</li>
            <li>Third item</li>
          </ol>
          
          <p style="color: #0066cc;">You can change text color</p>
          <p><span style="background-color: #FFFF00;">And highlight text</span> for emphasis.</p>
          
          <div class="code-block">// Example code block
function calculateQuadratic(a, b, c) {
    const discriminant = b*b - 4*a*c;
    if (discriminant < 0) return "No real solutions";
    
    const x1 = (-b + Math.sqrt(discriminant)) / (2*a);
    const x2 = (-b - Math.sqrt(discriminant)) / (2*a);
    return [x1, x2];
}</div>
          
          <p>You can add LaTeX equations like this:</p>
          
          <div class="equation equation-rendered">$\\int_{a}^{b} f(x) \\, dx$</div>
          
          <p>Double-click the equation to edit it in LaTeX format.</p>
          
          <hr class="editor-divider">
          
          <p>Use the toolbar above to format your text, add code blocks, equations, and more!</p>
        `;
        
        // Setup event listeners for equations and media elements
        setupEquationHandlers();
        setupMediaElementHandlers();
        
        // Setup global mouse move and up handlers for resize functionality
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        
        // Add drag and drop event listeners
        setupDragAndDropHandlers();
        
        // Add paste event listener
        document.addEventListener('paste', handlePaste);
        
        return () => {
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
          document.removeEventListener('paste', handlePaste);
        };
      }
    }, []);
    
    const setupDragAndDropHandlers = () => {
      if (!contentRef.current) return;
      
      const element = contentRef.current;
      
      // Prevent default behavior to allow drop
      element.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        element.classList.add('drag-over');
      });
      
      element.addEventListener('dragleave', () => {
        element.classList.remove('drag-over');
      });
      
      element.addEventListener('drop', handleDrop);
    };
    
    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (!contentRef.current) return;
      contentRef.current.classList.remove('drag-over');
      
      // Handle dropped files
      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        Array.from(e.dataTransfer.files).forEach(file => {
          processDroppedFile(file, e);
        });
      }
    };
    
    const processDroppedFile = (file: File, event: DragEvent) => {
      const fileType = file.type.split('/')[0]; // image, video, application, etc.
      const fileSubType = file.type.split('/')[1]; // jpeg, png, mp4, pdf, etc.
      const fileName = file.name;
      const fileSize = (file.size / 1024).toFixed(1) + ' KB';
      
      // Insert at the drop position
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        selection.deleteAllRanges();
      }
      
      // Create a range at the drop position
      const range = document.caretRangeFromPoint(event.clientX, event.clientY);
      if (range) {
        // Insert the appropriate media element based on the file type
        if (fileType === 'image') {
          insertMediaElement('image', file, range);
        } else if (fileType === 'video') {
          insertMediaElement('video', file, range);
        } else {
          insertDocumentElement(fileName, fileSubType.toUpperCase(), fileSize, file, range);
        }
      } else {
        // Fallback to the end of the content if range couldn't be determined
        if (fileType === 'image') {
          insertMediaElement('image', file);
        } else if (fileType === 'video') {
          insertMediaElement('video', file);
        } else {
          insertDocumentElement(fileName, fileSubType.toUpperCase(), fileSize, file);
        }
      }
    };
    
    const handlePaste = (e: ClipboardEvent) => {
      // Handle pasted files/images
      const clipboardItems = e.clipboardData?.items;
      
      if (clipboardItems) {
        let hasMedia = false;
        
        for (let i = 0; i < clipboardItems.length; i++) {
          const item = clipboardItems[i];
          
          // Check if the pasted content is an image
          if (item.type.indexOf('image') !== -1) {
            e.preventDefault(); // Prevent the default paste action
            hasMedia = true;
            
            const file = item.getAsFile();
            if (file) {
              // Get the current cursor position
              const selection = window.getSelection();
              if (selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                
                // Insert the image at the cursor position
                insertMediaElement('image', file, range);
                
                toast({
                  title: "Image Pasted",
                  description: "Image has been inserted at the cursor position."
                });
              }
            }
          }
        }
        
        // If we processed media, don't need to continue with standard paste
        if (hasMedia) return;
      }
      
      // Let the default paste behavior happen for text
    };
    
    const insertMediaElement = (type: 'image' | 'video', file: File, range?: Range) => {
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
              <path d="M15 3h6v6"/>
              <path d="M9 21H3v-6"/>
              <path d="M21 3l-7 7"/>
              <path d="M3 21l7-7"/>
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
      
      // Insert the element at the specified range or current cursor position
      if (range) {
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
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const selRange = selection.getRangeAt(0);
          selRange.deleteContents();
          selRange.insertNode(mediaElement);
          
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
      }
      
      // Show a toast notification that the upload is in progress
      toast({
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} Uploading`,
        description: "Please wait while your media is being processed...",
      });
      
      // Process the file and display it
      const reader = new FileReader();
      reader.onload = (e) => {
        const mediaContent = contentDiv;
        
        if (type === 'image') {
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
        } else if (type === 'video') {
          const video = document.createElement('video');
          video.controls = true;
          video.className = "uploaded-video";
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
        }
      };
      reader.readAsDataURL(file);
    };

    const insertDocumentElement = (fileName: string, fileType: string, fileSize: string, file: File, range?: Range) => {
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
      
      // Insert the element at the specified range or current cursor position
      if (range) {
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
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const selRange = selection.getRangeAt(0);
          selRange.deleteContents();
          selRange.insertNode(mediaElement);
          
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
    
    const setupEquationHandlers = () => {
      if (!contentRef.current) return;
      
      // Find all equations in the content
      const equations = contentRef.current.querySelectorAll('.equation');
      
      equations.forEach(equation => {
        // Double click to edit
        equation.addEventListener('dblclick', function() {
          // Place cursor inside the equation for easy editing
          const range = document.createRange();
          range.selectNodeContents(equation);
          const selection = window.getSelection();
          if (selection) {
            selection.removeAllRanges();
            selection.addRange(range);
          }
          equation.classList.remove('equation-rendered');
        });
        
        // Blur event to render the equation
        equation.addEventListener('blur', function() {
          equation.classList.add('equation-rendered');
        });
      });
    };

    const setupMediaElementHandlers = () => {
      if (!contentRef.current) return;
      
      const mediaElements = contentRef.current.querySelectorAll('.media-element');
      
      mediaElements.forEach(element => {
        setupMediaElementEventListeners(element as HTMLElement);
      });
    };
    
    const initializeResizeHandlers = (cropOverlay: HTMLElement) => {
      const resizeHandles = cropOverlay.querySelectorAll('.resize-handle');
      
      resizeHandles.forEach(handle => {
        handle.addEventListener('mousedown', (e: MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
          
          const mediaElement = (e.target as HTMLElement).closest('.media-element') as HTMLElement;
          if (!mediaElement) return;
          
          const mediaContent = mediaElement.querySelector('.media-content') as HTMLElement;
          if (!mediaContent) return;
          
          // Get handle position (nw, ne, sw, se)
          const handleClass = Array.from((e.target as HTMLElement).classList).find(cls => cls.startsWith('resize-handle-'));
          const handle = handleClass ? handleClass.replace('resize-handle-', '') : null;
          
          setResizeState({
            isResizing: true,
            element: mediaElement,
            startX: e.clientX,
            startY: e.clientY,
            startWidth: mediaContent.offsetWidth,
            startHeight: mediaContent.offsetHeight,
            handle
          });
        });
      });
    };
    
    const setupMediaElementEventListeners = (element: HTMLElement) => {
      // Handle edit button click
      element.addEventListener('click', (e) => {
        const editButton = (e.target as HTMLElement).closest('.media-toolbar-btn[title^="Edit"]');
        if (editButton) {
          e.preventDefault();
          e.stopPropagation();
          
          const editPanel = element.querySelector('.media-edit-panel');
          if (editPanel) {
            editPanel.classList.add('active');
            
            // Initialize resize handlers on the crop overlay
            const cropOverlay = editPanel.querySelector('.crop-overlay');
            if (cropOverlay) {
              initializeResizeHandlers(cropOverlay as HTMLElement);
            }
          }
        }
      });
      
      // Handle cancel button in edit panel
      element.addEventListener('click', (e) => {
        const cancelButton = (e.target as HTMLElement).closest('.edit-btn[title="Cancel"]');
        if (cancelButton) {
          e.preventDefault();
          e.stopPropagation();
          
          const editPanel = element.querySelector('.media-edit-panel');
          if (editPanel) {
            editPanel.classList.remove('active');
          }
        }
      });
      
      // Handle apply button in edit panel
      element.addEventListener('click', (e) => {
        const applyButton = (e.target as HTMLElement).closest('.edit-btn-primary');
        if (applyButton) {
          e.preventDefault();
          e.stopPropagation();
          
          const editPanel = element.querySelector('.media-edit-panel');
          if (editPanel) {
            editPanel.classList.remove('active');
            toast({
              title: "Changes applied",
              description: "Media has been edited successfully",
            });
          }
        }
      });
      
      // Handle alignment button click
      element.addEventListener('click', (e) => {
        const alignButton = (e.target as HTMLElement).closest('.media-toolbar-btn[title^="Align"]');
        if (alignButton) {
          e.preventDefault();
          e.stopPropagation();
          
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
        }
      });
      
      // Handle delete button click
      element.addEventListener('click', (e) => {
        const deleteButton = (e.target as HTMLElement).closest('.media-toolbar-btn[title="Delete"]');
        if (deleteButton) {
          e.preventDefault();
          e.stopPropagation();
          
          if (confirm('Are you sure you want to delete this media?')) {
            element.remove();
            toast({
              title: "Media deleted",
              description: "The media has been removed from the document",
            });
          }
        }
      });
      
      // Setup alignment controls in edit panel
      element.addEventListener('click', (e) => {
        const alignmentButton = (e.target as HTMLElement).closest('.alignment-btn');
        if (alignmentButton) {
          e.preventDefault();
          e.stopPropagation();
          
          const alignmentButtons = element.querySelectorAll('.alignment-btn');
          alignmentButtons.forEach(btn => btn.classList.remove('bg-blue-100'));
          alignmentButton.classList.add('bg-blue-100');
          
          // Remove alignment classes
          element.classList.remove('media-align-left', 'media-align-center', 'media-align-right');
          
          // Add the selected alignment class
          const title = alignmentButton.getAttribute('title');
          if (title?.includes('Left')) {
            element.classList.add('media-align-left');
          } else if (title?.includes('Center')) {
            element.classList.add('media-align-center');
          } else if (title?.includes('Right')) {
            element.classList.add('media-align-right');
          }
        }
      });
      
      // Enable direct resizing of the media content
      const mediaContent = element.querySelector('.media-content');
      if (mediaContent) {
        mediaContent.addEventListener('mousedown', (e: MouseEvent) => {
          // Only start resize if we're on the edge
          const rect = mediaContent.getBoundingClientRect();
          const edgeSize = 10;
          
          if (
            e.clientX > rect.right - edgeSize || 
            e.clientX < rect.left + edgeSize || 
            e.clientY > rect.bottom - edgeSize || 
            e.clientY < rect.top + edgeSize
          ) {
            e.preventDefault();
            e.stopPropagation();
            
            let handle = '';
            if (e.clientY < rect.top + edgeSize) handle += 'n';
            if (e.clientY > rect.bottom - edgeSize) handle += 's';
            if (e.clientX < rect.left + edgeSize) handle += 'w';
            if (e.clientX > rect.right - edgeSize) handle += 'e';
            
            // Set the resize state
            setResizeState({
              isResizing: true,
              element,
              startX: e.clientX,
              startY: e.clientY,
              startWidth: (mediaContent as HTMLElement).offsetWidth,
              startHeight: (mediaContent as HTMLElement).offsetHeight,
              handle
            });
            
            // Add a resize cursor class to the body
            document.body.style.cursor = handle ? `${handle}-resize` : 'move';
          }
        });
      }
    };

    const initializeMediaElement = (element: HTMLElement) => {
      setupMediaElementEventListeners(element);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!resizeState.isResizing || !resizeState.element || !resizeState.handle) return;
      
      e.preventDefault();
      
      const mediaContent = resizeState.element.querySelector('.media-content');
      if (!mediaContent) return;
      
      const dx = e.clientX - resizeState.startX;
      const dy = e.clientY - resizeState.startY;
      
      let newWidth = resizeState.startWidth;
      let newHeight = resizeState.startHeight;
      
      // Calculate new dimensions based on which handle is being dragged
      if (resizeState.handle.includes('e')) {
        newWidth = Math.max(100, resizeState.startWidth + dx);
      }
      if (resizeState.handle.includes('w')) {
        newWidth = Math.max(100, resizeState.startWidth - dx);
      }
      
      // Apply the new dimensions
      mediaContent.style.width = `${newWidth}px`;
      if (newHeight > 0) {
        mediaContent.style.height = `${newHeight}px`;
      }
    };
    
    const handleMouseUp = () => {
      if (resizeState.isResizing) {
        setResizeState({
          isResizing: false,
          element: null,
          startX: 0,
          startY: 0,
          startWidth: 0,
          startHeight: 0,
          handle: null
        });
      }
    };
    
    const handleFocus = () => {
      if (contentRef.current) {
        contentRef.current.style.boxShadow = 'none';
        contentRef.current.style.transition = 'box-shadow 0.2s ease';
      }
    };

    const handleBlur = () => {
      if (contentRef.current) {
        contentRef.current.style.boxShadow = 'none';
      }
    };
    
    return (
      <div 
        className="content-area drop-zone" 
        contentEditable={true}
        ref={(node) => {
          // Handle both the forwardRef and our local ref
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
          contentRef.current = node;
        }}
        suppressContentEditableWarning={true}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
    );
  }
);

ContentArea.displayName = 'ContentArea';
