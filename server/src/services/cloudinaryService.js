import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload a file buffer to Cloudinary
 * @param {Buffer} fileBuffer - The file buffer from multer memoryStorage
 * @param {Object} options - Upload options
 * @param {string} options.folder - Cloudinary folder (e.g. 'wedamate/avatars')
 * @param {string} [options.resourceType] - 'image', 'raw', or 'auto'
 * @param {string} [options.publicId] - Custom public ID
 * @param {Object} [options.transformation] - Cloudinary transformations
 * @returns {Promise<{url: string, publicId: string, format: string}>}
 */
export const uploadToCloudinary = (fileBuffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const {
      folder = 'wedamate',
      resourceType = 'auto',
      publicId,
      transformation
    } = options;

    const uploadOptions = {
      folder,
      resource_type: resourceType,
      ...(publicId && { public_id: publicId }),
      ...(transformation && { transformation })
    };

    const stream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error('[Cloudinary Upload Error]:', error.message);
          return reject(error);
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          format: result.format
        });
      }
    );

    stream.end(fileBuffer);
  });
};

/**
 * Delete a file from Cloudinary by public ID
 * @param {string} publicId - The Cloudinary public ID
 * @param {string} [resourceType] - 'image', 'raw', or 'video'
 */
export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType
    });
    return result;
  } catch (error) {
    console.error('[Cloudinary Delete Error]:', error.message);
    throw error;
  }
};

export default cloudinary;
