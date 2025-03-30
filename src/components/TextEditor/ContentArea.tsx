
import React, { forwardRef, useEffect } from 'react';
import KaTeX from 'katex';
import 'katex/dist/katex.min.css';

interface ContentAreaProps {
  onContentChange?: () => void;
}

export const ContentArea = forwardRef<HTMLDivElement, ContentAreaProps>(
  (props, ref) => {
    useEffect(() => {
      // Initialize equation rendering when component mounts
      renderEquations();
    }, []);

    // Function to render LaTeX equations
    const renderEquations = () => {
      if (!ref || !('current' in ref) || !ref.current) return;
      
      const equations = ref.current.querySelectorAll('.equation');
      equations.forEach(equation => {
        try {
          const latexContent = equation.getAttribute('data-latex') || equation.textContent || '';
          // Don't render if it doesn't start with LaTeX syntax
          if (!latexContent.trim().startsWith('$')) return;
          
          const cleanLatex = latexContent.replace(/^\$|\$$/g, '').trim();
          
          const renderEl = document.createElement('span');
          renderEl.className = 'katex-render';
          KaTeX.render(cleanLatex, renderEl, {
            throwOnError: false,
            displayMode: latexContent.startsWith('$$'),
            output: 'html'
          });
          
          // Store but don't show the original LaTeX code
          const originalLatex = document.createElement('span');
          originalLatex.className = 'latex-source';
          originalLatex.style.display = 'none';
          originalLatex.textContent = latexContent;
          
          // Clear and append new content
          if (equation.classList.contains('editing')) return;
          equation.innerHTML = '';
          equation.appendChild(renderEl);
          equation.appendChild(originalLatex);
        } catch (error) {
          console.error('Error rendering equation:', error);
        }
      });
    };

    // Handle click on the content area to initialize editing
    const handleInitialClick = (e: React.MouseEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      if (target.textContent === 'Start typing here...') {
        target.textContent = '';
      }
    };

    // Handle equation double-click to edit
    const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement;
      if (target.closest('.equation')) {
        const equation = target.closest('.equation') as HTMLElement;
        const latexSource = equation.querySelector('.latex-source');
        
        equation.classList.add('editing');
        equation.textContent = latexSource?.textContent || '$\\LaTeX$';
        
        // Select the equation content for easy editing
        const range = document.createRange();
        range.selectNodeContents(equation);
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
    };

    // Handle equation blur to render LaTeX
    const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement;
      const equation = target.closest('.equation');
      
      if (equation) {
        equation.classList.remove('editing');
        equation.setAttribute('data-latex', equation.textContent || '');
        setTimeout(() => renderEquations(), 10); // Small delay to ensure content is updated
      } else {
        // Render all equations in case content changed
        setTimeout(() => renderEquations(), 10);
      }

      // Notify parent about content change
      if (props.onContentChange) {
        props.onContentChange();
      }
    };

    // Handle input events to ensure proper history tracking for undo/redo
    const handleInput = () => {
      if (props.onContentChange) {
        props.onContentChange();
      }
      setTimeout(renderEquations, 100);
    };

    return (
      <div 
        className="content-area" 
        contentEditable={true}
        ref={ref}
        suppressContentEditableWarning={true}
        onClick={handleInitialClick}
        onDoubleClick={handleDoubleClick}
        onBlur={handleBlur}
        onInput={handleInput}
      >
        <p>Start typing here...</p>
      </div>
    );
  }
);

ContentArea.displayName = 'ContentArea';
