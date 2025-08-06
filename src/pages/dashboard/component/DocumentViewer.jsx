// ===== DOCUMENT VIEWER AVEC MATERIAL TAILWIND =====
// components/DocumentViewer.jsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Spinner,
  Alert,
  IconButton,
  Tooltip,
  Progress,
} from "@material-tailwind/react";
import {
  ArrowLeftIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  DocumentIcon,
  PhotoIcon,
  XMarkIcon,
  EyeIcon,
  ShareIcon,
  PrinterIcon,
} from "@heroicons/react/24/outline";
import axiosInstance from '@/api/axiosInstance';
import DocumentService from '@/api/documentService';

function DocumentViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [zoom, setZoom] = useState(100);
  const [fullscreen, setFullscreen] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await DocumentService.getDocument(id);
        setDocument(data);
        console.log('Document fetched:', data);
      } catch (error) {
        console.error('Error fetching document:', error);
        setError(error.response?.data?.message || 'Erreur lors du chargement du document');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDocument();
    }
  }, [id]);

  const handleDownload = async () => {
    if (!document?.url) return;

    try {
      setDownloading(true);
      setDownloadProgress(0);

      // Simulation de progression (remplacez par vraie progression si disponible)
      const progressInterval = setInterval(() => {
        setDownloadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 100);

      // Téléchargement réel
      const response = await DocumentService.downloadDocument(document._id);

      // Finaliser la progression
      clearInterval(progressInterval);
      setDownloadProgress(100);

      // Créer le lien de téléchargement
      const blob = new Blob([response]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = document.title || `document-${id}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      // Reset après un délai
      setTimeout(() => {
        setDownloadProgress(0);
        setDownloading(false);
      }, 1000);

    } catch (error) {
      console.error('Erreur de téléchargement:', error);
      setError('Erreur lors du téléchargement');
      setDownloading(false);
      setDownloadProgress(0);
    }
  };

  const handlePrint = () => {
    if (document?.url) {
      const printWindow = window.open(document.url, '_blank');
      printWindow?.print();
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: document.title,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Partage annulé');
      }
    } else {
      // Fallback: copier l'URL
      navigator.clipboard.writeText(window.location.href);
      // Vous pourriez ajouter une notification toast ici
    }
  };

  const adjustZoom = (delta) => {
    setZoom(prev => Math.max(25, Math.min(200, prev + delta)));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center w-full">
        <Card className="w-96 p-8">
          <CardBody className="text-center">
            <Spinner className="h-12 w-12 mx-auto mb-4" color="blue" />
            <Typography variant="h6" color="blue-gray" className="mb-2">
              Chargement du document...
            </Typography>
            <Typography variant="small" color="gray" className="mb-4">
              Veuillez patienter pendant le chargement
            </Typography>
            <Progress value={33} color="blue" className="mb-2" />
          </CardBody>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 w-full">
        <div className="w-full">
          <Button
            variant="text"
            className="flex items-center gap-2 mb-6"
            onClick={() => navigate(-1)}
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Retour
          </Button>
          
          <Alert color="red" className="mb-6">
            <Typography variant="small" className="font-medium">
              {error}
            </Typography>
          </Alert>
          
          <Card>
            <CardBody className="text-center py-12">
              <DocumentIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <Typography variant="h5" color="blue-gray" className="mb-2">
                Document introuvable
              </Typography>
              <Typography variant="small" color="gray" className="mb-6">
                Le document demandé n'existe pas ou n'est plus disponible.
              </Typography>
              <Button onClick={() => navigate(-1)} variant="outlined">
                Retour aux documents
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 w-full">
        <Card className="w-full mx-auto">
          <CardBody className="text-center py-12">
            <DocumentIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <Typography variant="h5" color="blue-gray">
              Document non trouvé
            </Typography>
          </CardBody>
        </Card>
      </div>
    );
  }

  const isPdf = document.url?.toLowerCase().endsWith('.pdf');
  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(document.url);
  const documentUrl = document.url.startsWith('http') 
    ? document.url 
    : `${import.meta.env.VITE_API_BASE_URL}/${document.url}`;

  return (
    <div className={`min-h-screen bg-gray-50 ${fullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="w-full px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="text"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => navigate(-1)}
              >
                <ArrowLeftIcon className="h-4 w-4" />
                Retour
              </Button>
              
              <div className="flex items-center space-x-3">
                {isPdf ? (
                  <DocumentIcon className="h-6 w-6 text-red-500" />
                ) : (
                  <PhotoIcon className="h-6 w-6 text-blue-500" />
                )}
                <div>
                  <Typography variant="h6" color="blue-gray">
                    {document.title}
                  </Typography>
                  <Typography variant="small" color="gray">
                    {isPdf ? 'Document PDF' : 'Image'} • {document.size || 'Taille inconnue'}
                  </Typography>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              {!isPdf && (
                <>
                  <Tooltip content="Zoom -">
                    <IconButton
                      variant="text"
                      size="sm"
                      onClick={() => adjustZoom(-25)}
                      disabled={zoom <= 25}
                    >
                      <MagnifyingGlassMinusIcon className="h-4 w-4" />
                    </IconButton>
                  </Tooltip>
                  
                  <Typography variant="small" color="gray" className="min-w-[60px] text-center">
                    {zoom}%
                  </Typography>
                  
                  <Tooltip content="Zoom +">
                    <IconButton
                      variant="text"
                      size="sm"
                      onClick={() => adjustZoom(25)}
                      disabled={zoom >= 200}
                    >
                      <MagnifyingGlassPlusIcon className="h-4 w-4" />
                    </IconButton>
                  </Tooltip>
                </>
              )}

              <Tooltip content="Plein écran">
                <IconButton
                  variant="text"
                  size="sm"
                  onClick={() => setFullscreen(!fullscreen)}
                >
                  {fullscreen ? (
                    <XMarkIcon className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                </IconButton>
              </Tooltip>

              <Tooltip content="Imprimer">
                <IconButton
                  variant="text"
                  size="sm"
                  onClick={handlePrint}
                >
                  <PrinterIcon className="h-4 w-4" />
                </IconButton>
              </Tooltip>

              <Tooltip content="Partager">
                <IconButton
                  variant="text"
                  size="sm"
                  onClick={handleShare}
                >
                  <ShareIcon className="h-4 w-4" />
                </IconButton>
              </Tooltip>

              <Button
                className="flex items-center gap-2"
                size="sm"
                onClick={handleDownload}
                disabled={downloading}
              >
                {downloading ? (
                  <Spinner className="h-4 w-4" />
                ) : (
                  <ArrowDownTrayIcon className="h-4 w-4" />
                )}
                Télécharger
              </Button>
            </div>
          </div>

          {/* Progress bar pour téléchargement */}
          {downloading && (
            <div className="mt-4">
              <Progress 
                value={downloadProgress} 
                color="blue" 
                className="h-1"
                label="Téléchargement..."
              />
            </div>
          )}
        </div>
      </div>

      {/* Document Viewer */}
      <div className={`${fullscreen ? 'h-screen' : 'min-h-screen'} bg-gray-100 p-6 w-full`}>
        <div className="w-full h-full">
          <Card className="overflow-hidden w-full h-full">
            <CardBody className="p-0 w-full h-full">
              <div className="flex justify-center bg-white w-full h-full">
                {isPdf ? (
                  <iframe
                    src={documentUrl}
                    className={`w-full ${fullscreen ? 'h-screen' : 'h-[calc(100vh-200px)]'} border-0`}
                    title={document.title}
                    loading="lazy"
                  />
                ) : isImage ? (
                  <div className="p-4 bg-gray-50 w-full h-full flex justify-center items-center">
                    <img
                      src={documentUrl}
                      alt={document.title}
                      className="max-w-full max-h-full object-contain shadow-lg rounded-lg"
                      style={{
                        transform: `scale(${zoom / 100})`,
                        transformOrigin: 'center',
                        transition: 'transform 0.2s ease'
                      }}
                      onError={(e) => {
                        console.error('Erreur de chargement image');
                        setError('Impossible de charger l\'image');
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 w-full h-full">
                    <DocumentIcon className="h-16 w-16 text-gray-400 mb-4" />
                    <Typography variant="h6" color="blue-gray" className="mb-2">
                      Aperçu non disponible
                    </Typography>
                    <Typography variant="small" color="gray" className="mb-6 text-center">
                      Ce type de fichier ne peut pas être prévisualisé dans le navigateur.
                    </Typography>
                    <Button
                      className="flex items-center gap-2"
                      onClick={handleDownload}
                      disabled={downloading}
                    >
                      <ArrowDownTrayIcon className="h-4 w-4" />
                      Télécharger le fichier
                    </Button>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Informations du document */}
      {!fullscreen && (
        <div className="bg-white border-t border-gray-200">
          <div className="w-full px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div>
                <Typography variant="small" className="font-medium text-gray-900">
                  Nom du fichier
                </Typography>
                <Typography variant="small" color="gray">
                  {document.fileName || document.title}
                </Typography>
              </div>
              <div>
                <Typography variant="small" className="font-medium text-gray-900">
                  Type
                </Typography>
                <Typography variant="small" color="gray">
                  {isPdf ? 'Document PDF' : isImage ? 'Image' : 'Fichier'}
                </Typography>
              </div>
              <div>
                <Typography variant="small" className="font-medium text-gray-900">
                  Date de création
                </Typography>
                <Typography variant="small" color="gray">
                  {document.createdAt 
                    ? new Date(document.createdAt).toLocaleDateString('fr-FR')
                    : 'Non spécifiée'
                  }
                </Typography>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DocumentViewer;