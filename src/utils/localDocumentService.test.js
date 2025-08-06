// Simple test for LocalDocumentService
import LocalDocumentService from './localDocumentService';

// Test the filename generation
const testFileNameGeneration = () => {
  const patientId = 'patient123';
  const title = 'Consultation Médicale';
  const fileName = LocalDocumentService.generateFileName(patientId, title);
  
  console.log('Generated filename:', fileName);
  
  // Check if filename follows the pattern
  const pattern = /^patient123_\d{4}-\d{2}-\d{2}_\d+_Consultation_Medicale\.txt$/;
  const isValid = pattern.test(fileName);
  
  console.log('Filename is valid:', isValid);
  return isValid;
};

// Test document saving
const testDocumentSaving = async () => {
  const content = 'Test document content';
  const patientId = 'testPatient';
  const title = 'Test Document';
  const type = 'word_template';
  
  try {
    const result = await LocalDocumentService.saveDocumentLocally(content, patientId, title, type);
    console.log('Document saved successfully:', result);
    
    // Test retrieval
    const documents = LocalDocumentService.getLocalDocuments(patientId);
    console.log('Retrieved documents:', documents);
    
    return documents.length > 0;
  } catch (error) {
    console.error('Error saving document:', error);
    return false;
  }
};

// Run tests
console.log('=== Testing LocalDocumentService ===');
console.log('1. Testing filename generation...');
const filenameTest = testFileNameGeneration();

console.log('2. Testing document saving...');
testDocumentSaving().then(saveTest => {
  console.log('All tests completed:');
  console.log('- Filename generation:', filenameTest ? 'PASS' : 'FAIL');
  console.log('- Document saving:', saveTest ? 'PASS' : 'FAIL');
});

export { testFileNameGeneration, testDocumentSaving }; 