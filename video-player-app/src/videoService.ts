import axios from 'axios';

// API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001';

// Video interface
export interface Video {
  id: string;
  name: string;
  url: string;
}

// Get all available videos
export const getVideos = async (): Promise<Video[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/videos`);
    return response.data.videos || [];
  } catch (error) {
    console.error('Error fetching videos:', error);
    throw new Error('Failed to fetch videos');
  }
};

// Get full video URL
export const getVideoUrl = (videoId: string): string => {
  return `${API_BASE_URL}/video/${videoId}`;
};