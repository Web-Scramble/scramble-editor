
import { TextEditor } from '../components/TextEditor/TextEditor';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 py-8 px-4">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Texteditorly</h1>
        <p className="text-gray-600">A beautiful, powerful rich text editor</p>
      </header>
      
      <main className="w-full max-w-5xl">
        <TextEditor />
      </main>
      
      <footer className="mt-8 text-center text-gray-500 text-sm">
        <p>Created with Lovable</p>
      </footer>
    </div>
  );
};

export default Index;
