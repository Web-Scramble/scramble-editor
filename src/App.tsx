
import { useState } from 'react'
import ScrambleEditor from './components/ScrambleEditor'
import './App.css'

function App() {
  const [content, setContent] = useState('<p>Start typing here...</p>')

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Floating Rich Text Editor</h1>
      <p className="mb-4">The toolbar can be moved around by dragging the handle and minimized with the icon in the top-right corner.</p>
      
      <div className="border rounded-lg p-4 bg-white shadow-md">
        <h2 className="text-2xl font-bold mb-4">Untitled</h2>
        <ScrambleEditor 
          initialValue={content}
          onChange={setContent}
          placeholder="Start typing here..."
          height="auto"
          editorClassName="min-h-[300px]"
          floatingToolbar={true}
        />
      </div>
      
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-2">Editor Output:</h3>
        <div className="border p-4 rounded-lg bg-gray-50">
          <pre className="whitespace-pre-wrap">{content}</pre>
        </div>
      </div>
    </div>
  )
}

export default App
