import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Avatar,
  Chip,
  IconButton,
  CardFooter,
} from "@material-tailwind/react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
  Input,
  Textarea
} from "@material-tailwind/react";
import UpdatePatientModal from './component/UpdatePatientModal'; 
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

import { useEffect, useState, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getPatientTable } from "@/data/patientTable";
import { createPatient } from '/src/data/createPatient.js';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { createAppointment, getAppointments } from "@/data/appointmentsData";
import axios from "axios";
import axiosInstance from "@/api/axiosInstance";
import PatientDetailsModal from "./component/PatientDetailsModal";
import { useNavigate } from "react-router-dom";
import { getVaccinationRecords } from "@/data/getVaccinationRecords";
import { Icon, ChevronDown, Users, Calendar as CalendarIcon, CalendarX } from "lucide-react";
import dayjs from "dayjs";

// Insurance Companies
const INSURANCE_COMPANIES = [
  { value: 'Wafa Assurance', label: 'Wafa Assurance' },
  { value: 'RMA Watanya', label: 'RMA Watanya' },
  { value: 'Saham Assurance', label: 'Saham Assurance' },
  { value: 'AXA Assurance Maroc', label: 'AXA Assurance Maroc' },
  { value: 'AtlantaSanad', label: 'AtlantaSanad' },
  { value: 'Allianz Maroc', label: 'Allianz Maroc' },
  { value: 'La Marocaine Vie', label: 'La Marocaine Vie' },
  { value: 'ZURICH Assurances Maroc', label: 'ZURICH Assurances Maroc' },
  { value: 'MAMDA-MCMA', label: 'MAMDA-MCMA' },
];

// International Phone Input Component
const InternationalPhoneInput = ({ value, onChange, error, onBlur }) => {
  return (
    <div className="relative">
      <PhoneInput
        international
        defaultCountry="MA"
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={`w-full p-3 border rounded-md focus:outline-none ${
          error ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
        }`}
      />
      {error && (
        <Typography variant="small" color="red" className="mt-1 text-xs">
          {error}
        </Typography>
      )}
      <Typography variant="small" color="gray" className="mt-1 text-xs">
        Format: +212612345678 (Maroc par défaut)
      </Typography>
    </div>
  );
};

// Helper component for form field errors
const FieldError = ({ error }) =>
  error ? (
    <Typography variant="small" color="red" className="mt-1 text-xs">
      {error.message}
    </Typography>
  ) : null;

// Validation schemas - Messages en français
const parentInfoSchema = Yup.object().shape({
  fullName: Yup.string()
    .required('Le nom complet est requis')
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne doit pas dépasser 100 caractères')
    .matches(/^[a-zA-Z\s'-]+$/, 'Le nom ne peut contenir que des lettres, espaces, tirets et apostrophes')
    .trim(),
  email: Yup.string()
    .required('L\'email est requis')
    .email('Veuillez entrer une adresse email valide')
    .max(254, 'L\'email ne doit pas dépasser 254 caractères')
    .lowercase()
    .trim(),
  phoneNumber: Yup.string()
    .required('Le numéro de téléphone est requis')
    .matches(
      /^\+[1-9]\d{1,14}$/,
      'Le numéro doit être au format international (ex: +212612345678)'
    )
    .min(8, 'Le numéro de téléphone doit contenir au moins 8 chiffres')
    .max(15, 'Le numéro de téléphone ne doit pas dépasser 15 caractères')
    .trim(),
  insurance: Yup.string()
  .nullable()
  .test(
    'insurance-validation',
    'Le nom de l\'assurance doit contenir entre 2 et 100 caractères',
    function(value) {
      if (!value) return true; // Optional field
      
      // If it's a predefined value
      if (INSURANCE_COMPANIES.some(c => c.value === value)) return true;
      
      // If it's "other" or custom value
      const customValue = this.parent.customInsurance || value;
      return customValue.length >= 2 && customValue.length <= 100;
    }
  )
});

const patientInfoSchema = Yup.object().shape({
  firstName: Yup.string()
    .required('Le prénom est requis')
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .max(50, 'Le prénom ne doit pas dépasser 50 caractères')
    .matches(/^[a-zA-Z\s'-]+$/, 'Le prénom ne peut contenir que des lettres, espaces, tirets et apostrophes')
    .trim(),
  lastName: Yup.string()
    .required('Le nom de famille est requis')
    .min(2, 'Le nom de famille doit contenir au moins 2 caractères')
    .max(50, 'Le nom de famille ne doit pas dépasser 50 caractères')
    .matches(/^[a-zA-Z\s'-]+$/, 'Le nom de famille ne peut contenir que des lettres, espaces, tirets et apostrophes')
    .trim(),
  birthDate: Yup.date()
    .required('La date de naissance est requise')
    .max(new Date(), 'La date de naissance ne peut pas être dans le futur')
    .min(new Date('1900-01-01'), 'La date de naissance ne peut pas être antérieure à 1900'),
  gender: Yup.string()
    .required('Le sexe est requis')
    .oneOf(['male', 'female'], 'Veuillez sélectionner un sexe valide')
});

const appointmentSchema = Yup.object().shape({
  date: Yup.date()
    .required('La date est requise')
    .min(new Date(), 'La date du rendez-vous ne peut pas être dans le passé'),
  time: Yup.string()
    .required('L\'heure est requise')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Veuillez entrer une heure valide'),
  reason: Yup.string()
    .required('Le motif de la visite est requis')
    .min(5, 'Le motif doit contenir au moins 5 caractères')
    .max(500, 'Le motif ne doit pas dépasser 500 caractères')
    .trim()
});

// Utility function to sanitize input
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .trim();
};

// Time slots available for booking
const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00"
];

export function Patient() {
  const [open, setOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const [patients, setPatients] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [patientsLength, setPatientsLength] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [patientsPerPage] = useState(5);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [patientToView, setPatientToView] = useState(null);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [patientToUpdate, setPatientToUpdate] = useState(null);
  const [customInsurance, setCustomInsurance] = useState('');
  const [sortField, setSortField] = useState("name"); // "name" or "lastConsultation"
  const [sortDirection, setSortDirection] = useState("asc"); // "asc" or "desc"
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const sortDropdownRef = useRef(null);
  const sortButtonRef = useRef(null);

  const navigate = useNavigate();

  // Filter options configuration
  const filterOptions = [
    { 
      value: 'all', 
      label: 'Tous les Patients', 
      icon: Users,
      count: patients?.length || 0
    },
    { 
      value: 'withAppointments', 
      label: 'Avec Rendez-vous', 
      icon: CalendarIcon,
      count: patients?.filter(p => p.appointments?.length > 0).length || 0
    },
    { 
      value: 'withoutAppointments', 
      label: 'Sans Rendez-vous', 
      icon: CalendarX,
      count: patients?.filter(p => !p.appointments || p.appointments.length === 0).length || 0
    }
  ];

  const selectedFilterOption = filterOptions.find(opt => opt.value === filterStatus) || filterOptions[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close filter dropdown
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setFilterDropdownOpen(false);
      }
      
      // Close sort dropdown
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target) &&
          sortButtonRef.current && !sortButtonRef.current.contains(event.target)) {
        setSortDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Position dropdown correctly
  useEffect(() => {
    if (filterDropdownOpen && buttonRef.current && dropdownRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const dropdown = dropdownRef.current;
      
      // Position the dropdown relative to the button
      dropdown.style.position = 'fixed';
      dropdown.style.top = `${buttonRect.bottom + 8}px`;
      dropdown.style.left = `${buttonRect.left}px`;
      dropdown.style.width = `${buttonRect.width}px`;
      dropdown.style.zIndex = '99999';
    }
  }, [filterDropdownOpen]);

  // Position sort dropdown correctly
  useEffect(() => {
    if (sortDropdownOpen && sortButtonRef.current && sortDropdownRef.current) {
      const buttonRect = sortButtonRef.current.getBoundingClientRect();
      const dropdown = sortDropdownRef.current;
      
      // Position the dropdown relative to the button
      dropdown.style.position = 'fixed';
      dropdown.style.top = `${buttonRect.bottom + 8}px`;
      dropdown.style.left = `${buttonRect.left}px`;
      dropdown.style.width = `${buttonRect.width}px`;
      dropdown.style.zIndex = '99999';
    }
  }, [sortDropdownOpen]);

  // React Hook Form setup
  const parentForm = useForm({
    resolver: yupResolver(parentInfoSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phoneNumber: '',
      insurance: null,
      customInsurance: ''
    },
    mode: 'onBlur'
  });

  const patientForm = useForm({
    resolver: yupResolver(patientInfoSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      birthDate: '',
      gender: '',
    },
    mode: 'onBlur'
  });

  const appointmentForm = useForm({
    resolver: yupResolver(appointmentSchema),
    defaultValues: {
      date: '',
      time: '',
      reason: ''
    },
    mode: 'onBlur'
  });

  // Filter and pagination logic
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = 
      patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.parent?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.parent?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      filterStatus === 'all' || 
      (filterStatus === 'withAppointments' && patient.appointments?.length > 0) ||
      (filterStatus === 'withoutAppointments' && (!patient.appointments || patient.appointments.length === 0));
    
    return matchesSearch && matchesStatus;
  });

  // Sorting logic
  const sortedPatients = [...filteredPatients].sort((a, b) => {
    let comparison = 0;
    
    if (sortField === "name") {
      const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
      const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
      comparison = nameA.localeCompare(nameB);
    } else if (sortField === "lastConsultation") {
      const lastAppointmentA = a.appointments && a.appointments.length > 0 
        ? new Date(a.appointments[0].date) 
        : new Date(0);
      const lastAppointmentB = b.appointments && b.appointments.length > 0 
        ? new Date(b.appointments[0].date) 
        : new Date(0);
      comparison = lastAppointmentA.getTime() - lastAppointmentB.getTime();
    }
    
    return sortDirection === "asc" ? comparison : -comparison;
  });

  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = sortedPatients.slice(indexOfFirstPatient, indexOfLastPatient);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Handlers
  const handleViewDetails = async (patient) => {
    const age= dayjs().diff(dayjs(patient.birthDate), 'year');

    const pricing = JSON.parse(localStorage.getItem('appointment_pricing_config') || '[]');
    const appointmentType = patient.appointments && patient.appointments[0]?.type;
    const tarifOfThisPatient = pricing.find(p => p.type === appointmentType)?.price || 0;
    
    const vaccinations = await getVaccinationRecords(patient._id);

    navigate(`/dashboard/patients/details/${patient._id}`, {
      state: {
        patient,
        age,
        tarifOfThisPatient,
        vaccinations,
        appointments: patient.appointments || []
      }
    });
  };

  const handleViewDetailsOpen = (patient) => {
    setPatientToView(patient);
    setDetailsModalOpen(true);
  };

  const handleViewDetailsClose = () => {
    setDetailsModalOpen(false);
    setPatientToView(null);
  };

  const handleUpdateModalOpen = (patient) => {
    setPatientToUpdate(patient);
    setUpdateModalOpen(true);
  };

  const handleUpdateModalClose = () => {
    setUpdateModalOpen(false);
    setPatientToUpdate(null);
  };

  const handlePatientUpdated = async () => {
    try {
      const updatedPatients = await getPatientTable();
      setPatients(updatedPatients);
      toast.success('Liste des patients actualisée');
    } catch (error) {
      console.error('Error refreshing patient list:', error);
      toast.error('Échec de l\'actualisation de la liste des patients');
    }
  };

  const handleOpen = async (patient) => {
    setSelectedPatient(patient);
    setOpen(true);
    appointmentForm.reset();
    setSelectedDate(null);
    setSelectedTime(null);

    try {
      const appointmentsData = await getAppointments();
      setAppointments(appointmentsData);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Échec du chargement des données de rendez-vous');
    }
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedPatient(null);
    appointmentForm.reset();
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const handleCreateModalOpen = () => {
    setCreateModalOpen(true);
    setCurrentStep(1);
    parentForm.reset();
    patientForm.reset();
    setCustomInsurance('');
  };

  const handleCreateModalClose = () => {
    setCreateModalOpen(false);
    parentForm.reset();
    patientForm.reset();
    setCustomInsurance('');
  };



  const handleCreatePatient = async (patientData) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const parentData = parentForm.getValues();
      const insuranceValue = parentData.insurance === 'other' ? customInsurance : parentData.insurance;

      // Ensure phone number is properly formatted
      let phoneNumber = parentData.phoneNumber;
      if (phoneNumber && !phoneNumber.startsWith('+')) {
        phoneNumber = `+${phoneNumber.replace(/^\+/, '')}`;
      }

      const sanitizedData = {
        fullName: sanitizeInput(parentData.fullName),
        email: sanitizeInput(parentData.email.toLowerCase()),
        phoneNumber: sanitizeInput(phoneNumber),
        insurance: insuranceValue ? sanitizeInput(insuranceValue) : null,
        firstName: sanitizeInput(patientData.firstName),
        lastName: sanitizeInput(patientData.lastName),
        birthDate: patientData.birthDate,
        gender: patientData.gender,
        role: "parent",
        address: ''
      };

      const response = await createPatient(sanitizedData);

      if (!response) {
        throw new Error('Échec de la création du patient');
      }
      setPatientsLength(patientsLength + 1);

      toast.success('Patient créé avec succès !', {
        position: "top-right",
        autoClose: 3000,
      });

      handleCreateModalClose();
      const updatedPatients = await getPatientTable();
      setPatients(updatedPatients);

    } catch (error) {
      console.error('Error creating patient:', error);
      toast.error(`Erreur lors de la création du patient: ${error.message}`, {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAppointmentSubmit = async (appointmentData) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (!selectedPatient || !selectedPatient.patientId) {
        throw new Error('Aucun patient sélectionné ou ID patient manquant');
      }

      if (!selectedDate) {
        throw new Error('Veuillez sélectionner une date');
      }

      if (!selectedTime) {
        throw new Error('Veuillez sélectionner une heure');
      }

      const formattedDate = dayjs(selectedDate).format('YYYY-MM-DD');

      const sanitizedAppointmentData = {
        patientId: selectedPatient.patientId,
        date: formattedDate,
        time: selectedTime,
        type: 'consultation',
        notes: appointmentData.reason || ''
      };

      const res = await createAppointment(sanitizedAppointmentData);

      if (res && res.error) {
        throw new Error(res.error || 'Échec de la création du rendez-vous');
      }
    
      toast.success('Rendez-vous réservé avec succès !', {
        position: "top-right",
        autoClose: 3000,
      });

      handleClose();

      const updatedAppointments = await getAppointments();
      setAppointments(updatedAppointments);

    } catch (error) {
      console.error('Error booking appointment:', error);
      toast.error(`Erreur lors de la réservation du rendez-vous: ${error.message}`, {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    appointmentForm.setValue('time', time);
  };

  const isTimeSlotBooked = (time) => {
    if (!selectedDate) return false;

    const selectedDateStr = selectedDate.toISOString().split('T')[0];
    return appointments.some(appt => {
      const apptDate = new Date(appt.date).toISOString().split('T')[0];
      return apptDate === selectedDateStr && appt.time === time;
    });
  };

  const tileDisabled = ({ date, view }) => {
    if (view === 'month') {
      return date < new Date(new Date().setHours(0, 0, 0, 0));
    }
  };

  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const dateStr = date.toISOString().split('T')[0];
      const hasAppointments = appointments.some(appt => {
        const apptDate = new Date(appt.date).toISOString().split('T')[0];
        return apptDate === dateStr;
      });

      if (hasAppointments) {
        return 'has-appointments';
      }
    }
  };

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const patientsData = await getPatientTable();
        setPatients(patientsData);
        console.log('Patients fetched: again   -----', patientsData);
      } catch (error) {
        console.error('Error fetching patients:', error);
      }
    };

    fetchPatients();
  }, [patientsLength]);

  const handleDelete = async (patientId) => {
    if (!patientId) {
      toast.error('ID du patient manquant');
      return;
    }

    try {
      const response = await axiosInstance.delete(`patients/${patientId}`);
      toast.success('Patient supprimé avec succès !', {
        position: "top-right",
        autoClose: 3000,
      });

      const updatedPatients = await getPatientTable();
      setPatients(updatedPatients);

    } catch (error) {
      console.error('Error deleting patient:', error);
      toast.error(`Erreur lors de la suppression du patient: ${error.message}`, {
        position: "top-right",
        autoClose: 5000,
      });
    }
  }

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12" style={{ position: 'relative' }}>
      <ToastContainer />

      <Card>
        <CardHeader variant="gradient" color="gray" className="mb-8 p-6" style={{ position: 'relative', zIndex: 1000 }}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <Typography variant="h6" color="white" className="w-full md:w-auto">
              Patients
            </Typography>
            <div className="flex gap-2 w-full md:w-auto justify-end items-center">
              <div className="relative flex items-center">
                <span className="absolute inset-y-0 left-0 flex items-center justify-center pl-3 pointer-events-none">
                  <svg className="w-4 h-4 text-white opacity-70" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </span>
                <Input
                  placeholder="Rechercher des patients..."
                  color="white"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-9 pr-3 py-2 text-white bg-white bg-opacity-10 border border-white border-opacity-20 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                  style={{ minWidth: 200 }}
                />
              </div>
              {/* Fixed Filter Dropdown */}
              <div className="relative inline-block text-left" style={{ position: 'relative', zIndex: 1001 }}>
  {/* Custom Select Button */}
  <button
    ref={buttonRef}
    onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
    className="group relative flex items-center gap-3 px-4 py-2 bg-white bg-opacity-10 hover:bg-opacity-20 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 w-64 border border-white border-opacity-20"
  >
    {/* Icon */}
    <div className="flex-shrink-0">
      {selectedFilterOption && selectedFilterOption.icon ? (
        <selectedFilterOption.icon className="w-5 h-5 text-white opacity-80" />
      ) : (
        <Users className="w-5 h-5 text-white opacity-80" />
      )}
    </div>
    
    {/* Text Content */}
    <div className="flex-1 text-left">
      <div className="text-sm font-medium">
        {selectedFilterOption ? selectedFilterOption.label : 'Tous les Patients'}
      </div>
      <div className="text-xs text-white opacity-75">
        {selectedFilterOption ? selectedFilterOption.count : 0} patients
      </div>
    </div>
    
    {/* Chevron */}
    <ChevronDown 
      className={`w-4 h-4 text-white opacity-80 transition-transform duration-200 ${
        filterDropdownOpen ? 'transform rotate-180' : ''
      }`} 
    />
    
    {/* Subtle gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-100" />
  </button>

  {/* Dropdown Menu - Fixed positioning */}
  {filterDropdownOpen && (
    <div 
      ref={dropdownRef}
      className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
      style={{
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      }}
    >
      {filterOptions && filterOptions.length > 0 ? (
        filterOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = option.value === filterStatus;
          
          return (
            <button
              key={option.value}
              onClick={() => {
                setFilterStatus(option.value);
                setCurrentPage(1);
                setFilterDropdownOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150 ${
                isSelected ? 'bg-blue-50 border-r-2 border-blue-500' : ''
              }`}
            >
              <Icon className={`w-5 h-5 ${
                isSelected ? 'text-blue-600' : 'text-gray-400'
              }`} />
              <div className="flex-1">
                <div className={`text-sm font-medium ${
                  isSelected ? 'text-blue-900' : 'text-gray-900'
                }`}>
                  {option.label}
                </div>
                <div className={`text-xs ${
                  isSelected ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {option.count} patients
                </div>
              </div>
              {isSelected && (
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
              )}
            </button>
          );
        })
      ) : (
        <div className="px-4 py-3 text-gray-500 text-sm">
          Aucune option disponible
        </div>
      )}
    </div>
  )}
</div>
              <div className="relative inline-block text-left" style={{ position: 'relative', zIndex: 1001 }}>
                {/* Custom Sort Button */}
                <button
                  ref={sortButtonRef}
                  onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                  className="group relative flex items-center gap-3 px-4 py-2 bg-white bg-opacity-10 hover:bg-opacity-20 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 w-48 border border-white border-opacity-20"
                >
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-white opacity-80" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M3 3v18h18M7 7l5 5 5-5M7 13l5 5 5-5" />
                    </svg>
                  </div>
                  
                  {/* Text Content */}
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium">
                      {sortField === 'name' ? 'Trier par nom' : 'Trier par dernière consultation'}
                    </div>
                    <div className="text-xs text-white opacity-75">
                      {sortDirection === 'asc' ? 'Croissant' : 'Décroissant'}
                    </div>
                  </div>
                  
                  {/* Chevron */}
                  <ChevronDown 
                    className={`w-4 h-4 text-white opacity-80 transition-transform duration-200 ${
                      sortDropdownOpen ? 'transform rotate-180' : ''
                    }`} 
                  />
                  
                  {/* Subtle gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-100" />
                </button>

                {/* Sort Dropdown Menu */}
                {sortDropdownOpen && (
                  <div 
                    ref={sortDropdownRef}
                    className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
                    style={{
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    }}
                  >
                    <button
                      onClick={() => {
                        setSortField('name');
                        setCurrentPage(1);
                        setSortDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150 ${
                        sortField === 'name' ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                      }`}
                    >
                      <svg className={`w-5 h-5 ${
                        sortField === 'name' ? 'text-blue-600' : 'text-gray-400'
                      }`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M3 3v18h18M7 7l5 5 5-5M7 13l5 5 5-5" />
                      </svg>
                      <div className="flex-1">
                        <div className={`text-sm font-medium ${
                          sortField === 'name' ? 'text-blue-900' : 'text-gray-900'
                        }`}>
                          Trier par nom
                        </div>
                        <div className={`text-xs ${
                          sortField === 'name' ? 'text-blue-600' : 'text-gray-500'
                        }`}>
                          Ordre alphabétique
                        </div>
                      </div>
                      {sortField === 'name' && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      )}
                    </button>
                    
                    <button
                      onClick={() => {
                        setSortField('lastConsultation');
                        setCurrentPage(1);
                        setSortDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150 ${
                        sortField === 'lastConsultation' ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                      }`}
                    >
                      <CalendarIcon className={`w-5 h-5 ${
                        sortField === 'lastConsultation' ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                      <div className="flex-1">
                        <div className={`text-sm font-medium ${
                          sortField === 'lastConsultation' ? 'text-blue-900' : 'text-gray-900'
                        }`}>
                          Trier par dernière consultation
                        </div>
                        <div className={`text-xs ${
                          sortField === 'lastConsultation' ? 'text-blue-600' : 'text-gray-500'
                        }`}>
                          Date de consultation
                        </div>
                      </div>
                      {sortField === 'lastConsultation' && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      )}
                    </button>
                  </div>
                )}
              </div>
              <div className="relative">
                <Button
                  size="sm"
                  color="white"
                  variant="text"
                  onClick={() => {
                    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-md hover:bg-opacity-20 transition"
                >
                  {sortDirection === "asc" ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M5 15l7-7 7 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </Button>
              </div>
              <Button
                size="sm"
                color="white"
                variant="filled"
                onClick={handleCreateModalOpen}
                className="ml-2"
              >
                Ajouter un Nouveau Patient
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2" style={{ position: 'relative' }}>
          <table className="w-full min-w-[640px] table-auto">
            <thead>
              <tr>
                {["patient", "parents", "statut des rendez-vous", "Date", "Prendre Rendez-vous","Assurance", "Actions"].map((el) => (
                  <th key={el} className="border-b border-blue-gray-50 py-3 px-5 text-left">
                    <Typography
                      variant="small"
                      className="text-[11px] font-bold uppercase text-blue-gray-400"
                    >
                      {el}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentPatients.map((patient, key) => {
                const className = `py-3 px-5 ${key === patients.length - 1 ? "" : "border-b border-blue-gray-50"}`;
                return (
                  <tr key={patient._id || key}>
                    <td className={className}>
                      <div className="flex items-center gap-4">
                        <Avatar src={patient.img} alt={patient.firstName} size="sm" variant="rounded" />
                        <div>
                          <Typography variant="small" color="blue-gray" className="font-semibold">
                            <span className="text-xs font-normal">prénom :</span> {patient.firstName} <span className="text-xs font-normal">nom :</span> {patient.lastName}
                          </Typography>
                          <Typography className="text-xs font-normal text-blue-gray-500">
                            Sexe: {patient.gender === 'male' ? 'Masculin' : patient.gender === 'female' ? 'Féminin' : 'Non spécifié'}
                          </Typography>
                        </div>
                      </div>
                    </td>
                    <td className={className}>
                      <div className="flex items-center gap-4">
                        <div>
                          <Typography variant="small" color="blue-gray" className="font-semibold">
                            {patient.parent?.fullName || 'Non spécifié'}
                          </Typography>
                          <Typography className="text-xs font-normal text-blue-gray-500">
                            {patient.parent?.email || patient.email || 'Pas d\'email'}
                          </Typography>
                          <Typography className="text-xs font-normal text-blue-gray-500">
                            Assurance: {patient.parent?.insurance || 'Non spécifié'}
                          </Typography>
                        </div>
                      </div>
                    </td>
                    <td className={className}>
                      <Typography className="text-xs font-semibold text-blue-gray-600">
                        {patient.job && patient.job[0] ? patient.job[0] : 'Non spécifié'}
                      </Typography>
                      <Typography className="text-xs font-normal text-blue-gray-500">
                        Statut: {patient.appointments?.length > 0 ? 'A des rendez-vous' : 'Pas de rendez-vous'}
                      </Typography>
                    </td>
                    <td className={className}>
                      {patient.appointments && patient.appointments.length > 0 ? (
                        <>
                          <Typography className="text-xs font-semibold text-blue-gray-600">
                            {patient.appointments[0].date}
                          </Typography>
                          <Typography className="text-xs font-semibold text-blue-gray-600">
                            à: {patient.appointments[0].time}
                          </Typography>
                        </>
                      ) : (
                        <Typography className="text-xs font-normal text-blue-gray-400">
                          Pas de rendez-vous
                        </Typography>
                      )}
                    </td>
                    <td className={className}>
                      <button
                        onClick={() => handleOpen(patient)}
                        className="text-xs font-normal text-blue-gray-500 underline ml-2 hover:text-blue-gray-700"
                      >
                        Prendre Rendez-vous
                      </button>
                    </td>
                    <td className={className}>
                      <Typography className="text-xs font-normal text-blue-gray-500">
                        {patient.parent?.insurance || 'Pas d\'assurance'}
                      </Typography>
                    </td>
                    <td className={className}>
                      <div className="flex gap-2">
                        <IconButton
                          variant="text"
                          color="blue"
                          size="sm"
                          onClick={() => handleUpdateModalOpen(patient)}
                          title="Modifier"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M15.232 5.232l3.536 3.536M9 11l6 6M3 21h6l11.293-11.293a1 1 0 000-1.414l-4.586-4.586a1 1 0 00-1.414 0L3 15v6z" />
                          </svg>
                        </IconButton>
                        <IconButton
                          variant="text"
                          color="red"
                          size="sm"
                          onClick={() => handleDelete(patient._id)}
                          title="Supprimer"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </IconButton>
                        <IconButton
                          variant="text"
                          color="green"
                          size="sm"
                          onClick={() => handleViewDetails(patient)}
                          title="Voir les Détails"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" />
                            <circle cx="12" cy="12" r="4" />
                          </svg>
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardBody>
        <CardFooter className="flex items-center justify-between border-t border-blue-gray-50 p-4">
          <Typography variant="small" color="blue-gray" className="font-normal">
            Affichage de {indexOfFirstPatient + 1} à {Math.min(indexOfLastPatient, sortedPatients.length)} sur {sortedPatients.length} entrées
          </Typography>
          <div className="flex gap-2">
            <Button
              variant="outlined"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => paginate(currentPage - 1)}
            >
              Précédent
            </Button>
            {Array.from({ length: Math.ceil(sortedPatients.length / patientsPerPage) }).map((_, index) => (
              <IconButton
                key={index}
                variant={currentPage === index + 1 ? "filled" : "text"}
                size="sm"
                onClick={() => paginate(index + 1)}
              >
                {index + 1}
              </IconButton>
            ))}
            <Button
              variant="outlined"
              size="sm"
              disabled={currentPage === Math.ceil(sortedPatients.length / patientsPerPage)}
              onClick={() => paginate(currentPage + 1)}
            >
              Suivant
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Update Patient Modal */}
      <UpdatePatientModal
        open={updateModalOpen}
        onClose={handleUpdateModalClose}
        patient={patientToUpdate}
        onPatientUpdated={handlePatientUpdated}
      />

      {/* Appointment Modal */}
      <Dialog open={open} handler={handleClose} size="xl" className="h-screen overflow-auto">
        <DialogHeader>Réserver un Rendez-vous</DialogHeader>
        <form onSubmit={appointmentForm.handleSubmit(handleAppointmentSubmit)}>
          <DialogBody className="flex flex-col gap-4">
            {selectedPatient && (
              <>
                <Typography variant="h6">Patient: {selectedPatient.name}</Typography>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Typography variant="h6" className="mb-2">Sélectionner la Date</Typography>
                    <Calendar
                      onChange={handleDateChange}
                      value={selectedDate}
                      minDate={new Date()}
                      tileDisabled={tileDisabled}
                      tileClassName={tileClassName}
                      className="border rounded-lg p-2 w-full"
                    />
                  </div>
                  <div>
                    <Typography variant="h6" className="mb-2">Créneaux Horaires Disponibles</Typography>
                    {selectedDate ? (
                      <div className="grid grid-cols-3 gap-2">
                        {TIME_SLOTS.map(time => (
                          <Button
                            key={time}
                            variant={selectedTime === time ? "filled" : "outlined"}
                            color={isTimeSlotBooked(time) ? "red" : selectedTime === time ? "blue" : "gray"}
                            onClick={() => !isTimeSlotBooked(time) && handleTimeSelect(time)}
                            disabled={isTimeSlotBooked(time)}
                            className="p-2 text-sm"
                          >
                            {time}
                            {isTimeSlotBooked(time) && (
                              <span className="ml-1 text-xs">(Réservé)</span>
                            )}
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <Typography variant="small" color="gray">
                        Veuillez d'abord sélectionner une date
                      </Typography>
                    )}
                  </div>
                </div>
                <div>
                  <Controller
                    name="reason"
                    control={appointmentForm.control}
                    render={({ field, fieldState }) => (
                      <>
                        <Textarea
                          {...field}
                          label="Motif de la Visite *"
                          error={!!fieldState.error}
                        />
                        <FieldError error={fieldState.error} />
                      </>
                    )}
                  />
                </div>
              </>
            )}
          </DialogBody>
          <DialogFooter className="flex justify-between">
            <Button variant="outlined" color="red" onClick={handleClose} type="button">
              Annuler
            </Button>
            <Button
              variant="gradient"
              color="green"
              type="submit"
              disabled={isSubmitting || !selectedDate || !selectedTime}
              onClick={handleAppointmentSubmit}
            >
              {isSubmitting ? 'Réservation...' : 'Réserver le Rendez-vous'}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* New Optimized Create Patient Modal */}
      <Dialog open={createModalOpen} handler={handleCreateModalClose} size="lg" className="max-w-2xl">
        <DialogHeader className="flex justify-between items-center pb-4">
          <div>
            <Typography variant="h5" className="text-gray-800">
              Ajouter un Nouveau Patient
            </Typography>
            <Typography variant="small" color="gray" className="font-normal">
              Remplissez les informations du patient et du parent
            </Typography>
          </div>
          <IconButton
            variant="text"
            size="sm"
            onClick={handleCreateModalClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </IconButton>
        </DialogHeader>
        
        <DialogBody className="p-6">
          <form onSubmit={async (e) => {
            e.preventDefault();
            const isParentValid = await parentForm.trigger();
            const isPatientValid = await patientForm.trigger();
            
            if (isParentValid && isPatientValid) {
              const patientData = patientForm.getValues();
              handleCreatePatient(patientData);
            }
          }} className="space-y-6">
            {/* Parent Information Section */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <Typography variant="h6" color="blue-gray" className="mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Informations du Parent/Tuteur
              </Typography>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Controller
                    name="fullName"
                    control={parentForm.control}
                    render={({ field, fieldState }) => (
                      <div>
                        <Input
                          {...field}
                          label="Nom Complet *"
                          size="lg"
                          error={!!fieldState.error}
                          success={!fieldState.error && fieldState.isTouched}
                          className="!border-gray-300 focus:!border-blue-500"
                        />
                        {fieldState.error && (
                          <Typography variant="small" color="red" className="mt-1 text-xs">
                            {fieldState.error.message}
                          </Typography>
                        )}
                      </div>
                    )}
                  />
                </div>
                
                <div>
                  <Controller
                    name="email"
                    control={parentForm.control}
                    render={({ field, fieldState }) => (
                      <div>
                        <Input
                          {...field}
                          label="Adresse Email *"
                          type="email"
                          size="lg"
                          error={!!fieldState.error}
                          success={!fieldState.error && fieldState.isTouched}
                          className="!border-gray-300 focus:!border-blue-500"
                        />
                        {fieldState.error && (
                          <Typography variant="small" color="red" className="mt-1 text-xs">
                            {fieldState.error.message}
                          </Typography>
                        )}
                      </div>
                    )}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <Controller
                    name="phoneNumber"
                    control={parentForm.control}
                    render={({ field, fieldState }) => (
                      <div>
                        <Typography variant="small" className="mb-2 block font-medium text-gray-700">
                          Téléphone *
                        </Typography>
                        <InternationalPhoneInput
                          value={field.value}
                          onChange={(value) => {
                            field.onChange(value);
                            parentForm.trigger('phoneNumber');
                          }}
                          onBlur={field.onBlur}
                          error={fieldState.error?.message}
                        />
                      </div>
                    )}
                  />
                </div>
                
                <div>
                  <Controller
                    name="insurance"
                    control={parentForm.control}
                    render={({ field, fieldState }) => {
                      const showCustomInput = field.value === 'other' || 
                        (field.value && !INSURANCE_COMPANIES.some(c => c.value === field.value));
                      
                      return (
                        <div>
                          <Typography variant="small" className="mb-2 block font-medium text-gray-700">
                            Assurance (optionnel)
                          </Typography>
                          <div className="relative">
                            {!showCustomInput ? (
                              <select
                                {...field}
                                onChange={(e) => {
                                  field.onChange(e.target.value);
                                  if (e.target.value !== 'other') {
                                    setCustomInsurance('');
                                  }
                                }}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                              >
                                <option value="">Sélectionner une assurance</option>
                                {INSURANCE_COMPANIES.map((company) => (
                                  <option key={company.value} value={company.value}>
                                    {company.label}
                                  </option>
                                ))}
                                <option value="other">Autre...</option>
                              </select>
                            ) : (
                              <div className="relative">
                                <Input
                                  value={customInsurance}
                                  onChange={(e) => {
                                    setCustomInsurance(e.target.value);
                                    field.onChange(e.target.value);
                                  }}
                                  placeholder="Nom de l'assurance"
                                  size="lg"
                                  className="!border-gray-300 focus:!border-blue-500"
                                />
                                <button
                                  type="button"
                                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                  onClick={() => {
                                    field.onChange('');
                                    setCustomInsurance('');
                                  }}
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Patient Information Section */}
            <div className="bg-green-50 p-4 rounded-lg">
              <Typography variant="h6" color="blue-gray" className="mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Informations du Patient
              </Typography>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Controller
                    name="firstName"
                    control={patientForm.control}
                    render={({ field, fieldState }) => (
                      <div>
                        <Input
                          {...field}
                          label="Prénom *"
                          size="lg"
                          error={!!fieldState.error}
                          success={!fieldState.error && fieldState.isTouched}
                          className="!border-gray-300 focus:!border-blue-500"
                        />
                        {fieldState.error && (
                          <Typography variant="small" color="red" className="mt-1 text-xs">
                            {fieldState.error.message}
                          </Typography>
                        )}
                      </div>
                    )}
                  />
                </div>
                
                <div>
                  <Controller
                    name="lastName"
                    control={patientForm.control}
                    render={({ field, fieldState }) => (
                      <div>
                        <Input
                          {...field}
                          label="Nom de Famille *"
                          size="lg"
                          error={!!fieldState.error}
                          success={!fieldState.error && fieldState.isTouched}
                          className="!border-gray-300 focus:!border-blue-500"
                        />
                        {fieldState.error && (
                          <Typography variant="small" color="red" className="mt-1 text-xs">
                            {fieldState.error.message}
                          </Typography>
                        )}
                      </div>
                    )}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <Controller
                    name="birthDate"
                    control={patientForm.control}
                    render={({ field, fieldState }) => (
                      <div>
                        <Input
                          {...field}
                          label="Date de Naissance *"
                          type="date"
                          size="lg"
                          error={!!fieldState.error}
                          success={!fieldState.error && fieldState.isTouched}
                          className="!border-gray-300 focus:!border-blue-500"
                        />
                        {fieldState.error && (
                          <Typography variant="small" color="red" className="mt-1 text-xs">
                            {fieldState.error.message}
                          </Typography>
                        )}
                      </div>
                    )}
                  />
                </div>
                
                <div>
                  <Controller
                    name="gender"
                    control={patientForm.control}
                    render={({ field, fieldState }) => (
                      <div>
                        <Typography variant="small" className="mb-2 block font-medium text-gray-700">
                          Sexe *
                        </Typography>
                        <select
                          {...field}
                          className={`w-full p-3 border rounded-lg focus:outline-none transition-colors ${
                            fieldState.error
                              ? 'border-red-500 focus:border-red-500'
                              : !fieldState.error && fieldState.isTouched
                              ? 'border-green-500 focus:border-green-500'
                              : 'border-gray-300 focus:border-blue-500'
                          }`}
                        >
                          <option value="">Sélectionner le sexe</option>
                          <option value="male">Masculin</option>
                          <option value="female">Féminin</option>
                        </select>
                        {fieldState.error && (
                          <Typography variant="small" color="red" className="mt-1 text-xs">
                            {fieldState.error.message}
                          </Typography>
                        )}
                      </div>
                    )}
                  />
                </div>
              </div>
            </div>
          </form>
        </DialogBody>
        
        <DialogFooter className="flex justify-between items-center p-6 pt-0">
          <Button
            variant="outlined"
            color="red"
            onClick={handleCreateModalClose}
            className="px-6"
          >
            Annuler
          </Button>
          
          <Button
            variant="gradient"
            color="green"
            onClick={async () => {
              const isParentValid = await parentForm.trigger();
              const isPatientValid = await patientForm.trigger();
              
              if (isParentValid && isPatientValid) {
                const patientData = patientForm.getValues();
                handleCreatePatient(patientData);
              }
            }}
            disabled={isSubmitting || !parentForm.formState.isValid || !patientForm.formState.isValid}
            className="px-8"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Création...
              </div>
            ) : (
              'Créer le Patient'
            )}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

export default Patient;



