
import { TextEditor } from '../components/TextEditor/TextEditor';
import { useIsMobile } from '../hooks/use-mobile';

const Index = () => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-4xl mx-auto pt-4 px-4 pb-8">
        <h1 className="text-3xl font-bold mb-4 text-center">Rich Text Editor with Media Support</h1>
        <p className="text-center mb-4 text-gray-600">
          {isMobile 
            ? "The toolbar is organized by tabs for better mobile experience. Add images, videos, and files using the Insert tab. Click on media to adjust size and alignment." 
            : "The toolbar can be moved around by dragging the handle and minimized with the icon in the top-right corner. Insert media using the image, video, and paperclip icons. Click on any image or video to resize and align it."
          }
        </p>
        <TextEditor />
      </main>
    </div>
  );
};

export default Index;
