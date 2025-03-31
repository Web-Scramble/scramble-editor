
import React from 'react';
import { Edit, AlignCenter, Trash2, Download, Crop, ChevronsExpand, Check, X, AlignLeft, AlignRight } from 'lucide-react';

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
    <div className="media-toolbar">
      {type !== 'document' && (
        <button className="media-toolbar-btn" title="Edit" onClick={handleEdit}>
          <Edit size={16} />
        </button>
      )}
      {type !== 'document' && (
        <button className="media-toolbar-btn" title={`Align (${currentAlignment})`} onClick={handleAlign}>
          {currentAlignment === 'left' && <AlignLeft size={16} />}
          {currentAlignment === 'center' && <AlignCenter size={16} />}
          {currentAlignment === 'right' && <AlignRight size={16} />}
        </button>
      )}
      {type === 'document' && (
        <button className="media-toolbar-btn" title="Download">
          <Download size={16} />
        </button>
      )}
      <button className="media-toolbar-btn" title="Delete" onClick={handleDelete}>
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
    <div className="media-edit-panel">
      <h3>Edit Media</h3>
      <div className="cropper-container">
        <div className="crop-overlay" style={{ width: '80%', height: '80%', top: '10%', left: '10%' }}>
          <div className="resize-handle resize-handle-nw"></div>
          <div className="resize-handle resize-handle-ne"></div>
          <div className="resize-handle resize-handle-sw"></div>
          <div className="resize-handle resize-handle-se"></div>
        </div>
      </div>
      <div className="edit-controls">
        <button className="edit-btn" title="Crop">
          <Crop size={16} />
          Crop
        </button>
        <button className="edit-btn" title="Resize">
          <ChevronsExpand size={16} />
          Resize
        </button>
        <button className="edit-btn edit-btn-primary" title="Apply" onClick={onApply}>
          <Check size={16} />
          Apply
        </button>
        <button className="edit-btn" title="Cancel" onClick={onCancel}>
          <X size={16} />
          Cancel
        </button>
      </div>
      <div className="alignment-controls">
        <button 
          className={`alignment-btn ${currentAlignment === 'left' ? 'active' : ''}`} 
          title="Align Left"
          onClick={() => onAlignChange('left')}
        >
          <AlignLeft size={16} />
        </button>
        <button 
          className={`alignment-btn ${currentAlignment === 'center' ? 'active' : ''}`} 
          title="Align Center"
          onClick={() => onAlignChange('center')}
        >
          <AlignCenter size={16} />
        </button>
        <button 
          className={`alignment-btn ${currentAlignment === 'right' ? 'active' : ''}`} 
          title="Align Right"
          onClick={() => onAlignChange('right')}
        >
          <AlignRight size={16} />
        </button>
      </div>
    </div>
  );
};
