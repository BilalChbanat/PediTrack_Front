
import axiosInstance from "@/api/axiosInstance";

export const uploadLogo = async (logoForm) => {
  try {
    // Validate that we have a proper file
    if (!logoForm.file || !(logoForm.file instanceof File)) {
      throw new Error('No valid file provided');
    }

    console.log('Creating FormData with:', {
      file: logoForm.file,
      fileName: logoForm.file.name,
      fileSize: logoForm.file.size,
      fileType: logoForm.file.type,
      logoName: logoForm.name,
      description: logoForm.description
    });

    const formData = new FormData();
    
    // Append file first
    formData.append('logo', logoForm.file, logoForm.file.name);
    
    // Append other fields
    formData.append('logoName', logoForm.name || '');
    formData.append('description', logoForm.description || '');

    // Log FormData contents (for debugging)
    console.log('FormData contents:');
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    const response = await axiosInstance.post('/documents/doctors/logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000, // 30 second timeout for file uploads
    });

    // Accept both 200 and 201 status codes
    if (response.status !== 200 && response.status !== 201) {
      throw new Error(`Upload failed with status: ${response.status}`);
    }

    console.log('Upload successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error uploading logo:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
    }
    throw error;
  }
};



export const getLogo = async () => {
  try {
    const response = await axiosInstance.get(`/documents/doctor/logo`);
    console.log('Logo fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching logo:', error);
    throw error;
  }
};