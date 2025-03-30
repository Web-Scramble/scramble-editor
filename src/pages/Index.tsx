
import { useState } from 'react';
import { TextEditor } from '../components/TextEditor/TextEditor';
import { Plus } from 'lucide-react';

const Index = () => {
  const [editorVisible, setEditorVisible] = useState(false);

  const toggleEditor = () => {
    setEditorVisible(prev => !prev);
  };

  return (
    <div className="min-h-screen bg-white relative">
      <main className="max-w-4xl mx-auto pt-6 px-4">
        {/* Example page content */}
        <h1 className="text-2xl font-bold mb-4">Welcome to our Rich Text Editor</h1>
        <p className="mb-4">Click the plus button in the bottom corner to open the editor.</p>
        
        {/* Content area can go here */}
        <div className="prose max-w-none">
          <p>This editor includes features like:</p>
          <ul>
            <li>Text formatting (bold, italic, underline)</li>
            <li>Paragraph styles (headings, lists)</li>
            <li>Code blocks and equations</li>
            <li>Text colors and highlighting</li>
          </ul>
        </div>
      </main>

      {/* Floating editor component */}
      {editorVisible && <TextEditor onClose={() => setEditorVisible(false)} />}
      
      {/* Floating action button to toggle editor */}
      <button
        onClick={toggleEditor}
        className="fixed bottom-6 right-6 bg-blue-500 hover:bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-all duration-200 transform hover:scale-105 z-50"
        aria-label="Toggle editor"
      >
        <Plus size={24} />
      </button>
    </div>
  );
};

export default Index;
