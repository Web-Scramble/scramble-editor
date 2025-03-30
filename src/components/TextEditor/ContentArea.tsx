
import React, { forwardRef, useEffect, useRef } from 'react';

interface ContentAreaProps {
  // Any props can be added here if needed
}

export const ContentArea = forwardRef<HTMLDivElement, ContentAreaProps>(
  (props, ref) => {
    const contentRef = useRef<HTMLDivElement | null>(null);
    
    useEffect(() => {
      if (contentRef.current) {
        // Initialize with minimal content for a better editing experience
        contentRef.current.innerHTML = `
          <p>Start typing here...</p>
        `;
        
        // Setup equation handlers
        contentRef.current.addEventListener('dblclick', (e) => {
          const target = e.target as HTMLElement;
          if (target.classList.contains('equation')) {
            // Make the equation editable on double click
            const range = document.createRange();
            range.selectNodeContents(target);
            const selection = window.getSelection();
            if (selection) {
              selection.removeAllRanges();
              selection.addRange(range);
            }
            target.classList.remove('equation-rendered');
          }
        });
        
        // Add blur event for equations
        contentRef.current.addEventListener('focusout', (e) => {
          const target = e.target as HTMLElement;
          if (target.classList.contains('equation') || target.closest('.equation')) {
            const equation = target.classList.contains('equation') ? target : target.closest('.equation');
            if (equation) {
              equation.classList.add('equation-rendered');
            }
          }
        });

        // Place cursor at the beginning
        const selection = window.getSelection();
        if (selection) {
          const range = document.createRange();
          const firstParagraph = contentRef.current.querySelector('p');
          if (firstParagraph) {
            range.setStart(firstParagraph, 0);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
            contentRef.current.focus();
          }
        }
      }
    }, []);

    // Apply focus styles
    const handleFocus = () => {
      if (contentRef.current) {
        contentRef.current.style.boxShadow = '0 0 0 2px rgba(66, 133, 244, 0.2)';
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
        className="content-area p-4 min-h-[300px] outline-none"
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
        style={{ 
          minHeight: '300px', 
          lineHeight: '1.5',
          fontSize: '16px',
          color: '#333'
        }}
      />
    );
  }
);

ContentArea.displayName = 'ContentArea';
