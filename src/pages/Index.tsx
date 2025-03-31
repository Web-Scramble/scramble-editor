
import React, { useState } from 'react';
import RichTextEditor from '../components/RichTextEditor';
import { useIsMobile } from '../hooks/use-mobile';
import { Toaster } from '../components/ui/toaster';
import { FileImage, FileVideo } from 'lucide-react';

const Index = () => {
  const isMobile = useIsMobile();
  const [editorContent, setEditorContent] = useState('<p>Start typing here...</p>');

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-4xl mx-auto pt-4 px-4 pb-8">
        <h1 className="text-3xl font-bold mb-4 text-center">Floating Rich Text Editor</h1>
        <p className="text-center mb-2 text-gray-600">
          {isMobile 
            ? "The toolbar is organized by tabs for better mobile experience." 
            : "The toolbar can be moved around by dragging the handle and minimized with the icon in the top-right corner."
          }
        </p>
        <p className="text-center mb-4 text-sm text-gray-500 flex items-center justify-center gap-2">
          <FileImage size={16} className="text-blue-500" /> 
          <span>Drag and drop images or files to upload</span>
          <span className="mx-2">|</span>
          <span>Copy and paste images directly</span>
        </p>
        <div className="border border-gray-200 rounded-lg p-4 shadow-sm">
          <RichTextEditor 
            initialValue={editorContent} 
            onChange={setEditorContent}
            height="450px"
          />
        </div>
        
        <div className="mt-10 pt-8 border-t border-gray-200">
          <h2 className="text-2xl font-bold mb-4">How to use this component</h2>
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-medium text-lg mb-2">Installation</h3>
            <pre className="bg-gray-800 text-white p-3 rounded overflow-auto">
              <code>npm install rich-text-editor</code>
            </pre>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-medium text-lg mb-2">Basic Usage</h3>
            <pre className="bg-gray-800 text-white p-3 rounded overflow-auto">
              <code>{`import RichTextEditor from 'rich-text-editor';
import 'rich-text-editor/styles.css';

function MyEditor() {
  const [content, setContent] = useState('<p>Hello world</p>');
  
  return (
    <RichTextEditor
      initialValue={content}
      onChange={setContent}
    />
  );
}`}</code>
            </pre>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-lg mb-2">Available Props</h3>
            <ul className="list-disc list-inside space-y-2">
              <li><code className="bg-gray-200 px-1 rounded">initialValue</code>: Initial HTML content</li>
              <li><code className="bg-gray-200 px-1 rounded">onChange</code>: Callback when content changes</li>
              <li><code className="bg-gray-200 px-1 rounded">onImageUpload</code>: Custom function to handle image uploads</li>
              <li><code className="bg-gray-200 px-1 rounded">height</code>: Height of the editor area</li>
              <li><code className="bg-gray-200 px-1 rounded">editorClassName</code>: Custom class for editor container</li>
              <li><code className="bg-gray-200 px-1 rounded">toolbarClassName</code>: Custom class for toolbar</li>
              <li><code className="bg-gray-200 px-1 rounded">floatingToolbar</code>: Whether toolbar is floating/draggable</li>
            </ul>
          </div>
        </div>
      </main>
      <Toaster />
    </div>
  );
};

export default Index;
