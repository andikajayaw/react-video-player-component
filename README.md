# Video Player Application

This project consists of a React + TypeScript frontend with a custom canvas-based video player and a Node.js backend for video streaming.

Installation guide: https://drive.google.com/file/d/19hq3VL_l_QJ52lap9X5T1ntSuEboDARE/view?usp=sharing

## Features

### Frontend
- Custom video player using Canvas API for rendering
- Playback controls (play/pause, seek bar, mute, fullscreen)
- Watermark and timestamp overlay
- Loading and error states with recovery options
- Video selection interface

### Backend
- Simple Node.js Express server
- Video streaming with byte-range support
- API endpoint to list available videos

## Project Structure

```
├── video-player-app/ (Frontend)
│   ├── src/
│   │   ├── App.tsx
│   │   ├── App.css
│   │   ├── VideoPlayer.tsx
│   │   ├── VideoPlayer.css
│   │   └── videoService.ts
│   └── ...
└── video-server/ (Backend)
    ├── server.js
    ├── videos/ (where video files are stored)
    └── ...
```

## Getting Started

### Backend Setup

1. Navigate to the `video-server` directory:
   ```
   cd video-server
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Add video files (MP4 format) to the `videos` directory

4. Start the server:
   ```
   node server.js
   ```

The server will run on http://localhost:3001

### Frontend Setup

1. Navigate to the `video-player-app` directory:
   ```
   cd video-player-app
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

The app will be available at http://localhost:5173

## How It Works

### Video Streaming
The backend uses Express to serve video chunks with proper HTTP range headers for efficient streaming.

### Canvas Rendering
Instead of using the standard HTML5 video element for display, the frontend renders video frames to a canvas element. This approach allows for:
- Custom overlays (watermark, timestamp)
- Potential for video processing and effects
- More control over the video playback appearance

## Technologies Used

### Frontend
- React
- TypeScript
- Vite
- HTML5 Canvas API

### Backend
- Node.js
- Express
- File System API

## Requirements
- Node.js 14+
- Modern web browser with Canvas API support
- Video files in MP4 format

## Future Enhancements
- Support for multiple video formats (WebM, MOV, etc.)
- Video quality selector
- Playback speed controls
- Picture-in-picture mode
- Video analytics and tracking
- Custom video filters and effects using WebGL

## Troubleshooting

### CORS Issues
If you encounter CORS errors, ensure the backend server has CORS enabled (already implemented in the provided code).

### Video Loading Problems
- Verify that video files are in the correct format (MP4)
- Check file permissions on the video directory
- Ensure videos are accessible via direct URL (e.g., http://localhost:3001/video/example)

### Canvas Rendering Issues
- Check browser compatibility (Canvas API is widely supported in modern browsers)
- Verify that the video is properly loaded before attempting to render frames

## License
MIT
