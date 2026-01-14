const cloudinary = require('cloudinary').v2;
const logger = require('./logger');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadImage = async (file, folder = 'blog-images') => {
  try {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: process.env.CLOUDINARY_FOLDER || folder,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) {
            logger.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
            });
          }
        }
      );

      uploadStream.end(file.buffer);
    });
  } catch (error) {
    logger.error('Upload image error:', error);
    throw error;
  }
};

const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    logger.info(`Image deleted: ${publicId}`);
    return result;
  } catch (error) {
    logger.error('Delete image error:', error);
    throw error;
  }
};

module.exports = {
  uploadImage,
  deleteImage,
};