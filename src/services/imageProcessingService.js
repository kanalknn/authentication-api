const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const logger = require('../utilities/logger');

class ImageProcessingService {
  constructor() {
    this.thumbnailsDir = path.join(__dirname, '../uploads/thumbnails');
  }

  // Generate thumbnail for image files
  async generateThumbnail(filePath, filename) {
    try {
      const thumbnailName = `thumb_${filename}`;
      const thumbnailPath = path.join(this.thumbnailsDir, thumbnailName);

      // Check if file is an image
      const isImage = await this.isImageFile(filePath);
      if (!isImage) {
        return null;
      }

      // Generate thumbnail
      await sharp(filePath)
        .resize(300, 300, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 80 })
        .toFile(thumbnailPath);

      return `/uploads/thumbnails/${thumbnailName}`;
    } catch (error) {
      logger.error('Error generating thumbnail:', error);
      return null;
    }
  }

  // Check if file is an image
  async isImageFile(filePath) {
    try {
      const metadata = await sharp(filePath).metadata();
      return !!metadata.format;
    } catch (error) {
      return false;
    }
  }

  // Get image dimensions
  async getImageDimensions(filePath) {
    try {
      const metadata = await sharp(filePath).metadata();
      return {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format
      };
    } catch (error) {
      logger.error('Error getting image dimensions:', error);
      return null;
    }
  }

  // Optimize image
  async optimizeImage(filePath, outputPath, quality = 85) {
    try {
      const metadata = await sharp(filePath).metadata();
      
      let pipeline = sharp(filePath);
      
      // Resize if too large
      if (metadata.width > 2000 || metadata.height > 2000) {
        pipeline = pipeline.resize(2000, 2000, {
          fit: 'inside',
          withoutEnlargement: true
        });
      }

      // Apply format-specific optimizations
      if (metadata.format === 'jpeg') {
        pipeline = pipeline.jpeg({ quality, progressive: true });
      } else if (metadata.format === 'png') {
        pipeline = pipeline.png({ compressionLevel: 9 });
      } else if (metadata.format === 'webp') {
        pipeline = pipeline.webp({ quality });
      }

      await pipeline.toFile(outputPath);
      return true;
    } catch (error) {
      logger.error('Error optimizing image:', error);
      return false;
    }
  }

  // Create multiple sizes for responsive images
  async createResponsiveImages(filePath, filename) {
    try {
      const sizes = [
        { width: 400, suffix: 'small' },
        { width: 800, suffix: 'medium' },
        { width: 1200, suffix: 'large' }
      ];

      const responsiveImages = [];
      const baseName = path.parse(filename).name;
      const ext = path.parse(filename).ext;

      for (const size of sizes) {
        const outputName = `${baseName}_${size.suffix}${ext}`;
        const outputPath = path.join(path.dirname(filePath), outputName);

        await sharp(filePath)
          .resize(size.width, null, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .jpeg({ quality: 85 })
          .toFile(outputPath);

        responsiveImages.push({
          size: size.suffix,
          width: size.width,
          filename: outputName,
          path: `/uploads/designs/${outputName}`
        });
      }

      return responsiveImages;
    } catch (error) {
      logger.error('Error creating responsive images:', error);
      return [];
    }
  }
}