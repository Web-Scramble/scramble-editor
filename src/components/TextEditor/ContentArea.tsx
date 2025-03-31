
import React, { forwardRef, useEffect, useRef } from 'react';
import { MediaToolbar, MediaEditPanel } from './MediaToolbar';
import { useToast } from '../../hooks/use-toast';

interface ContentAreaProps {
  // Any props can be added here if needed
}

export const ContentArea = forwardRef<HTMLDivElement, ContentAreaProps>(
  (props, ref) => {
    const contentRef = useRef<HTMLDivElement | null>(null);
    const { toast } = useToast();
    
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
    };

    // Setup event handlers for media elements
    const setupMediaElementHandlers = () => {
      if (!contentRef.current) return;
      
      const mediaElements = contentRef.current.querySelectorAll('.media-element');
      
      mediaElements.forEach(element => {
        setupMediaElementEventListeners(element as HTMLElement);
      });
    };
    
    // Add event listeners to a media element
    const setupMediaElementEventListeners = (element: HTMLElement) => {
      const editButton = element.querySelector('.media-toolbar-btn[title^="Edit"]');
      const alignButton = element.querySelector('.media-toolbar-btn[title^="Align"]');
      const deleteButton = element.querySelector('.media-toolbar-btn[title="Delete"]');
      const cancelButton = element.querySelector('.edit-btn[title="Cancel"]');
      const applyButton = element.querySelector('.edit-btn[title="Apply"]');
      
      // Handle edit button
      if (editButton) {
        editButton.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          
          const editPanel = element.querySelector('.media-edit-panel');
          if (editPanel) {
            editPanel.classList.add('active');
          }
        });
      }
      
      // Handle cancel button in edit panel
      if (cancelButton) {
        cancelButton.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          
          const editPanel = element.closest('.media-edit-panel');
          if (editPanel) {
            editPanel.classList.remove('active');
          }
        });
      }
      
      // Handle apply button in edit panel
      if (applyButton) {
        applyButton.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          
          const editPanel = element.closest('.media-edit-panel');
          if (editPanel) {
            editPanel.classList.remove('active');
            toast({
              title: "Changes applied",
              description: "Media has been edited successfully",
            });
          }
        });
      }
      
      // Handle alignment button
      if (alignButton) {
        alignButton.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          
          // Cycle through alignment classes
          if (element.classList.contains('media-align-left')) {
            element.classList.remove('media-align-left');
            element.classList.add('media-align-center');
          } else if (element.classList.contains('media-align-center')) {
            element.classList.remove('media-align-center');
            element.classList.add('media-align-right');
          } else if (element.classList.contains('media-align-right')) {
            element.classList.remove('media-align-right');
            element.classList.add('media-align-left');
          } else {
            element.classList.add('media-align-center');
          }
        });
      }
      
      // Handle delete button
      if (deleteButton) {
        deleteButton.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          
          if (confirm('Are you sure you want to delete this media?')) {
            element.remove();
            toast({
              title: "Media deleted",
              description: "The media has been removed from the document",
            });
          }
        });
      }
      
      // Setup alignment controls in edit panel
      const alignmentButtons = element.querySelectorAll('.alignment-btn');
      alignmentButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          
          // Remove alignment classes
          element.classList.remove('media-align-left', 'media-align-center', 'media-align-right');
          
          // Add the selected alignment class
          if (btn.getAttribute('title')?.includes('Left')) {
            element.classList.add('media-align-left');
          } else if (btn.getAttribute('title')?.includes('Center')) {
            element.classList.add('media-align-center');
          } else if (btn.getAttribute('title')?.includes('Right')) {
            element.classList.add('media-align-right');
          }
          
          // Update active state
          alignmentButtons.forEach(button => button.classList.remove('active'));
          btn.classList.add('active');
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
