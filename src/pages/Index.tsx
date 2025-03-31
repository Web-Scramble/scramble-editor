
import { TextEditor } from '../components/TextEditor/TextEditor';
import { useIsMobile } from '../hooks/use-mobile';
import { Toaster } from '../components/ui/toaster';

const Index = () => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-4xl mx-auto pt-4 px-4 pb-8">
        <h1 className="text-3xl font-bold mb-4 text-center">Floating Rich Text Editor</h1>
        <p className="text-center mb-4 text-gray-600">
          {isMobile 
            ? "The toolbar is organized by tabs for better mobile experience." 
            : "The toolbar can be moved around by dragging the handle and minimized with the icon in the top-right corner."
          }
        </p>
        <p className="text-center mb-4 text-gray-600">
          Add images, videos, or documents and use the edit controls to resize, crop, and align them. 
          Drag the crop overlay or its handles to adjust the selection.
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
