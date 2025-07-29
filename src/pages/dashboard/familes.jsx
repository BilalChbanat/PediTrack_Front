import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Chip,
  Tooltip,
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Select,
  Option,
  IconButton,
} from "@material-tailwind/react";
import { 
  UserPlusIcon,
  PencilIcon,
  TrashIcon,
  UsersIcon,
  UserIcon
} from "@heroicons/react/24/outline";
import { getFamilies, createFamily, updateFamily, deleteFamily } from "@/data/familiesData";
import { getPatientTable, getParents } from "@/data/patientTable";

export function Families() {
  // Gestion d'état
  const [state, setState] = useState({
    families: [],
    parents: [],
    patients: [],
    loading: true,
    error: null,
    isFamilyModalOpen: false,
    isDeleteModalOpen: false,
    selectedFamily: null,
    isSubmitting: false,
    familyForm: {
      familyName: '',
      parentId: '',
      children: []
    },
    errors: {}
  });

  // Déstructurer l'état pour un accès plus facile
  const {
    families,
    parents,
    patients,
    loading,
    error,
    isFamilyModalOpen,
    isDeleteModalOpen,
    selectedFamily,
    isSubmitting,
    familyForm,
    errors
  } = state;

  // Données dérivées mémorisées
  const availableParents = useMemo(() => (
    parents.filter(parent => parent._id !== familyForm.parentId)
  ), [parents, familyForm.parentId]);

  const availableChildren = useMemo(() => (
    patients.filter(patient => !familyForm.children.includes(patient._id))
  ), [patients, familyForm.children]);

  // Récupération des données
  useEffect(() => {
    const fetchData = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        
        const [familiesData, parentsData, patientsData] = await Promise.all([
          getFamilies(),
          getParents(),
          getPatientTable()
        ]);
        
        setState(prev => ({
          ...prev,
          families: familiesData,
          parents: parentsData,
          patients: patientsData,
          loading: false
        }));
      } catch (err) {
        setState(prev => ({
          ...prev,
          error: 'Échec du chargement des données familiales',
          loading: false
        }));
        toast.error('Échec du chargement des données familiales. Veuillez réessayer.');
        console.error('Erreur de chargement des données:', err);
      }
    };
    
    fetchData();
  }, []);

  // Fonctions d'aide
  const updateState = (updates) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  // Validation
  const validateFamilyForm = () => {
    const newErrors = {};
    
    if (!familyForm.familyName.trim()) {
      newErrors.familyName = 'Le nom de famille est requis';
    } else if (familyForm.familyName.trim().length < 2) {
      newErrors.familyName = 'Le nom de famille doit contenir au moins 2 caractères';
    }
    
    if (!familyForm.parentId) {
      newErrors.parentId = 'Veuillez sélectionner un parent';
    }
    
    updateState({ errors: newErrors });
    return Object.keys(newErrors).length === 0;
  };

  // Gestionnaires de formulaire
  const handleFormChange = (field, value) => {
    const updatedForm = { ...familyForm, [field]: value };
    updateState({ familyForm: updatedForm });
    
    if (errors[field]) {
      updateState({ errors: { ...errors, [field]: undefined } });
    }
  };

  const handleParentSelection = (parentId) => {
    handleFormChange('parentId', parentId);
  };

  const handleChildSelection = (childId) => {
    const updatedChildren = familyForm.children.includes(childId)
      ? familyForm.children.filter(id => id !== childId)
      : [...familyForm.children, childId];
    
    handleFormChange('children', updatedChildren);
  };

  // Opérations CRUD
  const handleSubmitFamily = async () => {
    if (!validateFamilyForm()) {
      toast.error('Veuillez corriger les erreurs de validation');
      return;
    }

    try {
      updateState({ isSubmitting: true });
      
      // Convertir parentId en tableau pour l'API
      const familyData = {
        familyName: familyForm.familyName,
        parentId: familyForm.parentId ? [familyForm.parentId] : [], // Convertir en tableau
        children: familyForm.children
      };

      const response = selectedFamily
        ? await updateFamily(selectedFamily._id, familyData)
        : await createFamily(familyData);
      
      const updatedFamilies = selectedFamily
        ? families.map(f => f._id === response._id ? response : f)
        : [...families, response];
      
      updateState({
        families: updatedFamilies,
        isSubmitting: false,
        isFamilyModalOpen: false
      });
      
      toast.success(`Famille ${selectedFamily ? 'mise à jour' : 'créée'} avec succès`);
    } catch (error) {
      console.error('Erreur d\'opération famille:', error);
      toast.error(error.message || `Échec de ${selectedFamily ? 'mise à jour' : 'création'} de la famille`);
      updateState({ isSubmitting: false });
    }
  };

  const handleDeleteFamily = async () => {
    try {
      await deleteFamily(selectedFamily._id);
      updateState({
        families: families.filter(f => f._id !== selectedFamily._id),
        isDeleteModalOpen: false,
        selectedFamily: null
      });
      toast.success('Famille supprimée avec succès');
    } catch (error) {
      toast.error('Échec de la suppression de la famille');
      console.error('Erreur de suppression de famille:', error);
    }
  };

  // Gestionnaires de modales
  const openCreateModal = () => {
    updateState({
      selectedFamily: null,
      familyForm: {
        familyName: '',
        parentId: '',
        children: []
      },
      errors: {},
      isFamilyModalOpen: true
    });
  };

  const openEditModal = (family) => {
    // Prendre le premier ID parent du tableau (l'API retourne un tableau mais nous n'affichons qu'un seul)
    const parentId = family.parentId?.length > 0 ? family.parentId[0] : '';
    
    updateState({
      selectedFamily: family,
      familyForm: {
        familyName: family.familyName,
        parentId: parentId,
        children: family.childrenDetails?.map(child => child._id) || []
      },
      errors: {},
      isFamilyModalOpen: true
    });
  };

  const openDeleteModal = (family) => {
    updateState({ selectedFamily: family, isDeleteModalOpen: true });
  };

  const closeModal = () => {
    updateState({
      isFamilyModalOpen: false,
      isDeleteModalOpen: false,
      selectedFamily: null,
      familyForm: {
        familyName: '',
        parentId: '',
        children: []
      },
      errors: {},
      isSubmitting: false
    });
  };

  // États de chargement et d'erreur
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Typography variant="h5">Chargement des familles...</Typography>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <Typography variant="h5" color="red">{error}</Typography>
      </div>
    );
  }

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
          <div className="flex items-center justify-between">
            <Typography variant="h6" color="white">
              Gestion des Familles
            </Typography>
            <Button
              color="white"
              size="sm"
              className="flex items-center gap-2"
              onClick={openCreateModal}
            >
              <UserPlusIcon className="h-4 w-4" />
              Ajouter une Famille
            </Button>
          </div>
        </CardHeader>
        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          <table className="w-full min-w-[640px] table-auto">
            <thead>
              <tr>
                {["Nom de Famille", "Parent", "Enfants", "Nombre Total de Membres", "Actions"].map(
                  (el) => (
                    <th
                      key={el}
                      className="border-b border-blue-gray-50 py-3 px-5 text-left"
                    >
                      <Typography
                        variant="small"
                        className="text-[11px] font-bold uppercase text-blue-gray-400"
                      >
                        {el}
                      </Typography>
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {families.map((family, key) => {
                const className = `py-3 px-5 ${key === families.length - 1 ? "" : "border-b border-blue-gray-50"}`;
                const totalMembers = (family.parentId?.length || 0) + (family.childrenDetails?.length || 0);

                return (
                  <tr key={family._id}>
                    <td className={className}>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center bg-blue-500 text-white rounded-full h-8 w-8">
                          <UsersIcon className="h-4 w-4" />
                        </div>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-bold"
                        >
                          {family.familyName}
                        </Typography>
                      </div>
                    </td>
                    <td className={className}>
                      <div className="flex items-center gap-1">
                        {family.parent && family.parent.fullName ? (
                          <Chip
                            size="sm"
                            value={family.parent.fullName}
                            className="bg-blue-50 text-blue-600 text-xs"
                          />
                        ) : (
                          <Typography variant="small" color="gray">
                            Aucun parent
                          </Typography>
                        )}
                      </div>
                    </td>
                    <td className={className}>
                      <div className="flex flex-wrap gap-1">
                        {family.childrenDetails?.length > 0 ? (
                          family.childrenDetails.slice(0, 3).map((child) => (
                            <Tooltip key={child._id} content={`${child.firstName} ${child.lastName}`}>
                              <div className="flex items-center justify-center bg-green-500 text-white rounded-full h-6 w-6 cursor-pointer border-2 border-white">
                                <UserIcon className="h-3 w-3" />
                              </div>
                            </Tooltip>
                          ))
                        ) : (
                          <Typography variant="small" color="gray">
                            Aucun enfant
                          </Typography>
                        )}
                        {family.childrenDetails?.length > 3 && (
                          <Chip
                            size="sm"
                            value={`+${family.childrenDetails.length - 3}`}
                            className="bg-gray-100 text-gray-600 text-xs"
                          />
                        )}
                      </div>
                    </td>
                    <td className={className}>
                      <Chip
                        size="sm"
                        value={`${family.totalMembers} membre${family.totalMembers !== 1 ? 's' : ''}`}
                        className={`${family.totalMembers > 0 ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-600'} text-xs`}
                      />
                    </td>
                    <td className={className}>
                      <div className="flex items-center gap-2">
                        <IconButton
                          variant="text"
                          size="sm"
                          onClick={() => openEditModal(family)}
                        >
                          <PencilIcon className="h-4 w-4 text-blue-600" />
                        </IconButton>
                        <IconButton
                          variant="text"
                          size="sm"
                          onClick={() => openDeleteModal(family)}
                        >
                          <TrashIcon className="h-4 w-4 text-red-600" />
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {families.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center">
                    <Typography variant="small" color="gray">
                      Aucune famille trouvée. Cliquez sur "Ajouter une Famille" pour en créer une.
                    </Typography>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardBody>
      </Card>

      {/* Modale de Famille */}
      <Dialog open={isFamilyModalOpen} handler={closeModal} size="lg">
        <DialogHeader>
          <Typography variant="h5">
            {selectedFamily ? 'Modifier la Famille' : 'Créer une Nouvelle Famille'}
          </Typography>
        </DialogHeader>
        <DialogBody className="space-y-6">
          <div>
            <Input
              label="Nom de Famille *"
              value={familyForm.familyName}
              onChange={(e) => handleFormChange('familyName', e.target.value)}
              error={!!errors.familyName}
            />
            {errors.familyName && (
              <Typography variant="small" color="red" className="mt-1">
                {errors.familyName}
              </Typography>
            )}
          </div>

          <div>
            <Typography variant="h6" className="mb-3">Parent *</Typography>
            <Select
              label="Sélectionner un Parent"
              value={familyForm.parentId}
              onChange={handleParentSelection}
              error={!!errors.parentId}
            >
              {parents.map((parent) => (
                <Option key={parent._id} value={parent._id}>
                  {parent.fullName} - {parent.phoneNumber}
                </Option>
              ))}
            </Select>
            {errors.parentId && (
              <Typography variant="small" color="red" className="mt-1">
                {errors.parentId}
              </Typography>
            )}
          </div>

          <div>
            <Typography variant="h6" className="mb-3">Enfants</Typography>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {patients.map((patient) => (
                <div key={patient._id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={familyForm.children.includes(patient._id)}
                    onChange={() => handleChildSelection(patient._id)}
                    className="rounded"
                  />
                  <Typography variant="small">
                    {patient.firstName} {patient.lastName} - {patient.gender}
                  </Typography>
                </div>
              ))}
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <div className="flex gap-2">
            <Button variant="text" color="red" onClick={closeModal}>
              Annuler
            </Button>
            <Button
              color="blue"
              onClick={handleSubmitFamily}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Traitement...' : selectedFamily ? 'Mettre à jour la Famille' : 'Créer la Famille'}
            </Button>
          </div>
        </DialogFooter>
      </Dialog>

      {/* Modale de Confirmation de Suppression */}
      <Dialog open={isDeleteModalOpen} handler={closeModal} size="sm">
        <DialogHeader>Confirmer la Suppression</DialogHeader>
        <DialogBody>
          <Typography>
            Êtes-vous sûr de vouloir supprimer la famille "{selectedFamily?.familyName}" ? 
            Cette action ne peut pas être annulée.
          </Typography>
        </DialogBody>
        <DialogFooter>
          <div className="flex gap-2">
            <Button variant="text" onClick={closeModal}>
              Annuler
            </Button>
            <Button color="red" onClick={handleDeleteFamily}>
              Supprimer la Famille
            </Button>
          </div>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

export default Families;


// english
// import React, { useState, useEffect, useMemo } from 'react';
// import { toast } from 'react-toastify';
// import {
//   Card,
//   CardHeader,
//   CardBody,
//   Typography,
//   Chip,
//   Tooltip,
//   Button,
//   Dialog,
//   DialogHeader,
//   DialogBody,
//   DialogFooter,
//   Input,
//   Select,
//   Option,
//   IconButton,
// } from "@material-tailwind/react";
// import { 
//   UserPlusIcon,
//   PencilIcon,
//   TrashIcon,
//   UsersIcon,
//   UserIcon
// } from "@heroicons/react/24/outline";
// import { getFamilies, createFamily, updateFamily, deleteFamily } from "@/data/familiesData";
// import { getPatientTable, getParents } from "@/data/patientTable";

// export function Families() {
//   // State management
//   const [state, setState] = useState({
//     families: [],
//     parents: [],
//     patients: [],
//     loading: true,
//     error: null,
//     isFamilyModalOpen: false,
//     isDeleteModalOpen: false,
//     selectedFamily: null,
//     isSubmitting: false,
//     familyForm: {
//       familyName: '',
//       parentId: '',
//       children: []
//     },
//     errors: {}
//   });

//   // Destructure state for easier access
//   const {
//     families,
//     parents,
//     patients,
//     loading,
//     error,
//     isFamilyModalOpen,
//     isDeleteModalOpen,
//     selectedFamily,
//     isSubmitting,
//     familyForm,
//     errors
//   } = state;

//   // Memoized derived data
//   const availableParents = useMemo(() => (
//     parents.filter(parent => parent._id !== familyForm.parentId)
//   ), [parents, familyForm.parentId]);

//   const availableChildren = useMemo(() => (
//     patients.filter(patient => !familyForm.children.includes(patient._id))
//   ), [patients, familyForm.children]);

//   // Data fetching
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setState(prev => ({ ...prev, loading: true, error: null }));
        
//         const [familiesData, parentsData, patientsData] = await Promise.all([
//           getFamilies(),
//           getParents(),
//           getPatientTable()
//         ]);
        
//         setState(prev => ({
//           ...prev,
//           families: familiesData,
//           parents: parentsData,
//           patients: patientsData,
//           loading: false
//         }));
//       } catch (err) {
//         setState(prev => ({
//           ...prev,
//           error: 'Failed to load family data',
//           loading: false
//         }));
//         toast.error('Failed to load family data. Please try again.');
//         console.error('Data loading error:', err);
//       }
//     };
    
//     fetchData();
//   }, []);

//   // Helper functions
//   const updateState = (updates) => {
//     setState(prev => ({ ...prev, ...updates }));
//   };

//   // Validation
//   const validateFamilyForm = () => {
//     const newErrors = {};
    
//     if (!familyForm.familyName.trim()) {
//       newErrors.familyName = 'Family name is required';
//     } else if (familyForm.familyName.trim().length < 2) {
//       newErrors.familyName = 'Family name must be at least 2 characters';
//     }
    
//     if (!familyForm.parentId) {
//       newErrors.parentId = 'Please select a parent';
//     }
    
//     updateState({ errors: newErrors });
//     return Object.keys(newErrors).length === 0;
//   };

//   // Form handlers
//   const handleFormChange = (field, value) => {
//     const updatedForm = { ...familyForm, [field]: value };
//     updateState({ familyForm: updatedForm });
    
//     if (errors[field]) {
//       updateState({ errors: { ...errors, [field]: undefined } });
//     }
//   };

//   const handleParentSelection = (parentId) => {
//     handleFormChange('parentId', parentId);
//   };

//   const handleChildSelection = (childId) => {
//     const updatedChildren = familyForm.children.includes(childId)
//       ? familyForm.children.filter(id => id !== childId)
//       : [...familyForm.children, childId];
    
//     handleFormChange('children', updatedChildren);
//   };

//   // CRUD operations
//   const handleSubmitFamily = async () => {
//     if (!validateFamilyForm()) {
//       toast.error('Please fix the validation errors');
//       return;
//     }

//     try {
//       updateState({ isSubmitting: true });
      
//       // Convert parentId to array for the API
//       const familyData = {
//         familyName: familyForm.familyName,
//         parentId: familyForm.parentId ? [familyForm.parentId] : [], // Convert to array
//         children: familyForm.children
//       };

//       const response = selectedFamily
//         ? await updateFamily(selectedFamily._id, familyData)
//         : await createFamily(familyData);
      
//       const updatedFamilies = selectedFamily
//         ? families.map(f => f._id === response._id ? response : f)
//         : [...families, response];
      
//       updateState({
//         families: updatedFamilies,
//         isSubmitting: false,
//         isFamilyModalOpen: false
//       });
      
//       toast.success(`Family ${selectedFamily ? 'updated' : 'created'} successfully`);
//     } catch (error) {
//       console.error('Family operation error:', error);
//       toast.error(error.message || `Failed to ${selectedFamily ? 'update' : 'create'} family`);
//       updateState({ isSubmitting: false });
//     }
//   };

//   const handleDeleteFamily = async () => {
//     try {
//       await deleteFamily(selectedFamily._id);
//       updateState({
//         families: families.filter(f => f._id !== selectedFamily._id),
//         isDeleteModalOpen: false,
//         selectedFamily: null
//       });
//       toast.success('Family deleted successfully');
//     } catch (error) {
//       toast.error('Failed to delete family');
//       console.error('Family deletion error:', error);
//     }
//   };

//   // Modal handlers
//   const openCreateModal = () => {
//     updateState({
//       selectedFamily: null,
//       familyForm: {
//         familyName: '',
//         parentId: '',
//         children: []
//       },
//       errors: {},
//       isFamilyModalOpen: true
//     });
//   };

//   const openEditModal = (family) => {
//     // Take the first parent ID from the array (API returns array but we only show one)
//     const parentId = family.parentId?.length > 0 ? family.parentId[0] : '';
    
//     updateState({
//       selectedFamily: family,
//       familyForm: {
//         familyName: family.familyName,
//         parentId: parentId,
//         children: family.childrenDetails?.map(child => child._id) || []
//       },
//       errors: {},
//       isFamilyModalOpen: true
//     });
//   };

//   const openDeleteModal = (family) => {
//     updateState({ selectedFamily: family, isDeleteModalOpen: true });
//   };

//   const closeModal = () => {
//     updateState({
//       isFamilyModalOpen: false,
//       isDeleteModalOpen: false,
//       selectedFamily: null,
//       familyForm: {
//         familyName: '',
//         parentId: '',
//         children: []
//       },
//       errors: {},
//       isSubmitting: false
//     });
//   };

//   // Loading and error states
//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <Typography variant="h5">Loading families...</Typography>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <Typography variant="h5" color="red">{error}</Typography>
//       </div>
//     );
//   }

//   return (
//     <div className="mt-12 mb-8 flex flex-col gap-12">
//       <Card>
//         <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
//           <div className="flex items-center justify-between">
//             <Typography variant="h6" color="white">
//               Family Management
//             </Typography>
//             <Button
//               color="white"
//               size="sm"
//               className="flex items-center gap-2"
//               onClick={openCreateModal}
//             >
//               <UserPlusIcon className="h-4 w-4" />
//               Add Family
//             </Button>
//           </div>
//         </CardHeader>
//         <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
//           <table className="w-full min-w-[640px] table-auto">
//             <thead>
//               <tr>
//                 {["Family Name", "Parent", "Children", " Total Members ", "Actions"].map(
//                   (el) => (
//                     <th
//                       key={el}
//                       className="border-b border-blue-gray-50 py-3 px-5 text-left"
//                     >
//                       <Typography
//                         variant="small"
//                         className="text-[11px] font-bold uppercase text-blue-gray-400"
//                       >
//                         {el}
//                       </Typography>
//                     </th>
//                   )
//                 )}
//               </tr>
//             </thead>
//             <tbody>
//               {families.map((family, key) => {
//                 const className = `py-3 px-5 ${key === families.length - 1 ? "" : "border-b border-blue-gray-50"}`;
//                 const totalMembers = (family.parentId?.length || 0) + (family.childrenDetails?.length || 0);

//                 return (
//                   <tr key={family._id}>
//                     <td className={className}>
//                       <div className="flex items-center gap-4">
//                         <div className="flex items-center justify-center bg-blue-500 text-white rounded-full h-8 w-8">
//                           <UsersIcon className="h-4 w-4" />
//                         </div>
//                         <Typography
//                           variant="small"
//                           color="blue-gray"
//                           className="font-bold"
//                         >
//                           {family.familyName}
//                         </Typography>
//                       </div>
//                     </td>
//                    <td className={className}>
//   <div className="flex items-center gap-1">
//     {family.parent && family.parent.fullName ? (
//       <Chip
//         size="sm"
//         value={family.parent.fullName}
//         className="bg-blue-50 text-blue-600 text-xs"
//       />
//     ) : (
//       <Typography variant="small" color="gray">
//         No parent
//       </Typography>
//     )}
//   </div>
// </td>
//                     <td className={className}>
//                       <div className="flex flex-wrap gap-1">
//                         {family.childrenDetails?.length > 0 ? (
//                           family.childrenDetails.slice(0, 3).map((child) => (
//                             <Tooltip key={child._id} content={`${child.firstName} ${child.lastName}`}>
//                               <div className="flex items-center justify-center bg-green-500 text-white rounded-full h-6 w-6 cursor-pointer border-2 border-white">
//                                 <UserIcon className="h-3 w-3" />
//                               </div>
//                             </Tooltip>
//                           ))
//                         ) : (
//                           <Typography variant="small" color="gray">
//                             No children
//                           </Typography>
//                         )}
//                         {family.childrenDetails?.length > 3 && (
//                           <Chip
//                             size="sm"
//                             value={`+${family.childrenDetails.length - 3}`}
//                             className="bg-gray-100 text-gray-600 text-xs"
//                           />
//                         )}
//                       </div>
//                     </td>
//                     <td className={className}>
//                       <Chip
//                         size="sm"
//                         value={`${totalMembers} member${totalMembers !== 1 ? 's' : ''}`}
//                         className={`${totalMembers > 0 ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-600'} text-xs`}
//                       />
//                     </td>
//                     <td className={className}>
//                       <div className="flex items-center gap-2">
//                         <IconButton
//                           variant="text"
//                           size="sm"
//                           onClick={() => openEditModal(family)}
//                         >
//                           <PencilIcon className="h-4 w-4 text-blue-600" />
//                         </IconButton>
//                         <IconButton
//                           variant="text"
//                           size="sm"
//                           onClick={() => openDeleteModal(family)}
//                         >
//                           <TrashIcon className="h-4 w-4 text-red-600" />
//                         </IconButton>
//                       </div>
//                     </td>
//                   </tr>
//                 );
//               })}
//               {families.length === 0 && (
//                 <tr>
//                   <td colSpan={5} className="py-8 text-center">
//                     <Typography variant="small" color="gray">
//                       No families found. Click "Add Family" to create one.
//                     </Typography>
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </CardBody>
//       </Card>

//       {/* Family Modal */}
//       <Dialog open={isFamilyModalOpen} handler={closeModal} size="lg">
//         <DialogHeader>
//           <Typography variant="h5">
//             {selectedFamily ? 'Edit Family' : 'Create New Family'}
//           </Typography>
//         </DialogHeader>
//         <DialogBody className="space-y-6">
//           <div>
//             <Input
//               label="Family Name *"
//               value={familyForm.familyName}
//               onChange={(e) => handleFormChange('familyName', e.target.value)}
//               error={!!errors.familyName}
//             />
//             {errors.familyName && (
//               <Typography variant="small" color="red" className="mt-1">
//                 {errors.familyName}
//               </Typography>
//             )}
//           </div>

//           <div>
//             <Typography variant="h6" className="mb-3">Parent *</Typography>
//             <Select
//               label="Select Parent"
//               value={familyForm.parentId}
//               onChange={handleParentSelection}
//               error={!!errors.parentId}
//             >
//               {parents.map((parent) => (
//                 <Option key={parent._id} value={parent._id}>
//                   {parent.fullName} - {parent.phoneNumber}
//                 </Option>
//               ))}
//             </Select>
//             {errors.parentId && (
//               <Typography variant="small" color="red" className="mt-1">
//                 {errors.parentId}
//               </Typography>
//             )}
//           </div>

//           <div>
//             <Typography variant="h6" className="mb-3">Children</Typography>
//             <div className="space-y-2 max-h-32 overflow-y-auto">
//               {patients.map((patient) => (
//                 <div key={patient._id} className="flex items-center gap-2">
//                   <input
//                     type="checkbox"
//                     checked={familyForm.children.includes(patient._id)}
//                     onChange={() => handleChildSelection(patient._id)}
//                     className="rounded"
//                   />
//                   <Typography variant="small">
//                     {patient.firstName} {patient.lastName} - {patient.gender}
//                   </Typography>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </DialogBody>
//         <DialogFooter>
//           <div className="flex gap-2">
//             <Button variant="text" color="red" onClick={closeModal}>
//               Cancel
//             </Button>
//             <Button
//               color="blue"
//               onClick={handleSubmitFamily}
//               disabled={isSubmitting}
//             >
//               {isSubmitting ? 'Processing...' : selectedFamily ? 'Update Family' : 'Create Family'}
//             </Button>
//           </div>
//         </DialogFooter>
//       </Dialog>

//       {/* Delete Confirmation Modal */}
//       <Dialog open={isDeleteModalOpen} handler={closeModal} size="sm">
//         <DialogHeader>Confirm Deletion</DialogHeader>
//         <DialogBody>
//           <Typography>
//             Are you sure you want to delete the family "{selectedFamily?.familyName}"? 
//             This action cannot be undone.
//           </Typography>
//         </DialogBody>
//         <DialogFooter>
//           <div className="flex gap-2">
//             <Button variant="text" onClick={closeModal}>
//               Cancel
//             </Button>
//             <Button color="red" onClick={handleDeleteFamily}>
//               Delete Family
//             </Button>
//           </div>
//         </DialogFooter>
//       </Dialog>
//     </div>
//   );
// }

// export default Families;