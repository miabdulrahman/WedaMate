import { uploadToCloudinary, deleteFromCloudinary } from '../services/cloudinaryService.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

/**
 * Upload a single image (avatar, portfolio, etc.)
 * POST /api/upload/image
 * Accepts multipart/form-data with field "file"
 * Optional query param: folder (default: 'wedamate/general')
 */
export const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return sendError(res, 'Please provide an image file', [], 400);
    }

    const folder = req.query.folder || 'wedamate/general';

    const result = await uploadToCloudinary(req.file.buffer, {
      folder,
      transformation: [
        { quality: 'auto', fetch_format: 'auto' }
      ]
    });

    return sendSuccess(res, 'Image uploaded successfully', {
      url: result.url,
      publicId: result.publicId,
      format: result.format
    }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Upload an avatar image with auto-cropping
 * POST /api/upload/avatar
 * Accepts multipart/form-data with field "file"
 */
export const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return sendError(res, 'Please provide an image file', [], 400);
    }

    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'wedamate/avatars',
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
        { quality: 'auto', fetch_format: 'auto' }
      ]
    });

    return sendSuccess(res, 'Avatar uploaded successfully', {
      url: result.url,
      publicId: result.publicId
    }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Upload a KYC/verification document
 * POST /api/upload/document
 * Accepts multipart/form-data with field "file"
 */
export const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return sendError(res, 'Please provide a document file', [], 400);
    }

    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'wedamate/documents',
      resourceType: 'auto'
    });

    return sendSuccess(res, 'Document uploaded successfully', {
      url: result.url,
      publicId: result.publicId,
      format: result.format
    }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete an uploaded file by public ID
 * DELETE /api/upload/:publicId
 */
export const deleteUpload = async (req, res, next) => {
  try {
    const { publicId } = req.params;
    const resourceType = req.query.type || 'image';

    if (!publicId) {
      return sendError(res, 'Please provide a public ID', [], 400);
    }

    // Decode the public ID (it may contain slashes encoded as dashes)
    const decodedId = decodeURIComponent(publicId);
    await deleteFromCloudinary(decodedId, resourceType);

    return sendSuccess(res, 'File deleted successfully');
  } catch (error) {
    next(error);
  }
};
