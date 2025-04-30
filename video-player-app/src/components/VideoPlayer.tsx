import { useEffect, useRef, useState } from 'react';
import './VideoPlayer.css';

interface VideoPlayerProps {
  videoUrl: string;
  watermarkText?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, watermarkText = 'Video Player Component' }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showControls, setShowControls] = useState<boolean>(true);
  const controlsTimeoutRef = useRef<number | null>(null);
  
  // Function to draw the current video frame to canvas
  const renderFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // // Draw watermark
    // if (watermarkText) {
    //   ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    //   ctx.font = 'bold 16px Arial';
    //   ctx.textAlign = 'right';
    //   ctx.fillText(watermarkText, 10, 30);
      
    //   // Draw timestamp
    //   const time = formatTime(video.currentTime);
    //   ctx.fillText(time, canvas.width - 20, 30);
    // }
    // Draw watermark
    if (watermarkText) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = 'bold 24px Arial';
      
      // Draw watermark text in top left
      ctx.textAlign = 'left'; // Changed from 'right' to 'left'
      ctx.fillText(watermarkText, 10, 30);
      
      // Draw timestamp in top right
      const time = formatTime(video.currentTime);
      ctx.textAlign = 'right'; // Set alignment to right for timestamp
      ctx.fillText(time, canvas.width - 20, 30);
    }
    
    // Request next frame
    if (video.paused || video.ended) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    } else {
      animationRef.current = requestAnimationFrame(renderFrame);
    }
  };
  
  // Format time in mm:ss format
  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Handle play/pause
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (video.paused) {
      video.play()
        .then(() => {
          setIsPlaying(true);
          renderFrame();
        })
        .catch(err => {
          console.error('Error playing video:', err);
          setError('Failed to play video');
        });
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };
  
  // Handle seek
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    
    const value = parseFloat(e.target.value);
    video.currentTime = value;
    setCurrentTime(value);
    
    // If paused, render the current frame
    if (video.paused && canvasRef.current) {
      renderFrame();
    }
  };
  
  // Handle mute toggle
  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };
  
  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;
    
    if (!document.fullscreenElement) {
      container.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error('Fullscreen error:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(err => {
        console.error('Exit fullscreen error:', err);
      });
    }
  };
  
  // Handle retry on error
  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    
    const video = videoRef.current;
    if (video) {
      video.load();
    }
  };
  
  // Show/hide controls based on mouse movement
  const handleMouseMove = () => {
    setShowControls(true);
    
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    controlsTimeoutRef.current = window.setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };
  
  // Set up video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoading(false);
    };
    
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
    };
    
    const handleError = () => {
      setError('Failed to load video');
      setIsLoading(false);
    };
    if(video) {
      renderFrame();
      video.pause();
      setIsPlaying(false);
      setIsMuted(false);
    }
    
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);
    
    // Start rendering when video starts playing
    video.addEventListener('play', renderFrame);
    
    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
      video.removeEventListener('play', renderFrame);
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [videoUrl]);
  
  // Clean up controls timeout
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [videoUrl]);
  
  return (
    <div 
      ref={containerRef} 
      className="video-player-container" 
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setShowControls(true)}
    >
      {/* Hidden video element to handle playback */}
      <video 
        ref={videoRef} 
        src={videoUrl} 
        muted={isMuted} 
        preload="metadata"
        playsInline
        crossOrigin="anonymous"
        style={{ display: 'none' }}
      />
      
      {/* Canvas element for rendering video frames */}
      <canvas 
        ref={canvasRef} 
        className="video-canvas" 
        onClick={togglePlay}
      />
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="video-overlay loading">
          <div className="spinner"></div>
          <p>Loading video...</p>
        </div>
      )}
      
      {/* Error indicator */}
      {error && (
        <div className="video-overlay error">
          <p>{error}</p>
          <button onClick={handleRetry}>Retry</button>
        </div>
      )}
      
      {/* Playback controls */}
      {!error && showControls && (
        <div className="video-controls">
          <button className="control-button" onClick={togglePlay}>
            {isPlaying ? '❚❚' : '▶'}
          </button>
          
          <div className="seek-container">
            <span className="time-display">{formatTime(currentTime)}</span>
            <input 
              type="range" 
              min="0" 
              max={duration} 
              value={currentTime} 
              onChange={handleSeek} 
              className="seek-bar"
            />
            <span className="time-display">{formatTime(duration)}</span>
          </div>
          
          <button className="control-button" onClick={toggleMute}>
            {isMuted ? '🔇' : '🔊'}
          </button>
          
          <button className="control-button" onClick={toggleFullscreen}>
            {isFullscreen ? '↙' : '↗'}
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;