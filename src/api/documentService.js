import axiosInstance from './axiosInstance';
import LocalDocumentService from '../utils/localDocumentService';

class DocumentService {
  // Upload a document file
  static async uploadDocument(file, patientId, title, type = 'document') {
    try {
      // Save locally first
      const fileExtension = LocalDocumentService.getFileExtensionFromFile(file);
      const customType = this.getTypeFromExtension(fileExtension);
      
      // Read file content based on type
      let fileContent;
      if (this.isBinaryFile(fileExtension)) {
        fileContent = await this.readFileAsBase64(file);
      } else {
        fileContent = await this.readFileAsText(file);
      }
      
      const localDocument = await LocalDocumentService.saveDocumentLocally(
        fileContent,
        patientId,
        title,
        customType
      );
      
      // Also try to upload to server if available
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('patientId', patientId);
        formData.append('title', title);
        formData.append('type', type);
        
        const response = await axiosInstance.post('/documents/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        return { ...localDocument, serverId: response.data._id };
      } catch (serverError) {
        console.warn('Server upload failed, document saved locally only:', serverError);
        return localDocument;
      }
    } catch (error) {
      console.error('Document upload error:', error);
      throw error;
    }
  }

  // Check if file is binary
  static isBinaryFile(extension) {
    const binaryExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'doc', 'docx', 'xls', 'xlsx'];
    return binaryExtensions.includes(extension.toLowerCase());
  }

  // Helper method to read file as base64
  static readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  }

  // Helper method to determine type from file extension
  static getTypeFromExtension(extension) {
    switch (extension.toLowerCase()) {
      case 'pdf':
        return 'pdf';
      case 'doc':
      case 'docx':
        return 'docx';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return 'image';
      case 'txt':
        return 'text';
      default:
        return 'document';
    }
  }

  // Helper method to read file as text
  static readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  }

  // Upload a Word template as a document
  static async uploadWordTemplate(content, patientId, title, type = 'word_template') {
    try {
      // Save locally first
      const localDocument = await LocalDocumentService.saveDocumentLocally(
        content, 
        patientId, 
        title, 
        type
      );
      
      // Also try to upload to server if available
      try {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const file = new File([blob], `${title}.txt`, { type: 'text/plain' });
        const serverDocument = await this.uploadDocument(file, patientId, title, type);
        return { ...localDocument, serverId: serverDocument._id };
      } catch (serverError) {
        console.warn('Server upload failed, document saved locally only:', serverError);
        return localDocument;
      }
    } catch (error) {
      console.error('Word template upload error:', error);
      throw error;
    }
  }

  // Get all documents for a patient
  static async getDocuments(patientId) {
    try {
      // Get local documents
      const localDocuments = LocalDocumentService.getLocalDocuments(patientId);
      
      // Try to get server documents
      try {
        const response = await axiosInstance.get(`/documents/patient/${patientId}`);
        const serverDocuments = response.data;
        
        // Merge local and server documents, avoiding duplicates
        const allDocuments = [...localDocuments];
        serverDocuments.forEach(serverDoc => {
          const exists = allDocuments.find(localDoc => 
            localDoc.serverId === serverDoc._id || localDoc._id === serverDoc._id
          );
          if (!exists) {
            allDocuments.push(serverDoc);
          }
        });
        
        return allDocuments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      } catch (serverError) {
        console.warn('Server documents fetch failed, returning local documents only:', serverError);
        return localDocuments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
    } catch (error) {
      console.error('Get documents error:', error);
      throw error;
    }
  }

  // Get a specific document
  static async getDocument(documentId) {
    try {
      const response = await axiosInstance.get(`/documents/${documentId}`);
      return response.data;
    } catch (error) {
      console.error('Get document error:', error);
      throw error;
    }
  }

  // Delete a document
  static async deleteDocument(documentId) {
    try {
      // Check if it's a local document
      if (documentId.startsWith('local_')) {
        const success = LocalDocumentService.deleteLocalDocument(documentId);
        return { success, message: 'Local document deleted' };
      }
      
      // Try to delete from server
      try {
        const response = await axiosInstance.delete(`/documents/${documentId}`);
        return response.data;
      } catch (serverError) {
        console.warn('Server delete failed:', serverError);
        throw serverError;
      }
    } catch (error) {
      console.error('Delete document error:', error);
      throw error;
    }
  }

  // Download a document
  static async downloadDocument(documentId) {
    try {
      // Check if it's a local document
      if (documentId.startsWith('local_')) {
        const allDocuments = LocalDocumentService.getAllLocalDocuments();
        const document = allDocuments.find(doc => doc._id === documentId);
        if (document) {
          return document.content;
        }
        throw new Error('Local document not found');
      }
      
      // Try to download from server
      try {
        const response = await axiosInstance.get(`/documents/${documentId}/download`, {
          responseType: 'blob',
        });
        return response.data;
      } catch (serverError) {
        console.warn('Server download failed:', serverError);
        throw serverError;
      }
    } catch (error) {
      console.error('Download document error:', error);
      throw error;
    }
  }
}

export default DocumentService; 