import { useState, useEffect } from 'react';
import { VideoPlayer } from './components';
import { getVideos, getVideoUrl, Video } from './videoService';
import './App.css';

function App() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const fetchedVideos = await getVideos();
      setVideos(fetchedVideos);
      
      // Set the first video as selected by default
      if (fetchedVideos.length > 0) {
        setSelectedVideo(fetchedVideos[0]);
      }
      
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch videos. Please try again later.' + err);
      setLoading(false);
    }
  };
  
  useEffect(() => {
    // Fetch videos when component mounts
    fetchVideos();
  }, []);

  // Handle video selection
  const handleVideoSelect = (video: Video) => {
    setSelectedVideo(video);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Custom Video Player</h1>
      </header>
      
      <main className="app-main">
        <div className="video-player-wrapper">
          {/* Show loading state */}
          {loading && <div className="loading-message">Loading videos...</div>}
          
          {/* Show error state */}
          {error && <div className="error-message">{error}</div>}
          
          {/* Show video player when a video is selected */}
          {selectedVideo && !loading && !error && (
            <VideoPlayer 
              videoUrl={getVideoUrl(selectedVideo.id)} 
              watermarkText={`${selectedVideo.name}`} 
            />
          )}
          
          {/* Show message when no videos available */}
          {!loading && !error && videos.length === 0 && (
            <div className="no-videos-message">
              <p>No videos available. Please add videos to the server's video directory.</p>
            </div>
          )}
        </div>
        
        {/* Video selection sidebar */}
        {videos.length > 0 && (
          <div className="video-list">
            <h2>Available Videos</h2>
            <ul>
              {videos.map((video) => (
                <li 
                  key={video.id}
                  className={selectedVideo?.id === video.id ? 'active' : ''}
                  onClick={() => handleVideoSelect(video)}
                >
                  {video.name}
                </li>
              ))}
            </ul>
            <button style={{ backgroundColor: 'green', color: 'white' }} onClick={fetchVideos}>Refresh</button>
          </div>
        )}
      </main>
      
      <footer className="app-footer">
        <p>Custom Canvas-based Video Player Demo</p>
      </footer>
    </div>
  );
}

export default App;