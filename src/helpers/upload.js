const multer = require("multer");
const path = require("path");
const ImageKit = require("imagekit");
const ApiError = require("../utils/ApiError");

// Memory storage for direct in-memory upload to ImageKit
const storage = multer.memoryStorage();

// File filter (Images only: jpg, jpeg, png, webp, svg)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|svg/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  }

  cb(new ApiError(400, "Only image files (JPEG, PNG, WebP, SVG) are allowed!"), false);
};

// Multer Upload Instance
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter,
});

/**
 * Get configured ImageKit instance dynamically from environment
 */
  const getImageKitInstance = () => {
    const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

    if (!publicKey || !privateKey || !urlEndpoint || publicKey.includes("your_imagekit")) {
      throw new ApiError(
        400,
        "ImageKit credentials are not properly configured in fitbari_backend/.env. Please check IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, and IMAGEKIT_URL_ENDPOINT."
      );
    }

        return new ImageKit({
          publicKey,
          privateKey,
          urlEndpoint,
        });
      };

  /**
   * Upload buffer directly to ImageKit Cloud CDN
   * @param {Buffer} fileBuffer - File buffer from multer memoryStorage
   * @param {string} originalName - Destination file name
   * @param {string} folder - Destination folder on ImageKit (e.g. "/fitbari/products")
   */
  const uploadToImageKit = async (fileBuffer, originalName, folder = "/fitbari/products") => {
    const ik = getImageKitInstance();

    // Convert buffer to base64 string (ImageKit Node SDK best practice)
    const base64File = fileBuffer.toString("base64");
    const cleanFolder = folder.startsWith("/") ? folder : `/${folder}`;

  try {
    const uploadResponse = await ik.upload({
      file: base64File,
      fileName: originalName,
      folder: cleanFolder,
      useUniqueFileName: true,
    });

      if (!uploadResponse || !uploadResponse.url) {
        throw new Error("No URL returned by ImageKit upload response");
      }

      return {
        url: uploadResponse.url,
        fileId: uploadResponse.fileId,
        thumbnailUrl: uploadResponse.thumbnailUrl || uploadResponse.url,
        name: uploadResponse.name,
        provider: "imagekit",
      };
    } catch (error) {
      console.error("ImageKit upload error:", error);
      throw new ApiError(500, `ImageKit Upload Failed: ${error.message || error}`);
    }
  };

  /**
   * Delete file from ImageKit by fileId
   * @param {string} fileId
   */
  const deleteFromImageKit = async (fileId) => {
    const ik = getImageKitInstance();
    try {
      await ik.deleteFile(fileId);
      return { success: true };
    } catch (error) {
      throw new ApiError(500, `ImageKit Delete Failed: ${error.message || error}`);
    }
  };

  module.exports = {
    upload,
    uploadToImageKit,
    deleteFromImageKit,
    getImageKitInstance,
  };
