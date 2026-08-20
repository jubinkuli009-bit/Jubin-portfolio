/**
 * Helper to process and optimize image files picked from phone gallery, camera, or desktop file picker.
 * Automatically downscales large camera shots to web-friendly crisp resolutions with high quality.
 */
export async function processImageFile(
  file: File,
  maxDimension: number = 1000,
  quality: number = 0.9
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return reject(new Error('Selected file is not an image.'));
    }

    const reader = new FileReader();

    reader.onload = (readerEvent) => {
      const result = readerEvent.target?.result as string;
      if (!result) {
        return reject(new Error('Failed to read image data.'));
      }

      // If already small SVG or small image, return directly
      if (file.type === 'image/svg+xml' || file.size < 50 * 1024) {
        return resolve(result);
      }

      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(result);
        }

        // Clean rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const optimizedDataUrl = canvas.toDataURL(mimeType, quality);
        resolve(optimizedDataUrl);
      };

      img.onerror = () => {
        // Fallback to raw data url if canvas fails
        resolve(result);
      };

      img.src = result;
    };

    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}
