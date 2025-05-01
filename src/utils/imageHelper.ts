/**
 * Helper function to get the correct image URL for different source types
 * - Handles Cloudinary URLs
 * - Handles local file paths
 * - Provides a fallback for missing images
 */
export const getImageUrl = (imageUrl: string | undefined): string => {
  if (!imageUrl) {
    return '/placeholder-image.jpg';
  }
  
  // If it's already a full URL (Cloudinary or other external source)
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // If it's a Cloudinary URL missing the protocol
  if (imageUrl.includes('res.cloudinary.com')) {
    return `https://${imageUrl}`;
  }
  
  // For local file paths in development vs production
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  return `${apiUrl}/uploads/${imageUrl}`;
}; 