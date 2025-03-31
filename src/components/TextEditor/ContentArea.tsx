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

interface MediaState {
  element: HTMLElement | null;
  editActive: boolean;
  alignment: 'left' | 'center' | 'right';
  type: 'image' | 'video' | 'document';
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
    
    const [activeMedia, setActiveMedia] = useState<MediaState>({
      element: null,
      editActive: false,
      alignment: 'center',
      type: 'image'
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
    
    // Handle media edit button click
    const handleMediaEdit = (element: HTMLElement, type: 'image' | 'video' | 'document') => {
      // Get the current alignment
      const alignment = element.classList.contains('media-align-left') 
        ? 'left' 
        : element.classList.contains('media-align-right') 
          ? 'right' 
          : 'center';
      
      setActiveMedia({
        element,
        editActive: true,
        alignment,
        type
      });
    };
    
    // Handle media edit apply
    const handleMediaEditApply = () => {
      if (!activeMedia.element) return;
      
      // Here you would apply actual cropping/resizing
      // For now, we just show a notification
      toast({
        title: "Changes applied",
        description: "Media has been edited successfully",
      });
      
      setActiveMedia(prev => ({
        ...prev,
        editActive: false
      }));
    };
    
    // Handle media edit cancel
    const handleMediaEditCancel = () => {
      setActiveMedia(prev => ({
        ...prev,
        editActive: false
      }));
    };
    
    // Handle alignment change
    const handleMediaAlignChange = (alignment: 'left' | 'center' | 'right') => {
      if (!activeMedia.element) return;
      
      // Update our state
      setActiveMedia(prev => ({
        ...prev,
        alignment
      }));
      
      // Apply to the element
      activeMedia.element.classList.remove('media-align-left', 'media-align-center', 'media-align-right');
      activeMedia.element.classList.add(`media-align-${alignment}`);
    };
    
    // Handle media delete
    const handleMediaDelete = () => {
      if (!activeMedia.element) return;
      
      // Remove the element
      activeMedia.element.remove();
      
      // Reset active media
      setActiveMedia({
        element: null,
        editActive: false,
        alignment: 'center',
        type: 'image'
      });
      
      // Show toast
      toast({
        title: "Media deleted",
        description: "The media has been removed from the document",
      });
    };
    
    // Add event listeners to a media element
    const setupMediaElementEventListeners = (element: HTMLElement) => {
      // Determine media type
      let mediaType: 'image' | 'video' | 'document' = 'image'; // Default
      
      if (element.querySelector('video')) {
        mediaType = 'video';
      } else if (element.querySelector('.document-preview')) {
        mediaType = 'document';
      }
      
      // Make the element interactive
      element.classList.add('group');
      
      // Create new toolbar
      const toolbarContainer = document.createElement('div');
      toolbarContainer.className = 'relative';
      
      // Render our React toolbar component
      const mediaContainer = element.querySelector('.media-container');
      if (mediaContainer) {
        const firstChild = mediaContainer.firstChild;
        
        // Remove old toolbar if it exists
        const oldToolbar = element.querySelector('.media-toolbar');
        if (oldToolbar) {
          oldToolbar.remove();
        }
        
        // Add React component props to the element
        element.dataset.mediaType = mediaType;
        
        // Add event handlers
        element.addEventListener('click', (e) => {
          const target = e.target as HTMLElement;
          
          // Check if this is an edit button click
          if (target.closest('.media-toolbar-btn[title="Edit"]')) {
            e.preventDefault();
            e.stopPropagation();
            handleMediaEdit(element, mediaType);
          }
          
          // Check if this is an align button click
          if (target.closest('.media-toolbar-btn[title^="Align"]')) {
            e.preventDefault();
            e.stopPropagation();
            
            // Current alignment
            const currentAlignment = element.classList.contains('media-align-left') 
              ? 'left' 
              : element.classList.contains('media-align-right') 
                ? 'right' 
                : 'center';
            
            // Next alignment
            let nextAlignment: 'left' | 'center' | 'right';
            if (currentAlignment === 'left') nextAlignment = 'center';
            else if (currentAlignment === 'center') nextAlignment = 'right';
            else nextAlignment = 'left';
            
            handleMediaAlignChange(nextAlignment);
          }
          
          // Check if this is a delete button click
          if (target.closest('.media-toolbar-btn[title="Delete"]')) {
            e.preventDefault();
            e.stopPropagation();
            
            if (confirm('Are you sure you want to delete this media?')) {
              handleMediaDelete();
            }
          }
        });
      }
      
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
      <>
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
        
        {/* Media Edit Panel */}
        {activeMedia.editActive && activeMedia.element && (
          <MediaEditPanel 
            onApply={handleMediaEditApply}
            onCancel={handleMediaEditCancel}
            onAlignChange={handleMediaAlignChange}
            currentAlignment={activeMedia.alignment}
          />
        )}
      </>
    );
  }
);

ContentArea.displayName = 'ContentArea';
