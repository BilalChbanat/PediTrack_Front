// Local Document Service for saving documents to file system
class LocalDocumentService {
  // Generate filename with patient ID and timestamp
  static generateFileName(patientId, title = 'document') {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + 
                     new Date().getTime();
    const sanitizedTitle = title.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '_');
    return `${patientId}_${timestamp}_${sanitizedTitle}`;
  }

  // Save document content to local file system
  static async saveDocumentLocally(content, patientId, title, type = 'document') {
    try {
      const fileName = this.generateFileName(patientId, title);
      const fileExtension = this.getFileExtension(type);
      const fullFileName = `${fileName}.${fileExtension}`;
      
      // Create document object
      const documentData = {
        _id: `local_${Date.now()}`,
        title: title,
        fileName: fullFileName,
        type: type,
        patientId: patientId,
        content: content,
        url: `/src/data/documents/${fullFileName}`,
        createdAt: new Date().toISOString(),
        isLocal: true,
        size: content.length,
        originalFileName: title
      };

      // In a real application, you would save to the file system here
      // For now, we'll store in localStorage as a fallback
      this.saveToLocalStorage(documentData);
      
      console.log(`Document saved locally: ${fullFileName}`);
      return documentData;
    } catch (error) {
      console.error('Error saving document locally:', error);
      throw error;
    }
  }

  // Get file extension based on document type
  static getFileExtension(type) {
    switch (type) {
      case 'word_template':
      case 'document':
        return 'txt';
      case 'pdf':
        return 'pdf';
      case 'docx':
        return 'docx';
      case 'image':
        return 'jpg';
      case 'text':
        return 'txt';
      default:
        return 'txt';
    }
  }

  // Get file extension from file object
  static getFileExtensionFromFile(file) {
    if (file && file.name) {
      const parts = file.name.split('.');
      if (parts.length > 1) {
        return parts[parts.length - 1].toLowerCase();
      }
    }
    return 'txt';
  }

  // Save document metadata to localStorage
  static saveToLocalStorage(documentData) {
    try {
      const existingDocuments = JSON.parse(localStorage.getItem('localDocuments') || '[]');
      existingDocuments.push(documentData);
      localStorage.setItem('localDocuments', JSON.stringify(existingDocuments));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  // Get all local documents for a patient
  static getLocalDocuments(patientId) {
    try {
      const allDocuments = JSON.parse(localStorage.getItem('localDocuments') || '[]');
      return allDocuments.filter(doc => doc.patientId === patientId);
    } catch (error) {
      console.error('Error getting local documents:', error);
      return [];
    }
  }

  // Get all local documents
  static getAllLocalDocuments() {
    try {
      return JSON.parse(localStorage.getItem('localDocuments') || '[]');
    } catch (error) {
      console.error('Error getting all local documents:', error);
      return [];
    }
  }

  // Delete local document
  static deleteLocalDocument(documentId) {
    try {
      const allDocuments = JSON.parse(localStorage.getItem('localDocuments') || '[]');
      const filteredDocuments = allDocuments.filter(doc => doc._id !== documentId);
      localStorage.setItem('localDocuments', JSON.stringify(filteredDocuments));
      return true;
    } catch (error) {
      console.error('Error deleting local document:', error);
      return false;
    }
  }

  // Download document content
  static downloadDocument(documentData) {
    try {
      let blob;
      let mimeType = 'text/plain;charset=utf-8';
      
      // Determine MIME type based on file extension
      const extension = documentData.fileName.split('.').pop().toLowerCase();
      switch (extension) {
        case 'pdf':
          mimeType = 'application/pdf';
          break;
        case 'docx':
          mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          break;
        case 'jpg':
        case 'jpeg':
          mimeType = 'image/jpeg';
          break;
        case 'png':
          mimeType = 'image/png';
          break;
        case 'gif':
          mimeType = 'image/gif';
          break;
        default:
          mimeType = 'text/plain;charset=utf-8';
      }
      
      // Handle base64 content (for binary files)
      if (documentData.content.startsWith('data:')) {
        // Convert base64 to blob
        const response = fetch(documentData.content);
        response.then(res => res.blob()).then(blobData => {
          const url = window.URL.createObjectURL(blobData);
          const a = document.createElement('a');
          a.href = url;
          a.download = documentData.fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        });
      } else {
        // Handle text content
        blob = new Blob([documentData.content], { type: mimeType });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = documentData.fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      throw error;
    }
  }

  // Export document to different formats
  static async exportDocument(documentData, format = 'txt') {
    try {
      let content = documentData.content;
      let mimeType = 'text/plain';
      let extension = 'txt';

      switch (format) {
        case 'pdf':
          // For PDF, we would need to convert the content
          // This is a simplified version
          mimeType = 'application/pdf';
          extension = 'pdf';
          break;
        case 'docx':
          // For DOCX, we would need to convert the content
          mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          extension = 'docx';
          break;
        default:
          mimeType = 'text/plain';
          extension = 'txt';
      }

      const blob = new Blob([content], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${documentData.fileName.split('.')[0]}.${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting document:', error);
      throw error;
    }
  }
}

export default LocalDocumentService; 