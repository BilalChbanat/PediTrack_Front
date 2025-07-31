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
  UserIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from "@heroicons/react/24/outline";
import { Modal, Box, TextField, FormControl, InputLabel, Select as MuiSelect, MenuItem, Typography as MuiTypography, Button as MuiButton, IconButton as MuiIconButton } from "@mui/material";
import { getFamilies, createFamily, updateFamily, deleteFamily } from "@/data/familiesData";
import { getPatientTable, getParents } from "@/data/patientTable";

export function Families() {
  // Material-UI Modal State
  const [state, setState] = useState({
    families: [],
    parents: [],
    patients: [],
    loading: true,
    error: null,
    isDeleteModalOpen: false,
    selectedFamily: null,
    isSubmitting: false,
    searchTerm: '',
    currentPage: 1,
    familiesPerPage: 10,
    // Material-UI Modal State
    muiModalOpen: false,
    muiFormData: {
      familyName: '',
      parentId: '',
      children: []
    },
    // Search states for modal
    parentSearchTerm: '',
    childrenSearchTerm: '',
    childrenCurrentPage: 1,
    childrenPerPage: 6,
    // Parent dropdown state
    parentDropdownOpen: false
  });

  // Déstructurer l'état pour un accès plus facile
  const {
    families,
    parents,
    patients,
    loading,
    error,
    isDeleteModalOpen,
    selectedFamily,
    isSubmitting,
    searchTerm,
    currentPage,
    familiesPerPage,
    muiModalOpen,
    muiFormData,
    parentSearchTerm,
    childrenSearchTerm,
    childrenCurrentPage,
    childrenPerPage,
    parentDropdownOpen
  } = state;

  // Données dérivées mémorisées
  const availableParents = useMemo(() => (
    parents.filter(parent => parent._id !== muiFormData.parentId)
  ), [parents, muiFormData.parentId]);

  const availableChildren = useMemo(() => (
    patients.filter(patient => !muiFormData.children.includes(patient._id))
  ), [patients, muiFormData.children]);

  // Filter and sort families
  const filteredAndSortedFamilies = useMemo(() => {
    const filtered = families.filter(family => 
      family.familyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (family.parent?.fullName && family.parent.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (family.childrenDetails && family.childrenDetails.some(child => 
        `${child.firstName} ${child.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
      ))
    );
    
    // Sort by newest first (by creation date or _id)
    return filtered.sort((a, b) => {
      // Use _id for sorting as it contains timestamp information
      return b._id.localeCompare(a._id);
    });
  }, [families, searchTerm]);

  // Pagination logic
  const indexOfLastFamily = currentPage * familiesPerPage;
  const indexOfFirstFamily = indexOfLastFamily - familiesPerPage;
  const currentFamilies = filteredAndSortedFamilies.slice(indexOfFirstFamily, indexOfLastFamily);
  const totalPages = Math.ceil(filteredAndSortedFamilies.length / familiesPerPage);

  // Modal search and pagination logic
  const filteredParents = useMemo(() => {
    const filtered = parents.filter(parent => 
      parent.fullName.toLowerCase().includes(parentSearchTerm.toLowerCase()) ||
      parent.phoneNumber.includes(parentSearchTerm)
    );
    
    // Sort by newest first (by _id)
    return filtered.sort((a, b) => {
      return b._id.localeCompare(a._id);
    });
  }, [parents, parentSearchTerm]);

  const filteredChildren = useMemo(() => {
    return patients.filter(patient => 
      `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(childrenSearchTerm.toLowerCase()) ||
      patient.gender.toLowerCase().includes(childrenSearchTerm.toLowerCase())
    );
  }, [patients, childrenSearchTerm]);

  const childrenIndexOfLast = childrenCurrentPage * childrenPerPage;
  const childrenIndexOfFirst = childrenIndexOfLast - childrenPerPage;
  const currentChildren = filteredChildren.slice(childrenIndexOfFirst, childrenIndexOfLast);
  const totalChildrenPages = Math.ceil(filteredChildren.length / childrenPerPage);

  // Modal style
  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    pt: 2,
    px: 4,
    pb: 3,
    width: '90%',
    maxWidth: '800px',
    maxHeight: '90vh',
    overflow: 'auto',
  };

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

  // Search and pagination handlers
  const handleSearchChange = (value) => {
    updateState({ searchTerm: value, currentPage: 1 });
  };

  const handlePageChange = (pageNumber) => {
    updateState({ currentPage: pageNumber });
  };

  // Material-UI Modal handlers
  const handleMuiModalOpen = () => {
    updateState({
      muiModalOpen: true,
      muiFormData: {
        familyName: '',
        parentId: '',
        children: []
      },
      parentSearchTerm: '',
      childrenSearchTerm: '',
      childrenCurrentPage: 1,
      parentDropdownOpen: false // Reset dropdown state
    });
  };

  const handleMuiModalClose = () => {
    updateState({
      muiModalOpen: false,
      muiFormData: {
        familyName: '',
        parentId: '',
        children: []
      },
      parentSearchTerm: '',
      childrenSearchTerm: '',
      childrenCurrentPage: 1,
      parentDropdownOpen: false
    });
  };

  const handleMuiFormChange = (field, value) => {
    updateState({
      muiFormData: {
        ...muiFormData,
        [field]: value
      }
    });
  };

  // Modal search handlers
  const handleParentSearchChange = (value) => {
    updateState({ parentSearchTerm: value });
  };

  const handleChildrenSearchChange = (value) => {
    updateState({ childrenSearchTerm: value, childrenCurrentPage: 1 });
  };

  const handleChildrenPageChange = (pageNumber) => {
    updateState({ childrenCurrentPage: pageNumber });
  };

  // Parent selection handler
  const handleParentSelect = (parentId, parentName) => {
    handleMuiFormChange('parentId', parentId);
    updateState({ parentSearchTerm: parentName });
    updateState({ parentDropdownOpen: false }); // Close dropdown after selection
  };

  // Get selected parent display name
  const getSelectedParentDisplay = () => {
    if (muiFormData.parentId) {
      const selectedParent = parents.find(p => p._id === muiFormData.parentId);
      return selectedParent ? `${selectedParent.fullName} - ${selectedParent.phoneNumber}` : '';
    }
    return '';
  };

  // Click outside handler for dropdowns
  const handleClickOutside = (event) => {
    if (parentSearchTerm && !event.target.closest('.parent-dropdown-container')) {
      // Don't clear if a parent is selected
      if (!muiFormData.parentId) {
        updateState({ parentSearchTerm: '' });
      }
    }
    
    // Close parent dropdown when clicking outside
    if (parentDropdownOpen && !event.target.closest('.parent-dropdown-container')) {
      updateState({ parentDropdownOpen: false });
    }
  };

  // Add click outside listener
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [parentSearchTerm, parentDropdownOpen]);

  // Validation
  const validateFamilyForm = () => {
    const newErrors = {};
    
    if (!muiFormData.familyName.trim()) {
      newErrors.familyName = 'Le nom de famille est requis';
    } else if (muiFormData.familyName.trim().length < 2) {
      newErrors.familyName = 'Le nom de famille doit contenir au moins 2 caractères';
    }
    
    if (!muiFormData.parentId) {
      newErrors.parentId = 'Veuillez sélectionner un parent';
    }
    
    updateState({ errors: newErrors });
    return Object.keys(newErrors).length === 0;
  };

  // Gestionnaires de formulaire
  const handleFormChange = (field, value) => {
    const updatedForm = { ...muiFormData, [field]: value };
    updateState({ muiFormData: updatedForm });
    
    if (errors[field]) {
      updateState({ errors: { ...errors, [field]: undefined } });
    }
  };

  const handleParentSelection = (parentId) => {
    handleFormChange('parentId', parentId);
  };

  const handleChildSelection = (childId) => {
    const updatedChildren = muiFormData.children.includes(childId)
      ? muiFormData.children.filter(id => id !== childId)
      : [...muiFormData.children, childId];
    
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
        familyName: muiFormData.familyName,
        parentId: muiFormData.parentId ? [muiFormData.parentId] : [], // Convertir en tableau
        children: muiFormData.children
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
        muiModalOpen: false
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
  const openEditModal = (family) => {
    // Prendre le premier ID parent du tableau (l'API retourne un tableau mais nous n'affichons qu'un seul)
    const parentId = family.parentId?.length > 0 ? family.parentId[0] : '';
    
    updateState({
      selectedFamily: family,
      muiFormData: {
        familyName: family.familyName,
        parentId: parentId,
        children: family.childrenDetails?.map(child => child._id) || []
      },
      muiModalOpen: true
    });
  };

  const openDeleteModal = (family) => {
    updateState({ selectedFamily: family, isDeleteModalOpen: true });
  };

  const closeModal = () => {
    updateState({
      muiModalOpen: false,
      isDeleteModalOpen: false,
      selectedFamily: null,
      muiFormData: {
        familyName: '',
        parentId: '',
        children: []
      },
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
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <Typography variant="h6" color="white">
              Gestion des Familles
            </Typography>
            <div className="flex items-center gap-4 w-full md:w-auto">
              {/* Search Bar */}
              <div className="relative flex-1 md:flex-none">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-white opacity-70" />
                </div>
                <Input
                  placeholder="Rechercher des familles..."
                  color="white"
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10 pr-3 py-2 text-white bg-white bg-opacity-10 border border-white border-opacity-20 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                  style={{ minWidth: 250 }}
                />
              </div>
              <Button
                color="white"
                size="sm"
                className="flex items-center gap-2"
                onClick={handleMuiModalOpen}
              >
                <UserPlusIcon className="h-4 w-4" />
                Ajouter une Famille
              </Button>
            </div>
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
              {currentFamilies.map((family, key) => {
                const className = `py-3 px-5 ${key === currentFamilies.length - 1 ? "" : "border-b border-blue-gray-50"}`;
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
                        value={`${totalMembers} membre${totalMembers !== 1 ? 's' : ''}`}
                        className={`${totalMembers > 0 ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-600'} text-xs`}
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
              {currentFamilies.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center">
                    <Typography variant="small" color="gray">
                      {searchTerm 
                        ? 'Aucune famille trouvée pour votre recherche.'
                        : 'Aucune famille trouvée. Cliquez sur "Ajouter une Famille" pour en créer une.'
                      }
                    </Typography>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardBody>
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-blue-gray-50 p-4">
            <Typography variant="small" color="blue-gray" className="font-normal">
              Affichage de {indexOfFirstFamily + 1} à {Math.min(indexOfLastFamily, filteredAndSortedFamilies.length)} sur {filteredAndSortedFamilies.length} familles
            </Typography>
            <div className="flex gap-2">
              <Button
                variant="outlined"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className="flex items-center gap-1"
              >
                <ChevronLeftIcon className="h-4 w-4" />
                Précédent
              </Button>
              
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, index) => {
                  const pageNumber = index + 1;
                  const isCurrentPage = pageNumber === currentPage;
                  
                  return (
                    <Button
                      key={pageNumber}
                      variant={isCurrentPage ? "filled" : "text"}
                      size="sm"
                      onClick={() => handlePageChange(pageNumber)}
                      className="w-8 h-8 p-0"
                    >
                      {pageNumber}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outlined"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                className="flex items-center gap-1"
              >
                Suivant
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

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

      {/* Material-UI Family Creation Modal */}
      <Modal
        open={muiModalOpen}
        onClose={handleMuiModalClose}
        aria-labelledby="family-modal-title"
        aria-describedby="family-modal-description"
      >
        <Box sx={style}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
            <Box>
              <MuiTypography variant="h5" sx={{ fontWeight: 'bold', color: '#1f2937', mb: 1 }}>
                Ajouter une Nouvelle Famille
              </MuiTypography>
              <MuiTypography variant="body2" sx={{ color: '#6b7280' }}>
                Remplissez les informations de la famille
              </MuiTypography>
            </Box>
            <MuiIconButton
              onClick={handleMuiModalClose}
              sx={{ color: '#6b7280', '&:hover': { color: '#374151' } }}
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </MuiIconButton>
          </Box>

          {/* Form Content */}
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Family Information Section */}
            <Box sx={{ 
              bgcolor: '#eff6ff', 
              p: 3, 
              borderRadius: 2,
              border: '1px solid #dbeafe'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <MuiTypography variant="h6" sx={{ color: '#1e40af', fontWeight: 'medium' }}>
                  Informations de la Famille
                </MuiTypography>
              </Box>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                <TextField
                  label="Nom de Famille *"
                  variant="outlined"
                  fullWidth
                  size="medium"
                  value={muiFormData.familyName}
                  onChange={(e) => handleMuiFormChange('familyName', e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: '#d1d5db' },
                      '&:hover fieldset': { borderColor: '#3b82f6' },
                      '&.Mui-focused fieldset': { borderColor: '#3b82f6' }
                    }
                  }}
                />
                
                <Box sx={{ position: 'relative' }} className="parent-dropdown-container">
                  <TextField
                    label="Parent Principal *"
                    variant="outlined"
                    fullWidth
                    size="medium"
                    value={muiFormData.parentId ? getSelectedParentDisplay() : parentSearchTerm}
                    onChange={(e) => {
                      handleParentSearchChange(e.target.value);
                      // Clear selected parent when user starts typing
                      if (muiFormData.parentId) {
                        handleMuiFormChange('parentId', '');
                      }
                      // Show dropdown when typing
                      updateState({ parentDropdownOpen: true });
                    }}
                    onFocus={() => {
                      // Show dropdown when input is focused
                      updateState({ parentDropdownOpen: true });
                    }}
                    placeholder="Rechercher un parent..."
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: '#d1d5db' },
                        '&:hover fieldset': { borderColor: '#3b82f6' },
                        '&.Mui-focused fieldset': { borderColor: '#3b82f6' }
                      }
                    }}
                  />
                  
                  {/* Parent Dropdown */}
                  {parentDropdownOpen && !muiFormData.parentId && filteredParents.length > 0 && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        zIndex: 1000,
                        backgroundColor: 'white',
                        border: '1px solid #d1d5db',
                        borderRadius: 1,
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        maxHeight: 200,
                        overflowY: 'auto',
                        mt: 0.5
                      }}
                    >
                      {filteredParents.map((parent) => (
                        <Box
                          key={parent._id}
                          sx={{
                            p: 2,
                            cursor: 'pointer',
                            borderBottom: '1px solid #f3f4f6',
                            '&:hover': {
                              backgroundColor: '#f9fafb'
                            },
                            '&:last-child': {
                              borderBottom: 'none'
                            }
                          }}
                          onClick={() => handleParentSelect(parent._id, `${parent.fullName} - ${parent.phoneNumber}`)}
                        >
                          <MuiTypography variant="body2" sx={{ fontWeight: 'medium', color: '#1f2937' }}>
                            {parent.fullName}
                          </MuiTypography>
                          <MuiTypography variant="caption" sx={{ color: '#6b7280' }}>
                            {parent.phoneNumber}
                          </MuiTypography>
                        </Box>
                      ))}
                    </Box>
                  )}
                  
                  {/* No results message */}
                  {parentDropdownOpen && !muiFormData.parentId && filteredParents.length === 0 && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        zIndex: 1000,
                        backgroundColor: 'white',
                        border: '1px solid #d1d5db',
                        borderRadius: 1,
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        p: 2,
                        mt: 0.5
                      }}
                    >
                      <MuiTypography variant="body2" sx={{ color: '#6b7280', textAlign: 'center' }}>
                        Aucun parent trouvé
                      </MuiTypography>
                    </Box>
                  )}
                  
                  {/* Clear button for selected parent */}
                  {muiFormData.parentId && (
                    <MuiIconButton
                      size="small"
                      onClick={() => {
                        handleMuiFormChange('parentId', '');
                        updateState({ parentSearchTerm: '' });
                      }}
                      sx={{
                        position: 'absolute',
                        right: 8,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#6b7280',
                        '&:hover': { color: '#374151' }
                      }}
                    >
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </MuiIconButton>
                  )}
                </Box>
              </Box>
            </Box>

            {/* Children Selection Section */}
            <Box sx={{ 
              bgcolor: '#f0fdf4', 
              p: 3, 
              borderRadius: 2,
              border: '1px solid #bbf7d0'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <MuiTypography variant="h6" sx={{ color: '#166534', fontWeight: 'medium' }}>
                  Enfants de la Famille
                </MuiTypography>
              </Box>

              {/* Children Search Bar */}
              <Box sx={{ mb: 2 }}>
                <TextField
                  placeholder="Rechercher des enfants..."
                  variant="outlined"
                  fullWidth
                  size="small"
                  value={childrenSearchTerm}
                  onChange={(e) => handleChildrenSearchChange(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </Box>
                    )
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: '#d1d5db' },
                      '&:hover fieldset': { borderColor: '#3b82f6' },
                      '&.Mui-focused fieldset': { borderColor: '#3b82f6' }
                    }
                  }}
                />
              </Box>

              {/* Children Cards Grid */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, 
                  gap: 2,
                  maxHeight: 300,
                  overflowY: 'auto'
                }}>
                  {currentChildren.map((patient) => (
                    <Box
                      key={patient._id}
                      sx={{
                        border: muiFormData.children.includes(patient._id) 
                          ? '2px solid #22c55e' 
                          : '2px solid #e5e7eb',
                        borderRadius: 2,
                        p: 2,
                        cursor: 'pointer',
                        backgroundColor: muiFormData.children.includes(patient._id) 
                          ? '#f0fdf4' 
                          : 'white',
                        '&:hover': {
                          borderColor: '#22c55e',
                          backgroundColor: '#f0fdf4'
                        },
                        transition: 'all 0.2s'
                      }}
                      onClick={() => {
                        const updatedChildren = muiFormData.children.includes(patient._id)
                          ? muiFormData.children.filter(id => id !== patient._id)
                          : [...muiFormData.children, patient._id];
                        handleMuiFormChange('children', updatedChildren);
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            backgroundColor: muiFormData.children.includes(patient._id) 
                              ? '#22c55e' 
                              : '#e5e7eb',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: 'bold'
                          }}
                        >
                          {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <MuiTypography variant="body2" sx={{ fontWeight: 'medium' }}>
                            {patient.firstName} {patient.lastName}
                          </MuiTypography>
                          <MuiTypography variant="caption" sx={{ color: '#6b7280' }}>
                            {patient.gender === 'male' ? 'Masculin' : 'Féminin'}
                          </MuiTypography>
                        </Box>
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            border: '2px solid #d1d5db',
                            backgroundColor: muiFormData.children.includes(patient._id) 
                              ? '#22c55e' 
                              : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {muiFormData.children.includes(patient._id) && (
                            <svg width="12" height="12" fill="white" viewBox="0 0 24 24">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                            </svg>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Children Pagination */}
              {totalChildrenPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, mt: 2 }}>
                  <MuiButton
                    variant="outlined"
                    size="small"
                    disabled={childrenCurrentPage === 1}
                    onClick={() => handleChildrenPageChange(childrenCurrentPage - 1)}
                    sx={{ minWidth: 40 }}
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </MuiButton>
                  
                  <MuiTypography variant="body2" sx={{ mx: 2 }}>
                    Page {childrenCurrentPage} sur {totalChildrenPages}
                  </MuiTypography>
                  
                  <MuiButton
                    variant="outlined"
                    size="small"
                    disabled={childrenCurrentPage === totalChildrenPages}
                    onClick={() => handleChildrenPageChange(childrenCurrentPage + 1)}
                    sx={{ minWidth: 40 }}
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </MuiButton>
                </Box>
              )}

              {/* Selected Children Summary */}
              {muiFormData.children.length > 0 && (
                <Box sx={{ mt: 2, p: 2, backgroundColor: '#f0fdf4', borderRadius: 1, border: '1px solid #bbf7d0' }}>
                  <MuiTypography variant="body2" sx={{ fontWeight: 'medium', color: '#166534', mb: 1 }}>
                    Enfants sélectionnés ({muiFormData.children.length}):
                  </MuiTypography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {muiFormData.children.map((childId) => {
                      const child = patients.find(p => p._id === childId);
                      return child ? (
                        <Box
                          key={childId}
                          sx={{
                            backgroundColor: '#22c55e',
                            color: 'white',
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5
                          }}
                        >
                          {child.firstName} {child.lastName}
                          <svg 
                            width="12" 
                            height="12" 
                            fill="currentColor" 
                            viewBox="0 0 24 24"
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                              const updatedChildren = muiFormData.children.filter(id => id !== childId);
                              handleMuiFormChange('children', updatedChildren);
                            }}
                          >
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                          </svg>
                        </Box>
                      ) : null;
                    })}
                  </Box>
                </Box>
              )}
            </Box>
          </Box>

          {/* Footer Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4, pt: 2, borderTop: '1px solid #e5e7eb' }}>
            <MuiButton
              variant="outlined"
              onClick={handleMuiModalClose}
              sx={{
                borderColor: '#dc2626',
                color: '#dc2626',
                '&:hover': {
                  borderColor: '#b91c1c',
                  backgroundColor: '#fef2f2'
                },
                px: 3
              }}
            >
              Annuler
            </MuiButton>
            
            <MuiButton
              variant="contained"
              onClick={async () => {
                try {
                  // Validate required fields
                  if (!muiFormData.familyName || !muiFormData.parentId) {
                    toast.error('Veuillez remplir tous les champs obligatoires');
                    return;
                  }

                  const familyData = {
                    familyName: muiFormData.familyName,
                    parentId: [muiFormData.parentId],
                    children: muiFormData.children
                  };

                  const response = await createFamily(familyData);

                  if (!response) {
                    throw new Error('Échec de la création de la famille');
                  }
                  
                  toast.success('Famille créée avec succès !', {
                    position: "top-right",
                    autoClose: 3000,
                  });

                  handleMuiModalClose();
                  const updatedFamilies = await getFamilies();
                  updateState({ families: updatedFamilies });

                } catch (error) {
                  console.error('Error creating family:', error);
                  toast.error(`Erreur lors de la création de la famille: ${error.message}`, {
                    position: "top-right",
                    autoClose: 5000,
                  });
                }
              }}
              disabled={isSubmitting}
              sx={{
                bgcolor: '#22c55e',
                '&:hover': { bgcolor: '#16a34a' },
                '&:disabled': { bgcolor: '#9ca3af' },
                px: 4
              }}
            >
              {isSubmitting ? 'Création...' : 'Créer la Famille'}
            </MuiButton>
          </Box>
        </Box>
      </Modal>
    </div>
  );
}

export default Families;
