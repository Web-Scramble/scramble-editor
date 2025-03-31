
import { TextEditor } from '../components/TextEditor/TextEditor';
import { useIsMobile } from '../hooks/use-mobile';
import { Toaster } from '../components/ui/toaster';
import { FileImage, FileVideo } from 'lucide-react';

const Index = () => {
  const isMobile = useIsMobile();

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
          <TextEditor />
        </div>
      </main>
      <Toaster />
    </div>
  );
};

export default Index;
