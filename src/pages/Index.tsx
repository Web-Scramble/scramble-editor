
import React, { useState } from 'react';
import { TextEditor } from '../components/TextEditor/TextEditor';
import { Plus, X } from 'lucide-react';

const Index = () => {
  const [editorOpen, setEditorOpen] = useState(false);

  const toggleEditor = () => {
    setEditorOpen(!editorOpen);
  };

  return (
    <div className="min-h-screen bg-white relative">
      {editorOpen ? (
        <div className="fixed inset-0 bg-black/20 z-40 flex items-center justify-center">
          <div className="floating-editor-container">
            <button 
              onClick={toggleEditor} 
              className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/90 hover:bg-white shadow-sm"
            >
              <X size={18} />
            </button>
            <TextEditor />
          </div>
        </div>
      ) : (
        <button 
          onClick={toggleEditor}
          className="fixed bottom-8 right-8 z-50 h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105"
        >
          <Plus size={24} />
        </button>
      )}
    </div>
  );
};

export default Index;
