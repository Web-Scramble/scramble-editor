
import { TextEditor } from '../components/TextEditor/TextEditor';
import { useIsMobile } from '../hooks/use-mobile';

const Index = () => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-4xl mx-auto pt-6 px-4">
        <h1 className="text-3xl font-bold mb-6 text-center">Floating Rich Text Editor Toolbar</h1>
        <p className="text-center mb-4">
          {isMobile 
            ? "The toolbar is organized by tabs on mobile for better usability." 
            : "The toolbar can be moved around by dragging the handle and minimized with the icon in the top-right corner."
          }
        </p>
        <TextEditor />
      </main>
    </div>
  );
};

export default Index;
