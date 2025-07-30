import React, { useState, useEffect,Suspense  } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  getAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} from "@/data/appointmentsData";
import { getPatientTable, getParents } from "@/data/patientTable";
import { createPatient, createParent } from "@/data/createPatient";
// Import pricing hook
import {
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Select,
  Option,
  Textarea,
  Tabs,
  TabsHeader,
  Tab,
  Typography,
  Chip,
  Card,
  CardBody,
} from "@material-tailwind/react";
import { 
  Calendar as CalendarIcon, 
  List,
  UserPlus,
  Clock,
  User,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  AlertTriangle
} from 'lucide-react';
import dayjs from 'dayjs';
const AppointmentCalendar = React.lazy(() => import('./dashboard/component/AppointmentCalendar'));
const AppointmentList = React.lazy(() => import("./dashboard/component/appointmentList"));
  
import { useAppointmentPricing } from './dashboard/sitting/AppointmentPricing';


import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';


const CustomStepper = ({ activeStep, setActiveStep }) => {
  const steps = [
        { id: 0, label: 'Parent', icon: <User className="h-5 w-5" /> },
        { id: 1, label: 'Patient', icon: <User className="h-5 w-5" /> },
        { id: 2, label: 'Rendez-vous', icon: <Clock className="h-5 w-5" /> }
      ];

  return (
    <div className="w-full px-24 py-4">
      <div className="flex items-center justify-between relative">
        {steps.map((step, index) => (
          <div key={step.id} className="flex flex-col items-center z-10">
            <button
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors
                ${activeStep >= step.id ? 'bg-blue-500 text-white' : 'bg-blue-gray-100 text-blue-gray-500'}
                ${activeStep > step.id ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
              onClick={() => activeStep > step.id && setActiveStep(step.id)}
            >
              {step.icon}
            </button>
            <Typography
              variant="small"
              color={activeStep >= step.id ? "blue" : "blue-gray"}
              className="mt-2 text-center"
            >
              {step.label}
            </Typography>
            {index < steps.length - 1 && (
              <div className={`absolute h-1 w-1/4 top-5 transform -translate-y-1/2 
                ${activeStep > step.id ? 'bg-blue-500' : 'bg-blue-gray-100'}
                ${index === 0 ? 'left-1/4' : index === 1 ? 'left-1/2' : 'left-3/4'}`} 
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const AppointmentsPage = () => {
  const { calculatePrice, getDuration } = useAppointmentPricing(); // Add pricing hook
  
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [activeTab, setActiveTab] = useState('calendar');
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [flowType, setFlowType] = useState(null);
  const [parentSelection, setParentSelection] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedParent, setSelectedParent] = useState(null);
  const [newParentForm, setNewParentForm] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    address: ''
  });
  const [newPatientForm, setNewPatientForm] = useState({
    firstName: '',
    lastName: '',
    birthDate: '',
    gender: ''
  });
  const [appointmentForm, setAppointmentForm] = useState({
    date: '',
    time: '',
    type: 'consultation',
    status: 'confirmed',
    notes: ''
  });
  const [parentErrors, setParentErrors] = useState({});
  const [patientErrors, setPatientErrors] = useState({});
  const [appointmentErrors, setAppointmentErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeConflicts, setTimeConflicts] = useState([]); // Add conflict tracking
  const [parentSearchTerm, setParentSearchTerm] = useState('');
  const [parentCurrentPage, setParentCurrentPage] = useState(1);
  const [parentCardsPerPage] = useState(6);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [appts, pts, prnts] = await Promise.all([
          getAppointments(),
          getPatientTable(),
          getParents()
        ]);
        setAppointments(appts);
        setPatients(pts);
        setParents(prnts);
      } catch {
        toast.error('Échec du chargement des données');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Enhanced time conflict validation
  const checkTimeConflicts = (date, time, type, excludeAppointmentId = null) => {
    const appointmentDuration = getDuration(type) || 30; // Get duration from localStorage
    const requestedStart = dayjs(`${date} ${time}`);
    const requestedEnd = requestedStart.add(appointmentDuration, 'minute');

    const conflicts = appointments.filter(appointment => {
      if (excludeAppointmentId && appointment._id === excludeAppointmentId) {
        return false; // Don't check conflict with itself when editing
      }

      const appointmentDate = dayjs(appointment.date).format('YYYY-MM-DD');
      if (appointmentDate !== date) {
        return false; // Different date, no conflict
      }

      const existingDuration = getDuration(appointment.type) || appointment.duration || 30;
      const existingStart = dayjs(`${appointmentDate} ${appointment.time}`);
      const existingEnd = existingStart.add(existingDuration, 'minute');

      // Check for overlap
      return (
        (requestedStart.isBefore(existingEnd) && requestedEnd.isAfter(existingStart)) ||
        (existingStart.isBefore(requestedEnd) && existingEnd.isAfter(requestedStart))
      );
    });

    return conflicts;
  };

  const validateParentForm = () => {
    const errors = {};
    if (!newParentForm.fullName.trim()) {
      errors.fullName = 'Le nom complet est requis';
    } else if (newParentForm.fullName.trim().length < 2) {
      errors.fullName = 'Le nom complet doit contenir au moins 2 caractères';
    }
    if (!newParentForm.phoneNumber.trim()) {
      errors.phoneNumber = 'Le numéro de téléphone est requis';
    } else if (!/^[\+]?[\d\s\-\(\)]{8,}$/.test(newParentForm.phoneNumber.trim())) {
      errors.phoneNumber = 'Veuillez saisir un numéro de téléphone valide';
    }
    if (newParentForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newParentForm.email)) {
      errors.email = 'Veuillez saisir une adresse e-mail valide';
    }
    setParentErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePatientForm = () => {
    const errors = {};
    if (!newPatientForm.firstName.trim()) {
      errors.firstName = 'Le prénom est requis';
    } else if (newPatientForm.firstName.trim().length < 2) {
      errors.firstName = 'Le prénom doit contenir au moins 2 caractères';
    }
    if (!newPatientForm.lastName.trim()) {
      errors.lastName = 'Le nom de famille est requis';
    } else if (newPatientForm.lastName.trim().length < 2) {
      errors.lastName = 'Le nom de famille doit contenir au moins 2 caractères';
    }
    if (!newPatientForm.birthDate) {
      errors.birthDate = 'La date de naissance est requise';
    } else {
      const birthDate = new Date(newPatientForm.birthDate);
      const today = new Date();
      if (birthDate > today) {
        errors.birthDate = 'La date de naissance ne peut pas être dans le futur';
      }
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age > 150) {
        errors.birthDate = 'Veuillez saisir une date de naissance valide';
      }
    }
    if (!newPatientForm.gender) {
      errors.gender = 'Le sexe est requis';
    }
    setPatientErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateAppointmentForm = () => {
    const errors = {};
    if (!appointmentForm.date) {
      errors.date = 'La date est requise';
    } else {
      const appointmentDate = new Date(appointmentForm.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (appointmentDate < today) {
        errors.date = 'La date du rendez-vous ne peut pas être dans le passé';
      }
    }
    if (!appointmentForm.time) {
      errors.time = 'L\'heure est requise';
    } else if (appointmentForm.date) {
      const appointmentDateTime = new Date(`${appointmentForm.date}T${appointmentForm.time}`);
      const now = new Date();
      if (appointmentDateTime < now) {
        errors.time = 'L\'heure du rendez-vous ne peut pas être dans le passé';
      }

      // Check for time conflicts
      const conflicts = checkTimeConflicts(
        appointmentForm.date, 
        appointmentForm.time, 
        appointmentForm.type,
        selectedAppointment?._id
      );
      
      if (conflicts.length > 0) {
        errors.time = `Conflit d'horaire avec un rendez-vous existant à ${conflicts[0].time}`;
        setTimeConflicts(conflicts);
      } else {
        setTimeConflicts([]);
      }
    }
    if (!appointmentForm.type) {
      errors.type = 'Le type de rendez-vous est requis';
    }
    setAppointmentErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateParent = async () => {
    if (!validateParentForm()) {
      toast.error('Veuillez corriger les erreurs de validation');
      return;
    }
    try {
      setIsSubmitting(true);
      const parent = await createParent(newParentForm);
      setParents(prev => [...prev, parent]);
      setSelectedParent(parent._id);
      toast.success('Parent créé avec succès');
      setActiveStep(1);
      setParentErrors({});
    } catch (error) {
      toast.error('Échec de la création du parent');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreatePatient = async () => {
    if (!validatePatientForm()) {
      toast.error('Veuillez corriger les erreurs de validation');
      return;
    }
    try {
      setIsSubmitting(true);
      const patientData = {
        ...newPatientForm,
        parentId: selectedParent
      };
      const patient = await createPatient(patientData);
      setPatients(prev => [...prev, patient]);
      setSelectedPatient(patient._id);
      toast.success('Patient créé avec succès');
      setActiveStep(2);
      setPatientErrors({});
    } catch (error) {
      toast.error('Échec de la création du patient');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitAppointment = async () => {
    if (!validateAppointmentForm()) {
      toast.error('Veuillez corriger les erreurs de validation');
      return;
    }
    if (!selectedPatient) {
      toast.error('Veuillez sélectionner un patient');
      return;
    }

    // Final conflict check
    const conflicts = checkTimeConflicts(
      appointmentForm.date, 
      appointmentForm.time, 
      appointmentForm.type,
      selectedAppointment?._id
    );

    if (conflicts.length > 0) {
      toast.error(`Conflit d'horaire détecté ! Un autre rendez-vous existe à ${conflicts[0].time}`);
      return;
    }

    try {
      setIsSubmitting(true);
      const appointmentData = {
        ...appointmentForm,
        patientId: selectedPatient
      };
      
      if (selectedAppointment) {
        const updated = await updateAppointment(selectedAppointment._id, appointmentData);
        setAppointments(prev => prev.map(a => a._id === updated._id ? updated : a));
        toast.success('Rendez-vous mis à jour avec succès');
      } else {
        const created = await createAppointment(appointmentData);
        setAppointments(prev => [...prev, created]);
        toast.success('Rendez-vous créé avec succès');
      }
      closeAllModals();
    } catch (error) {
      toast.error(`Échec de ${selectedAppointment ? 'la mise à jour' : 'la création'} du rendez-vous`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCalendarTimeSelect = (date, time) => {
    setAppointmentForm({
      ...appointmentForm,
      date: date.format('YYYY-MM-DD'),
      time
    });
    setIsPatientModalOpen(true);
    setActiveStep(0);
    setFlowType(null);
    setSelectedAppointment(null);
  };

  const handleEditAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setAppointmentForm({
      date: appointment.date,
      time: appointment.time,
      type: appointment.type,
      status: appointment.status,
      notes: appointment.notes || ''
    });
    const patient = patients.find(p => p._id === appointment.patientId);
    if (patient) {
      setSelectedPatient(patient._id);
    }
    setIsPatientModalOpen(true);
    setFlowType('existing');
    setActiveStep(2);
  };

  const handleDeleteAppointment = (appointmentId) => {
    const appointmentToDelete = appointments.find(a => a._id === appointmentId);
    setSelectedAppointment(appointmentToDelete);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteAppointment(selectedAppointment._id);
      setAppointments(prev => prev.filter(a => a._id !== selectedAppointment._id));
      toast.success('Rendez-vous supprimé');
      setIsDeleteModalOpen(false);
    } catch {
      toast.error('Échec de la suppression du rendez-vous');
    }
  };

  const closeAllModals = () => {
    setIsPatientModalOpen(false);
    setIsDeleteModalOpen(false);
    setActiveStep(0);
    setParentSelection(null);
    setSelectedPatient(null);
    setSelectedParent(null);
    setSelectedAppointment(null);
    setIsSubmitting(false);
    setTimeConflicts([]);
    setParentSearchTerm('');
    setParentCurrentPage(1);
    setNewParentForm({
      fullName: '',
      phoneNumber: '',
      email: '',
      address: ''
    });
    setNewPatientForm({
      firstName: '',
      lastName: '',
      birthDate: '',
      gender: ''
    });
    setAppointmentForm({
      date: '',
      time: '',
      type: 'consultation',
      status: 'confirmed',
      notes: ''
    });
    setParentErrors({});
    setPatientErrors({});
    setAppointmentErrors({});
  };

  const canProceedToNext = () => {
    if (activeStep === 0) {
      if (parentSelection === 'existing') return selectedParent;
      if (parentSelection === 'new') {
        return newParentForm.fullName && newParentForm.phoneNumber && Object.keys(parentErrors).length === 0;
      }
    }
    if (activeStep === 1) {
      return newPatientForm.firstName && newPatientForm.lastName && 
             newPatientForm.birthDate && newPatientForm.gender && 
             Object.keys(patientErrors).length === 0;
    }
    if (activeStep === 2) {
      return appointmentForm.date && appointmentForm.time && Object.keys(appointmentErrors).length === 0;
    }
    return false;
  };

  const handleParentFormChange = (field, value) => {
    setNewParentForm(prev => ({...prev, [field]: value}));
    if (parentErrors[field]) {
      setParentErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handlePatientFormChange = (field, value) => {
    setNewPatientForm(prev => ({...prev, [field]: value}));
    if (patientErrors[field]) {
      setPatientErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleAppointmentFormChange = (field, value) => {
    setAppointmentForm(prev => ({...prev, [field]: value}));
    if (appointmentErrors[field]) {
      setAppointmentErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[field];
        return newErrors;
      });
    }
    
    // Re-validate when time or type changes to check for conflicts
    if (field === 'time' || field === 'type') {
      setTimeout(() => validateAppointmentForm(), 100);
    }
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (parentSelection === 'existing' && selectedParent) {
        setActiveStep(1);
      } else if (parentSelection === 'new' && validateParentForm()) {
        handleCreateParent();
      }
    } else if (activeStep === 1 && validatePatientForm()) {
      handleCreatePatient();
    }
  };

  const handleFieldBlur = (formType, field) => {
    if (formType === 'parent') validateParentForm();
    if (formType === 'patient') validatePatientForm();
    if (formType === 'appointment') validateAppointmentForm();
  };

  // Get current appointment pricing info
  const getCurrentAppointmentPrice = () => {
    if (!appointmentForm.type) return null;
    const price = calculatePrice(appointmentForm.type);
    const duration = getDuration(appointmentForm.type);
    return { price, duration };
  };

  // Parent filtering and pagination functions
  const filteredParents = parents.filter(parent => 
    parent.fullName.toLowerCase().includes(parentSearchTerm.toLowerCase()) ||
    parent.phoneNumber.includes(parentSearchTerm) ||
    (parent.email && parent.email.toLowerCase().includes(parentSearchTerm.toLowerCase()))
  );

  const indexOfLastParent = parentCurrentPage * parentCardsPerPage;
  const indexOfFirstParent = indexOfLastParent - parentCardsPerPage;
  const currentParents = filteredParents.slice(indexOfFirstParent, indexOfLastParent);
  const totalParentPages = Math.ceil(filteredParents.length / parentCardsPerPage);

  const handleParentSearch = (value) => {
    setParentSearchTerm(value);
    setParentCurrentPage(1); // Reset to first page when searching
  };

  const handleParentPageChange = (pageNumber) => {
    setParentCurrentPage(pageNumber);
  };

  const renderPricingInfo = () => {
    const pricingInfo = getCurrentAppointmentPrice();
    if (!pricingInfo) return null;

    return (
      <Card className="mt-4 bg-blue-50 border border-blue-200">
      <CardBody className="p-4">
        <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Typography variant="h6" color="blue-gray">
          Informations Tarifaires
          </Typography>
        </div>
        <Chip
          value={
          <span>
            {pricingInfo.price} <span className="text-xs">MAD</span>
          </span>
          }
          color="blue"
          size="lg"
        />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-4">
        <div>
          <Typography variant="small" color="blue-gray" className="font-medium">
          Durée :
          </Typography>
          <Typography variant="small" color="gray">
          {pricingInfo.duration} minutes
          </Typography>
        </div>
        <div>
          <Typography variant="small" color="blue-gray" className="font-medium">
          Type :
          </Typography>
          <Typography variant="small" color="gray">
          {appointmentForm.type === 'consultation' ? 'Consultation' :
           appointmentForm.type === 'vaccination' ? 'Vaccination' :
           appointmentForm.type === 'follow-up' ? 'Suivi' : appointmentForm.type}
          </Typography>
        </div>
        </div>
      </CardBody>
      </Card>
    );
  };

  const renderConflictWarning = () => {
    if (timeConflicts.length === 0) return null;

    return (
      <Card className="mt-4 bg-red-50 border border-red-200">
        <CardBody className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <Typography variant="h6" color="red">
              Conflit d'Horaire Détecté
            </Typography>
          </div>
          <Typography variant="small" color="red" className="mb-3">
            L'horaire sélectionné entre en conflit avec des rendez-vous existants :
          </Typography>
          {timeConflicts.map((conflict, index) => {
            const patient = patients.find(p => p._id === conflict.patientId);
            const conflictDuration = getDuration(conflict.type) || 30;
            return (
              <div key={index} className="bg-white p-3 rounded border border-red-200 mb-2">
                <Typography variant="small" className="font-medium">
                  {patient ? `${patient.firstName} ${patient.lastName}` : 'Patient Inconnu'}
                </Typography>
                <Typography variant="small" color="gray">
                  {conflict.time} - {conflict.type === 'consultation' ? 'Consultation' :
                                    conflict.type === 'vaccination' ? 'Vaccination' :
                                    conflict.type === 'follow-up' ? 'Suivi' : conflict.type} ({conflictDuration} min)
                </Typography>
              </div>
            );
          })}
        </CardBody>
      </Card>
    );
  };

  const renderFormStep = () => {
    // Handle existing patient flow (editing appointment)
    if (flowType === 'existing' && activeStep === 2) {
      return (
        <div className="space-y-6">
          <Typography variant="h5" className="text-gray-800 font-semibold mb-6">
            Modifier le Rendez-vous
          </Typography>
          
          {/* Date and Time Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Input 
                type="date" 
                label="Date du Rendez-vous"
                value={appointmentForm.date}
                onChange={(e) => handleAppointmentFormChange('date', e.target.value)}
                onBlur={() => handleFieldBlur('appointment', 'date')}
                error={!!appointmentErrors.date}
                min={new Date().toISOString().split('T')[0]}
                className="w-full"
                required
              />
              {appointmentErrors.date && (
                <Typography variant="small" color="red" className="text-red-600">
                  {appointmentErrors.date}
                </Typography>
              )}
            </div>
            
            <div className="space-y-2">
              <Input 
                type="time"
                label="Heure du Rendez-vous"
                value={appointmentForm.time}
                onChange={(e) => handleAppointmentFormChange('time', e.target.value)}
                onBlur={() => handleFieldBlur('appointment', 'time')}
                error={!!appointmentErrors.time}
                className="w-full"
                required
              />
              {appointmentErrors.time && (
                <Typography variant="small" color="red" className="text-red-600">
                  {appointmentErrors.time}
                </Typography>
              )}
            </div>
          </div>

          {/* Appointment Type */}
          <div className="space-y-2">
            <Select
              label="Type de Rendez-vous"
              value={appointmentForm.type}
              onChange={(value) => handleAppointmentFormChange('type', value)}
              error={!!appointmentErrors.type}
              className="w-full"
              menuProps={{
                className: "max-h-60 overflow-y-auto z-50",
                style: { zIndex: 9999 }
              }}
              containerProps={{
                className: "relative"
              }}
              required
            >
              <Option value="consultation" className="hover:bg-gray-50 p-2">
                <div className="flex items-center space-x-2">
                  <span>🩺</span>
                  <span>Consultation</span>
                </div>
              </Option>
              <Option value="vaccination" className="hover:bg-gray-50 p-2">
                <div className="flex items-center space-x-2">
                  <span>💉</span>
                  <span>Vaccination</span>
                </div>
              </Option>
              <Option value="follow-up" className="hover:bg-gray-50 p-2">
                <div className="flex items-center space-x-2">
                  <span>📋</span>
                  <span>Contrôle</span>
                </div>
              </Option>
            </Select>
            {appointmentErrors.type && (
              <Typography variant="small" color="red" className="text-red-600">
                {appointmentErrors.type}
              </Typography>
            )}
          </div>

          {/* Appointment Status */}
          <div className="space-y-2">
            <Select
              label="Statut du Rendez-vous"
              value={appointmentForm.status}
              onChange={(value) => handleAppointmentFormChange('status', value)}
              className="w-full"
              menuProps={{
                className: "max-h-60 overflow-y-auto z-50",
                style: { zIndex: 9999 }
              }}
              containerProps={{
                className: "relative"
              }}
            >
              <Option value="confirmed" className="hover:bg-gray-50 p-2">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>Confirmé</span>
                </div>
              </Option>
              <Option value="pending" className="hover:bg-gray-50 p-2">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                  <span>En Attente</span>
                </div>
              </Option>
              <Option value="cancelled" className="hover:bg-gray-50 p-2">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  <span>Annulé</span>
                </div>
              </Option>
              <Option value="completed" className="hover:bg-gray-50 p-2">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span>Terminé</span>
                </div>
              </Option>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Textarea
              label="Notes Additionnelles"
              placeholder="Saisir des notes ou instructions spéciales..."
              value={appointmentForm.notes}
              onChange={(e) => handleAppointmentFormChange('notes', e.target.value)}
              className="w-full min-h-[100px]"
              rows={4}
            />
          </div>
          
          {/* Pricing Information */}
          <div className="border-t pt-4">
            {renderPricingInfo()}
          </div>
          
          {/* Conflict Warning */}
          {renderConflictWarning && (
            <div className="border-t pt-4">
              {renderConflictWarning()}
            </div>
          )}
        </div>
      );
    }

    // Handle new patient flow
    if (activeStep === 0) {
      if (parentSelection === null) {
        return (
          <div className="space-y-4">
            <Typography variant="h5" className="mb-4">Sélection du Parent</Typography>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                onClick={() => setParentSelection('existing')}
                className="flex flex-col items-center h-24 justify-center"
                variant="outlined"
              >
                <User className="h-6 w-6 mb-2" />
                <Typography variant="h6">Parent Existant</Typography>
              </Button>
              <Button 
                onClick={() => setParentSelection('new')}
                className="flex flex-col items-center h-24 justify-center"
                variant="outlined"
              >
                <UserPlus className="h-6 w-6 mb-2" />
                <Typography variant="h6">Nouveau Parent</Typography>
              </Button>
            </div>
          </div>
        );
      }
      if (parentSelection === 'existing') {
        return (
          <div className="space-y-6">
            <Typography variant="h5" className="mb-4">Sélectionner un Parent</Typography>
            
            {/* Search Bar */}
            <div className="relative">
              <Input
                label="Rechercher un parent..."
                value={parentSearchTerm}
                onChange={(e) => handleParentSearch(e.target.value)}
                className="w-full"
                icon={<User className="h-5 w-5" />}
                placeholder="Nom, téléphone ou email..."
              />
            </div>

            {/* Parent Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentParents.map(parent => (
                <Card 
                  key={parent._id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    selectedParent === parent._id 
                      ? 'ring-2 ring-blue-500 bg-blue-50' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedParent(parent._id)}
                >
                  <CardBody className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <Typography variant="h6" className="font-semibold text-gray-800">
                            {parent.fullName}
                          </Typography>
                          <Typography variant="small" className="text-gray-600">
                            {parent.phoneNumber}
                          </Typography>
                        </div>
                      </div>
                      {selectedParent === parent._id && (
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    {parent.email && (
                      <Typography variant="small" className="text-gray-600 mb-2">
                        📧 {parent.email}
                      </Typography>
                    )}
                    
                    {parent.address && (
                      <Typography variant="small" className="text-gray-600">
                        📍 {parent.address}
                      </Typography>
                    )}
                  </CardBody>
                </Card>
              ))}
            </div>

            {/* No Results Message */}
            {currentParents.length === 0 && (
              <div className="text-center py-8">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <Typography variant="h6" className="text-gray-600 mb-2">
                  Aucun parent trouvé
                </Typography>
                <Typography variant="small" className="text-gray-500">
                  {parentSearchTerm ? 'Essayez de modifier vos critères de recherche' : 'Aucun parent disponible'}
                </Typography>
              </div>
            )}

            {/* Pagination */}
            {totalParentPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <Button
                  variant="text"
                  size="sm"
                  onClick={() => handleParentPageChange(parentCurrentPage - 1)}
                  disabled={parentCurrentPage === 1}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Précédent
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalParentPages }, (_, index) => index + 1).map(pageNumber => (
                    <Button
                      key={pageNumber}
                      variant={parentCurrentPage === pageNumber ? "filled" : "text"}
                      size="sm"
                      onClick={() => handleParentPageChange(pageNumber)}
                      className="w-8 h-8 p-0"
                    >
                      {pageNumber}
                    </Button>
                  ))}
                </div>
                
                <Button
                  variant="text"
                  size="sm"
                  onClick={() => handleParentPageChange(parentCurrentPage + 1)}
                  disabled={parentCurrentPage === totalParentPages}
                  className="flex items-center gap-1"
                >
                  Suivant
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Selection Status */}
            {!selectedParent && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <Typography variant="small" className="text-yellow-800 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Veuillez sélectionner un parent pour continuer
                </Typography>
              </div>
            )}

            {/* Selected Parent Info */}
            {selectedParent && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <Typography variant="small" className="text-green-800 font-medium mb-2">
                  Parent sélectionné :
                </Typography>
                <Typography variant="small" className="text-green-700">
                  {parents.find(p => p._id === selectedParent)?.fullName} - {parents.find(p => p._id === selectedParent)?.phoneNumber}
                </Typography>
              </div>
            )}
          </div>
        );
      }
      if (parentSelection === 'new') {
        return (
          <div className="space-y-4">
            <Typography variant="h5" className="mb-4">Créer un Nouveau Parent</Typography>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  label="Nom Complet *"
                  value={newParentForm.fullName}
                  onChange={(e) => handleParentFormChange('fullName', e.target.value)}
                  onBlur={() => handleFieldBlur('parent', 'fullName')}
                  error={!!parentErrors.fullName}
                />
                {parentErrors.fullName && (
                  <Typography variant="small" color="red" className="mt-1">
                    {parentErrors.fullName}
                  </Typography>
                )}
              </div>
              <div>
                <div className="relative">
                  <PhoneInput
                    label="Numéro de Téléphone *"
                    international
                    defaultCountry="MA"
                    value={newParentForm.phoneNumber}
                    onChange={(value) => handleParentFormChange('phoneNumber', value)}
                    onBlur={() => handleFieldBlur('parent', 'phoneNumber')}
                    className="w-full"
                    style={{
                      '--PhoneInputCountryFlag-height': '1.2em',
                      '--PhoneInputCountryFlag-width': '1.5em',
                      '--PhoneInputCountrySelectArrow-color': '#64748b',
                      '--PhoneInput-color--focus': '#3b82f6',
                      '--PhoneInputCountrySelectArrow-opacity': '1',
                    }}
                    inputStyle={{
                      width: '100%',
                      padding: '0.625rem',
                      borderRadius: '0.5rem',
                      borderWidth: '1px',
                      borderColor: parentErrors.phoneNumber ? '#ef4444' : '#e2e8f0',
                      outline: 'none',
                      transition: 'all 0.2s',
                      fontSize: '0.875rem',
                      lineHeight: '1.25rem',
                    }}
                    countrySelectStyle={{
                      padding: '0.5rem',
                      marginRight: '0.5rem',
                      borderRadius: '0.375rem',
                    }}
                    countrySelectProps={{
                      style: {
                        border: 'none',
                        backgroundColor: 'transparent',
                      }
                    }}
                  />
                  {parentErrors.phoneNumber && (
                    <Typography variant="small" color="red" className="mt-1">
                      {parentErrors.phoneNumber}
                    </Typography>
                  )}
                  <Typography variant="small" color="gray" className="mt-1 text-xs">
                    Format: +212612345678 (Maroc par défaut)
                  </Typography>
                </div>
              </div>
            </div>
            <div>
              <Input
                label="E-mail"
                type="email"
                value={newParentForm.email}
                onChange={(e) => handleParentFormChange('email', e.target.value)}
                onBlur={() => handleFieldBlur('parent', 'email')}
                error={!!parentErrors.email}
              />
              {parentErrors.email && (
                <Typography variant="small" color="red" className="mt-1">
                  {parentErrors.email}
                </Typography>
              )}
            </div>
            <Input
              label="Adresse"
              value={newParentForm.address}
              onChange={(e) => handleParentFormChange('address', e.target.value)}
            />
          </div>
        );
      }
    }
    
    if (activeStep === 1) {
      return (
        <div className="space-y-4">
          <Typography variant="h5" className="mb-4">Créer un Nouveau Patient</Typography>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input
                label="Prénom *"
                value={newPatientForm.firstName}
                onChange={(e) => handlePatientFormChange('firstName', e.target.value)}
                onBlur={() => handleFieldBlur('patient', 'firstName')}
                error={!!patientErrors.firstName}
              />
              {patientErrors.firstName && (
                <Typography variant="small" color="red" className="mt-1">
                  {patientErrors.firstName}
                </Typography>
              )}
            </div>
            <div>
              <Input
                label="Nom de Famille *"
                value={newPatientForm.lastName}
                onChange={(e) => handlePatientFormChange('lastName', e.target.value)}
                onBlur={() => handleFieldBlur('patient', 'lastName')}
                error={!!patientErrors.lastName}
              />
              {patientErrors.lastName && (
                <Typography variant="small" color="red" className="mt-1">
                  {patientErrors.lastName}
                </Typography>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input
                type="date"
                label="Date de Naissance *"
                value={newPatientForm.birthDate}
                onChange={(e) => handlePatientFormChange('birthDate', e.target.value)}
                onBlur={() => handleFieldBlur('patient', 'birthDate')}
                error={!!patientErrors.birthDate}
              />
              {patientErrors.birthDate && (
                <Typography variant="small" color="red" className="mt-1">
                  {patientErrors.birthDate}
                </Typography>
              )}
            </div>
            <div>
              <Select
                label="Sexe *"
                value={newPatientForm.gender}
                onChange={(value) => handlePatientFormChange('gender', value)}
                error={!!patientErrors.gender}
              >
                <Option value="male">Masculin</Option>
                <Option value="female">Féminin</Option>
              </Select>
              {patientErrors.gender && (
                <Typography variant="small" color="red" className="mt-1">
                  {patientErrors.gender}
                </Typography>
              )}
            </div>
          </div>
        </div>
      );
    }
    
    if (activeStep === 2) {
      return (
        <div className="space-y-6">
          <Typography variant="h5" className="text-gray-800 font-semibold mb-6">
            Planifier un Rendez-vous
          </Typography>
          
          {/* Date and Time Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Input 
                type="date" 
                label="Date du Rendez-vous"
                value={appointmentForm.date}
                onChange={(e) => handleAppointmentFormChange('date', e.target.value)}
                onBlur={() => handleFieldBlur('appointment', 'date')}
                error={!!appointmentErrors.date}
                min={new Date().toISOString().split('T')[0]}
                className="w-full"
                required
              />
              {appointmentErrors.date && (
                <Typography variant="small" color="red" className="text-red-600">
                  {appointmentErrors.date}
                </Typography>
              )}
            </div>
            
            <div className="space-y-2">
              <Input 
                type="time"
                label="Heure du Rendez-vous"
                value={appointmentForm.time}
                onChange={(e) => handleAppointmentFormChange('time', e.target.value)}
                onBlur={() => handleFieldBlur('appointment', 'time')}
                error={!!appointmentErrors.time}
                className="w-full"
                required
              />
              {appointmentErrors.time && (
                <Typography variant="small" color="red" className="text-red-600">
                  {appointmentErrors.time}
                </Typography>
              )}
            </div>
          </div>

          {/* Appointment Type */}
          <div className="space-y-2">
            <Select
              label="Type de Rendez-vous"
              value={appointmentForm.type}
              onChange={(value) => handleAppointmentFormChange('type', value)}
              error={!!appointmentErrors.type}
              className="w-full"
              menuProps={{
                className: "max-h-60 overflow-y-auto z-50",
                style: { zIndex: 9999 }
              }}
              containerProps={{
                className: "relative"
              }}
              required
            >
              <Option value="consultation" className="hover:bg-gray-50 p-2">
                <div className="flex items-center space-x-2">
                  <span>🩺</span>
                  <span>Consultation</span>
                </div>
              </Option>
              <Option value="vaccination" className="hover:bg-gray-50 p-2">
                <div className="flex items-center space-x-2">
                  <span>💉</span>
                  <span>Vaccination</span>
                </div>
              </Option>
              <Option value="follow-up" className="hover:bg-gray-50 p-2">
                <div className="flex items-center space-x-2">
                  <span>📋</span>
                  <span>contrôle</span>
                </div>
              </Option>
            </Select>
            {appointmentErrors.type && (
              <Typography variant="small" color="red" className="text-red-600">
                {appointmentErrors.type}
              </Typography>
            )}
          </div>

          {/* Appointment Status */}
          <div className="space-y-2">
            <Select
              label="Statut du Rendez-vous"
              value={appointmentForm.status}
              onChange={(value) => handleAppointmentFormChange('status', value)}
              className="w-full"
              menuProps={{
                className: "max-h-60 overflow-y-auto z-50",
                style: { zIndex: 9999 }
              }}
              containerProps={{
                className: "relative"
              }}
            >
              <Option value="confirmed" className="hover:bg-gray-50 p-2">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>Confirmé</span>
                </div>
              </Option>
              <Option value="pending" className="hover:bg-gray-50 p-2">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                  <span>En Attente</span>
                </div>
              </Option>
              <Option value="cancelled" className="hover:bg-gray-50 p-2">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  <span>Annulé</span>
                </div>
              </Option>
              <Option value="completed" className="hover:bg-gray-50 p-2">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span>Terminé</span>
                </div>
              </Option>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Textarea
              label="Notes Additionnelles"
              placeholder="Saisir des notes ou instructions spéciales..."
              value={appointmentForm.notes}
              onChange={(e) => handleAppointmentFormChange('notes', e.target.value)}
              className="w-full min-h-[100px]"
              rows={4}
            />
          </div>
          
          {/* Pricing Information */}
          <div className="border-t pt-4">
            {renderPricingInfo()}
          </div>
          
          {/* Conflict Warning */}
          {renderConflictWarning && (
            <div className="border-t pt-4">
              {renderConflictWarning()}
            </div>
          )}
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Typography variant="h5">Chargement des rendez-vous...</Typography>
      </div>
    );
  }

  return (
    <div className="mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <Typography variant="h3">Rendez-vous</Typography>
        <Button
          className="flex items-center gap-2"
          onClick={() => {
            setIsPatientModalOpen(true);
            setActiveStep(0);
            setParentSelection(null);
            setSelectedAppointment(null);
          }}
        >
          <UserPlus size={18} /> Nouveau Rendez-vous
        </Button>
      </div>
      
      <Tabs value={activeTab} className="mb-6">
        <TabsHeader>
          <Tab value="calendar" onClick={() => setActiveTab('calendar')}>
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" /> Calendrier
            </div>
          </Tab>
          <Tab value="list" onClick={() => setActiveTab('list')}>
            <div className="flex items-center gap-2">
              <List className="h-5 w-5" /> Vue Liste
            </div>
          </Tab>
        </TabsHeader>
      </Tabs>

      {activeTab === 'calendar' && (
  <Suspense fallback={<div className="flex justify-center items-center h-64">Chargement du calendrier...</div>}>
    <AppointmentCalendar
      appointments={appointments}
      patients={patients}
      currentDate={currentDate}
      onDateChange={setCurrentDate}
      onTimeSelect={handleCalendarTimeSelect}
      onEditAppointment={handleEditAppointment}
    />
  </Suspense>
)}

{activeTab === 'list' && (
  <Suspense fallback={<div className="flex justify-center items-center h-64">Chargement de la liste...</div>}>
    <AppointmentList
      appointments={appointments}
      patients={patients}
      onEditAppointment={handleEditAppointment}
      onDeleteAppointment={handleDeleteAppointment}
    />
  </Suspense>
)}
      
      {/* {activeTab === 'calendar' && (
        <AppointmentCalendar
          appointments={appointments}
          patients={patients}
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          onTimeSelect={handleCalendarTimeSelect}
          onEditAppointment={handleEditAppointment}
        />
      )}
      
      {activeTab === 'list' && (
        <AppointmentList
          appointments={appointments}
          patients={patients}
          onEditAppointment={handleEditAppointment}
          onDeleteAppointment={handleDeleteAppointment}
        />
      )} */}
      
      <Dialog open={isPatientModalOpen} handler={closeAllModals} size="xl">
        <DialogHeader>
            <CustomStepper 
              activeStep={activeStep} 
              setActiveStep={setActiveStep}
            />
        </DialogHeader>
        <DialogBody className="max-h-[70vh] overflow-y-auto">
          {renderFormStep()}
        </DialogBody>
        <DialogFooter>
          <div className="flex justify-between w-full">
            <div>
              {activeStep > 0 && (
                <Button
                  variant="text"
                  onClick={() => setActiveStep(activeStep - 1)}
                  className="mr-1"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Retour
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="text"
                color="red"
                onClick={closeAllModals}
                className="mr-1"
              >
                Annuler
              </Button>
              {activeStep === 2 && (
                <Button 
                  color="blue" 
                  onClick={handleSubmitAppointment}
                  disabled={!canProceedToNext() || isSubmitting || timeConflicts.length > 0}
                  loading={isSubmitting}
                >
                  {selectedAppointment ? 'Mettre à Jour le Rendez-vous' : 'Créer le Rendez-vous'}
                </Button>
              )}
              {activeStep < 2 && (
                <Button 
                  color="blue" 
                  onClick={handleNext}
                  disabled={!canProceedToNext() || isSubmitting}
                  loading={isSubmitting && ((activeStep === 0 && parentSelection === 'new') || activeStep === 1)}
                >
                  {(activeStep === 0 && parentSelection === 'new') ? 'Créer le Parent' :
                   (activeStep === 0 && parentSelection === 'existing') ? 'Suivant' :
                   (activeStep === 1) ? 'Créer le Patient' : 'Suivant'}
                  {!(isSubmitting && ((activeStep === 0 && parentSelection === 'new') || activeStep === 1)) && (
                    <ChevronRight className="h-4 w-4 ml-1" />
                  )}
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </Dialog>
      
      <Dialog open={isDeleteModalOpen} handler={() => setIsDeleteModalOpen(false)} size="sm">
        <DialogHeader>Confirmer la Suppression</DialogHeader>
        <DialogBody>
          Êtes-vous sûr de vouloir supprimer ce rendez-vous ? Cette action ne peut pas être annulée.
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            onClick={() => setIsDeleteModalOpen(false)}
            className="mr-1"
          >
            Annuler
          </Button>
          <Button color="red" onClick={confirmDelete}>
            Supprimer
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};

export default AppointmentsPage;

