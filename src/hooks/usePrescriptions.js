
// FILE 7: hooks/usePrescriptions.js
import { useState, useCallback, useMemo } from 'react';
import axiosInstance from '../api/axiosInstance';
import { toast } from 'react-toastify';

export const usePrescriptions = (patientId, useFormState, modals, openModal, closeModal) => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [loading, setLoading] = useState(false);

  // Form state
  const [prescriptionForm, updatePrescriptionField, resetPrescriptionForm] = useFormState({
    medication: "",
    dosage: "",
    frequency: "",
    startDate: "",
    endDate: "",
    notes: ""
  });

  // Validation
  const isPrescriptionFormValid = useMemo(() => {
    const { medication, dosage, frequency, startDate } = prescriptionForm;
    return medication && dosage && frequency && startDate;
  }, [prescriptionForm]);

  // API calls
  const fetchPrescriptions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/prescriptions/${patientId}`);
      setPrescriptions(response.data);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      toast.error('Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  const createPrescription = useCallback(async () => {
    if (!isPrescriptionFormValid) return;
    
    try {
      setLoading(true);
      const response = await axiosInstance.post('/prescriptions', {
        patientId,
        ...prescriptionForm,
        startDate: new Date(prescriptionForm.startDate).toISOString(),
        endDate: prescriptionForm.endDate 
          ? new Date(prescriptionForm.endDate).toISOString() 
          : null
      });
      
      setPrescriptions(prev => [response.data, ...prev]);
      closeModal('createPrescription');
      resetPrescriptionForm();
      toast.success('Prescription added successfully!');
    } catch (error) {
      console.error('Error creating prescription:', error);
      toast.error('Failed to add prescription');
    } finally {
      setLoading(false);
    }
  }, [prescriptionForm, isPrescriptionFormValid, patientId, closeModal, resetPrescriptionForm]);

  const updatePrescription = useCallback(async () => {
    if (!selectedPrescription || !isPrescriptionFormValid) return;
    
    try {
      setLoading(true);
      const response = await axiosInstance.put(`/prescriptions/${selectedPrescription._id}`, {
        ...prescriptionForm,
        startDate: new Date(prescriptionForm.startDate).toISOString(),
        endDate: prescriptionForm.endDate 
          ? new Date(prescriptionForm.endDate).toISOString() 
          : null
      });
      
      setPrescriptions(prev =>
        prev.map(p => p._id === selectedPrescription._id ? response.data : p)
      );
      closeModal('editPrescription');
      toast.success('Prescription updated successfully!');
    } catch (error) {
      console.error('Error updating prescription:', error);
      toast.error('Failed to update prescription');
    } finally {
      setLoading(false);
    }
  }, [selectedPrescription, prescriptionForm, isPrescriptionFormValid, closeModal]);

  const deletePrescription = useCallback(async () => {
    if (!selectedPrescription) return;
    
    try {
      setLoading(true);
      await axiosInstance.delete(`/prescriptions/${selectedPrescription._id}`);
      setPrescriptions(prev => prev.filter(p => p._id !== selectedPrescription._id));
      closeModal('deletePrescription');
      toast.success('Prescription deleted successfully!');
    } catch (error) {
      console.error('Error deleting prescription:', error);
      toast.error('Failed to delete prescription');
    } finally {
      setLoading(false);
    }
  }, [selectedPrescription, closeModal]);

  // Event handlers
  const handleOpenCreate = useCallback(() => {
    resetPrescriptionForm();
    openModal('createPrescription');
  }, [resetPrescriptionForm, openModal]);

  const handleOpenEdit = useCallback((prescription) => {
    setSelectedPrescription(prescription);
    updatePrescriptionField('medication', prescription.medication);
    updatePrescriptionField('dosage', prescription.dosage);
    updatePrescriptionField('frequency', prescription.frequency);
    updatePrescriptionField('startDate', prescription.startDate.split('T')[0]);
    updatePrescriptionField('endDate', prescription.endDate ? prescription.endDate.split('T')[0] : "");
    updatePrescriptionField('notes', prescription.notes || "");
    openModal('editPrescription');
  }, [updatePrescriptionField, openModal]);

  const handleOpenDelete = useCallback((prescription) => {
    setSelectedPrescription(prescription);
    openModal('deletePrescription');
  }, [openModal]);

  const handleOpenView = useCallback((prescription) => {
    setSelectedPrescription(prescription);
    openModal('viewPrescription');
  }, [openModal]);

  return {
    prescriptions,
    selectedPrescription,
    loading,
    prescriptionForm,
    updatePrescriptionField,
    isPrescriptionFormValid,
    fetchPrescriptions,
    createPrescription,
    updatePrescription,
    deletePrescription,
    handleOpenCreate,
    handleOpenEdit,
    handleOpenDelete,
    handleOpenView
  };
};