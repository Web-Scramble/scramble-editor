
import React from 'react';
import { Edit, Trash2, Crop, Check, X, AlignLeft, AlignCenter, AlignRight, Maximize2 } from './Icons';

interface MediaToolbarProps {
  editor: any;
  node: any;
  onDelete: () => void;
  onEdit: () => void;
  alignment: string;
  onAlignChange: (alignment: string) => void;
}

export const MediaToolbar: React.FC<MediaToolbarProps> = ({ 
  editor, 
  node, 
  onDelete, 
  onEdit, 
  alignment, 
  onAlignChange 
}) => {
  const handleAlignChange = () => {
    const alignments = ['left', 'center', 'right'];
    const currentIndex = alignments.indexOf(alignment);
    const nextIndex = (currentIndex + 1) % alignments.length;
    onAlignChange(alignments[nextIndex]);
  };

  return (
    <div className="media-toolbar">
      <button className="p-1 hover:bg-gray-100 rounded-md" title="Edit" onClick={onEdit}>
        <Edit size={16} />
      </button>
      <button className="p-1 hover:bg-gray-100 rounded-md" title={`Align (${alignment})`} onClick={handleAlignChange}>
        {alignment === 'left' && <AlignLeft size={16} />}
        {alignment === 'center' && <AlignCenter size={16} />}
        {alignment === 'right' && <AlignRight size={16} />}
      </button>
      <button className="p-1 hover:bg-gray-100 rounded-md text-red-500 hover:text-red-700" title="Delete" onClick={onDelete}>
        <Trash2 size={16} />
      </button>
    </div>
  );
};

interface MediaEditPanelProps {
  onApply: () => void;
  onCancel: () => void;
  alignment: string;
  onAlignChange: (alignment: string) => void;
}

export const MediaEditPanel: React.FC<MediaEditPanelProps> = ({ 
  onApply, 
  onCancel, 
  alignment, 
  onAlignChange 
}) => {
  return (
    <div className="media-edit-panel">
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
          <button className="flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded" title="Crop">
            <Crop size={16} />
            Crop
          </button>
          <button className="flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded" title="Resize">
            <Maximize2 size={16} />
            Resize
          </button>
          <button className="flex items-center gap-1 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded ml-auto" title="Apply" onClick={onApply}>
            <Check size={16} />
            Apply
          </button>
          <button className="flex items-center gap-1 px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded" title="Cancel" onClick={onCancel}>
            <X size={16} />
            Cancel
          </button>
        </div>
        <div className="alignment-controls flex justify-center gap-2">
          <button 
            className={`p-2 rounded ${alignment === 'left' ? 'bg-blue-100' : 'bg-gray-100 hover:bg-gray-200'}`} 
            title="Align Left"
            onClick={() => onAlignChange('left')}
          >
            <AlignLeft size={16} />
          </button>
          <button 
            className={`p-2 rounded ${alignment === 'center' ? 'bg-blue-100' : 'bg-gray-100 hover:bg-gray-200'}`} 
            title="Align Center"
            onClick={() => onAlignChange('center')}
          >
            <AlignCenter size={16} />
          </button>
          <button 
            className={`p-2 rounded ${alignment === 'right' ? 'bg-blue-100' : 'bg-gray-100 hover:bg-gray-200'}`} 
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
