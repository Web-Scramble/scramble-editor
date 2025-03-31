
import React, { forwardRef, useEffect } from 'react';
import { toast } from '../../hooks/use-toast';
import { FileImage, FileVideo } from 'lucide-react';

interface ContentAreaProps {
  onPaste?: (e: ClipboardEvent) => void;
  onDrop?: (e: DragEvent) => void;
  onDragOver?: (e: DragEvent) => void;
  onDragLeave?: (e: DragEvent) => void;
}

export const ContentArea = forwardRef<HTMLDivElement, ContentAreaProps>((props, ref) => {
  const { onPaste, onDrop, onDragOver, onDragLeave } = props;
  
  useEffect(() => {
    const contentRef = ref as React.RefObject<HTMLDivElement>;
    const contentElement = contentRef?.current;
    
    if (!contentElement) return;
    
    // Handle paste events
    const handlePaste = (e: ClipboardEvent) => {
      if (onPaste) {
        onPaste(e);
        return;
      }
      
      // Default paste handler
      const items = e.clipboardData?.items;
      if (!items) return;
      
      let hasHandledItem = false;
      
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          e.preventDefault();
          const file = items[i].getAsFile();
          if (file) {
            handleMediaInsertion('image', file);
            hasHandledItem = true;
            break;
          }
        }
      }
      
      if (!hasHandledItem) {
        // Let the browser handle regular text pastes
        return;
      }
    };
    
    // Handle drop events
    const handleDrop = (e: DragEvent) => {
      if (onDrop) {
        onDrop(e);
        return;
      }
      
      e.preventDefault();
      e.stopPropagation();
      
      contentElement.classList.remove('drag-over');
      
      const files = e.dataTransfer?.files;
      if (!files || files.length === 0) return;
      
      const file = files[0];
      const fileType = file.type.split('/')[0];
      
      if (fileType === 'image') {
        handleMediaInsertion('image', file);
      } else if (fileType === 'video') {
        handleMediaInsertion('video', file);
      } else {
        const fileSubType = file.type.split('/')[1];
        const fileName = file.name;
        const fileSize = (file.size / 1024).toFixed(1) + ' KB';
        handleDocumentInsertion(fileName, fileSubType.toUpperCase(), fileSize, file);
      }
    };
    
    // Handle drag over
    const handleDragOver = (e: DragEvent) => {
      if (onDragOver) {
        onDragOver(e);
        return;
      }
      
      e.preventDefault();
      e.stopPropagation();
      contentElement.classList.add('drag-over');
      
      // Update cursor based on content
      const items = e.dataTransfer?.items;
      if (items && items.length > 0) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
            e.dataTransfer!.dropEffect = 'copy';
            break;
          }
        }
      }
    };
    
    // Handle drag leave
    const handleDragLeave = (e: DragEvent) => {
      if (onDragLeave) {
        onDragLeave(e);
        return;
      }
      
      e.preventDefault();
      e.stopPropagation();
      contentElement.classList.remove('drag-over');
    };
    
    // Function to insert media
    const handleMediaInsertion = (type: 'image' | 'video', file: File) => {
      // Create the media element
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
        contentElement.appendChild(mediaElement);
      }
      
      // Show a toast notification that the upload is in progress
      toast({
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} Uploading`,
        description: "Please wait while your media is being processed...",
      });
      
      // Load and display the image/video
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
      }, 500);
    };
    
    // Function to insert documents
    const handleDocumentInsertion = (fileName: string, fileType: string, fileSize: string, file: File) => {
      // Create the document element
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
      
      // Create the content area with document info
      const contentDiv = document.createElement('div');
      contentDiv.className = 'media-content';
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
        contentElement.appendChild(mediaElement);
      }
      
      // Initialize event listeners on the new media element
      initializeMediaElement(mediaElement);
      
      toast({
        title: "Document Added",
        description: `${fileName} has been added to your document.`,
      });
    };
    
    // Initialize media element with event listeners
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
          const editPanel = element.querySelector('.media-edit-panel') as HTMLElement;
          if (editPanel) {
            editPanel.classList.add('active');
            
            // Setup crop overlay drag functionality
            const cropOverlay = editPanel.querySelector('.crop-overlay') as HTMLElement;
            if (cropOverlay) {
              setupCropOverlayDrag(cropOverlay);
              setupResizeHandles(cropOverlay);
            }
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
    
    // Setup crop overlay drag functionality
    const setupCropOverlayDrag = (overlay: HTMLElement) => {
      let isDragging = false;
      let startX = 0;
      let startY = 0;
      
      overlay.addEventListener('mousedown', (e) => {
        // Only start drag if clicking directly on the overlay (not on resize handles)
        if (e.target === overlay) {
          isDragging = true;
          startX = e.clientX - overlay.offsetLeft;
          startY = e.clientY - overlay.offsetTop;
          overlay.style.cursor = 'grabbing';
        }
      });
      
      document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        const cropperContainer = overlay.parentElement;
        if (!cropperContainer) return;
        
        const containerRect = cropperContainer.getBoundingClientRect();
        
        // Calculate new position within boundaries
        let newLeft = ((e.clientX - startX) / containerRect.width) * 100;
        let newTop = ((e.clientY - startY) / containerRect.height) * 100;
        
        // Get current width and height as percentages
        const currentWidth = parseFloat(overlay.style.width);
        const currentHeight = parseFloat(overlay.style.height);
        
        // Ensure the overlay stays within the container bounds
        newLeft = Math.max(0, Math.min(newLeft, 100 - currentWidth));
        newTop = Math.max(0, Math.min(newTop, 100 - currentHeight));
        
        overlay.style.left = `${newLeft}%`;
        overlay.style.top = `${newTop}%`;
      });
      
      document.addEventListener('mouseup', () => {
        if (isDragging) {
          isDragging = false;
          overlay.style.cursor = 'move';
        }
      });
      
      // Set initial cursor style
      overlay.style.cursor = 'move';
    };
    
    // Setup resize handles functionality
    const setupResizeHandles = (overlay: HTMLElement) => {
      const handles = overlay.querySelectorAll('.resize-handle');
      
      handles.forEach(handle => {
        const handleEl = handle as HTMLElement;
        
        handleEl.addEventListener('mousedown', (e) => {
          e.stopPropagation(); // Prevent overlay drag when resizing
          
          const handleClass = handleEl.className;
          const isNorth = handleClass.includes('n');
          const isSouth = handleClass.includes('s');
          const isWest = handleClass.includes('w');
          const isEast = handleClass.includes('e');
          
          const startX = e.clientX;
          const startY = e.clientY;
          
          const cropperContainer = overlay.parentElement;
          if (!cropperContainer) return;
          
          const containerRect = cropperContainer.getBoundingClientRect();
          
          // Initial values in pixels
          const startLeft = parseFloat(overlay.style.left) / 100 * containerRect.width;
          const startTop = parseFloat(overlay.style.top) / 100 * containerRect.height;
          const startWidth = parseFloat(overlay.style.width) / 100 * containerRect.width;
          const startHeight = parseFloat(overlay.style.height) / 100 * containerRect.height;
          
          const onMouseMove = (moveEvent: MouseEvent) => {
            const deltaX = moveEvent.clientX - startX;
            const deltaY = moveEvent.clientY - startY;
            
            let newLeft = startLeft;
            let newTop = startTop;
            let newWidth = startWidth;
            let newHeight = startHeight;
            
            // Handle resizing based on which handle was grabbed
            if (isEast) {
              newWidth = Math.max(50, startWidth + deltaX);
              newWidth = Math.min(newWidth, containerRect.width - newLeft);
            }
            
            if (isWest) {
              const possibleWidth = Math.max(50, startWidth - deltaX);
              if (startLeft + deltaX >= 0 && possibleWidth + startLeft + deltaX <= containerRect.width) {
                newWidth = possibleWidth;
                newLeft = startLeft + deltaX;
              }
            }
            
            if (isSouth) {
              newHeight = Math.max(50, startHeight + deltaY);
              newHeight = Math.min(newHeight, containerRect.height - newTop);
            }
            
            if (isNorth) {
              const possibleHeight = Math.max(50, startHeight - deltaY);
              if (startTop + deltaY >= 0 && possibleHeight + startTop + deltaY <= containerRect.height) {
                newHeight = possibleHeight;
                newTop = startTop + deltaY;
              }
            }
            
            // Convert back to percentages
            overlay.style.left = `${(newLeft / containerRect.width) * 100}%`;
            overlay.style.top = `${(newTop / containerRect.height) * 100}%`;
            overlay.style.width = `${(newWidth / containerRect.width) * 100}%`;
            overlay.style.height = `${(newHeight / containerRect.height) * 100}%`;
          };
          
          const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
          };
          
          document.addEventListener('mousemove', onMouseMove);
          document.addEventListener('mouseup', onMouseUp);
        });
      });
    };
    
    // Add event listeners
    contentElement.addEventListener('paste', handlePaste);
    contentElement.addEventListener('dragover', handleDragOver);
    contentElement.addEventListener('dragleave', handleDragLeave);
    contentElement.addEventListener('drop', handleDrop);
    
    // Cleanup function
    return () => {
      contentElement.removeEventListener('paste', handlePaste);
      contentElement.removeEventListener('dragover', handleDragOver);
      contentElement.removeEventListener('dragleave', handleDragLeave);
      contentElement.removeEventListener('drop', handleDrop);
    };
  }, [ref, onPaste, onDrop, onDragOver, onDragLeave]);
  
  return (
    <div className="content-area">
      <div className="media-dropzone-indicator">
        <div className="dropzone-message">
          <FileImage size={32} className="mr-2" />
          <span>Drop media here</span>
          <FileVideo size={32} className="ml-2" />
        </div>
      </div>
      <div
        ref={ref}
        className="editor-content"
        contentEditable="true"
        suppressContentEditableWarning={true}
        data-placeholder="Type or drop content here..."
      >
        <p><br /></p>
      </div>
    </div>
  );
});

ContentArea.displayName = 'ContentArea';
