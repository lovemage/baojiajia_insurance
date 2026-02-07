
type UploadToCloudinaryOptions = {
  forceFormat?: string;
};

export const uploadToCloudinary = async (file: File, options: UploadToCloudinaryOptions = {}): Promise<string> => {
  const cloudName = 'dkmqvyso4';
  const uploadPreset = 'baojiajia_upload';

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  if (options.forceFormat) {
    formData.append('format', options.forceFormat);
  }

  try {
    const resourceType = file.type.startsWith('video/') ? 'video' : 'image';
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Upload failed');
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

export const uploadImageToCloudinaryWebp = async (file: File): Promise<string> => {
  return uploadToCloudinary(file, { forceFormat: 'webp' });
};
