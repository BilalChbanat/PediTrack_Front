import { CheckBadgeIcon } from '@heroicons/react/24/solid';
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { 
  getConsultationsByPatient, 
  getConsultations,
  createConsultation, 
  updateConsultation, 
  deleteConsultation 
} from '@/data/consultationsData';
import { getAppointmentsByPatient } from '@/data/appointmentsData';

const ConsultationHistory = ({ patientData = { name: 'Jean Dupont', id: '123' } }) => {
  const [consultations, setConsultations] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [notification, setNotification] = useState(null);
  const [formData, setFormData] = useState(getInitialForm());
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: ''
  });

  const itemsPerPage = 5;



  function getInitialForm() {
    return {
      appointmentId: '',
      motifConsultation: '',
      antecedents: '',
      anamnese: '',
      examenClinique: '',
      cat: '',
      traitement: '',
      isPaid: false
    };
  }

  const handleInputChange = useCallback((field) => (e) => {
    const value = field === 'isPaid' ? e.target.checked : e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleDateFilterChange = useCallback((field) => (e) => {
    setDateFilter((prev) => ({ ...prev, [field]: e.target.value }));
    setCurrentPage(1);
  }, []);

  const clearDateFilter = useCallback(() => {
    setDateFilter({ startDate: '', endDate: '' });
    setCurrentPage(1);
  }, []);

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchConsultations = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    if (!patientData.id) {
      setError('ID du patient manquant');
      showNotification('ID du patient manquant', 'error');
      setLoading(false);
      return;
    }
    
          // Use URL patient ID as fallback if patientData.id is not available
      const urlPatientId = window.location.pathname.split('/').pop();
      const patientIdToUse = patientData.id || urlPatientId;
    
    try {
      const response = await getConsultationsByPatient(patientIdToUse);
      // Handle both array and object responses
      const consultationsData = Array.isArray(response) ? response : (response?.consultations || []);
      setConsultations(consultationsData);
      
      if (consultationsData.length === 0) {
        showNotification('Aucune consultation trouvée pour ce patient.', 'info');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors du chargement des consultations';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  }, [patientData.id]);

  const fetchAppointments = useCallback(async () => {
    setAppointmentsLoading(true);
    try {
      // Get patient ID from URL first, then fallback to patientData.id
      const pathSegments = window.location.pathname.split('/');
      const urlPatientId = pathSegments[pathSegments.length - 1];
      const patientIdToUse = urlPatientId || patientData.id;
      
      console.log('Fetching appointments for patient ID:', patientIdToUse);
      console.log('URL patient ID:', urlPatientId);
      console.log('patientData.id:', patientData.id);
      
      if (!patientIdToUse) {
        console.error('No patient ID available for fetching appointments');
        setAppointments([]);
        return;
      }
      
      try {
        // First try to get appointments by patient
        const appointmentsData = await getAppointmentsByPatient(patientIdToUse);
        console.log('Appointments data received:', appointmentsData);
        
                 // Sort appointments by date and time, newest first
         const sortedAppointments = appointmentsData.sort((a, b) => {
           const dateA = new Date(a.appointmentDate || a.date);
           const dateB = new Date(b.appointmentDate || b.date);
           
           // If dates are the same, sort by time
           if (dateA.getTime() === dateB.getTime()) {
             const timeA = a.time || '00:00';
             const timeB = b.time || '00:00';
             // Convert time to minutes for proper comparison
             const timeAMinutes = parseInt(timeA.split(':')[0]) * 60 + parseInt(timeA.split(':')[1]);
             const timeBMinutes = parseInt(timeB.split(':')[0]) * 60 + parseInt(timeB.split(':')[1]);
             return timeBMinutes - timeAMinutes; // Newest time first
           }
           
           return dateB - dateA; // Newest date first
         });
        setAppointments(sortedAppointments || []);
      } catch (patientSpecificError) {
        console.log('Patient-specific endpoint failed, trying to fetch all appointments and filter:', patientSpecificError);
        
        // Fallback: fetch all appointments and filter by patient
        const { getAppointments } = await import('@/data/appointmentsData');
        const allAppointments = await getAppointments();
        console.log('All appointments received:', allAppointments);
        console.log('Total appointments found:', allAppointments.length);
        
        // Filter appointments for this patient
        const patientAppointments = allAppointments.filter(apt => {
          console.log('Checking appointment:', apt);
          console.log('Appointment patientId:', apt.patientId);
          console.log('Appointment patient:', apt.patient);
          console.log('Looking for patientIdToUse:', patientIdToUse);
          console.log('patientId match:', apt.patientId === patientIdToUse);
          console.log('patient match:', apt.patient === patientIdToUse);
          return apt.patientId === patientIdToUse || apt.patient === patientIdToUse;
        });
        console.log('Filtered appointments for patient:', patientAppointments);
        
                 // Sort appointments by date and time, newest first
         const sortedAppointments = patientAppointments.sort((a, b) => {
           const dateA = new Date(a.appointmentDate || a.date);
           const dateB = new Date(b.appointmentDate || b.date);
           
           // If dates are the same, sort by time
           if (dateA.getTime() === dateB.getTime()) {
             const timeA = a.time || '00:00';
             const timeB = b.time || '00:00';
             // Convert time to minutes for proper comparison
             const timeAMinutes = parseInt(timeA.split(':')[0]) * 60 + parseInt(timeA.split(':')[1]);
             const timeBMinutes = parseInt(timeB.split(':')[0]) * 60 + parseInt(timeB.split(':')[1]);
             return timeBMinutes - timeAMinutes; // Newest time first
           }
           
           return dateB - dateA; // Newest date first
         });
        setAppointments(sortedAppointments || []);
      }
    } catch (err) {
      console.error('Error fetching appointments for patient:', err);
      // Don't show error notification for appointments as it's optional
      setAppointments([]);
    } finally {
      setAppointmentsLoading(false);
    }
  }, [patientData.id]);

  useEffect(() => {
    fetchConsultations();
    fetchAppointments();
  }, [fetchConsultations, fetchAppointments]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const doctorId = localStorage.getItem('doctorId');
      if (!doctorId) {
        showNotification('ID du médecin non trouvé. Veuillez vous reconnecter.', 'error');
        return;
      }

      // Get patient ID from URL to ensure we're using the correct one
      const pathSegments = window.location.pathname.split('/');
      const urlPatientId = pathSegments[pathSegments.length - 1];
      
      // Validate that we have the correct patient ID
      if (!patientData.id) {
        showNotification('ID du patient manquant. Veuillez actualiser la page.', 'error');
        return;
      }
      
      // Use URL patient ID as the primary source since it represents the current patient being viewed
      const finalPatientId = urlPatientId || patientData.id;

      const newConsultation = {
        patientId: finalPatientId,
        doctorId: doctorId,
        appointmentId: formData.appointmentId || undefined, // Use undefined instead of null
        motifConsultation: formData.motifConsultation,
        antecedents: formData.antecedents,
        anamnese: formData.anamnese,
        examenClinique: formData.examenClinique,
        cat: formData.cat,
        traitement: formData.traitement,
        isPaid: formData.isPaid,
        consultationDate: new Date().toISOString()
      };
      
      // Remove undefined fields to avoid backend validation issues
      Object.keys(newConsultation).forEach(key => {
        if (newConsultation[key] === undefined) {
          delete newConsultation[key];
        }
      });
      
      // Validate required fields
      if (!newConsultation.motifConsultation || newConsultation.motifConsultation.trim() === '') {
        showNotification('Le motif de consultation est obligatoire', 'error');
        return;
      }
      
      const createdConsultation = await createConsultation(newConsultation);
      setConsultations((prev) => [createdConsultation, ...prev]);
      showNotification('Consultation ajoutée avec succès', 'success');
      closeModal();
    } catch (err) {
      console.error('Error creating consultation:', err);
      let errorMessage = 'Erreur lors de la création de la consultation';
      
      if (err.response?.data?.message) {
        if (Array.isArray(err.response.data.message)) {
          errorMessage = err.response.data.message.join(', ');
        } else {
          errorMessage = err.response.data.message;
        }
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      

      
      showNotification(errorMessage, 'error');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const doctorId = localStorage.getItem('doctorId');
      if (!doctorId) {
        showNotification('ID du médecin non trouvé. Veuillez vous reconnecter.', 'error');
        return;
      }

      const updateData = {
        ...formData,
        doctorId: doctorId
      };
      
      // Convert empty string to null for appointmentId
      if (updateData.appointmentId === '') {
        updateData.appointmentId = null;
      }

      await updateConsultation(selectedConsultation._id, updateData);
      setConsultations((prev) =>
        prev.map((c) =>
          c._id === selectedConsultation._id ? { ...c, ...updateData } : c
        )
      );
      showNotification('Consultation mise à jour avec succès', 'success');
      closeModal();
    } catch (err) {
      console.error('Error updating consultation:', err);
      let errorMessage = 'Erreur lors de la mise à jour de la consultation';
      
      if (err.response?.data?.message) {
        if (Array.isArray(err.response.data.message)) {
          errorMessage = err.response.data.message.join(', ');
        } else {
          errorMessage = err.response.data.message;
        }
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      showNotification(errorMessage, 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteConsultation(selectedConsultation._id);
      setConsultations((prev) => prev.filter((c) => c._id !== selectedConsultation._id));
      showNotification('Consultation supprimée avec succès', 'success');
      closeModal();
    } catch (err) {
      console.error('Error deleting consultation:', err);
      let errorMessage = 'Erreur lors de la suppression de la consultation';
      
      if (err.response?.data?.message) {
        if (Array.isArray(err.response.data.message)) {
          errorMessage = err.response.data.message.join(', ');
        } else {
          errorMessage = err.response.data.message;
        }
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      showNotification(errorMessage, 'error');
    }
  };

  const closeModal = () => {
    setModalType(null);
    setFormData(getInitialForm());
    setSelectedConsultation(null);
  };

  const openModal = (type, consultation = null) => {
    setModalType(type);
    setSelectedConsultation(consultation);
    if (type === 'edit' && consultation) {
      setFormData({
        appointmentId: consultation.appointmentId || '',
        motifConsultation: consultation.motifConsultation,
        antecedents: consultation.antecedents,
        anamnese: consultation.anamnese,
        examenClinique: consultation.examenClinique,
        cat: consultation.cat,
        traitement: consultation.traitement,
        isPaid: consultation.isPaid || false
      });
    } else if (type === 'view' && consultation) {
      setFormData({
        isPaid: consultation.isPaid || false
      });
    }
  };

  const filteredConsultations = useMemo(() => {
    let filtered = consultations;

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter((c) =>
        Object.values(c).some((v) => v?.toString?.().toLowerCase?.().includes(search))
      );
    }

    if (dateFilter.startDate || dateFilter.endDate) {
      filtered = filtered.filter((c) => {
        const consultationDate = new Date(c.consultationDate);
        
        if (dateFilter.startDate && dateFilter.endDate) {
          const startDate = new Date(dateFilter.startDate);
          const endDate = new Date(dateFilter.endDate);
          endDate.setHours(23, 59, 59, 999);
          return consultationDate >= startDate && consultationDate <= endDate;
        } else if (dateFilter.startDate) {
          const startDate = new Date(dateFilter.startDate);
          return consultationDate >= startDate;
        } else if (dateFilter.endDate) {
          const endDate = new Date(dateFilter.endDate);
          endDate.setHours(23, 59, 59, 999);
          return consultationDate <= endDate;
        }
        
        return true;
      });
    }

    return filtered.sort((a, b) =>
      sortOrder === 'asc'
        ? new Date(a.consultationDate) - new Date(b.consultationDate)
        : new Date(b.consultationDate) - new Date(a.consultationDate)
    );
  }, [consultations, searchTerm, sortOrder, dateFilter]);

  const totalPages = Math.ceil(filteredConsultations.length / itemsPerPage);
  const currentPageData = filteredConsultations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAppointmentDate = (appointment) => {
    // Handle both date and time fields
    const date = appointment.appointmentDate || appointment.date;
    const time = appointment.time;
    
    if (!date) return 'Date non spécifiée';
    
    const dateObj = new Date(date);
    
    // If we have a separate time field, combine it with the date
    if (time) {
      const [hours, minutes] = time.split(':');
      dateObj.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
    }
    
    return dateObj.toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getNotificationStyle = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 border-green-500 text-green-700';
      case 'error':
        return 'bg-red-100 border-red-500 text-red-700';
      default:
        return 'bg-blue-100 border-blue-500 text-blue-700';
    }
  };

  if (loading) {
    return (
      <div className="px-4">
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-4"></div>
            <p className="text-gray-600">Chargement des consultations...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <div className="font-medium">Erreur de chargement</div>
          <div className="mt-1 opacity-80">{error}</div>
          <button
            onClick={fetchConsultations}
            className="mt-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Historique des Consultations
          </h1>
          <p className="text-gray-600">
            Consultations pour {patientData?.name || (patientData?.firstName + ' ' + patientData?.lastName) || 'Patient'}
          </p>

        </div>

        {/* Notification */}
        {notification && (
          <div className={`fixed top-4 right-4 p-4 border-l-4 rounded shadow-lg z-50 ${getNotificationStyle(notification.type)}`}>
            <div className="flex items-center">
              <span>{notification.message}</span>
              <button
                onClick={() => setNotification(null)}
                className="ml-4 text-lg hover:opacity-70"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex-1 w-full lg:w-auto">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Rechercher des consultations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <svg className={`h-4 w-4 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  {sortOrder === 'asc' ? 'Anciennes d\'abord' : 'Nouvelles d\'abord'}
                </button>
                <button
                  onClick={() => openModal('create')}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Nouvelle Consultation
                </button>
              </div>
            </div>

            {/* Date Range Filter */}
            <div className="border-t pt-4">
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 9h6m-6 0a2 2 0 01-2-2V9a2 2 0 012-2h6a2 2 0 012 2v7a2 2 0 01-2 2m-6 0H6a2 2 0 01-2-2V9a2 2 0 012-2h3" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">Filtrer par date:</span>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2 items-center">
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">De:</label>
                    <input
                      type="date"
                      value={dateFilter.startDate}
                      onChange={handleDateFilterChange('startDate')}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">À:</label>
                    <input
                      type="date"
                      value={dateFilter.endDate}
                      onChange={handleDateFilterChange('endDate')}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  
                  {(dateFilter.startDate || dateFilter.endDate) && (
                    <button
                      onClick={clearDateFilter}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Effacer
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results count */}
        {filteredConsultations.length > 0 && (
          <div className="mb-4">
            <p className="text-gray-600">
              {filteredConsultations.length} consultation{filteredConsultations.length > 1 ? 's' : ''} trouvé{filteredConsultations.length > 1 ? 'es' : 'e'}
              {(dateFilter.startDate || dateFilter.endDate) && (
                <span className="text-green-600 ml-1">
                  (filtré par date)
                </span>
              )}
            </p>
          </div>
        )}

        {/* Consultations List */}
        <div className="space-y-4 mb-6">
          {currentPageData.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="h-16 w-16 mx-auto text-gray-300 mb-4 flex items-center justify-center">
                <svg className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 9h6m-6 0a2 2 0 01-2-2V9a2 2 0 012-2h6a2 2 0 012 2v7a2 2 0 01-2 2m-6 0H6a2 2 0 01-2-2V9a2 2 0 012-2h3" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune consultation trouvée</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || dateFilter.startDate || dateFilter.endDate 
                  ? "Aucune consultation ne correspond à vos critères de recherche." 
                  : "Ce patient n'a pas encore de consultations."}
              </p>
              {(searchTerm || dateFilter.startDate || dateFilter.endDate) && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    clearDateFilter();
                  }}
                  className="mr-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Effacer les filtres
                </button>
              )}
              <button
                onClick={() => openModal('create')}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Ajouter une consultation
              </button>
            </div>
          ) : (
            currentPageData.map((consultation) => (
              <div key={consultation._id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="bg-green-50 p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{formatDate(consultation.consultationDate)}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Terminée
                          </span>
                          {consultation.isPaid && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              <CheckBadgeIcon className="h-3 w-3 mr-1" />
                              Payée
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Motif de consultation</p>
                      <p className="text-sm text-gray-600">{consultation.motifConsultation}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Traitement</p>
                      <p className="text-sm text-gray-600">{consultation.traitement || 'Non spécifié'}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => openModal('view', consultation)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Voir les détails
                    </button>
                    <button
                      onClick={() => openModal('edit', consultation)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Modifier
                    </button>
                    <button
                      onClick={() => openModal('delete', consultation)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Précédent
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-2 text-sm rounded-lg ${
                  currentPage === i + 1
                    ? 'bg-green-600 text-white'
                    : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
            </button>
          </div>
        )}

        {/* Modal */}
        {modalType && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  {modalType === 'create' && 'Nouvelle Consultation'}
                  {modalType === 'edit' && 'Modifier la Consultation'}
                  {modalType === 'view' && 'Détails de la Consultation'}
                  {modalType === 'delete' && 'Confirmation de Suppression'}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {(modalType === 'create' || modalType === 'edit') && (
                  <form onSubmit={modalType === 'create' ? handleCreate : handleUpdate} className="space-y-4">
                                         <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">
                         Rendez-vous lié (Optionnel)
                       </label>
                       <select
                         value={formData.appointmentId}
                         onChange={handleInputChange('appointmentId')}
                         disabled={appointmentsLoading}
                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                       >
                         <option value="">
                           {appointmentsLoading ? 'Chargement des rendez-vous...' : 'Sélectionner un rendez-vous (optionnel)'}
                         </option>
                                                   {appointments.map((appointment) => {
                            const reason = appointment.reason || appointment.motif || '';
                            const displayText = reason ? `${formatAppointmentDate(appointment)} - ${reason}` : formatAppointmentDate(appointment);
                            return (
                              <option key={appointment._id} value={appointment._id}>
                                {displayText}
                              </option>
                            );
                          })}
                       </select>
                       {appointmentsLoading && (
                         <p className="text-sm text-gray-500 mt-1">Chargement des rendez-vous...</p>
                       )}
                       {!appointmentsLoading && appointments.length === 0 && (
                         <p className="text-sm text-gray-500 mt-1">Aucun rendez-vous trouvé</p>
                       )}
                     </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Motif de consultation *
                      </label>
                      <textarea
                        value={formData.motifConsultation}
                        onChange={handleInputChange('motifConsultation')}
                        required
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Historique médical
                      </label>
                      <textarea
                        value={formData.antecedents}
                        onChange={handleInputChange('antecedents')}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Anamnèse
                      </label>
                      <textarea
                        value={formData.anamnese}
                        onChange={handleInputChange('anamnese')}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Examen clinique
                      </label>
                      <textarea
                        value={formData.examenClinique}
                        onChange={handleInputChange('examenClinique')}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Plan médical
                      </label>
                      <textarea
                        value={formData.cat}
                        onChange={handleInputChange('cat')}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Traitement
                      </label>
                      <textarea
                        value={formData.traitement}
                        onChange={handleInputChange('traitement')}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div className="flex items-center">
                      <CheckBadgeIcon className="h-6 w-6 text-green-500 mr-2" />
                      <label className="text-sm font-medium text-gray-700">
                        Consultation Payée
                      </label>
                      <input
                        type="checkbox"
                        checked={formData.isPaid}
                        onChange={handleInputChange('isPaid')}
                        className="ml-2 h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    
                    <div className="flex justify-end gap-3 pt-4">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        {modalType === 'create' ? 'Créer' : 'Mettre à jour'}
                      </button>
                    </div>
                  </form>
                )}

                {modalType === 'view' && selectedConsultation && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Date et Heure</p>
                        <p className="text-sm text-gray-600">{formatDate(selectedConsultation.consultationDate)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Statut de paiement</p>
                        <p className="text-sm text-gray-600">
                          {selectedConsultation.isPaid ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              <CheckBadgeIcon className="h-3 w-3 mr-1" />
                              Payée
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              En attente
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Motif de consultation</p>
                      <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">{selectedConsultation.motifConsultation}</p>
                    </div>
                    
                    {selectedConsultation.antecedents && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Historique médical</p>
                        <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">{selectedConsultation.antecedents}</p>
                      </div>
                    )}
                    
                    {selectedConsultation.anamnese && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Anamnèse</p>
                        <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">{selectedConsultation.anamnese}</p>
                      </div>
                    )}
                    
                    {selectedConsultation.examenClinique && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Examen clinique</p>
                        <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">{selectedConsultation.examenClinique}</p>
                      </div>
                    )}
                    
                    {selectedConsultation.cat && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Plan médical</p>
                        <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">{selectedConsultation.cat}</p>
                      </div>
                    )}
                    
                    {selectedConsultation.traitement && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Traitement</p>
                        <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">{selectedConsultation.traitement}</p>
                      </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4">
                      <button
                        onClick={closeModal}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                      >
                        Fermer
                      </button>
                      <button
                        onClick={() => {
                          closeModal();
                          openModal('edit', selectedConsultation);
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Modifier
                      </button>
                    </div>
                  </div>
                )}

                {modalType === 'delete' && selectedConsultation && (
                  <div className="space-y-4">
                    <p className="text-gray-600">
                      Êtes-vous sûr de vouloir supprimer cette consultation ? Cette action ne peut pas être annulée.
                    </p>
                    
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <p className="text-red-800 text-sm">
                        <strong>Date de consultation:</strong> {formatDate(selectedConsultation.consultationDate)}
                      </p>
                      <p className="text-red-800 text-sm">
                        <strong>Motif:</strong> {selectedConsultation.motifConsultation}
                      </p>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                      <button
                        onClick={closeModal}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={handleDelete}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsultationHistory;