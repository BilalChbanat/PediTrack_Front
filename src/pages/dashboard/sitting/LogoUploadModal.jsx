import React, { useState, useRef } from 'react';
import {
  Button,
  Typography,
  Input,
  Card,
  CardBody,
  CardHeader,
  Alert
} from "@material-tailwind/react";
import {
  CloudArrowUpIcon,
  PhotoIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";
import { uploadLogo } from '@/data/sitting';
import { toast } from 'react-toastify';

const LogoUpload = ({ onSubmit, loading = false }) => {
  const [logoForm, setLogoForm] = useState({
    file: null,
    name: "",
    description: ""
  });
  const [preview, setPreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    if (!file) {
      return "Aucun fichier fourni";
    }
    
    if (!(file instanceof File)) {
      return "Objet fichier invalide";
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp', 'image/gif'];
    
    if (!allowedTypes.includes(file.type)) {
      return "Veuillez télécharger un fichier image valide (JPEG, PNG, SVG, WebP ou GIF)";
    }
    if (file.size > maxSize) {
      return "La taille du fichier doit être inférieure à 5MB";
    }
    if (file.size === 0) {
      return "Le fichier semble être vide";
    }
    return null;
  };

  const handleFileSelect = (file) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setError("");
    setLogoForm(prev => ({ ...prev, file }));
    
    // Créer un aperçu
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.onerror = () => setError("Échec de la lecture du fichier");
    reader.readAsDataURL(file);
    
    // Remplir automatiquement le nom si vide
    if (!logoForm.name) {
      const fileName = file.name.split('.')[0];
      setLogoForm(prev => ({ ...prev, name: fileName }));
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleInputChange = (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const removeFile = () => {
    setLogoForm(prev => ({ ...prev, file: null }));
    setPreview(null);
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleLogoSubmit = async (e) => {
    e.preventDefault();
    
    // Réinitialiser les erreurs précédentes
    setError("");
    
    // Valider le formulaire
    if (!logoForm.file) {
      setError("Veuillez sélectionner un fichier à télécharger");
      return;
    }
    
    if (!logoForm.name.trim()) {
      setError("Veuillez entrer un nom pour le logo");
      return;
    }
    
    // Valider l'objet fichier
    if (!(logoForm.file instanceof File)) {
      setError("Fichier invalide sélectionné. Veuillez sélectionner un nouveau fichier.");
      return;
    }
    
    // Validation finale du fichier
    const validationError = validateFile(logoForm.file);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setIsUploading(true);
    
    try {
      const result = await uploadLogo(logoForm);
      
      // Réinitialiser le formulaire en cas de succès
      setLogoForm({ file: null, name: "", description: "" });
      setPreview(null);
      setError("");
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      toast.success('Logo téléchargé avec succès');
      
      // Appeler onSubmit du parent si fourni
      if (onSubmit) {
        onSubmit(result);
      }
      
    } catch (error) {
      console.error('Échec du téléchargement:', error);
      
      // Définir un message d'erreur convivial
      let errorMessage = "Échec du téléchargement du logo. Veuillez vérifier votre connexion et réessayer.";
      
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        if (status === 400) {
          errorMessage = data.message || "Requête incorrecte. Veuillez vérifier votre fichier et réessayer.";
        } else if (status === 413) {
          errorMessage = "Fichier trop volumineux. Veuillez sélectionner un fichier plus petit.";
        } else if (status === 415) {
          errorMessage = "Type de fichier non pris en charge. Veuillez sélectionner un fichier image valide.";
        } else {
          errorMessage = `Échec du téléchargement: ${data.message || 'Erreur inconnue'}`;
        }
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = "Timeout du téléchargement. Veuillez réessayer avec un fichier plus petit.";
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const isLogoFormValid = logoForm.file && logoForm.name.trim() && !error && !isUploading;

  return (
    <Card>
      <CardHeader variant="gradient" color="gray" className="mb-6 p-6">
        <Typography variant="h6" color="white">
          Téléchargement du Logo
        </Typography>
      </CardHeader>
      <CardBody>
        {error && (
          <Alert color="red" icon={<ExclamationTriangleIcon className="h-6 w-6" />} className="mb-4">
            {error}
          </Alert>
        )}

        <form onSubmit={handleLogoSubmit} className="space-y-6">
          <div>
            <Typography variant="h6" color="blue-gray" className="mb-3">
              Fichier Logo *
            </Typography>
            {!logoForm.file ? (
              <Card
                className={`border-2 border-dashed cursor-pointer transition-all duration-200 ${
                  dragActive
                    ? 'border-gray-500 bg-gray-50'
                    : 'border-blue-gray-200 hover:border-gray-400 hover:bg-blue-gray-50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <CardBody className="text-center py-12">
                  <CloudArrowUpIcon className="h-16 w-16 mx-auto text-blue-gray-400 mb-4" />
                  <Typography variant="h6" color="blue-gray" className="mb-2">
                    Déposez votre logo ici ou cliquez pour parcourir
                  </Typography>
                  <Typography variant="small" className="text-blue-gray-500 mb-4">
                    Formats pris en charge: JPEG, PNG, SVG, WebP, GIF (Max 5MB)
                  </Typography>
                  <Button variant="outlined" size="sm">
                    Choisir un Fichier
                  </Button>
                </CardBody>
              </Card>
            ) : (
              <Card className="border border-blue-gray-200">
                <CardBody className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      {preview ? (
                        <img
                          src={preview}
                          alt="Aperçu du logo"
                          className="w-20 h-20 object-contain rounded-lg border border-blue-gray-200"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-blue-gray-50 rounded-lg flex items-center justify-center">
                          <PhotoIcon className="h-8 w-8 text-blue-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-grow">
                      <Typography variant="h6" color="blue-gray">
                        {logoForm.file.name}
                      </Typography>
                      <Typography variant="small" className="text-blue-gray-500">
                        {(logoForm.file.size / 1024 / 1024).toFixed(2)} MB • {logoForm.file.type}
                      </Typography>
                      <div className="flex items-center gap-1 mt-1">
                        <CheckCircleIcon className="h-4 w-4 text-green-500" />
                        <Typography variant="small" className="text-green-500">
                          Fichier validé avec succès
                        </Typography>
                      </div>
                    </div>
                    <Button
                      variant="text"
                      color="red"
                      size="sm"
                      onClick={removeFile}
                      className="p-2"
                      disabled={isUploading}
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </CardBody>
              </Card>
            )}
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleInputChange}
              accept="image/jpeg,image/png,image/svg+xml,image/webp,image/gif"
              className="hidden"
            />
          </div>

          <div className="grid gap-4">
            <div>
              <Typography variant="small" className="mb-2 font-semibold text-blue-gray-500">
                Nom du Logo *
              </Typography>
              <Input
                value={logoForm.name}
                onChange={(e) => setLogoForm(prev => ({ ...prev, name: e.target.value }))}
                label="Entrez le nom du logo"
                placeholder="ex: Logo de l'Entreprise, Logo de la Marque"
                disabled={isUploading}
              />
            </div>
            <div>
              <Typography variant="small" className="mb-2 font-semibold text-blue-gray-500">
                Description (Optionnel)
              </Typography>
              <Input
                value={logoForm.description}
                onChange={(e) => setLogoForm(prev => ({ ...prev, description: e.target.value }))}
                label="Entrez la description"
                placeholder="Brève description de l'utilisation du logo"
                disabled={isUploading}
              />
            </div>
          </div>

          <Card className="bg-gray-50 border border-gray-200">
            <CardBody className="p-4">
              <Typography variant="h6" color="blue-gray" className="mb-2">
                Directives de Téléchargement
              </Typography>
              <ul className="text-sm text-blue-gray-600 space-y-1">
                <li>• Utilisez des images haute résolution pour une meilleure qualité</li>
                <li>• Le format SVG est recommandé pour la mise à l'échelle</li>
                <li>• Assurez-vous que le logo a un arrière-plan transparent si nécessaire</li>
                <li>• Taille maximale du fichier: 5MB</li>
                <li>• Formats pris en charge: JPEG, PNG, SVG, WebP, GIF</li>
              </ul>
            </CardBody>
          </Card>

          <div className="flex justify-end gap-2">
            <Button
              variant="gradient"
              color="gray"
              type="submit"
              disabled={!isLogoFormValid}
              className="flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Téléchargement...
                </>
              ) : (
                <>
                  <CloudArrowUpIcon className="h-4 w-4" />
                  Télécharger le Logo
                </>
              )}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
};

export default LogoUpload;

// import React, { useState, useRef } from 'react';
// import {
//   Button,
//   Typography,
//   Input,
//   Card,
//   CardBody,
//   CardHeader,
//   Alert,
//   Tabs,
//   TabsHeader,
//   TabsBody,
//   Tab,
//   TabPanel,
//   Chip,
//   IconButton,
//   Dialog,
//   DialogHeader,
//   DialogBody,
//   DialogFooter,
//   Select,
//   Option,
//   Tooltip
// } from "@material-tailwind/react";
// import {
//   CloudArrowUpIcon,
//   PhotoIcon,
//   XMarkIcon,
//   ExclamationTriangleIcon,
//   CheckCircleIcon,
//   CurrencyDollarIcon,
//   PlusIcon,
//   PencilIcon,
//   TrashIcon,
//   CalculatorIcon,
//   CalendarDaysIcon,
//   CogIcon
// } from "@heroicons/react/24/outline";
// import { uploadLogo } from '@/data/sitting';
// import { toast } from 'react-toastify';

// const LogoUploadPage = ({
//   onSubmit,
//   loading = false,
//   title = "Gestion des Paramètres",
//   description = "Gérez vos logos et tarifs de rendez-vous"
// }) => {
//   // État pour les onglets
//   const [activeTab, setActiveTab] = useState("logo");

//   // État pour le logo
//   const [logoForm, setLogoForm] = useState({
//     file: null,
//     name: "",
//     description: ""
//   });
//   const [preview, setPreview] = useState(null);
//   const [dragActive, setDragActive] = useState(false);
//   const [error, setError] = useState("");
//   const [isUploading, setIsUploading] = useState(false);
//   const fileInputRef = useRef(null);

//   // État pour les tarifs de rendez-vous
//   const [pricingState, setPricingState] = useState({
//     appointments: [
//       { id: 1, type: 'Consultation générale', duration: 30, price: 50, category: 'consultation' },
//       { id: 2, type: 'Consultation spécialisée', duration: 45, price: 80, category: 'consultation' },
//       { id: 3, type: 'Vaccination', duration: 15, price: 30, category: 'vaccination' },
//       { id: 4, type: 'Suivi médical', duration: 20, price: 40, category: 'suivi' },
//       { id: 5, type: 'Consultation urgente', duration: 30, price: 100, category: 'urgence' },
//       { id: 6, type: 'Bilan de santé', duration: 60, price: 120, category: 'bilan' }
//     ],
//     isAppointmentModalOpen: false,
//     selectedAppointment: null,
//     appointmentForm: {
//       type: '',
//       duration: '',
//       price: '',
//       category: 'consultation'
//     },
//     errors: {}
//   });

//   const {
//     appointments,
//     isAppointmentModalOpen,
//     selectedAppointment,
//     appointmentForm,
//     errors
//   } = pricingState;

//   // Fonctions pour la gestion des états
//   const updatePricingState = (updates) => {
//     setPricingState(prev => ({ ...prev, ...updates }));
//   };

//   // Fonctions pour la validation du logo
//   const validateFile = (file) => {
//     if (!file) {
//       return "Aucun fichier fourni";
//     }
    
//     if (!(file instanceof File)) {
//       return "Objet fichier invalide";
//     }

//     const maxSize = 5 * 1024 * 1024; // 5MB
//     const allowedTypes = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp', 'image/gif'];
    
//     if (!allowedTypes.includes(file.type)) {
//       return "Veuillez télécharger un fichier image valide (JPEG, PNG, SVG, WebP ou GIF)";
//     }
//     if (file.size > maxSize) {
//       return "La taille du fichier doit être inférieure à 5MB";
//     }
//     if (file.size === 0) {
//       return "Le fichier semble être vide";
//     }
//     return null;
//   };

//   const handleFileSelect = (file) => {
//     const validationError = validateFile(file);
//     if (validationError) {
//       setError(validationError);
//       return;
//     }
    
//     setError("");
//     setLogoForm(prev => ({ ...prev, file }));
    
//     // Créer un aperçu
//     const reader = new FileReader();
//     reader.onload = (e) => setPreview(e.target.result);
//     reader.onerror = () => setError("Échec de la lecture du fichier");
//     reader.readAsDataURL(file);
    
//     // Remplir automatiquement le nom si vide
//     if (!logoForm.name) {
//       const fileName = file.name.split('.')[0];
//       setLogoForm(prev => ({ ...prev, name: fileName }));
//     }
//   };

//   const handleDrag = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     if (e.type === "dragenter" || e.type === "dragover") {
//       setDragActive(true);
//     } else if (e.type === "dragleave") {
//       setDragActive(false);
//     }
//   };

//   const handleDrop = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setDragActive(false);
    
//     const files = e.dataTransfer.files;
//     if (files && files[0]) {
//       handleFileSelect(files[0]);
//     }
//   };

//   const handleInputChange = (e) => {
//     const files = e.target.files;
//     if (files && files[0]) {
//       handleFileSelect(files[0]);
//     }
//   };

//   const removeFile = () => {
//     setLogoForm(prev => ({ ...prev, file: null }));
//     setPreview(null);
//     setError("");
//     if (fileInputRef.current) {
//       fileInputRef.current.value = '';
//     }
//   };

//   const handleLogoSubmit = async (e) => {
//     e.preventDefault();
    
//     // Réinitialiser les erreurs précédentes
//     setError("");
    
//     // Valider le formulaire
//     if (!logoForm.file) {
//       setError("Veuillez sélectionner un fichier à télécharger");
//       return;
//     }
    
//     if (!logoForm.name.trim()) {
//       setError("Veuillez entrer un nom pour le logo");
//       return;
//     }
    
//     // Valider l'objet fichier
//     if (!(logoForm.file instanceof File)) {
//       setError("Fichier invalide sélectionné. Veuillez sélectionner un nouveau fichier.");
//       return;
//     }
    
//     // Validation finale du fichier
//     const validationError = validateFile(logoForm.file);
//     if (validationError) {
//       setError(validationError);
//       return;
//     }
    
//     setIsUploading(true);
    
//     try {
//       const result = await uploadLogo(logoForm);
      
//       // Réinitialiser le formulaire en cas de succès
//       setLogoForm({ file: null, name: "", description: "" });
//       setPreview(null);
//       setError("");
//       if (fileInputRef.current) {
//         fileInputRef.current.value = '';
//       }
      
//       toast.success('Logo téléchargé avec succès');
      
//       // Appeler onSubmit du parent si fourni
//       if (onSubmit) {
//         onSubmit(result);
//       }
      
//     } catch (error) {
//       console.error('Échec du téléchargement:', error);
      
//       // Définir un message d'erreur convivial
//       let errorMessage = "Échec du téléchargement du logo. Veuillez vérifier votre connexion et réessayer.";
      
//       if (error.response) {
//         const status = error.response.status;
//         const data = error.response.data;
        
//         if (status === 400) {
//           errorMessage = data.message || "Requête incorrecte. Veuillez vérifier votre fichier et réessayer.";
//         } else if (status === 413) {
//           errorMessage = "Fichier trop volumineux. Veuillez sélectionner un fichier plus petit.";
//         } else if (status === 415) {
//           errorMessage = "Type de fichier non pris en charge. Veuillez sélectionner un fichier image valide.";
//         } else {
//           errorMessage = `Échec du téléchargement: ${data.message || 'Erreur inconnue'}`;
//         }
//       } else if (error.code === 'ECONNABORTED') {
//         errorMessage = "Timeout du téléchargement. Veuillez réessayer avec un fichier plus petit.";
//       }
      
//       setError(errorMessage);
//       toast.error(errorMessage);
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   // Fonctions pour la gestion des tarifs
//   const validateAppointmentForm = () => {
//     const newErrors = {};
    
//     if (!appointmentForm.type.trim()) {
//       newErrors.type = 'Le type de rendez-vous est requis';
//     }
    
//     if (!appointmentForm.duration || appointmentForm.duration <= 0) {
//       newErrors.duration = 'La durée doit être supérieure à 0';
//     }
    
//     if (!appointmentForm.price || appointmentForm.price <= 0) {
//       newErrors.price = 'Le prix doit être supérieur à 0';
//     }
    
//     updatePricingState({ errors: newErrors });
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleAppointmentFormChange = (field, value) => {
//     const updatedForm = { ...appointmentForm, [field]: value };
//     updatePricingState({ appointmentForm: updatedForm });
    
//     if (errors[field]) {
//       updatePricingState({ errors: { ...errors, [field]: undefined } });
//     }
//   };

//   const handleSubmitAppointment = () => {
//     if (!validateAppointmentForm()) {
//       toast.error('Veuillez corriger les erreurs de validation');
//       return;
//     }

//     const appointmentData = {
//       ...appointmentForm,
//       duration: parseInt(appointmentForm.duration),
//       price: parseFloat(appointmentForm.price)
//     };

//     if (selectedAppointment) {
//       // Modifier un rendez-vous existant
//       const updatedAppointments = appointments.map(apt => 
//         apt.id === selectedAppointment.id 
//           ? { ...apt, ...appointmentData }
//           : apt
//       );
//       updatePricingState({ appointments: updatedAppointments });
//       toast.success('Tarif de rendez-vous mis à jour avec succès');
//     } else {
//       // Ajouter un nouveau rendez-vous
//       const newAppointment = {
//         id: Date.now(),
//         ...appointmentData
//       };
//       updatePricingState({ 
//         appointments: [...appointments, newAppointment]
//       });
//       toast.success('Nouveau tarif de rendez-vous ajouté avec succès');
//     }

//     closeAppointmentModal();
//   };

//   const handleDeleteAppointment = (appointmentId) => {
//     const updatedAppointments = appointments.filter(apt => apt.id !== appointmentId);
//     updatePricingState({ appointments: updatedAppointments });
//     toast.success('Tarif de rendez-vous supprimé avec succès');
//   };

//   const openCreateAppointmentModal = () => {
//     updatePricingState({
//       selectedAppointment: null,
//       appointmentForm: {
//         type: '',
//         duration: '',
//         price: '',
//         category: 'consultation'
//       },
//       errors: {},
//       isAppointmentModalOpen: true
//     });
//   };

//   const openEditAppointmentModal = (appointment) => {
//     updatePricingState({
//       selectedAppointment: appointment,
//       appointmentForm: {
//         type: appointment.type,
//         duration: appointment.duration.toString(),
//         price: appointment.price.toString(),
//         category: appointment.category
//       },
//       errors: {},
//       isAppointmentModalOpen: true
//     });
//   };

//   const closeAppointmentModal = () => {
//     updatePricingState({
//       isAppointmentModalOpen: false,
//       selectedAppointment: null,
//       appointmentForm: {
//         type: '',
//         duration: '',
//         price: '',
//         category: 'consultation'
//       },
//       errors: {}
//     });
//   };

//   const getCategoryColor = (category) => {
//     const colors = {
//       consultation: 'gray',
//       vaccination: 'blue-gray',
//       suivi: 'gray',
//       urgence: 'red',
//       bilan: 'gray'
//     };
//     return colors[category] || 'gray';
//   };

//   const getCategoryLabel = (category) => {
//     const labels = {
//       consultation: 'Consultation',
//       vaccination: 'Vaccination',
//       suivi: 'Suivi',
//       urgence: 'Urgence',
//       bilan: 'Bilan'
//     };
//     return labels[category] || category;
//   };

//   const isLogoFormValid = logoForm.file && logoForm.name.trim() && !error && !isUploading;

//   return (
//     <div className="mt-12 mb-8 flex flex-col gap-12">
//       <Typography variant="h3" color="blue-gray" className="mb-2">
//         {title}
//       </Typography>
//       <Typography variant="small" className="text-blue-gray-500 font-normal mb-6">
//         {description}
//       </Typography>

//       <Tabs value={activeTab} onChange={setActiveTab}>
//         <TabsHeader className="rounded-none border-b border-blue-gray-50 bg-transparent p-0">
//           <Tab
//             value="logo"
//             onClick={() => setActiveTab("logo")}
//             className={activeTab === "logo" ? "text-gray-900" : ""}
//           >
//             <div className="flex items-center gap-2">
//               <CogIcon className="h-5 w-5" />
//               Gestion du Logo
//             </div>
//           </Tab>
//           <Tab
//             value="pricing"
//             onClick={() => setActiveTab("pricing")}
//             className={activeTab === "pricing" ? "text-gray-900" : ""}
//           >
//             <div className="flex items-center gap-2">
//               <CurrencyDollarIcon className="h-5 w-5" />
//               Tarifs des Rendez-vous
//             </div>
//           </Tab>
//         </TabsHeader>

//         <TabsBody>
//           <TabPanel value="logo" className="p-0">
//             <Card className="mt-6">
//               <CardHeader variant="gradient" color="gray" className="mb-6 p-6">
//                 <Typography variant="h6" color="white">
//                   Téléchargement du Logo
//                 </Typography>
//               </CardHeader>
//               <CardBody>
//                 {error && (
//                   <Alert color="red" icon={<ExclamationTriangleIcon className="h-6 w-6" />} className="mb-4">
//                     {error}
//                   </Alert>
//                 )}

//                 <form onSubmit={handleLogoSubmit} className="space-y-6">
//                   <div>
//                     <Typography variant="h6" color="blue-gray" className="mb-3">
//                       Fichier Logo *
//                     </Typography>
//                     {!logoForm.file ? (
//                       <Card
//                         className={`border-2 border-dashed cursor-pointer transition-all duration-200 ${
//                           dragActive
//                             ? 'border-gray-500 bg-gray-50'
//                             : 'border-blue-gray-200 hover:border-gray-400 hover:bg-blue-gray-50'
//                         }`}
//                         onDragEnter={handleDrag}
//                         onDragLeave={handleDrag}
//                         onDragOver={handleDrag}
//                         onDrop={handleDrop}
//                         onClick={() => fileInputRef.current?.click()}
//                       >
//                         <CardBody className="text-center py-12">
//                           <CloudArrowUpIcon className="h-16 w-16 mx-auto text-blue-gray-400 mb-4" />
//                           <Typography variant="h6" color="blue-gray" className="mb-2">
//                             Déposez votre logo ici ou cliquez pour parcourir
//                           </Typography>
//                           <Typography variant="small" className="text-blue-gray-500 mb-4">
//                             Formats pris en charge: JPEG, PNG, SVG, WebP, GIF (Max 5MB)
//                           </Typography>
//                           <Button variant="outlined" size="sm">
//                             Choisir un Fichier
//                           </Button>
//                         </CardBody>
//                       </Card>
//                     ) : (
//                       <Card className="border border-blue-gray-200">
//                         <CardBody className="p-4">
//                           <div className="flex items-center gap-4">
//                             <div className="flex-shrink-0">
//                               {preview ? (
//                                 <img
//                                   src={preview}
//                                   alt="Aperçu du logo"
//                                   className="w-20 h-20 object-contain rounded-lg border border-blue-gray-200"
//                                 />
//                               ) : (
//                                 <div className="w-20 h-20 bg-blue-gray-50 rounded-lg flex items-center justify-center">
//                                   <PhotoIcon className="h-8 w-8 text-blue-gray-400" />
//                                 </div>
//                               )}
//                             </div>
//                             <div className="flex-grow">
//                               <Typography variant="h6" color="blue-gray">
//                                 {logoForm.file.name}
//                               </Typography>
//                               <Typography variant="small" className="text-blue-gray-500">
//                                 {(logoForm.file.size / 1024 / 1024).toFixed(2)} MB • {logoForm.file.type}
//                               </Typography>
//                               <div className="flex items-center gap-1 mt-1">
//                                 <CheckCircleIcon className="h-4 w-4 text-green-500" />
//                                 <Typography variant="small" className="text-green-500">
//                                   Fichier validé avec succès
//                                 </Typography>
//                               </div>
//                             </div>
//                             <Button
//                               variant="text"
//                               color="red"
//                               size="sm"
//                               onClick={removeFile}
//                               className="p-2"
//                               disabled={isUploading}
//                             >
//                               <XMarkIcon className="h-4 w-4" />
//                             </Button>
//                           </div>
//                         </CardBody>
//                       </Card>
//                     )}
//                     <input
//                       ref={fileInputRef}
//                       type="file"
//                       onChange={handleInputChange}
//                       accept="image/jpeg,image/png,image/svg+xml,image/webp,image/gif"
//                       className="hidden"
//                     />
//                   </div>

//                   <div className="grid gap-4">
//                     <div>
//                       <Typography variant="small" className="mb-2 font-semibold text-blue-gray-500">
//                         Nom du Logo *
//                       </Typography>
//                       <Input
//                         value={logoForm.name}
//                         onChange={(e) => setLogoForm(prev => ({ ...prev, name: e.target.value }))}
//                         label="Entrez le nom du logo"
//                         placeholder="ex: Logo de l'Entreprise, Logo de la Marque"
//                         disabled={isUploading}
//                       />
//                     </div>
//                     <div>
//                       <Typography variant="small" className="mb-2 font-semibold text-blue-gray-500">
//                         Description (Optionnel)
//                       </Typography>
//                       <Input
//                         value={logoForm.description}
//                         onChange={(e) => setLogoForm(prev => ({ ...prev, description: e.target.value }))}
//                         label="Entrez la description"
//                         placeholder="Brève description de l'utilisation du logo"
//                         disabled={isUploading}
//                       />
//                     </div>
//                   </div>

//                   <Card className="bg-gray-50 border border-gray-200">
//                     <CardBody className="p-4">
//                       <Typography variant="h6" color="blue-gray" className="mb-2">
//                         Directives de Téléchargement
//                       </Typography>
//                       <ul className="text-sm text-blue-gray-600 space-y-1">
//                         <li>• Utilisez des images haute résolution pour une meilleure qualité</li>
//                         <li>• Le format SVG est recommandé pour la mise à l'échelle</li>
//                         <li>• Assurez-vous que le logo a un arrière-plan transparent si nécessaire</li>
//                         <li>• Taille maximale du fichier: 5MB</li>
//                         <li>• Formats pris en charge: JPEG, PNG, SVG, WebP, GIF</li>
//                       </ul>
//                     </CardBody>
//                   </Card>

//                   <div className="flex justify-end gap-2">
//                     <Button
//                       variant="gradient"
//                       color="gray"
//                       type="submit"
//                       disabled={!isLogoFormValid}
//                       className="flex items-center gap-2"
//                     >
//                       {isUploading ? (
//                         <>
//                           <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//                           Téléchargement...
//                         </>
//                       ) : (
//                         <>
//                           <CloudArrowUpIcon className="h-4 w-4" />
//                           Télécharger le Logo
//                         </>
//                       )}
//                     </Button>
//                   </div>
//                 </form>
//               </CardBody>
//             </Card>
//           </TabPanel>

//           <TabPanel value="pricing" className="p-0">
//             <Card className="mt-6">
//               <CardHeader variant="gradient" color="gray" className="mb-6 p-6">
//                 <div className="flex items-center justify-between">
//                   <Typography variant="h6" color="white">
//                     Tarifs des Rendez-vous
//                   </Typography>
//                   <Button
//                     color="white"
//                     size="sm"
//                     className="flex items-center gap-2"
//                     onClick={openCreateAppointmentModal}
//                   >
//                     <PlusIcon className="h-4 w-4" />
//                     Ajouter un Tarif
//                   </Button>
//                 </div>
//               </CardHeader>
//               <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
//                 <table className="w-full min-w-[640px] table-auto">
//                   <thead>
//                     <tr>
//                       {["Type de Rendez-vous", "Catégorie", "Durée", "Prix", "Actions"].map(
//                         (el) => (
//                           <th
//                             key={el}
//                             className="border-b border-blue-gray-50 py-3 px-5 text-left"
//                           >
//                             <Typography
//                               variant="small"
//                               className="text-[11px] font-bold uppercase text-blue-gray-400"
//                             >
//                               {el}
//                             </Typography>
//                           </th>
//                         )
//                       )}
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {appointments.map((appointment, key) => {
//                       const className = `py-3 px-5 ${key === appointments.length - 1 ? "" : "border-b border-blue-gray-50"}`;

//                       return (
//                         <tr key={appointment.id}>
//                           <td className={className}>
//                             <div className="flex items-center gap-3">
//                               <div className="flex items-center justify-center bg-gray-600 text-white rounded-full h-8 w-8">
//                                 <CalendarDaysIcon className="h-4 w-4" />
//                               </div>
//                               <Typography
//                                 variant="small"
//                                 color="blue-gray"
//                                 className="font-bold"
//                               >
//                                 {appointment.type}
//                               </Typography>
//                             </div>
//                           </td>
//                           <td className={className}>
//                             <Chip
//                               size="sm"
//                               value={getCategoryLabel(appointment.category)}
//                               color={getCategoryColor(appointment.category)}
//                               className="text-xs"
//                             />
//                           </td>
//                           <td className={className}>
//                             <Typography variant="small" color="blue-gray">
//                               {appointment.duration} min
//                             </Typography>
//                           </td>
//                           <td className={className}>
//                             <Typography variant="small" color="gray" className="font-bold">
//                               {appointment.price}€
//                             </Typography>
//                           </td>
//                           <td className={className}>
//                             <div className="flex items-center gap-2">
//                               <Tooltip content="Modifier">
//                                 <IconButton
//                                   variant="text"
//                                   size="sm"
//                                   onClick={() => openEditAppointmentModal(appointment)}
//                                 >
//                                   <PencilIcon className="h-4 w-4 text-blue-600" />
//                                 </IconButton>
//                               </Tooltip>
//                               <Tooltip content="Supprimer">
//                                 <IconButton
//                                   variant="text"
//                                   size="sm"
//                                   onClick={() => handleDeleteAppointment(appointment.id)}
//                                 >
//                                   <TrashIcon className="h-4 w-4 text-red-600" />
//                                 </IconButton>
//                               </Tooltip>
//                             </div>
//                           </td>
//                         </tr>
//                       );
//                     })}
//                     {appointments.length === 0 && (
//                       <tr>
//                         <td colSpan={5} className="py-8 text-center">
//                           <Typography variant="small" color="gray">
//                             Aucun tarif de rendez-vous trouvé. Cliquez sur "Ajouter un Tarif" pour en créer un.
//                           </Typography>
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </CardBody>
//             </Card>
//           </TabPanel>
//         </TabsBody>
//       </Tabs>

//       {/* Modal pour ajouter/modifier un tarif */}
//       <Dialog open={isAppointmentModalOpen} handler={closeAppointmentModal} size="md">
//         <DialogHeader>
//           <Typography variant="h5">
//             {selectedAppointment ? 'Modifier le Tarif' : 'Ajouter un Nouveau Tarif'}
//           </Typography>
//         </DialogHeader>
//         <DialogBody className="space-y-4">
//           <div>
//             <Typography variant="small" className="mb-2 font-semibold text-blue-gray-500">
//               Type de Rendez-vous *
//             </Typography>
//             <Input
//               value={appointmentForm.type}
//               onChange={(e) => handleAppointmentFormChange('type', e.target.value)}
//               label="Type de rendez-vous"
//               placeholder="ex: Consultation générale, Vaccination"
//               error={!!errors.type}
//             />
//             {errors.type && (
//               <Typography variant="small" color="red" className="mt-1">
//                 {errors.type}
//               </Typography>
//             )}
//           </div>

//           <div>
//             <Typography variant="small" className="mb-2 font-semibold text-blue-gray-500">
//               Catégorie *
//             </Typography>
//             <Select
//               value={appointmentForm.category}
//               onChange={(value) => handleAppointmentFormChange('category', value)}
//               label="Sélectionner une catégorie"
//             >
//               <Option value="consultation">Consultation</Option>
//               <Option value="vaccination">Vaccination</Option>
//               <Option value="suivi">Suivi</Option>
//               <Option value="urgence">Urgence</Option>
//               <Option value="bilan">Bilan</Option>
//             </Select>
//           </div>

//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <Typography variant="small" className="mb-2 font-semibold text-blue-gray-500">
//                 Durée (minutes) *
//               </Typography>
//               <Input
//                 type="number"
//                 value={appointmentForm.duration}
//                 onChange={(e) => handleAppointmentFormChange('duration', e.target.value)}
//                 label="Durée en minutes"
//                 placeholder="30"
//                 error={!!errors.duration}
//                 min="1"
//               />
//               {errors.duration && (
//                 <Typography variant="small" color="red" className="mt-1">
//                   {errors.duration}
//                 </Typography>
//               )}
//             </div>
//             <div>
//               <Typography variant="small" className="mb-2 font-semibold text-blue-gray-500">
//                 Prix (€) *
//               </Typography>
//               <Input
//                 type="number"
//                 value={appointmentForm.price}
//                 onChange={(e) => handleAppointmentFormChange('price', e.target.value)}
//                 label="Prix en euros"
//                 placeholder="50"
//                 error={!!errors.price}
//                 min="0"
//                 step="0.01"
//               />
//               {errors.price && (
//                 <Typography variant="small" color="red" className="mt-1">
//                   {errors.price}
//                 </Typography>
//               )}
//             </div>
//           </div>
//         </DialogBody>
//         <DialogFooter>
//           <div className="flex gap-2">
//             <Button variant="text" color="red" onClick={closeAppointmentModal}>
//               Annuler
//             </Button>
//             <Button color="green" onClick={handleSubmitAppointment}>
//               {selectedAppointment ? 'Mettre à jour' : 'Ajouter'}
//             </Button>
//           </div>
//         </DialogFooter>
//       </Dialog>
//     </div>
//   );
// };

// export default LogoUploadPage;

// // Composant React avec gestion d'erreurs améliorée - Interface en Français
// import React, { useState, useRef } from 'react';
// import {
//   Button,
//   Typography,
//   Input,
//   Card,
//   CardBody,
//   Alert
// } from "@material-tailwind/react";
// import {
//   CloudArrowUpIcon,
//   PhotoIcon,
//   XMarkIcon,
//   ExclamationTriangleIcon,
//   CheckCircleIcon
// } from "@heroicons/react/24/solid";
// import { uploadLogo } from '@/data/sitting';

// const LogoUploadPage = ({
//   onSubmit,
//   loading = false,
//   title = "Télécharger le Logo",
//   description = "Téléchargez un nouveau logo pour votre organisation"
// }) => {
//   const [logoForm, setLogoForm] = useState({
//     file: null,
//     name: "",
//     description: ""
//   });
//   const [preview, setPreview] = useState(null);
//   const [dragActive, setDragActive] = useState(false);
//   const [error, setError] = useState("");
//   const [isUploading, setIsUploading] = useState(false);
//   const fileInputRef = useRef(null);

//   const validateFile = (file) => {
//     console.log('Validation du fichier:', file);
    
//     if (!file) {
//       return "Aucun fichier fourni";
//     }
    
//     if (!(file instanceof File)) {
//       return "Objet fichier invalide";
//     }

//     const maxSize = 5 * 1024 * 1024; // 5MB
//     const allowedTypes = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp', 'image/gif'];
    
//     console.log('Type de fichier:', file.type);
//     console.log('Taille du fichier:', file.size);
    
//     if (!allowedTypes.includes(file.type)) {
//       return "Veuillez télécharger un fichier image valide (JPEG, PNG, SVG, WebP ou GIF)";
//     }
//     if (file.size > maxSize) {
//       return "La taille du fichier doit être inférieure à 5MB";
//     }
//     if (file.size === 0) {
//       return "Le fichier semble être vide";
//     }
//     return null;
//   };

//   const handleFileSelect = (file) => {
//     console.log('Fichier sélectionné:', file);
    
//     const validationError = validateFile(file);
//     if (validationError) {
//       setError(validationError);
//       return;
//     }
    
//     setError("");
//     setLogoForm(prev => ({ ...prev, file }));
    
//     // Créer un aperçu
//     const reader = new FileReader();
//     reader.onload = (e) => setPreview(e.target.result);
//     reader.onerror = () => setError("Échec de la lecture du fichier");
//     reader.readAsDataURL(file);
    
//     // Remplir automatiquement le nom si vide
//     if (!logoForm.name) {
//       const fileName = file.name.split('.')[0];
//       setLogoForm(prev => ({ ...prev, name: fileName }));
//     }
//   };

//   const handleDrag = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     if (e.type === "dragenter" || e.type === "dragover") {
//       setDragActive(true);
//     } else if (e.type === "dragleave") {
//       setDragActive(false);
//     }
//   };

//   const handleDrop = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setDragActive(false);
    
//     const files = e.dataTransfer.files;
//     if (files && files[0]) {
//       handleFileSelect(files[0]);
//     }
//   };

//   const handleInputChange = (e) => {
//     const files = e.target.files;
//     if (files && files[0]) {
//       handleFileSelect(files[0]);
//     }
//   };

//   const removeFile = () => {
//     setLogoForm(prev => ({ ...prev, file: null }));
//     setPreview(null);
//     setError("");
//     if (fileInputRef.current) {
//       fileInputRef.current.value = '';
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     // Réinitialiser les erreurs précédentes
//     setError("");
    
//     // Valider le formulaire
//     if (!logoForm.file) {
//       setError("Veuillez sélectionner un fichier à télécharger");
//       return;
//     }
    
//     if (!logoForm.name.trim()) {
//       setError("Veuillez entrer un nom pour le logo");
//       return;
//     }
    
//     // Valider l'objet fichier
//     if (!(logoForm.file instanceof File)) {
//       setError("Fichier invalide sélectionné. Veuillez sélectionner un nouveau fichier.");
//       return;
//     }
    
//     // Validation finale du fichier
//     const validationError = validateFile(logoForm.file);
//     if (validationError) {
//       setError(validationError);
//       return;
//     }
    
//     console.log("Soumission du formulaire logo:", {
//       file: logoForm.file,
//       name: logoForm.name,
//       description: logoForm.description,
//       fileDetails: {
//         name: logoForm.file.name,
//         size: logoForm.file.size,
//         type: logoForm.file.type,
//         lastModified: logoForm.file.lastModified
//       }
//     });
    
//     setIsUploading(true);
    
//     try {
//       const result = await uploadLogo(logoForm);
//       console.log('Téléchargement réussi:', result);
      
//       // Réinitialiser le formulaire en cas de succès
//       setLogoForm({ file: null, name: "", description: "" });
//       setPreview(null);
//       setError("");
//       if (fileInputRef.current) {
//         fileInputRef.current.value = '';
//       }
      
//       // Appeler onSubmit du parent si fourni
//       if (onSubmit) {
//         onSubmit(result);
//       }
      
//     } catch (error) {
//       console.error('Échec du téléchargement:', error);
      
//       // Définir un message d'erreur convivial
//       if (error.response) {
//         const status = error.response.status;
//         const data = error.response.data;
        
//         if (status === 400) {
//           setError(data.message || "Requête incorrecte. Veuillez vérifier votre fichier et réessayer.");
//         } else if (status === 413) {
//           setError("Fichier trop volumineux. Veuillez sélectionner un fichier plus petit.");
//         } else if (status === 415) {
//           setError("Type de fichier non pris en charge. Veuillez sélectionner un fichier image valide.");
//         } else {
//           setError(`Échec du téléchargement: ${data.message || 'Erreur inconnue'}`);
//         }
//       } else if (error.code === 'ECONNABORTED') {
//         setError("Timeout du téléchargement. Veuillez réessayer avec un fichier plus petit.");
//       } else {
//         setError("Échec du téléchargement du logo. Veuillez vérifier votre connexion et réessayer.");
//       }
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   const isFormValid = logoForm.file && logoForm.name.trim() && !error && !isUploading;

//   return (
//     <div className="max-w-xxl mx-auto p-6">
//       <Typography variant="h3" color="blue-gray" className="mb-2">
//         {title}
//       </Typography>
//       <Typography variant="small" className="text-blue-gray-500 font-normal mb-6">
//         {description}
//       </Typography>

//       {error && (
//         <Alert color="red" icon={<ExclamationTriangleIcon className="h-6 w-6" />} className="mb-4">
//           {error}
//         </Alert>
//       )}

//       <form onSubmit={handleSubmit} className="space-y-6">
//         <div>
//           <Typography variant="h6" color="blue-gray">
//             Fichier Logo *
//           </Typography>
//           {!logoForm.file ? (
//             <Card
//               className={`border-2 border-dashed cursor-pointer transition-all duration-200 ${
//                 dragActive
//                   ? 'border-blue-500 bg-blue-50'
//                   : 'border-blue-gray-200 hover:border-blue-300 hover:bg-blue-gray-50'
//               }`}
//               onDragEnter={handleDrag}
//               onDragLeave={handleDrag}
//               onDragOver={handleDrag}
//               onDrop={handleDrop}
//               onClick={() => fileInputRef.current?.click()}
//             >
//               <CardBody className="text-center py-12">
//                 <CloudArrowUpIcon className="h-16 w-16 mx-auto text-blue-gray-400 mb-4" />
//                 <Typography variant="h6" color="blue-gray" className="mb-2">
//                   Déposez votre logo ici ou cliquez pour parcourir
//                 </Typography>
//                 <Typography variant="small" className="text-blue-gray-500 mb-4">
//                   Formats pris en charge: JPEG, PNG, SVG, WebP, GIF (Max 5MB)
//                 </Typography>
//                 <Button variant="outlined" size="sm">
//                   Choisir un Fichier
//                 </Button>
//               </CardBody>
//             </Card>
//           ) : (
//             <Card className="border border-blue-gray-200">
//               <CardBody className="p-4">
//                 <div className="flex items-center gap-4">
//                   <div className="flex-shrink-0">
//                     {preview ? (
//                       <img
//                         src={preview}
//                         alt="Aperçu du logo"
//                         className="w-20 h-20 object-contain rounded-lg border border-blue-gray-200"
//                       />
//                     ) : (
//                       <div className="w-20 h-20 bg-blue-gray-50 rounded-lg flex items-center justify-center">
//                         <PhotoIcon className="h-8 w-8 text-blue-gray-400" />
//                       </div>
//                     )}
//                   </div>
//                   <div className="flex-grow">
//                     <Typography variant="h6" color="blue-gray">
//                       {logoForm.file.name}
//                     </Typography>
//                     <Typography variant="small" className="text-blue-gray-500">
//                       {(logoForm.file.size / 1024 / 1024).toFixed(2)} MB • {logoForm.file.type}
//                     </Typography>
//                     <div className="flex items-center gap-1 mt-1">
//                       <CheckCircleIcon className="h-4 w-4 text-green-500" />
//                       <Typography variant="small" className="text-green-500">
//                         Fichier validé avec succès
//                       </Typography>
//                     </div>
//                   </div>
//                   <Button
//                     variant="text"
//                     color="red"
//                     size="sm"
//                     onClick={removeFile}
//                     className="p-2"
//                     disabled={isUploading}
//                   >
//                     <XMarkIcon className="h-4 w-4" />
//                   </Button>
//                 </div>
//               </CardBody>
//             </Card>
//           )}
//           <input
//             ref={fileInputRef}
//             type="file"
//             onChange={handleInputChange}
//             accept="image/jpeg,image/png,image/svg+xml,image/webp,image/gif"
//             className="hidden"
//           />
//         </div>

//         <div className="grid gap-4">
//           <div>
//             <Typography variant="small" className="mb-2 font-semibold text-blue-gray-500">
//               Nom du Logo *
//             </Typography>
//             <Input
//               value={logoForm.name}
//               onChange={(e) => setLogoForm(prev => ({ ...prev, name: e.target.value }))}
//               label="Entrez le nom du logo"
//               placeholder="ex: Logo de l'Entreprise, Logo de la Marque"
//               disabled={isUploading}
//             />
//           </div>
//           <div>
//             <Typography variant="small" className="mb-2 font-semibold text-blue-gray-500">
//               Description (Optionnel)
//             </Typography>
//             <Input
//               value={logoForm.description}
//               onChange={(e) => setLogoForm(prev => ({ ...prev, description: e.target.value }))}
//               label="Entrez la description"
//               placeholder="Brève description de l'utilisation du logo"
//               disabled={isUploading}
//             />
//           </div>
//         </div>

//         <Card className="bg-blue-50 border border-blue-200">
//           <CardBody className="p-4">
//             <Typography variant="h6" color="blue-gray" className="mb-2">
//               Directives de Téléchargement
//             </Typography>
//             <ul className="text-sm text-blue-gray-600 space-y-1">
//               <li>• Utilisez des images haute résolution pour une meilleure qualité</li>
//               <li>• Le format SVG est recommandé pour la mise à l'échelle</li>
//               <li>• Assurez-vous que le logo a un arrière-plan transparent si nécessaire</li>
//               <li>• Taille maximale du fichier: 5MB</li>
//               <li>• Formats pris en charge: JPEG, PNG, SVG, WebP, GIF</li>
//             </ul>
//           </CardBody>
//         </Card>

//         <div className="flex justify-end gap-2">
//           <Button
//             variant="gradient"
//             color="blue"
//             type="submit"
//             disabled={!isFormValid}
//             className="flex items-center gap-2"
//           >
//             {isUploading ? (
//               <>
//                 <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//                 Téléchargement...
//               </>
//             ) : (
//               <>
//                 <CloudArrowUpIcon className="h-4 w-4" />
//                 Télécharger le Logo
//               </>
//             )}
//           </Button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default LogoUploadPage;




// // Fixed React component with better error handling
// import React, { useState, useRef } from 'react';
// import {
//   Button,
//   Typography,
//   Input,
//   Card,
//   CardBody,
//   Alert
// } from "@material-tailwind/react";
// import {
//   CloudArrowUpIcon,
//   PhotoIcon,
//   XMarkIcon,
//   ExclamationTriangleIcon,
//   CheckCircleIcon
// } from "@heroicons/react/24/solid";
// import { uploadLogo } from '@/data/sitting';

// const LogoUploadPage = ({
//   onSubmit,
//   loading = false,
//   title = "Upload Logo",
//   description = "Upload a new logo for your organization"
// }) => {
//   const [logoForm, setLogoForm] = useState({
//     file: null,
//     name: "",
//     description: ""
//   });
//   const [preview, setPreview] = useState(null);
//   const [dragActive, setDragActive] = useState(false);
//   const [error, setError] = useState("");
//   const [isUploading, setIsUploading] = useState(false);
//   const fileInputRef = useRef(null);

//   const validateFile = (file) => {
//     console.log('Validating file:', file);
    
//     if (!file) {
//       return "No file provided";
//     }
    
//     if (!(file instanceof File)) {
//       return "Invalid file object";
//     }

//     const maxSize = 5 * 1024 * 1024; // 5MB
//     const allowedTypes = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp', 'image/gif'];
    
//     console.log('File type:', file.type);
//     console.log('File size:', file.size);
    
//     if (!allowedTypes.includes(file.type)) {
//       return "Please upload a valid image file (JPEG, PNG, SVG, WebP, or GIF)";
//     }
//     if (file.size > maxSize) {
//       return "File size must be less than 5MB";
//     }
//     if (file.size === 0) {
//       return "File appears to be empty";
//     }
//     return null;
//   };

//   const handleFileSelect = (file) => {
//     console.log('File selected:', file);
    
//     const validationError = validateFile(file);
//     if (validationError) {
//       setError(validationError);
//       return;
//     }
    
//     setError("");
//     setLogoForm(prev => ({ ...prev, file }));
    
//     // Create preview
//     const reader = new FileReader();
//     reader.onload = (e) => setPreview(e.target.result);
//     reader.onerror = () => setError("Failed to read file");
//     reader.readAsDataURL(file);
    
//     // Auto-fill name if empty
//     if (!logoForm.name) {
//       const fileName = file.name.split('.')[0];
//       setLogoForm(prev => ({ ...prev, name: fileName }));
//     }
//   };

//   const handleDrag = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     if (e.type === "dragenter" || e.type === "dragover") {
//       setDragActive(true);
//     } else if (e.type === "dragleave") {
//       setDragActive(false);
//     }
//   };

//   const handleDrop = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setDragActive(false);
    
//     const files = e.dataTransfer.files;
//     if (files && files[0]) {
//       handleFileSelect(files[0]);
//     }
//   };

//   const handleInputChange = (e) => {
//     const files = e.target.files;
//     if (files && files[0]) {
//       handleFileSelect(files[0]);
//     }
//   };

//   const removeFile = () => {
//     setLogoForm(prev => ({ ...prev, file: null }));
//     setPreview(null);
//     setError("");
//     if (fileInputRef.current) {
//       fileInputRef.current.value = '';
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     // Reset previous errors
//     setError("");
    
//     // Validate form
//     if (!logoForm.file) {
//       setError("Please select a file to upload");
//       return;
//     }
    
//     if (!logoForm.name.trim()) {
//       setError("Please enter a name for the logo");
//       return;
//     }
    
//     // Validate file object
//     if (!(logoForm.file instanceof File)) {
//       setError("Invalid file selected. Please select a new file.");
//       return;
//     }
    
//     // Final file validation
//     const validationError = validateFile(logoForm.file);
//     if (validationError) {
//       setError(validationError);
//       return;
//     }
    
//     console.log("Submitting logo form:", {
//       file: logoForm.file,
//       name: logoForm.name,
//       description: logoForm.description,
//       fileDetails: {
//         name: logoForm.file.name,
//         size: logoForm.file.size,
//         type: logoForm.file.type,
//         lastModified: logoForm.file.lastModified
//       }
//     });
    
//     setIsUploading(true);
    
//     try {
//       const result = await uploadLogo(logoForm);
//       console.log('Upload successful:', result);
      
//       // Reset form on success
//       setLogoForm({ file: null, name: "", description: "" });
//       setPreview(null);
//       setError("");
//       if (fileInputRef.current) {
//         fileInputRef.current.value = '';
//       }
      
//       // Call parent onSubmit if provided
//       if (onSubmit) {
//         onSubmit(result);
//       }
      
//     } catch (error) {
//       console.error('Upload failed:', error);
      
//       // Set user-friendly error message
//       if (error.response) {
//         const status = error.response.status;
//         const data = error.response.data;
        
//         if (status === 400) {
//           setError(data.message || "Bad request. Please check your file and try again.");
//         } else if (status === 413) {
//           setError("File too large. Please select a smaller file.");
//         } else if (status === 415) {
//           setError("Unsupported file type. Please select a valid image file.");
//         } else {
//           setError(`Upload failed: ${data.message || 'Unknown error'}`);
//         }
//       } else if (error.code === 'ECONNABORTED') {
//         setError("Upload timeout. Please try again with a smaller file.");
//       } else {
//         setError("Failed to upload logo. Please check your connection and try again.");
//       }
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   const isFormValid = logoForm.file && logoForm.name.trim() && !error && !isUploading;

//   return (
//     <div className="max-w-xxl mx-auto p-6">
//       <Typography variant="h3" color="blue-gray" className="mb-2">
//         {title}
//       </Typography>
//       <Typography variant="small" className="text-blue-gray-500 font-normal mb-6">
//         {description}
//       </Typography>

//       {error && (
//         <Alert color="red" icon={<ExclamationTriangleIcon className="h-6 w-6" />} className="mb-4">
//           {error}
//         </Alert>
//       )}

//       <form onSubmit={handleSubmit} className="space-y-6">
//         <div>
//           <Typography variant="h6" color="blue-gray">
//             Logo File *
//           </Typography>
//           {!logoForm.file ? (
//             <Card
//               className={`border-2 border-dashed cursor-pointer transition-all duration-200 ${
//                 dragActive
//                   ? 'border-blue-500 bg-blue-50'
//                   : 'border-blue-gray-200 hover:border-blue-300 hover:bg-blue-gray-50'
//               }`}
//               onDragEnter={handleDrag}
//               onDragLeave={handleDrag}
//               onDragOver={handleDrag}
//               onDrop={handleDrop}
//               onClick={() => fileInputRef.current?.click()}
//             >
//               <CardBody className="text-center py-12">
//                 <CloudArrowUpIcon className="h-16 w-16 mx-auto text-blue-gray-400 mb-4" />
//                 <Typography variant="h6" color="blue-gray" className="mb-2">
//                   Drop your logo here or click to browse
//                 </Typography>
//                 <Typography variant="small" className="text-blue-gray-500 mb-4">
//                   Supports: JPEG, PNG, SVG, WebP, GIF (Max 5MB)
//                 </Typography>
//                 <Button variant="outlined" size="sm">
//                   Choose File
//                 </Button>
//               </CardBody>
//             </Card>
//           ) : (
//             <Card className="border border-blue-gray-200">
//               <CardBody className="p-4">
//                 <div className="flex items-center gap-4">
//                   <div className="flex-shrink-0">
//                     {preview ? (
//                       <img
//                         src={preview}
//                         alt="Logo preview"
//                         className="w-20 h-20 object-contain rounded-lg border border-blue-gray-200"
//                       />
//                     ) : (
//                       <div className="w-20 h-20 bg-blue-gray-50 rounded-lg flex items-center justify-center">
//                         <PhotoIcon className="h-8 w-8 text-blue-gray-400" />
//                       </div>
//                     )}
//                   </div>
//                   <div className="flex-grow">
//                     <Typography variant="h6" color="blue-gray">
//                       {logoForm.file.name}
//                     </Typography>
//                     <Typography variant="small" className="text-blue-gray-500">
//                       {(logoForm.file.size / 1024 / 1024).toFixed(2)} MB • {logoForm.file.type}
//                     </Typography>
//                     <div className="flex items-center gap-1 mt-1">
//                       <CheckCircleIcon className="h-4 w-4 text-green-500" />
//                       <Typography variant="small" className="text-green-500">
//                         File validated successfully
//                       </Typography>
//                     </div>
//                   </div>
//                   <Button
//                     variant="text"
//                     color="red"
//                     size="sm"
//                     onClick={removeFile}
//                     className="p-2"
//                     disabled={isUploading}
//                   >
//                     <XMarkIcon className="h-4 w-4" />
//                   </Button>
//                 </div>
//               </CardBody>
//             </Card>
//           )}
//           <input
//             ref={fileInputRef}
//             type="file"
//             onChange={handleInputChange}
//             accept="image/jpeg,image/png,image/svg+xml,image/webp,image/gif"
//             className="hidden"
//           />
//         </div>

//         <div className="grid gap-4">
//           <div>
//             <Typography variant="small" className="mb-2 font-semibold text-blue-gray-500">
//               Logo Name *
//             </Typography>
//             <Input
//               value={logoForm.name}
//               onChange={(e) => setLogoForm(prev => ({ ...prev, name: e.target.value }))}
//               label="Enter logo name"
//               placeholder="e.g., Company Logo, Brand Logo"
//               disabled={isUploading}
//             />
//           </div>
//           <div>
//             <Typography variant="small" className="mb-2 font-semibold text-blue-gray-500">
//               Description (Optional)
//             </Typography>
//             <Input
//               value={logoForm.description}
//               onChange={(e) => setLogoForm(prev => ({ ...prev, description: e.target.value }))}
//               label="Enter description"
//               placeholder="Brief description of the logo usage"
//               disabled={isUploading}
//             />
//           </div>
//         </div>

//         <Card className="bg-blue-50 border border-blue-200">
//           <CardBody className="p-4">
//             <Typography variant="h6" color="blue-gray" className="mb-2">
//               Upload Guidelines
//             </Typography>
//             <ul className="text-sm text-blue-gray-600 space-y-1">
//               <li>• Use high-resolution images for best quality</li>
//               <li>• SVG format is recommended for scalability</li>
//               <li>• Ensure the logo has transparent background if needed</li>
//               <li>• Maximum file size: 5MB</li>
//               <li>• Supported formats: JPEG, PNG, SVG, WebP, GIF</li>
//             </ul>
//           </CardBody>
//         </Card>

//         <div className="flex justify-end gap-2">
//           <Button
//             variant="gradient"
//             color="blue"
//             type="submit"
//             disabled={!isFormValid}
//             className="flex items-center gap-2"
//           >
//             {isUploading ? (
//               <>
//                 <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//                 Uploading...
//               </>
//             ) : (
//               <>
//                 <CloudArrowUpIcon className="h-4 w-4" />
//                 Upload Logo
//               </>
//             )}
//           </Button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default LogoUploadPage;





// // import React, { useState, useRef } from 'react';
// // import {
// //   Button,
// //   Typography,
// //   Input,
// //   Card,
// //   CardBody,
// //   Alert
// // } from "@material-tailwind/react";
// // import {
// //   CloudArrowUpIcon,
// //   PhotoIcon,
// //   XMarkIcon,
// //   ExclamationTriangleIcon,
// //   CheckCircleIcon
// // } from "@heroicons/react/24/solid";
// // import { uploadLogo } from '@/data/sitting';

// // const LogoUploadPage = ({
// //   onSubmit,
// //   loading = false,
// //   title = "Upload Logo",
// //   description = "Upload a new logo for your organization"
// // }) => {
// //   const [logoForm, setLogoForm] = useState({
// //     file: null,
// //     name: "",
// //     description: ""
// //   });
// //   const [preview, setPreview] = useState(null);
// //   const [dragActive, setDragActive] = useState(false);
// //   const [error, setError] = useState("");
// //   const fileInputRef = useRef(null);

// //   const validateFile = (file) => {
// //     const maxSize = 5 * 1024 * 1024;
// //     const allowedTypes = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'];
// //     if (!allowedTypes.includes(file.type)) {
// //       return "Please upload a valid image file (JPEG, PNG, SVG, or WebP)";
// //     }
// //     if (file.size > maxSize) {
// //       return "File size must be less than 5MB";
// //     }
// //     return null;
// //   };

// //   const handleFileSelect = (file) => {
// //     const validationError = validateFile(file);
// //     if (validationError) {
// //       setError(validationError);
// //       return;
// //     }
// //     setError("");
// //     setLogoForm(prev => ({ ...prev, file }));
// //     const reader = new FileReader();
// //     reader.onload = (e) => setPreview(e.target.result);
// //     reader.readAsDataURL(file);
// //     if (!logoForm.name) {
// //       const fileName = file.name.split('.')[0];
// //       setLogoForm(prev => ({ ...prev, name: fileName }));
// //     }
// //   };

// //   const handleDrag = (e) => {
// //     e.preventDefault();
// //     e.stopPropagation();
// //     if (e.type === "dragenter" || e.type === "dragover") {
// //       setDragActive(true);
// //     } else if (e.type === "dragleave") {
// //       setDragActive(false);
// //     }
// //   };

// //   const handleDrop = (e) => {
// //     e.preventDefault();
// //     e.stopPropagation();
// //     setDragActive(false);
// //     if (e.dataTransfer.files && e.dataTransfer.files[0]) {
// //       handleFileSelect(e.dataTransfer.files[0]);
// //     }
// //   };

// //   const handleInputChange = (e) => {
// //     if (e.target.files && e.target.files[0]) {
// //       handleFileSelect(e.target.files[0]);
// //     }
// //   };

// //   const removeFile = () => {
// //     setLogoForm(prev => ({ ...prev, file: null }));
// //     setPreview(null);
// //     setError("");
// //     if (fileInputRef.current) {
// //       fileInputRef.current.value = '';
// //     }
// //   };

// // const handleSubmit = async (e) => {
// //   e.preventDefault();
// //   if (!logoForm.file) {
// //     setError("Please select a file to upload");
// //     return;
// //   }
// //   if (!logoForm.name.trim()) {
// //     setError("Please enter a name for the logo");
// //     return;
// //   }
  
// //   // Add this validation
// //   if (!(logoForm.file instanceof File)) {
// //     setError("Invalid file selected");
// //     return;
// //   }
  
// //   console.log("Submitting logo form:", logoForm);
// //   console.log("File details:", logoForm.file); // Add this to debug
  
// //   try {
// //     await uploadLogo(logoForm);
// //     setLogoForm({ file: null, name: "", description: "" });
// //     setPreview(null);
// //     setError("");
// //     if (fileInputRef.current) fileInputRef.current.value = '';
// //   } catch (error) {
// //     setError("Failed to upload logo. Please try again.");
// //   }
// // };

// //   const isFormValid = logoForm.file && logoForm.name.trim() && !error;

// //   return (
// //     <div className="max-w-xxl mx-auto p-6 ">
// //       <Typography variant="h3" color="blue-gray" className="mb-2">
// //         {title}
// //       </Typography>
// //       <Typography variant="small" className="text-blue-gray-500 font-normal mb-6">
// //         {description}
// //       </Typography>

// //       {error && (
// //         <Alert color="red" icon={<ExclamationTriangleIcon className="h-6 w-6" />}>
// //           {error}
// //         </Alert>
// //       )}

// //       <form onSubmit={handleSubmit} className="space-y-6">
// //         <div>
// //           <Typography variant="h6" color="blue-gray">
// //             Logo File *
// //           </Typography>
// //           {!logoForm.file ? (
// //             <Card
// //               className={`border-2 border-dashed cursor-pointer transition-all duration-200 ${
// //                 dragActive
// //                   ? 'border-blue-500 bg-blue-50'
// //                   : 'border-blue-gray-200 hover:border-blue-300 hover:bg-blue-gray-50'
// //               }`}
// //               onDragEnter={handleDrag}
// //               onDragLeave={handleDrag}
// //               onDragOver={handleDrag}
// //               onDrop={handleDrop}
// //               onClick={() => fileInputRef.current?.click()}
// //             >
// //               <CardBody className="text-center py-12">
// //                 <CloudArrowUpIcon className="h-16 w-16 mx-auto text-blue-gray-400 mb-4" />
// //                 <Typography variant="h6" color="blue-gray" className="mb-2">
// //                   Drop your logo here or click to browse
// //                 </Typography>
// //                 <Typography variant="small" className="text-blue-gray-500 mb-4">
// //                   Supports: JPEG, PNG, SVG, WebP (Max 5MB)
// //                 </Typography>
// //                 <Button variant="outlined" size="sm">
// //                   Choose File
// //                 </Button>
// //               </CardBody>
// //             </Card>
// //           ) : (
// //             <Card className="border border-blue-gray-200">
// //               <CardBody className="p-4">
// //                 <div className="flex items-center gap-4">
// //                   <div className="flex-shrink-0">
// //                     {preview ? (
// //                       <img
// //                         src={preview}
// //                         alt="Logo preview"
// //                         className="w-20 h-20 object-contain rounded-lg border border-blue-gray-200"
// //                       />
// //                     ) : (
// //                       <div className="w-20 h-20 bg-blue-gray-50 rounded-lg flex items-center justify-center">
// //                         <PhotoIcon className="h-8 w-8 text-blue-gray-400" />
// //                       </div>
// //                     )}
// //                   </div>
// //                   <div className="flex-grow">
// //                     <Typography variant="h6" color="blue-gray">
// //                       {logoForm.file.name}
// //                     </Typography>
// //                     <Typography variant="small" className="text-blue-gray-500">
// //                       {(logoForm.file.size / 1024 / 1024).toFixed(2)} MB
// //                     </Typography>
// //                     <div className="flex items-center gap-1 mt-1">
// //                       <CheckCircleIcon className="h-4 w-4 text-green-500" />
// //                       <Typography variant="small" className="text-green-500">
// //                         File validated successfully
// //                       </Typography>
// //                     </div>
// //                   </div>
// //                   <Button
// //                     variant="text"
// //                     color="red"
// //                     size="sm"
// //                     onClick={removeFile}
// //                     className="p-2"
// //                   >
// //                     <XMarkIcon className="h-4 w-4" />
// //                   </Button>
// //                 </div>
// //               </CardBody>
// //             </Card>
// //           )}
// //           <input
// //             ref={fileInputRef}
// //             type="file"
// //             onChange={handleInputChange}
// //             accept="image/jpeg,image/png,image/svg+xml,image/webp"
// //             className="hidden"
// //           />
// //         </div>

// //         <div className="grid gap-4">
// //           <div>
// //             <Typography variant="small" className="mb-2 font-semibold text-blue-gray-500">
// //               Logo Name *
// //             </Typography>
// //             <Input
// //               value={logoForm.name}
// //               onChange={(e) => setLogoForm(prev => ({ ...prev, name: e.target.value }))}
// //               label="Enter logo name"
// //               placeholder="e.g., Company Logo, Brand Logo"
// //             />
// //           </div>
// //           <div>
// //             <Typography variant="small" className="mb-2 font-semibold text-blue-gray-500">
// //               Description (Optional)
// //             </Typography>
// //             <Input
// //               value={logoForm.description}
// //               onChange={(e) => setLogoForm(prev => ({ ...prev, description: e.target.value }))}
// //               label="Enter description"
// //               placeholder="Brief description of the logo usage"
// //             />
// //           </div>
// //         </div>

// //         <Card className="bg-blue-50 border border-blue-200">
// //           <CardBody className="p-4">
// //             <Typography variant="h6" color="blue-gray" className="mb-2">
// //               Upload Guidelines
// //             </Typography>
// //             <ul className="text-sm text-blue-gray-600 space-y-1">
// //               <li>• Use high-resolution images for best quality</li>
// //               <li>• SVG format is recommended for scalability</li>
// //               <li>• Ensure the logo has transparent background if needed</li>
// //               <li>• Maximum file size: 5MB</li>
// //               <li>• Supported formats: JPEG, PNG, SVG, WebP</li>
// //             </ul>
// //           </CardBody>
// //         </Card>

// //         <div className="flex justify-end gap-2">
// //           <Button
// //             variant="gradient"
// //             color="blue"
// //             type="submit"
// //             disabled={!isFormValid || loading}
// //             className="flex items-center gap-2"
// //           >
// //             {loading ? (
// //               <>
// //                 <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
// //                 Uploading...
// //               </>
// //             ) : (
// //               <>
// //                 <CloudArrowUpIcon className="h-4 w-4" />
// //                 Upload Logo
// //               </>
// //             )}
// //           </Button>
// //         </div>
// //       </form>
// //     </div>
// //   );
// // };

// // export default LogoUploadPage;
