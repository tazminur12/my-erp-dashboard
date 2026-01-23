# Cloudinary Upload Utility

This utility provides easy-to-use functions for uploading files to Cloudinary from your React components.

## Setup

Make sure you have the following environment variables set in your `.env.local` file:

```env
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_API_KEY=your_api_key
VITE_CLOUDINARY_API_SECRET=your_api_secret
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
VITE_CLOUDINARY_FOLDER=employees
```

## Usage

### Basic Upload

```javascript
import { uploadToCloudinary } from '../utils/cloudinaryUpload';

const handleFileUpload = async (file) => {
  try {
    const result = await uploadToCloudinary(file, {
      folder: 'employees',
      transformation: 'c_thumb,w_300,h_300'
    });
    
    console.log('Upload successful:', result.secure_url);
    // Use result.secure_url in your component
  } catch (error) {
    console.error('Upload failed:', error.message);
  }
};
```

### Multiple File Upload

```javascript
import { uploadMultipleToCloudinary } from '../utils/cloudinaryUpload';

const handleMultipleUpload = async (files) => {
  try {
    const results = await uploadMultipleToCloudinary(files, {
      folder: 'documents'
    });
    
    console.log('All uploads successful:', results);
  } catch (error) {
    console.error('Upload failed:', error.message);
  }
};
```

### Get Optimized URLs

```javascript
import { getOptimizedImageUrl, getThumbnailUrl } from '../utils/cloudinaryUpload';

const imageUrl = getOptimizedImageUrl('public_id', 'c_scale,w_500,h_500');
const thumbnailUrl = getThumbnailUrl('public_id');
```

## Features

- ✅ Automatic file validation
- ✅ Progress tracking support
- ✅ Error handling
- ✅ Multiple file upload
- ✅ Image transformations
- ✅ Optimized URL generation
- ✅ TypeScript support (if using TypeScript)

## Error Handling

The utility provides comprehensive error handling:

- Configuration validation
- Network errors
- File validation errors
- Cloudinary API errors

Always wrap upload calls in try-catch blocks to handle errors gracefully.

## Security Notes

- Never expose your API secret in client-side code
- Use upload presets for security
- Validate file types and sizes on the client side
- Consider implementing server-side validation as well
