// Polyfill for global object (required for draft-js)
if (typeof global === 'undefined') {
  window.global = window;
}

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import './WordTemplateModal.css';
import html2pdf from 'html2pdf.js';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { toast } from 'react-toastify';
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
  Typography,
  Card,
  CardBody,
  Input,
  Select,
  Option
} from "@material-tailwind/react";
import {
  DocumentTextIcon,
  DocumentArrowDownIcon,
  DocumentIcon
} from "@heroicons/react/24/solid";

const WordTemplateModal = ({
  open,
  onClose,
  patientData,
  onSaveToHistory
}) => {
  const [templateData, setTemplateData] = useState({
    title: '',
    type: 'consultation',
    patientName: patientData?.name || '',
    date: new Date().toISOString().split('T')[0]
  });

  const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
  const editorRef = useRef(null);
  const [isEditorReady, setIsEditorReady] = useState(false);

  const templateTypes = [
    { value: 'consultation', label: 'Consultation' },
    { value: 'prescription', label: 'Prescription' },
    { value: 'vaccination', label: 'Vaccination' },
    { value: 'growth', label: 'Suivi de croissance' },
    { value: 'medical_certificate', label: 'Certificat médical' },
    { value: 'referral', label: 'Lettre de référence' }
  ];

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      setTemplateData({
        title: '',
        type: 'consultation',
        patientName: patientData?.name || '',
        date: new Date().toISOString().split('T')[0]
      });
      setEditorState(EditorState.createEmpty());
      setIsEditorReady(false);
    }
  }, [open, patientData]);

  // Handle editor initialization to prevent null errors
  useEffect(() => {
    if (open) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        setIsEditorReady(true);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setIsEditorReady(false);
    }
  }, [open]);

  const handleInputChange = (field, value) => {
    setTemplateData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const onEditorStateChange = (newEditorState) => {
    try {
      if (newEditorState && typeof newEditorState.getCurrentContent === 'function') {
        setEditorState(newEditorState);
      }
    } catch (error) {
      console.error('Editor state change error:', error);
      // Reset to empty state if there's an error
      setEditorState(EditorState.createEmpty());
    }
  };

  const generateDocumentContent = () => {
    try {
      const contentState = editorState.getCurrentContent();
      const rawContent = convertToRaw(contentState);
      
      // Convert raw content to HTML
      let htmlContent = '';
      rawContent.blocks.forEach(block => {
        switch (block.type) {
          case 'header-one':
            htmlContent += `<h1>${block.text}</h1>`;
            break;
          case 'header-two':
            htmlContent += `<h2>${block.text}</h2>`;
            break;
          case 'header-three':
            htmlContent += `<h3>${block.text}</h3>`;
            break;
          case 'unordered-list-item':
            htmlContent += `<li>${block.text}</li>`;
            break;
          case 'ordered-list-item':
            htmlContent += `<li>${block.text}</li>`;
            break;
          default:
            htmlContent += `<p>${block.text}</p>`;
        }
      });

      return `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1e40af; margin-bottom: 10px;">DOCUMENT MÉDICAL</h1>
            <h2 style="color: #374151; margin-bottom: 5px;">${templateData.type.toUpperCase()}</h2>
          </div>
          
          <div style="margin-bottom: 20px;">
            <p><strong>Patient:</strong> ${templateData.patientName}</p>
            <p><strong>Date:</strong> ${templateData.date}</p>
            <p><strong>Titre:</strong> ${templateData.title}</p>
          </div>
          
          <div style="border-top: 2px solid #e5e7eb; padding-top: 20px;">
            ${htmlContent}
          </div>
          
          <div style="margin-top: 40px; border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center; color: #6b7280;">
            <p>Généré par PediTrack</p>
            <p>Date de création: ${new Date().toLocaleString('fr-FR')}</p>
          </div>
        </div>
      `;
    } catch (error) {
      console.error('Error generating document content:', error);
      return `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1e40af; margin-bottom: 10px;">DOCUMENT MÉDICAL</h1>
            <h2 style="color: #374151; margin-bottom: 5px;">${templateData.type.toUpperCase()}</h2>
          </div>
          
          <div style="margin-bottom: 20px;">
            <p><strong>Patient:</strong> ${templateData.patientName}</p>
            <p><strong>Date:</strong> ${templateData.date}</p>
            <p><strong>Titre:</strong> ${templateData.title}</p>
          </div>
          
          <div style="border-top: 2px solid #e5e7eb; padding-top: 20px;">
            <p>Contenu du document...</p>
          </div>
          
          <div style="margin-top: 40px; border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center; color: #6b7280;">
            <p>Généré par PediTrack</p>
            <p>Date de création: ${new Date().toLocaleString('fr-FR')}</p>
          </div>
        </div>
      `;
    }
  };

  const generatePlainTextContent = () => {
    try {
      const contentState = editorState.getCurrentContent();
      const rawContent = convertToRaw(contentState);
      
      let textContent = '';
      rawContent.blocks.forEach(block => {
        textContent += block.text + '\n';
      });

      return `
DOCUMENT MÉDICAL - ${templateData.type.toUpperCase()}

Patient: ${templateData.patientName}
Date: ${templateData.date}
Titre: ${templateData.title}

${textContent}

---
Généré par PediTrack
Date de création: ${new Date().toLocaleString('fr-FR')}
      `;
    } catch (error) {
      console.error('Error generating plain text content:', error);
      return `
DOCUMENT MÉDICAL - ${templateData.type.toUpperCase()}

Patient: ${templateData.patientName}
Date: ${templateData.date}
Titre: ${templateData.title}

Contenu du document...

---
Généré par PediTrack
Date de création: ${new Date().toLocaleString('fr-FR')}
      `;
    }
  };

  const handleSaveToHistory = () => {
    const content = generatePlainTextContent();
    const documentData = {
      title: templateData.title || `Document ${templateData.type}`,
      type: templateData.type,
      content: content,
      patientName: templateData.patientName,
      createdAt: new Date().toISOString(),
      isTemplate: true
    };
    
    if (!templateData.title || !templateData.patientName) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    onSaveToHistory(documentData);
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setTemplateData({
      title: '',
      type: 'consultation',
      patientName: patientData?.name || '',
      date: new Date().toISOString().split('T')[0]
    });
    setEditorState(EditorState.createEmpty());
    setIsEditorReady(false);
  };

  const handleDownloadPDF = () => {
    try {
      const content = generateDocumentContent();
      const element = document.createElement('div');
      element.innerHTML = content;
      document.body.appendChild(element);

      const opt = {
        margin: 1,
        filename: `${templateData.title || 'document'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      };

      html2pdf().set(opt).from(element).save().then(() => {
        document.body.removeChild(element);
      }).catch(error => {
        console.error('PDF generation error:', error);
        toast.error('Erreur lors de la génération du PDF');
        document.body.removeChild(element);
      });
    } catch (error) {
      console.error('PDF download error:', error);
      toast.error('Erreur lors du téléchargement du PDF');
    }
  };

  const handleDownloadDOCX = async () => {
    try {
      const contentState = editorState.getCurrentContent();
      const rawContent = convertToRaw(contentState);
      
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              text: "DOCUMENT MÉDICAL",
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER
            }),
            new Paragraph({
              text: templateData.type.toUpperCase(),
              heading: HeadingLevel.HEADING_2,
              alignment: AlignmentType.CENTER
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Patient: ", bold: true }),
                new TextRun({ text: templateData.patientName })
              ]
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Date: ", bold: true }),
                new TextRun({ text: templateData.date })
              ]
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Titre: ", bold: true }),
                new TextRun({ text: templateData.title })
              ]
            }),
            new Paragraph({ text: "" }),
            ...rawContent.blocks.map(block => 
              new Paragraph({
                text: block.text,
                heading: block.type.includes('header') ? 
                  (block.type === 'header-one' ? HeadingLevel.HEADING_1 : 
                   block.type === 'header-two' ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_3) : 
                  undefined
              })
            ),
            new Paragraph({ text: "" }),
            new Paragraph({
              text: "---",
              alignment: AlignmentType.CENTER
            }),
            new Paragraph({
              text: "Généré par PediTrack",
              alignment: AlignmentType.CENTER
            }),
            new Paragraph({
              text: `Date de création: ${new Date().toLocaleString('fr-FR')}`,
              alignment: AlignmentType.CENTER
            })
          ]
        }]
      });

      const blob = await Packer.toBlob(doc);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${templateData.title || 'document'}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('DOCX download error:', error);
      toast.error('Erreur lors du téléchargement du DOCX');
    }
  };

  const handleDownloadTXT = () => {
    try {
      const content = generatePlainTextContent();
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${templateData.title || 'document'}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('TXT download error:', error);
      toast.error('Erreur lors du téléchargement du TXT');
    }
  };

  return (
    <Dialog open={open} handler={onClose} size="xl">
      <DialogHeader>
        <div className="flex items-center gap-2">
          <DocumentTextIcon className="h-6 w-6 text-blue-500" />
          <Typography variant="h5" color="blue-gray">
            Créer un document Word
          </Typography>
        </div>
      </DialogHeader>
      <DialogBody divider className="max-h-[80vh] overflow-y-auto">
        <div className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Titre du document"
              value={templateData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              required
            />
            <Select
              label="Type de document"
              value={templateData.type}
              onChange={(value) => handleInputChange('type', value)}
            >
              {templateTypes.map((type) => (
                <Option key={type.value} value={type.value}>
                  {type.label}
                </Option>
              ))}
            </Select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nom du patient"
              value={templateData.patientName}
              onChange={(e) => handleInputChange('patientName', e.target.value)}
              required
            />
            <Input
              label="Date"
              type="date"
              value={templateData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              required
            />
          </div>
          
          <div>
            <Typography variant="small" color="blue-gray" className="mb-2">
              Contenu du document
            </Typography>
            <div className="border border-gray-300 rounded-lg">
              {isEditorReady && (
                <div>
                  {(() => {
                    try {
                      return (
                        <Editor
                          key={`editor-${open}`}
                          ref={editorRef}
                          editorState={editorState}
                          onEditorStateChange={onEditorStateChange}
                          wrapperClassName="wrapperClassName"
                          editorClassName="px-4 py-2 min-h-[300px]"
                          toolbarClassName="toolbarClassName"
                          toolbar={{
                            options: ['inline', 'blockType', 'list', 'textAlign', 'link', 'emoji', 'history'],
                            inline: {
                              options: ['bold', 'italic', 'underline', 'strikethrough'],
                            },
                            blockType: {
                              options: ['Normal', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'],
                            },
                            textAlign: {
                              options: ['left', 'center', 'right', 'justify'],
                            },
                          }}
                        />
                      );
                    } catch (error) {
                      console.error('Editor rendering error:', error);
                      return (
                        <div className="px-4 py-2 min-h-[300px] flex items-center justify-center bg-red-50">
                          <Typography variant="small" color="red">
                            Erreur de chargement de l'éditeur
                          </Typography>
                        </div>
                      );
                    }
                  })()}
                </div>
              )}
              {!isEditorReady && (
                <div className="px-4 py-2 min-h-[300px] flex items-center justify-center bg-gray-50">
                  <Typography variant="small" color="gray">
                    Chargement de l'éditeur...
                  </Typography>
                </div>
              )}
            </div>
          </div>

          <Card className="bg-blue-gray-50/50">
            <CardBody>
              <Typography variant="h6" color="blue-gray" className="mb-3">
                Aperçu du document
              </Typography>
              <div className="bg-white p-4 rounded border max-h-40 overflow-y-auto">
                <div dangerouslySetInnerHTML={{ __html: generateDocumentContent() }} />
              </div>
            </CardBody>
          </Card>
        </div>
      </DialogBody>
      <DialogFooter>
        <Button
          variant="text"
          color="red"
          onClick={onClose}
          className="mr-1"
        >
          Annuler
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outlined"
            color="blue"
            onClick={handleDownloadTXT}
            size="sm"
          >
            <DocumentIcon className="h-4 w-4 mr-1" />
            TXT
          </Button>
          <Button
            variant="outlined"
            color="green"
            onClick={handleDownloadPDF}
            size="sm"
          >
            <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
            PDF
          </Button>
          <Button
            variant="outlined"
            color="purple"
            onClick={handleDownloadDOCX}
            size="sm"
          >
            <DocumentTextIcon className="h-4 w-4 mr-1" />
            DOCX
          </Button>
        </div>
        <Button
          variant="gradient"
          color="green"
          onClick={handleSaveToHistory}
          disabled={!templateData.title || !templateData.patientName}
        >
          Sauvegarder dans l'historique
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default WordTemplateModal; 