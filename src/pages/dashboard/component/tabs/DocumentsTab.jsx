import React, { useMemo, useState } from 'react';


import {
  Card,
  CardBody,
  CardFooter,
  Typography,
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input
} from "@material-tailwind/react";
import {
  DocumentTextIcon,
  PlusIcon,
  TrashIcon as SolidTrashIcon,
  DocumentArrowDownIcon as SolidDownloadIcon
} from "@heroicons/react/24/solid";
import {
  DocumentArrowDownIcon as OutlineDownloadIcon,
  DocumentTextIcon as DocumentTextIconOutline,

} from "@heroicons/react/24/outline";
import axiosInstance from '@/api/axiosInstance';
import { formatDate } from '@/utils/prescriptionUtils';

// Document type icons
const DOCUMENT_TYPE_ICONS = {
  pdf: <div className="h-10 w-10 text-red-500">📄</div>,
  jpg: <div className="h-10 w-10 text-blue-500">🖼️</div>,
  jpeg: <div className="h-10 w-10 text-blue-500">🖼️</div>,
  png: <div className="h-10 w-10 text-green-500">🖼️</div>,
  doc: <div className="h-10 w-10 text-blue-600">📝</div>,
  docx: <div className="h-10 w-10 text-blue-600">📝</div>,
  xls: <div className="h-10 w-10 text-green-600">📊</div>,
  xlsx: <div className="h-10 w-10 text-green-600">📊</div>,
  default: <div className="h-10 w-10 text-gray-500">📁</div>,
};

const getFileIcon = (fileName) => {
  if (!fileName) return DOCUMENT_TYPE_ICONS.default;
  const extension = fileName.split('.').pop().toLowerCase();
  return DOCUMENT_TYPE_ICONS[extension] || DOCUMENT_TYPE_ICONS.default;
};

// Document Management Components
const DocumentsTab = ({ 
  documents, 
  patientName, 
  onUpload,
  onDelete 
}) => {
  const groupedDocuments = useMemo(() => {
    const groups = {};
    documents.forEach(document => {
      const year = new Date(document.createdAt).getFullYear();
      if (!groups[year]) groups[year] = [];
      groups[year].push(document);
    });
    return groups;
  }, [documents]);

  return (
    <div className="px-4">
      <div className="flex items-center justify-between mb-6">
        <Typography variant="h4" color="blue-gray">
          Patient Documents
        </Typography>
        <Button variant="gradient" onClick={onUpload}>
          <PlusIcon className="h-4 w-4 mr-1" />
          Upload Document
        </Button>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-16 bg-blue-gray-50/30 rounded-xl">
          <DocumentTextIcon className="h-16 w-16 mx-auto text-blue-gray-300 mb-4" />
          <Typography variant="h5" color="blue-gray" className="mb-2">
            No Documents Found
          </Typography>
          <Button variant="gradient" onClick={onUpload}>
            Upload First Document
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedDocuments)
            .sort(([yearA], [yearB]) => yearB - yearA)
            .map(([year, yearDocuments]) => (
              <div key={year}>
                <Typography variant="h5" color="blue-gray" className="mb-4">
                  {year}
                </Typography>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {yearDocuments.map((document) => (
                    <Card key={document._id} className="border border-blue-gray-50 hover:shadow-md transition-shadow h-full flex flex-col">
                      <CardBody className="flex flex-col items-center text-center p-6">
                        <div className="mb-4">
                          {getFileIcon(document.url)}
                        </div>
                        <Typography variant="h6" color="blue-gray" className="mb-2 truncate w-full">
                          {document.title || document.url.split('/').pop()}
                        </Typography>
                        <Typography variant="small" className="text-blue-gray-500 mb-4">
                          {formatDate(document.createdAt)}
                        </Typography>
                      </CardBody>
                      <CardFooter className="flex justify-center gap-4 p-4 pt-0 mt-auto">
                        <a 
                          href={`${axiosInstance.defaults.baseURL}${document.url}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <Button variant="gradient" size="sm">
                            <OutlineDownloadIcon className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        </a>
                        <Button 
                          variant="outlined" 
                          color="red" 
                          size="sm"
                          onClick={() => onDelete(document)}
                        >
                          <SolidTrashIcon className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

const DocumentUploadModal = ({ 
  open, 
  onClose, 
  formData, 
  setFormData, 
  onSubmit, 
  loading 
}) => {
  const handleFileChange = (e) => {
    setFormData(prev => ({ 
      ...prev, 
      file: e.target.files[0] 
    }));
  };

  return (
    <Dialog open={open} handler={onClose} size="md">
      <DialogHeader>Upload New Document</DialogHeader>
      <DialogBody divider>
        <div className="grid gap-6">
          <Input
            label="Document Title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            required
          />
          
          <div>
            <input
              type="file"
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
              required
            />
          </div>
        </div>
      </DialogBody>
      <DialogFooter>
        <Button
          variant="text"
          color="red"
          onClick={onClose}
          className="mr-1"
          disabled={loading}
        >
          Cancel
        </Button>
        <Button 
          variant="gradient" 
          color="green" 
          onClick={onSubmit}
          disabled={!formData.title || !formData.file || loading}
        >
          {loading ? "Uploading..." : "Upload Document"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

const DeleteDocumentModal = ({ 
  open, 
  onClose, 
  document, 
  onConfirm, 
  loading 
}) => (
  <Dialog open={open} handler={onClose}>
    <DialogHeader>Delete Document</DialogHeader>
    <DialogBody divider>
      <Typography variant="small" className="text-red-500">
        Are you sure you want to delete "{document?.title}"?
      </Typography>
    </DialogBody>
    <DialogFooter>
      <Button
        variant="text"
        color="red"
        onClick={onClose}
        className="mr-1"
        disabled={loading}
      >
        Cancel
      </Button>
      <Button 
        variant="gradient" 
        color="red" 
        onClick={onConfirm}
        disabled={loading}
      >
        {loading ? "Deleting..." : "Delete Document"}
      </Button>
    </DialogFooter>
  </Dialog>
);
export  {
  getFileIcon,
  formatDate,
  DOCUMENT_TYPE_ICONS,
  // Exported components

  DocumentsTab,
  DocumentUploadModal,
  DeleteDocumentModal
  
};