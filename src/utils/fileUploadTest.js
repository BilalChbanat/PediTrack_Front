// Test file upload functionality
import DocumentService from '../api/documentService';
import LocalDocumentService from './localDocumentService';

// Test file upload
const testFileUpload = async () => {
  console.log('=== Testing File Upload ===');
  
  // Create a test file
  const testContent = 'This is a test document content for file upload testing.';
  const testFile = new File([testContent], 'test-document.txt', { type: 'text/plain' });
  
  const patientId = 'testPatient123';
  const title = 'Test Upload Document';
  const type = 'document';
  
  try {
    console.log('1. Testing file upload...');
    const result = await DocumentService.uploadDocument(testFile, patientId, title, type);
    console.log('Upload result:', result);
    
    console.log('2. Testing document retrieval...');
    const documents = await DocumentService.getDocuments(patientId);
    console.log('Retrieved documents:', documents);
    
    console.log('3. Testing local documents...');
    const localDocuments = LocalDocumentService.getLocalDocuments(patientId);
    console.log('Local documents:', localDocuments);
    
    const success = documents.length > 0 && localDocuments.length > 0;
    console.log('Test result:', success ? 'PASS' : 'FAIL');
    
    return success;
  } catch (error) {
    console.error('Test failed:', error);
    return false;
  }
};

// Test different file types
const testDifferentFileTypes = async () => {
  console.log('=== Testing Different File Types ===');
  
  const patientId = 'testPatient456';
  const testCases = [
    {
      content: 'PDF test content',
      fileName: 'test.pdf',
      type: 'application/pdf',
      expectedType: 'pdf'
    },
    {
      content: 'Word document test content',
      fileName: 'test.docx',
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      expectedType: 'docx'
    },
    {
      content: 'Image test content',
      fileName: 'test.jpg',
      type: 'image/jpeg',
      expectedType: 'image'
    }
  ];
  
  for (const testCase of testCases) {
    try {
      const testFile = new File([testCase.content], testCase.fileName, { type: testCase.type });
      const result = await DocumentService.uploadDocument(testFile, patientId, testCase.fileName, 'document');
      
      console.log(`File type ${testCase.expectedType}:`, result.fileName.includes(testCase.expectedType) ? 'PASS' : 'FAIL');
    } catch (error) {
      console.error(`File type ${testCase.expectedType} failed:`, error);
    }
  }
};

// Run tests
export const runFileUploadTests = async () => {
  console.log('Starting file upload tests...');
  
  const basicTest = await testFileUpload();
  await testDifferentFileTypes();
  
  console.log('All file upload tests completed!');
  return basicTest;
};

// Auto-run tests if imported directly
if (typeof window !== 'undefined') {
  runFileUploadTests();
} 