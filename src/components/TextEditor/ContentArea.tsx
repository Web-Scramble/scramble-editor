
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
  startLeft?: number;
  startTop?: number;
  handle: string | null;
  isPanning: boolean;
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
      handle: null,
      isPanning: false
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
        
        return () => {
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
        };
      }
    }, []);
    
    // Mouse move handler for resizing media elements
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizeState.isResizing || !resizeState.element) return;
      
      e.preventDefault();
      
      const mediaContent = resizeState.element.querySelector('.media-content') as HTMLElement;
      if (!mediaContent) return;
      
      const dx = e.clientX - resizeState.startX;
      const dy = e.clientY - resizeState.startY;
      
      // Handle panning (moving the crop overlay)
      if (resizeState.isPanning) {
        const cropOverlay = resizeState.element.querySelector('.crop-overlay') as HTMLElement;
        if (cropOverlay && resizeState.startLeft !== undefined && resizeState.startTop !== undefined) {
          const newLeft = Math.max(0, Math.min(100 - parseFloat(cropOverlay.style.width || '80'), resizeState.startLeft + dx * 100 / mediaContent.offsetWidth));
          const newTop = Math.max(0, Math.min(100 - parseFloat(cropOverlay.style.height || '80'), resizeState.startTop + dy * 100 / mediaContent.offsetHeight));
          
          cropOverlay.style.left = `${newLeft}%`;
          cropOverlay.style.top = `${newTop}%`;
        }
        return;
      }
      
      // Handle resizing
      let newWidth = resizeState.startWidth;
      let newHeight = resizeState.startHeight;
      
      // Calculate new dimensions based on which handle is being dragged
      if (resizeState.handle === null) {
        // Direct resize of the media content
        if (e.clientX > resizeState.startX) {
          newWidth = Math.max(100, resizeState.startWidth + dx);
        } else {
          newWidth = Math.max(100, resizeState.startWidth - Math.abs(dx));
        }
      } else {
        // Resize crop overlay
        const cropOverlay = resizeState.element.querySelector('.crop-overlay') as HTMLElement;
        if (cropOverlay) {
          const containerWidth = mediaContent.offsetWidth;
          const containerHeight = mediaContent.offsetHeight;
          
          if (resizeState.handle.includes('e')) {
            const newWidthPercent = Math.max(10, Math.min(100, parseFloat(cropOverlay.style.width || '80') + dx * 100 / containerWidth));
            cropOverlay.style.width = `${newWidthPercent}%`;
          }
          if (resizeState.handle.includes('w')) {
            const currentWidth = parseFloat(cropOverlay.style.width || '80');
            const currentLeft = parseFloat(cropOverlay.style.left || '10');
            
            const widthChange = dx * 100 / containerWidth;
            const newWidthPercent = Math.max(10, Math.min(100 - currentLeft, currentWidth - widthChange));
            const newLeftPercent = Math.max(0, Math.min(90, currentLeft + widthChange));
            
            cropOverlay.style.width = `${newWidthPercent}%`;
            cropOverlay.style.left = `${newLeftPercent}%`;
          }
          if (resizeState.handle.includes('s')) {
            const newHeightPercent = Math.max(10, Math.min(100, parseFloat(cropOverlay.style.height || '80') + dy * 100 / containerHeight));
            cropOverlay.style.height = `${newHeightPercent}%`;
          }
          if (resizeState.handle.includes('n')) {
            const currentHeight = parseFloat(cropOverlay.style.height || '80');
            const currentTop = parseFloat(cropOverlay.style.top || '10');
            
            const heightChange = dy * 100 / containerHeight;
            const newHeightPercent = Math.max(10, Math.min(100 - currentTop, currentHeight - heightChange));
            const newTopPercent = Math.max(0, Math.min(90, currentTop + heightChange));
            
            cropOverlay.style.height = `${newHeightPercent}%`;
            cropOverlay.style.top = `${newTopPercent}%`;
          }
          return;
        }
      }
      
      // Apply the new dimensions to direct media resize
      mediaContent.style.width = `${newWidth}px`;
      if (newHeight > 0) {
        mediaContent.style.height = `${newHeight}px`;
      }
    };
    
    // Mouse up handler to stop resizing
    const handleMouseUp = () => {
      if (resizeState.isResizing) {
        setResizeState({
          isResizing: false,
          element: null,
          startX: 0,
          startY: 0,
          startWidth: 0,
          startHeight: 0,
          handle: null,
          isPanning: false
        });
        
        // Reset cursor style
        document.body.style.cursor = '';
      }
    };
    
    // Setup equation handlers for double-click editing
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

    // Setup event handlers for media elements
    const setupMediaElementHandlers = () => {
      if (!contentRef.current) return;
      
      const mediaElements = contentRef.current.querySelectorAll('.media-element');
      
      mediaElements.forEach(element => {
        setupMediaElementEventListeners(element as HTMLElement);
      });
    };
    
    // Initialize resize handlers on the crop overlay
    const initializeResizeHandlers = (cropOverlay: HTMLElement) => {
      const resizeHandles = cropOverlay.querySelectorAll('.resize-handle');
      
      resizeHandles.forEach(handle => {
        handle.addEventListener('mousedown', (e: MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
          
          const mediaElement = (e.target as HTMLElement).closest('.media-element') as HTMLElement;
          if (!mediaElement) return;
          
          // Get handle position (nw, ne, sw, se)
          const handleClass = Array.from((e.target as HTMLElement).classList).find(cls => cls.startsWith('resize-handle-'));
          const handle = handleClass ? handleClass.replace('resize-handle-', '') : null;
          
          setResizeState({
            isResizing: true,
            element: mediaElement,
            startX: e.clientX,
            startY: e.clientY,
            startWidth: 0, // Not needed for crop overlay resize
            startHeight: 0, // Not needed for crop overlay resize
            handle,
            isPanning: false
          });
          
          // Set appropriate resize cursor
          if (handle) {
            document.body.style.cursor = `${handle}-resize`;
          }
        });
      });
      
      // Add panning ability for crop overlay
      cropOverlay.addEventListener('mousedown', (e: MouseEvent) => {
        // Only start panning if we're not on a resize handle
        if (!(e.target as HTMLElement).classList.contains('resize-handle')) {
          e.preventDefault();
          e.stopPropagation();
          
          const mediaElement = (e.target as HTMLElement).closest('.media-element') as HTMLElement;
          if (!mediaElement) return;
          
          // Get current position
          const left = parseFloat(cropOverlay.style.left || '10');
          const top = parseFloat(cropOverlay.style.top || '10');
          
          setResizeState({
            isResizing: true,
            element: mediaElement,
            startX: e.clientX,
            startY: e.clientY,
            startWidth: 0, // Not used for panning
            startHeight: 0, // Not used for panning
            startLeft: left,
            startTop: top,
            handle: null,
            isPanning: true
          });
          
          // Set move cursor
          document.body.style.cursor = 'move';
        }
      });
    };
    
    // Add event listeners to a media element
    const setupMediaElementEventListeners = (element: HTMLElement) => {
      // Handle edit button click
      element.addEventListener('click', (e) => {
        const editButton = (e.target as HTMLElement).closest('.media-toolbar-btn[title="Edit"]');
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
            
            // Apply the crop/resize changes
            const cropOverlay = editPanel.querySelector('.crop-overlay') as HTMLElement;
            if (cropOverlay) {
              // Here you would apply the actual crop/resize - for demo purposes we just show a toast
              toast({
                title: "Changes applied",
                description: "Media has been edited successfully",
              });
            }
          }
        }
      });
      
      // Handle alignment button click
      element.addEventListener('click', (e) => {
        const alignButton = (e.target as HTMLElement).closest('.media-toolbar-btn[title^="Align"]');
        if (alignButton) {
          e.preventDefault();
          e.stopPropagation();
          
          // Get current alignment
          const currentAlignment = element.classList.contains('media-align-left') 
            ? 'left' 
            : element.classList.contains('media-align-right') 
              ? 'right' 
              : 'center';
          
          // Determine next alignment
          let nextAlignment: 'left' | 'center' | 'right';
          if (currentAlignment === 'left') nextAlignment = 'center';
          else if (currentAlignment === 'center') nextAlignment = 'right';
          else nextAlignment = 'left';
          
          // Apply new alignment
          element.classList.remove('media-align-left', 'media-align-center', 'media-align-right');
          element.classList.add(`media-align-${nextAlignment}`);
          
          // Update button title
          alignButton.setAttribute('title', `Align (${nextAlignment})`);
          
          // Find the alignment icon and update it
          const alignIcon = alignButton.querySelector('svg');
          if (alignIcon) {
            // We would update the alignment icon here
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
      const mediaContent = element.querySelector('.media-content') as HTMLElement;
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
              startWidth: mediaContent.offsetWidth,
              startHeight: mediaContent.offsetHeight,
              handle: null,
              isPanning: false
            });
            
            // Add a resize cursor class to the body
            document.body.style.cursor = handle ? `${handle}-resize` : 'move';
          }
        });
      }
    };

    // Apply focus styles
    const handleFocus = () => {
      if (contentRef.current) {
        contentRef.current.style.boxShadow = 'none';
        contentRef.current.style.transition = 'box-shadow 0.2s ease';
      }
    };

    // Remove focus styles
    const handleBlur = () => {
      if (contentRef.current) {
        contentRef.current.style.boxShadow = 'none';
      }
    };
    
    return (
      <div 
        className="content-area" 
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
