import React, { useEffect, useRef, useState } from 'react';
import { Edit, AlignCenter, Trash2, Download, Crop, Maximize2, Check, X, AlignLeft, AlignRight } from 'lucide-react';

interface MediaToolbarProps {
  type: 'image' | 'video' | 'document';
  onEdit: () => void;
  onAlignChange: (align: 'left' | 'center' | 'right') => void;
  onDelete: () => void;
  currentAlignment: 'left' | 'center' | 'right';
}

export const MediaToolbar: React.FC<MediaToolbarProps> = ({
  type,
  onEdit,
  onAlignChange,
  onDelete,
  currentAlignment
}) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this media?')) {
      onDelete();
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit();
  };

  const handleAlign = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Cycle through alignment options
    const alignments: ('left' | 'center' | 'right')[] = ['left', 'center', 'right'];
    const currentIndex = alignments.indexOf(currentAlignment);
    const nextIndex = (currentIndex + 1) % alignments.length;
    onAlignChange(alignments[nextIndex]);
  };

  return (
    <div className="media-toolbar absolute top-2 right-2 bg-white/80 rounded-md shadow-sm backdrop-blur-sm flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
      {type !== 'document' && (
        <button className="media-toolbar-btn p-1 hover:bg-gray-100 rounded-md" title="Edit" onClick={handleEdit}>
          <Edit size={16} />
        </button>
      )}
      {type !== 'document' && (
        <button className="media-toolbar-btn p-1 hover:bg-gray-100 rounded-md" title={`Align (${currentAlignment})`} onClick={handleAlign}>
          {currentAlignment === 'left' && <AlignLeft size={16} />}
          {currentAlignment === 'center' && <AlignCenter size={16} />}
          {currentAlignment === 'right' && <AlignRight size={16} />}
        </button>
      )}
      {type === 'document' && (
        <button className="media-toolbar-btn p-1 hover:bg-gray-100 rounded-md" title="Download">
          <Download size={16} />
        </button>
      )}
      <button className="media-toolbar-btn p-1 hover:bg-gray-100 rounded-md text-red-500 hover:text-red-700" title="Delete" onClick={handleDelete}>
        <Trash2 size={16} />
      </button>
    </div>
  );
};

interface MediaEditPanelProps {
  onApply: () => void;
  onCancel: () => void;
  onAlignChange: (align: 'left' | 'center' | 'right') => void;
  currentAlignment: 'left' | 'center' | 'right';
}

export const MediaEditPanel: React.FC<MediaEditPanelProps> = ({ 
  onApply, 
  onCancel, 
  onAlignChange, 
  currentAlignment 
}) => {
  const cropOverlayRef = useRef<HTMLDivElement>(null);
  const cropContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startDims, setStartDims] = useState({ width: 0, height: 0, left: 0, top: 0 });

  useEffect(() => {
    // Initialize the crop overlay with percentage-based dimensions
    if (cropOverlayRef.current) {
      cropOverlayRef.current.style.width = '80%';
      cropOverlayRef.current.style.height = '80%';
      cropOverlayRef.current.style.top = '10%';
      cropOverlayRef.current.style.left = '10%';
    }

    // Add global mouse event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Mouse down handler for the crop overlay (panning)
  const handleCropOverlayMouseDown = (e: React.MouseEvent) => {
    // Only start panning if we're not on a resize handle
    if (!(e.target as HTMLElement).classList.contains('resize-handle')) {
      e.preventDefault();
      e.stopPropagation();
      
      setIsDragging(true);
      setStartPos({
        x: e.clientX,
        y: e.clientY
      });
      
      if (cropOverlayRef.current) {
        setStartDims({
          width: cropOverlayRef.current.offsetWidth,
          height: cropOverlayRef.current.offsetHeight,
          left: parseFloat(cropOverlayRef.current.style.left || '10'),
          top: parseFloat(cropOverlayRef.current.style.top || '10')
        });
      }
      
      // Set cursor style
      document.body.style.cursor = 'move';
    }
  };

  // Mouse down handler for resize handles
  const handleResizeHandleMouseDown = (e: React.MouseEvent, handle: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsResizing(true);
    setResizeHandle(handle);
    setStartPos({
      x: e.clientX,
      y: e.clientY
    });
    
    if (cropOverlayRef.current) {
      setStartDims({
        width: parseFloat(cropOverlayRef.current.style.width || '80'),
        height: parseFloat(cropOverlayRef.current.style.height || '80'),
        left: parseFloat(cropOverlayRef.current.style.left || '10'),
        top: parseFloat(cropOverlayRef.current.style.top || '10')
      });
    }
    
    // Set appropriate resize cursor
    document.body.style.cursor = `${handle}-resize`;
  };

  // Mouse move handler for both panning and resizing
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging && !isResizing) return;
    
    if (!cropOverlayRef.current || !cropContainerRef.current) return;
    
    const containerRect = cropContainerRef.current.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;
    
    if (isDragging) {
      // Calculate drag movement in percent of container dimensions
      const deltaXPercent = ((e.clientX - startPos.x) / containerWidth) * 100;
      const deltaYPercent = ((e.clientY - startPos.y) / containerHeight) * 100;
      
      // Calculate new position while keeping the overlay within bounds
      const newLeft = Math.max(0, Math.min(100 - parseFloat(cropOverlayRef.current.style.width), startDims.left + deltaXPercent));
      const newTop = Math.max(0, Math.min(100 - parseFloat(cropOverlayRef.current.style.height), startDims.top + deltaYPercent));
      
      // Apply new position
      cropOverlayRef.current.style.left = `${newLeft}%`;
      cropOverlayRef.current.style.top = `${newTop}%`;
    } else if (isResizing && resizeHandle) {
      // Calculate resize movement in percent of container dimensions
      const deltaXPercent = ((e.clientX - startPos.x) / containerWidth) * 100;
      const deltaYPercent = ((e.clientY - startPos.y) / containerHeight) * 100;
      
      let newWidth = startDims.width;
      let newHeight = startDims.height;
      let newLeft = startDims.left;
      let newTop = startDims.top;
      
      // Handle different resize directions
      if (resizeHandle.includes('e')) {
        // Resizing from east (right)
        newWidth = Math.max(10, Math.min(100 - newLeft, startDims.width + deltaXPercent));
      }
      
      if (resizeHandle.includes('w')) {
        // Resizing from west (left)
        const maxWidthChange = Math.min(startDims.width - 10, startDims.left);
        const widthChange = Math.max(-maxWidthChange, Math.min(deltaXPercent, startDims.width - 10));
        
        newWidth = startDims.width - widthChange;
        newLeft = startDims.left + widthChange;
      }
      
      if (resizeHandle.includes('s')) {
        // Resizing from south (bottom)
        newHeight = Math.max(10, Math.min(100 - newTop, startDims.height + deltaYPercent));
      }
      
      if (resizeHandle.includes('n')) {
        // Resizing from north (top)
        const maxHeightChange = Math.min(startDims.height - 10, startDims.top);
        const heightChange = Math.max(-maxHeightChange, Math.min(deltaYPercent, startDims.height - 10));
        
        newHeight = startDims.height - heightChange;
        newTop = startDims.top + heightChange;
      }
      
      // Apply new dimensions and position
      cropOverlayRef.current.style.width = `${newWidth}%`;
      cropOverlayRef.current.style.height = `${newHeight}%`;
      cropOverlayRef.current.style.left = `${newLeft}%`;
      cropOverlayRef.current.style.top = `${newTop}%`;
    }
  };

  // Mouse up handler to stop dragging/resizing
  const handleMouseUp = () => {
    if (isDragging || isResizing) {
      setIsDragging(false);
      setIsResizing(false);
      setResizeHandle(null);
      
      // Reset cursor
      document.body.style.cursor = '';
    }
  };

  return (
    <div className="media-edit-panel fixed inset-0 bg-black/50 z-50 flex flex-col items-center justify-center">
      <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-md">
        <h3 className="text-lg font-medium mb-4">Edit Media</h3>
        <div 
          ref={cropContainerRef} 
          className="cropper-container relative bg-gray-100 mb-4 overflow-hidden"
          style={{ aspectRatio: '16/9' }}
        >
          <div 
            ref={cropOverlayRef}
            className="crop-overlay absolute border-2 border-blue-500 cursor-move"
            style={{ width: '80%', height: '80%', top: '10%', left: '10%' }}
            onMouseDown={handleCropOverlayMouseDown}
          >
            <div 
              className="resize-handle resize-handle-nw absolute w-4 h-4 bg-white border-2 border-blue-500 rounded-full -top-2 -left-2 cursor-nwse-resize"
              onMouseDown={(e) => handleResizeHandleMouseDown(e, 'nw')}
            />
            <div 
              className="resize-handle resize-handle-ne absolute w-4 h-4 bg-white border-2 border-blue-500 rounded-full -top-2 -right-2 cursor-nesw-resize"
              onMouseDown={(e) => handleResizeHandleMouseDown(e, 'ne')}
            />
            <div 
              className="resize-handle resize-handle-sw absolute w-4 h-4 bg-white border-2 border-blue-500 rounded-full -bottom-2 -left-2 cursor-nesw-resize"
              onMouseDown={(e) => handleResizeHandleMouseDown(e, 'sw')}
            />
            <div 
              className="resize-handle resize-handle-se absolute w-4 h-4 bg-white border-2 border-blue-500 rounded-full -bottom-2 -right-2 cursor-nwse-resize"
              onMouseDown={(e) => handleResizeHandleMouseDown(e, 'se')}
            />
          </div>
        </div>
        
        <div className="edit-controls flex flex-wrap gap-2 mb-4">
          <button className="edit-btn flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded" title="Crop">
            <Crop size={16} />
            Crop
          </button>
          <button className="edit-btn flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded" title="Resize">
            <Maximize2 size={16} />
            Resize
          </button>
          <button
            className="edit-btn-primary flex items-center gap-1 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded ml-auto"
            title="Apply"
            onClick={onApply}
          >
            <Check size={16} />
            Apply
          </button>
          <button
            className="edit-btn flex items-center gap-1 px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded"
            title="Cancel"
            onClick={onCancel}
          >
            <X size={16} />
            Cancel
          </button>
        </div>
        
        <div className="alignment-controls flex justify-center gap-2">
          <button 
            className={`alignment-btn p-2 rounded ${currentAlignment === 'left' ? 'bg-blue-100' : 'bg-gray-100 hover:bg-gray-200'}`} 
            title="Align Left"
            onClick={() => onAlignChange('left')}
          >
            <AlignLeft size={16} />
          </button>
          <button 
            className={`alignment-btn p-2 rounded ${currentAlignment === 'center' ? 'bg-blue-100' : 'bg-gray-100 hover:bg-gray-200'}`} 
            title="Align Center"
            onClick={() => onAlignChange('center')}
          >
            <AlignCenter size={16} />
          </button>
          <button 
            className={`alignment-btn p-2 rounded ${currentAlignment === 'right' ? 'bg-blue-100' : 'bg-gray-100 hover:bg-gray-200'}`} 
            title="Align Right"
            onClick={() => onAlignChange('right')}
          >
            <AlignRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
