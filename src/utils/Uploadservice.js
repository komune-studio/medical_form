import Upload from "../models/UploadModel";

export default class UploadService {
  static async uploadAnatomyImage(file) {
    try {
      console.log('Uploading anatomy image:', file.name);
      
      const response = await Upload.uploadPicutre(file);
      
      console.log('Upload response:', response);

      // SIMPLE: Langsung ambil location
      if (response && response.location) {
        return response.location;
      }

      // Kalo gak ada location, throw error
      console.error('No location in response:', response);
      throw new Error('Upload failed: No image URL received');
    } catch (error) {
      console.error('Error uploading anatomy image:', error);
      throw error;
    }
  }

  static async uploadAnatomyImages(files) {
    try {
      const uploadPromises = files.map(file => this.uploadAnatomyImage(file));
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Error uploading images:', error);
      throw error;
    }
  }

  static fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  }
}