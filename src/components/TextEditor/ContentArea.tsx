
import React, { forwardRef } from 'react';

interface ContentAreaProps {
  // Any props can be added here if needed
}

export const ContentArea = forwardRef<HTMLDivElement, ContentAreaProps>(
  (props, ref) => {
    return (
      <div 
        className="content-area" 
        contentEditable={true}
        ref={ref}
        suppressContentEditableWarning={true}
      >
        <p>Start typing here...</p>
      </div>
    );
  }
);

ContentArea.displayName = 'ContentArea';
