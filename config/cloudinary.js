// Cloudinary Configuration
export const CLOUDINARY_CONFIG = {
  CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '',
  UPLOAD_PRESET: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '',
  API_KEY: process.env.CLOUDINARY_API_KEY || '',
  API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
  UPLOAD_URL: `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || ''}/image/upload`,
};

// Validate Cloudinary configuration
export const validateCloudinaryConfig = () => {
  if (!CLOUDINARY_CONFIG.CLOUD_NAME) {
    console.error('Missing NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME');
    return false;
  }
  if (!CLOUDINARY_CONFIG.UPLOAD_PRESET) {
    console.error('Missing NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET');
    return false;
  }
  return true;
};

// Upload file to Cloudinary
export const uploadToCloudinary = async (file, folder = 'hajj-documents') => {
  if (!validateCloudinaryConfig()) {
    throw new Error('Cloudinary configuration is incomplete');
  }

  if (!file) {
    throw new Error('No file provided');
  }

  // Validate file size (5MB limit)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('File size must be less than 5MB');
  }

  // Create FormData for Cloudinary upload
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_CONFIG.UPLOAD_PRESET);
  formData.append('folder', folder);

  // Upload to Cloudinary
  const response = await fetch(CLOUDINARY_CONFIG.UPLOAD_URL, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Upload failed with status: ${response.status}`);
  }

  const result = await response.json();
  return result.secure_url;
};
