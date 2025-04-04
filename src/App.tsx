
import { useState } from 'react';
import './App.css';

function App() {
  const [content, setContent] = useState('<p>Start typing here...</p>');

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Floating Rich Text Editor</h1>
      <p className="mb-4">This is a simplified version of the editor.</p>
      
      <div className="border rounded-lg p-4 bg-white shadow-md">
        <h2 className="text-2xl font-bold mb-4">Untitled</h2>
        <div 
          className="min-h-[300px] p-4 focus:outline-none border rounded" 
          contentEditable
          dangerouslySetInnerHTML={{ __html: content }}
          onInput={(e) => setContent(e.currentTarget.innerHTML)}
        />
      </div>
      
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-2">Editor Output:</h3>
        <div className="border p-4 rounded-lg bg-gray-50">
          <pre className="whitespace-pre-wrap">{content}</pre>
        </div>
      </div>
    </div>
  );
}

export default App;
