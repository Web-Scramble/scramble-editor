
import React, { forwardRef, useEffect, useRef } from 'react';

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

          <p>You can insert images:</p>
          <div class="media-container image-container">
            <img src="public/lovable-uploads/3eb5291f-2406-42ce-9ff8-5fcfa4e12fcb.png" alt="Color Gradient Example" class="editor-image" />
            <div class="media-controls">
              <button class="media-control-btn" data-action="resize-small">S</button>
              <button class="media-control-btn" data-action="resize-medium">M</button>
              <button class="media-control-btn" data-action="resize-large">L</button>
              <button class="media-control-btn" data-action="align-left">◀</button>
              <button class="media-control-btn" data-action="align-center">■</button>
              <button class="media-control-btn" data-action="align-right">▶</button>
            </div>
          </div>
          
          <p>Attach documents or files:</p>
          <div class="attachment">
            <span class="attachment-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                <polyline points="13 2 13 9 20 9"></polyline>
              </svg>
            </span>
            <span class="attachment-name">example-document.pdf</span>
            <span class="attachment-size">245.35 KB</span>
            <button class="attachment-preview-btn">Preview</button>
          </div>
          
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
          alert('Preview functionality is available when you upload your own files.');
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
          if ((e.target as Element).closest('.media-controls')) return;
          
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
                container.style.width = '25%';
                break;
              case 'resize-medium':
                container.style.width = '50%';
                break;
              case 'resize-large':
                container.style.width = '100%';
                break;
              case 'align-left':
                container.style.marginLeft = '0';
                container.style.marginRight = 'auto';
                break;
              case 'align-center':
                container.style.marginLeft = 'auto';
                container.style.marginRight = 'auto';
                break;
              case 'align-right':
                container.style.marginLeft = 'auto';
                container.style.marginRight = '0';
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
