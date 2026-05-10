import { useState } from 'react';
import { ImportView } from './components/ImportView';
import { MainView } from './components/MainView';

function App() {
  const [currentView, setCurrentView] = useState<'import' | 'main'>('import');
  const [videoData, setVideoData] = useState<{ videoId: number; title: string } | null>(null);

  const handleImportSuccess = (videoId: number, title: string) => {
    setVideoData({ videoId, title });
    setCurrentView('main');
  };

  const handleBackToImport = () => {
    setCurrentView('import');
    setVideoData(null);
  };

  return (
    <div>
      {currentView === 'import' && (
        <ImportView onImportSuccess={handleImportSuccess} />
      )}
      
      {currentView === 'main' && videoData && (
        <MainView
          videoId={videoData.videoId}
          videoTitle={videoData.title}
          onBack={handleBackToImport}
        />
      )}
    </div>
  );
}

export default App;
