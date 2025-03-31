
import React from 'react';
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

export const MediaEditPanel: React.FC<{
  onApply: () => void;
  onCancel: () => void;
  onAlignChange: (align: 'left' | 'center' | 'right') => void;
  currentAlignment: 'left' | 'center' | 'right';
}> = ({ onApply, onCancel, onAlignChange, currentAlignment }) => {
  return (
    <div className="media-edit-panel absolute inset-0 bg-black/50 z-20 flex flex-col items-center justify-center">
      <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-md">
        <h3 className="text-lg font-medium mb-4">Edit Media</h3>
        <div className="cropper-container relative bg-gray-100 mb-4 aspect-video">
          <div className="crop-overlay absolute border-2 border-blue-500 cursor-move"
               style={{ width: '80%', height: '80%', top: '10%', left: '10%' }}>
            <div className="resize-handle resize-handle-nw absolute w-3 h-3 bg-white border-2 border-blue-500 rounded-full top-0 left-0 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize"></div>
            <div className="resize-handle resize-handle-ne absolute w-3 h-3 bg-white border-2 border-blue-500 rounded-full top-0 right-0 translate-x-1/2 -translate-y-1/2 cursor-nesw-resize"></div>
            <div className="resize-handle resize-handle-sw absolute w-3 h-3 bg-white border-2 border-blue-500 rounded-full bottom-0 left-0 -translate-x-1/2 translate-y-1/2 cursor-nesw-resize"></div>
            <div className="resize-handle resize-handle-se absolute w-3 h-3 bg-white border-2 border-blue-500 rounded-full bottom-0 right-0 translate-x-1/2 translate-y-1/2 cursor-nwse-resize"></div>
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
          <button className="edit-btn-primary flex items-center gap-1 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded ml-auto" title="Apply" onClick={onApply}>
            <Check size={16} />
            Apply
          </button>
          <button className="edit-btn flex items-center gap-1 px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded" title="Cancel" onClick={onCancel}>
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
