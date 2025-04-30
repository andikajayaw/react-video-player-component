const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

// Load environment variables from .env file if present
try {
  require('dotenv').config();
} catch (err) {
  // dotenv is optional, continue if not available
}

const app = express();
const PORT = process.env.PORT || 3001;
const VIDEOS_DIR = process.env.VIDEO_DIR || './videos';

// Enable CORS with configurable origin
app.use(cors({
  origin: process.env.ALLOW_ORIGIN || '*'
}));

// API endpoint to get list of available videos
app.get('/api/videos', (req, res) => {
  const videosDir = path.join(__dirname, VIDEOS_DIR);
  
  try {
    const files = fs.readdirSync(videosDir)
      .filter(file => {
        // Filter video files only
        const ext = path.extname(file).toLowerCase();
        return ['.mp4', '.webm', '.mov'].includes(ext);
      })
      .map(file => ({
        id: path.parse(file).name,
        name: path.parse(file).name.replace(/-/g, ' '),
        url: `/video/${path.parse(file).name}`,
      }));
      
    res.json({ videos: files });
  } catch (err) {
    console.error('Error reading videos directory:', err);
    res.status(500).json({ error: 'Failed to retrieve videos' });
  }
});

// Video streaming endpoint
app.get('/video/:filename', (req, res) => {
  const filename = req.params.filename;
  const videoPath = path.join(__dirname, VIDEOS_DIR, `${filename}.mp4`);
  
  // Check if file exists
  fs.stat(videoPath, (err, stats) => {
    if (err) {
      console.error('Error accessing video file:', err);
      return res.status(404).json({ error: 'Video not found' });
    }
    
    // Handle range requests for proper video streaming
    const range = req.headers.range;
    const fileSize = stats.size;
    
    if (range) {
      // Parse Range header
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      
      // Calculate chunk size (1MB max)
      const chunkSize = Math.min(end - start + 1, 1024 * 1024);
      const fileStream = fs.createReadStream(videoPath, { start, end });
      
      // Set appropriate headers for streaming
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': 'video/mp4',
      });
      
      // Stream the video chunk
      fileStream.pipe(res);
    } else {
      // No range requested, send entire file (not recommended for large files)
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      });
      
      fs.createReadStream(videoPath).pipe(res);
    }
  });
});

// Default message for root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Video streaming server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Handle 404 errors
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Create video directory if it doesn't exist
try {
  const videosDir = path.join(__dirname, VIDEOS_DIR);
  if (!fs.existsSync(videosDir)) {
    fs.mkdirSync(videosDir, { recursive: true });
    console.log(`Created videos directory: ${videosDir}`);
  }
} catch (err) {
  console.error('Error creating videos directory:', err);
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Video streaming available at http://localhost:${PORT}/video/[filename]`);
  console.log(`Videos directory: ${path.join(__dirname, VIDEOS_DIR)}`);
});