
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
        
        return () => {
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
        };
      }
    }, []);
    
    // Mouse move handler for resizing media elements
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
          handle: null
        });
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
    
    // Add event listeners to a media element
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
