import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '../lib/firebase'

/**
 * Upload an image file to Firebase Storage
 * @param file - The image file to upload
 * @param folder - The folder path in storage (e.g., 'events', 'profiles')
 * @returns Promise with the download URL of the uploaded image
 */
export const uploadImage = async (
  file: File,
  folder: string = 'events'
): Promise<string> => {
  // Validate file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file type. Please upload a valid image (JPEG, PNG, GIF, or WebP)')
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024 // 5MB in bytes
  if (file.size > maxSize) {
    throw new Error('File too large. Maximum size is 5MB')
  }

  try {
    // Create a unique filename using timestamp
    const timestamp = Date.now()
    const fileName = `${folder}/${timestamp}_${file.name}`
    
    // Create a storage reference
    const storageRef = ref(storage, fileName)
    
    // Upload the file
    const snapshot = await uploadBytes(storageRef, file)
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref)
    
    return downloadURL
  } catch (error) {
    console.error('Error uploading image:', error)
    throw new Error('Failed to upload image. Please try again.')
  }
}
