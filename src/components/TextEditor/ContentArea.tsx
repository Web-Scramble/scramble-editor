
import React, { forwardRef, useEffect, useRef } from 'react';
import { Trash, Edit, Crop } from 'lucide-react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';

interface ContentAreaProps {
  // Any props can be added here if needed
}

export const ContentArea = forwardRef<HTMLDivElement, ContentAreaProps>(
  (props, ref) => {
    const contentRef = useRef<HTMLDivElement | null>(null);
    
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

          <p>Click the media toolbar buttons to insert images and videos that will automatically fit the editor width.</p>
          
          <p>After inserting media, click on it to see the controls for resizing, alignment, and other options.</p>
          
          <hr class="editor-divider">
          
          <p>Use the toolbar above to format your text, add code blocks, equations, and more!</p>
        `;
        
        // Setup event listeners for equations and other interactive elements
        setupEquationHandlers();
        setupMediaHandlers();
      }
    }, []);
    
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

      // Setup preview buttons for attachments
      const previewButtons = contentRef.current.querySelectorAll('.attachment-preview-btn');
      previewButtons.forEach(button => {
        button.addEventListener('click', function(e) {
          e.preventDefault();
          // The preview functionality is now implemented in TextEditor.tsx
          // This is just a fallback for any existing buttons
        });
      });
    };

    // Setup media handlers for controlling images and videos
    const setupMediaHandlers = () => {
      if (!contentRef.current) return;

      // Add click listeners to all media containers
      const mediaContainers = contentRef.current.querySelectorAll('.media-container');
      mediaContainers.forEach(container => {
        // Show controls on click
        container.addEventListener('click', function(e) {
          // Prevent handling clicks on control buttons twice
          if ((e.target as Element)?.closest('.media-controls')) return;
          
          // Toggle active state
          const wasActive = container.classList.contains('media-active');
          
          // Remove active class from all media containers first
          document.querySelectorAll('.media-container').forEach(mc => {
            mc.classList.remove('media-active');
          });
          
          // If this container wasn't active before, make it active
          if (!wasActive) {
            container.classList.add('media-active');
          }
        });

        // Set default styles to ensure media fits properly
        const mediaElement = container.querySelector('img, video') as HTMLElement;
        if (mediaElement) {
          mediaElement.style.maxWidth = '100%';
          mediaElement.style.height = 'auto';
          mediaElement.style.display = 'block';
          
          // Set default container styles
          (container as HTMLElement).style.width = '100%';
          (container as HTMLElement).style.marginLeft = 'auto';
          (container as HTMLElement).style.marginRight = 'auto';
        }

        // Setup control buttons
        const controlButtons = container.querySelectorAll('.media-control-btn');
        controlButtons.forEach(button => {
          button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const action = (button as HTMLElement).dataset.action;
            const mediaElement = container.querySelector('img, video') as HTMLElement;
            
            if (!mediaElement) return;
            
            switch(action) {
              case 'resize-small':
                (container as HTMLElement).style.width = '25%';
                break;
              case 'resize-medium':
                (container as HTMLElement).style.width = '50%';
                break;
              case 'resize-large':
                (container as HTMLElement).style.width = '100%';
                break;
              case 'align-left':
                (container as HTMLElement).style.marginLeft = '0';
                (container as HTMLElement).style.marginRight = 'auto';
                break;
              case 'align-center':
                (container as HTMLElement).style.marginLeft = 'auto';
                (container as HTMLElement).style.marginRight = 'auto';
                break;
              case 'align-right':
                (container as HTMLElement).style.marginLeft = 'auto';
                (container as HTMLElement).style.marginRight = '0';
                break;
              case 'delete':
                if (confirm('Are you sure you want to delete this media?')) {
                  container.remove();
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
      });

      // Close active media on outside click
      document.addEventListener('click', function(e) {
        if (!(e.target as Element).closest('.media-container')) {
          document.querySelectorAll('.media-container').forEach(container => {
            container.classList.remove('media-active');
          });
        }
      });

      // Set up context menu for right-click actions on media
      setupMediaContextMenu();
    };

    const setupMediaContextMenu = () => {
      if (!contentRef.current) return;
      
      // Add context menu triggers to all media containers
      const mediaElements = contentRef.current.querySelectorAll('.editor-image, .editor-video');
      
      mediaElements.forEach(media => {
        // Handle right click on media elements
        media.addEventListener('contextmenu', (e) => {
          // The context menu is handled by the ContextMenu component,
          // but we can use this to prevent default browser context menu
          e.preventDefault();
        });
      });
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
