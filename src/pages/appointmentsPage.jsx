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
import { Modal, Box, TextField, FormControl, InputLabel, Select as MuiSelect, MenuItem, Typography as MuiTypography, Button as MuiButton, IconButton as MuiIconButton } from "@mui/material";
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
import relativeTime from 'dayjs/plugin/relativeTime';

// Configure dayjs plugins
dayjs.extend(relativeTime);

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
    address: '',
    gender: 'other',
    birthDate: ''
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

  // Material-UI Modal State
  const [muiModalOpen, setMuiModalOpen] = useState(false);
  const [muiActiveStep, setMuiActiveStep] = useState(0);
  const [muiFlowType, setMuiFlowType] = useState(null);
  const [muiParentSelection, setMuiParentSelection] = useState(null);
  const [muiPatientSelection, setMuiPatientSelection] = useState(null);
  const [muiFormData, setMuiFormData] = useState({
    parentId: '',
    patientId: '',
    date: '',
    time: '',
    type: 'consultation',
    status: 'confirmed',
    notes: ''
  });
  const [parentCountryCode, setParentCountryCode] = useState('+212'); // Morocco default
  const [parentSearchTermMui, setParentSearchTermMui] = useState('');
  
  // Country codes for phone numbers
  const countryCodes = [
    { code: '+212', country: 'Maroc', flag: '🇲🇦' },
    { code: '+33', country: 'France', flag: '🇫🇷' },
    { code: '+1', country: 'Canada/USA', flag: '🇺🇸' },
    { code: '+44', country: 'Royaume-Uni', flag: '🇬🇧' },
    { code: '+49', country: 'Allemagne', flag: '🇩🇪' },
    { code: '+34', country: 'Espagne', flag: '🇪🇸' },
    { code: '+39', country: 'Italie', flag: '🇮🇹' },
    { code: '+31', country: 'Pays-Bas', flag: '🇳🇱' },
    { code: '+32', country: 'Belgique', flag: '🇧🇪' },
    { code: '+41', country: 'Suisse', flag: '🇨🇭' },
    { code: '+213', country: 'Algérie', flag: '🇩🇿' },
    { code: '+216', country: 'Tunisie', flag: '🇹🇳' },
    { code: '+20', country: 'Égypte', flag: '🇪🇬' },
    { code: '+971', country: 'Émirats Arabes Unis', flag: '🇦🇪' },
    { code: '+966', country: 'Arabie Saoudite', flag: '🇸🇦' },
    { code: '+90', country: 'Turquie', flag: '🇹🇷' },
    { code: '+91', country: 'Inde', flag: '🇮🇳' },
    { code: '+86', country: 'Chine', flag: '🇨🇳' },
    { code: '+81', country: 'Japon', flag: '🇯🇵' },
    { code: '+82', country: 'Corée du Sud', flag: '🇰🇷' },
    { code: '+61', country: 'Australie', flag: '🇦🇺' },
    { code: '+27', country: 'Afrique du Sud', flag: '🇿🇦' },
    { code: '+234', country: 'Nigeria', flag: '🇳🇬' },
    { code: '+254', country: 'Kenya', flag: '🇰🇪' },
    { code: '+233', country: 'Ghana', flag: '🇬🇭' },
    { code: '+225', country: 'Côte d\'Ivoire', flag: '🇨🇮' },
    { code: '+237', country: 'Cameroun', flag: '🇨🇲' },
    { code: '+221', country: 'Sénégal', flag: '🇸🇳' },
    { code: '+225', country: 'Côte d\'Ivoire', flag: '🇨🇮' },
    { code: '+226', country: 'Burkina Faso', flag: '🇧🇫' },
    { code: '+227', country: 'Niger', flag: '🇳🇪' },
    { code: '+228', country: 'Togo', flag: '🇹🇬' },
    { code: '+229', country: 'Bénin', flag: '🇧🇯' },
    { code: '+230', country: 'Maurice', flag: '🇲🇺' },
    { code: '+231', country: 'Libéria', flag: '🇱🇷' },
    { code: '+232', country: 'Sierra Leone', flag: '🇸🇱' },
    { code: '+233', country: 'Ghana', flag: '🇬🇭' },
    { code: '+234', country: 'Nigeria', flag: '🇳🇬' },
    { code: '+235', country: 'Tchad', flag: '🇹🇩' },
    { code: '+236', country: 'République centrafricaine', flag: '🇨🇫' },
    { code: '+237', country: 'Cameroun', flag: '🇨🇲' },
    { code: '+238', country: 'Cap-Vert', flag: '🇨🇻' },
    { code: '+239', country: 'São Tomé-et-Principe', flag: '🇸🇹' },
    { code: '+240', country: 'Guinée équatoriale', flag: '🇬🇶' },
    { code: '+241', country: 'Gabon', flag: '🇬🇦' },
    { code: '+242', country: 'République du Congo', flag: '🇨🇬' },
    { code: '+243', country: 'République démocratique du Congo', flag: '🇨🇩' },
    { code: '+244', country: 'Angola', flag: '🇦🇴' },
    { code: '+245', country: 'Guinée-Bissau', flag: '🇬🇼' },
    { code: '+246', country: 'Territoire britannique de l\'océan Indien', flag: '🇮🇴' },
    { code: '+247', country: 'Ascension', flag: '🇦🇨' },
    { code: '+248', country: 'Seychelles', flag: '🇸🇨' },
    { code: '+249', country: 'Soudan', flag: '🇸🇩' },
    { code: '+250', country: 'Rwanda', flag: '🇷🇼' },
    { code: '+251', country: 'Éthiopie', flag: '🇪🇹' },
    { code: '+252', country: 'Somalie', flag: '🇸🇴' },
    { code: '+253', country: 'Djibouti', flag: '🇩🇯' },
    { code: '+254', country: 'Kenya', flag: '🇰🇪' },
    { code: '+255', country: 'Tanzanie', flag: '🇹🇿' },
    { code: '+256', country: 'Ouganda', flag: '🇺🇬' },
    { code: '+257', country: 'Burundi', flag: '🇧🇮' },
    { code: '+258', country: 'Mozambique', flag: '🇲🇿' },
    { code: '+259', country: 'Zanzibar', flag: '🇹🇿' },
    { code: '+260', country: 'Zambie', flag: '🇿🇲' },
    { code: '+261', country: 'Madagascar', flag: '🇲🇬' },
    { code: '+262', country: 'Réunion', flag: '🇷🇪' },
    { code: '+263', country: 'Zimbabwe', flag: '🇿🇼' },
    { code: '+264', country: 'Namibie', flag: '🇳🇦' },
    { code: '+265', country: 'Malawi', flag: '🇲🇼' },
    { code: '+266', country: 'Lesotho', flag: '🇱🇸' },
    { code: '+267', country: 'Botswana', flag: '🇧🇼' },
    { code: '+268', country: 'Eswatini', flag: '🇸🇿' },
    { code: '+269', country: 'Comores', flag: '🇰🇲' },
    { code: '+27', country: 'Afrique du Sud', flag: '🇿🇦' },
    { code: '+290', country: 'Sainte-Hélène', flag: '🇸🇭' },
    { code: '+291', country: 'Érythrée', flag: '🇪🇷' },
    { code: '+297', country: 'Aruba', flag: '🇦🇼' },
    { code: '+298', country: 'Îles Féroé', flag: '🇫🇴' },
    { code: '+299', country: 'Groenland', flag: '🇬🇱' },
    { code: '+30', country: 'Grèce', flag: '🇬🇷' },
    { code: '+31', country: 'Pays-Bas', flag: '🇳🇱' },
    { code: '+32', country: 'Belgique', flag: '🇧🇪' },
    { code: '+33', country: 'France', flag: '🇫🇷' },
    { code: '+34', country: 'Espagne', flag: '🇪🇸' },
    { code: '+350', country: 'Gibraltar', flag: '🇬🇮' },
    { code: '+351', country: 'Portugal', flag: '🇵🇹' },
    { code: '+352', country: 'Luxembourg', flag: '🇱🇺' },
    { code: '+353', country: 'Irlande', flag: '🇮🇪' },
    { code: '+354', country: 'Islande', flag: '🇮🇸' },
    { code: '+355', country: 'Albanie', flag: '🇦🇱' },
    { code: '+356', country: 'Malte', flag: '🇲🇹' },
    { code: '+357', country: 'Chypre', flag: '🇨🇾' },
    { code: '+358', country: 'Finlande', flag: '🇫🇮' },
    { code: '+359', country: 'Bulgarie', flag: '🇧🇬' },
    { code: '+36', country: 'Hongrie', flag: '🇭🇺' },
    { code: '+370', country: 'Lituanie', flag: '🇱🇹' },
    { code: '+371', country: 'Lettonie', flag: '🇱🇻' },
    { code: '+372', country: 'Estonie', flag: '🇪🇪' },
    { code: '+373', country: 'Moldavie', flag: '🇲🇩' },
    { code: '+374', country: 'Arménie', flag: '🇦🇲' },
    { code: '+375', country: 'Biélorussie', flag: '🇧🇾' },
    { code: '+376', country: 'Andorre', flag: '🇦🇩' },
    { code: '+377', country: 'Monaco', flag: '🇲🇨' },
    { code: '+378', country: 'Saint-Marin', flag: '🇸🇲' },
    { code: '+379', country: 'Vatican', flag: '🇻🇦' },
    { code: '+380', country: 'Ukraine', flag: '🇺🇦' },
    { code: '+381', country: 'Serbie', flag: '🇷🇸' },
    { code: '+382', country: 'Monténégro', flag: '🇲🇪' },
    { code: '+383', country: 'Kosovo', flag: '🇽🇰' },
    { code: '+385', country: 'Croatie', flag: '🇭🇷' },
    { code: '+386', country: 'Slovénie', flag: '🇸🇮' },
    { code: '+387', country: 'Bosnie-Herzégovine', flag: '🇧🇦' },
    { code: '+389', country: 'Macédoine du Nord', flag: '🇲🇰' },
    { code: '+39', country: 'Italie', flag: '🇮🇹' },
    { code: '+40', country: 'Roumanie', flag: '🇷🇴' },
    { code: '+41', country: 'Suisse', flag: '🇨🇭' },
    { code: '+420', country: 'République tchèque', flag: '🇨🇿' },
    { code: '+421', country: 'Slovaquie', flag: '🇸🇰' },
    { code: '+423', country: 'Liechtenstein', flag: '🇱🇮' },
    { code: '+43', country: 'Autriche', flag: '🇦🇹' },
    { code: '+44', country: 'Royaume-Uni', flag: '🇬🇧' },
    { code: '+45', country: 'Danemark', flag: '🇩🇰' },
    { code: '+46', country: 'Suède', flag: '🇸🇪' },
    { code: '+47', country: 'Norvège', flag: '🇳🇴' },
    { code: '+48', country: 'Pologne', flag: '🇵🇱' },
    { code: '+49', country: 'Allemagne', flag: '🇩🇪' },
    { code: '+500', country: 'Îles Malouines', flag: '🇫🇰' },
    { code: '+501', country: 'Belize', flag: '🇧🇿' },
    { code: '+502', country: 'Guatemala', flag: '🇬🇹' },
    { code: '+503', country: 'El Salvador', flag: '🇸🇻' },
    { code: '+504', country: 'Honduras', flag: '🇭🇳' },
    { code: '+505', country: 'Nicaragua', flag: '🇳🇮' },
    { code: '+506', country: 'Costa Rica', flag: '🇨🇷' },
    { code: '+507', country: 'Panama', flag: '🇵🇦' },
    { code: '+508', country: 'Saint-Pierre-et-Miquelon', flag: '🇵🇲' },
    { code: '+509', country: 'Haïti', flag: '🇭🇹' },
    { code: '+51', country: 'Pérou', flag: '🇵🇪' },
    { code: '+52', country: 'Mexique', flag: '🇲🇽' },
    { code: '+53', country: 'Cuba', flag: '🇨🇺' },
    { code: '+54', country: 'Argentine', flag: '🇦🇷' },
    { code: '+55', country: 'Brésil', flag: '🇧🇷' },
    { code: '+56', country: 'Chili', flag: '🇨🇱' },
    { code: '+57', country: 'Colombie', flag: '🇨🇴' },
    { code: '+58', country: 'Venezuela', flag: '🇻🇪' },
    { code: '+590', country: 'Guadeloupe', flag: '🇬🇵' },
    { code: '+591', country: 'Bolivie', flag: '🇧🇴' },
    { code: '+592', country: 'Guyana', flag: '🇬🇾' },
    { code: '+593', country: 'Équateur', flag: '🇪🇨' },
    { code: '+594', country: 'Guyane française', flag: '🇬🇫' },
    { code: '+595', country: 'Paraguay', flag: '🇵🇾' },
    { code: '+596', country: 'Martinique', flag: '🇲🇶' },
    { code: '+597', country: 'Suriname', flag: '🇸🇷' },
    { code: '+598', country: 'Uruguay', flag: '🇺🇾' },
    { code: '+599', country: 'Antilles néerlandaises', flag: '🇧🇶' },
    { code: '+60', country: 'Malaisie', flag: '🇲🇾' },
    { code: '+61', country: 'Australie', flag: '🇦🇺' },
    { code: '+62', country: 'Indonésie', flag: '🇮🇩' },
    { code: '+63', country: 'Philippines', flag: '🇵🇭' },
    { code: '+64', country: 'Nouvelle-Zélande', flag: '🇳🇿' },
    { code: '+65', country: 'Singapour', flag: '🇸🇬' },
    { code: '+66', country: 'Thaïlande', flag: '🇹🇭' },
    { code: '+670', country: 'Timor oriental', flag: '🇹🇱' },
    { code: '+672', country: 'Territoire antarctique australien', flag: '🇦🇶' },
    { code: '+673', country: 'Brunei', flag: '🇧🇳' },
    { code: '+674', country: 'Nauru', flag: '🇳🇷' },
    { code: '+675', country: 'Papouasie-Nouvelle-Guinée', flag: '🇵🇬' },
    { code: '+676', country: 'Tonga', flag: '🇹🇴' },
    { code: '+677', country: 'Îles Salomon', flag: '🇸🇧' },
    { code: '+678', country: 'Vanuatu', flag: '🇻🇺' },
    { code: '+679', country: 'Fidji', flag: '🇫🇯' },
    { code: '+680', country: 'Palaos', flag: '🇵🇼' },
    { code: '+681', country: 'Wallis-et-Futuna', flag: '🇼🇫' },
    { code: '+682', country: 'Îles Cook', flag: '🇨🇰' },
    { code: '+683', country: 'Niue', flag: '🇳🇺' },
    { code: '+685', country: 'Samoa', flag: '🇼🇸' },
    { code: '+686', country: 'Kiribati', flag: '🇰🇮' },
    { code: '+687', country: 'Nouvelle-Calédonie', flag: '🇳🇨' },
    { code: '+688', country: 'Tuvalu', flag: '🇹🇻' },
    { code: '+689', country: 'Polynésie française', flag: '🇵🇫' },
    { code: '+690', country: 'Tokelau', flag: '🇹🇰' },
    { code: '+691', country: 'Micronésie', flag: '🇫🇲' },
    { code: '+692', country: 'Îles Marshall', flag: '🇲🇭' },
    { code: '+7', country: 'Russie', flag: '🇷🇺' },
    { code: '+800', country: 'Service international', flag: '🌐' },
    { code: '+808', country: 'Service international partagé', flag: '🌐' },
    { code: '+81', country: 'Japon', flag: '🇯🇵' },
    { code: '+82', country: 'Corée du Sud', flag: '🇰🇷' },
    { code: '+84', country: 'Vietnam', flag: '🇻🇳' },
    { code: '+850', country: 'Corée du Nord', flag: '🇰🇵' },
    { code: '+852', country: 'Hong Kong', flag: '🇭🇰' },
    { code: '+853', country: 'Macao', flag: '🇲🇴' },
    { code: '+855', country: 'Cambodge', flag: '🇰🇭' },
    { code: '+856', country: 'Laos', flag: '🇱🇦' },
    { code: '+86', country: 'Chine', flag: '🇨🇳' },
    { code: '+870', country: 'Service maritime', flag: '🚢' },
    { code: '+871', country: 'Service maritime', flag: '🚢' },
    { code: '+872', country: 'Service maritime', flag: '🚢' },
    { code: '+873', country: 'Service maritime', flag: '🚢' },
    { code: '+874', country: 'Service maritime', flag: '🚢' },
    { code: '+880', country: 'Bangladesh', flag: '🇧🇩' },
    { code: '+881', country: 'Service mobile par satellite', flag: '📡' },
    { code: '+882', country: 'Service mobile par satellite', flag: '📡' },
    { code: '+883', country: 'Service mobile par satellite', flag: '📡' },
    { code: '+886', country: 'Taïwan', flag: '🇹🇼' },
    { code: '+90', country: 'Turquie', flag: '🇹🇷' },
    { code: '+91', country: 'Inde', flag: '🇮🇳' },
    { code: '+92', country: 'Pakistan', flag: '🇵🇰' },
    { code: '+93', country: 'Afghanistan', flag: '🇦🇫' },
    { code: '+94', country: 'Sri Lanka', flag: '🇱🇰' },
    { code: '+95', country: 'Myanmar', flag: '🇲🇲' },
    { code: '+960', country: 'Maldives', flag: '🇲🇻' },
    { code: '+961', country: 'Liban', flag: '🇱🇧' },
    { code: '+962', country: 'Jordanie', flag: '🇯🇴' },
    { code: '+963', country: 'Syrie', flag: '🇸🇾' },
    { code: '+964', country: 'Irak', flag: '🇮🇶' },
    { code: '+965', country: 'Koweït', flag: '🇰🇼' },
    { code: '+966', country: 'Arabie Saoudite', flag: '🇸🇦' },
    { code: '+967', country: 'Yémen', flag: '🇾🇪' },
    { code: '+968', country: 'Oman', flag: '🇴🇲' },
    { code: '+970', country: 'Palestine', flag: '🇵🇸' },
    { code: '+971', country: 'Émirats Arabes Unis', flag: '🇦🇪' },
    { code: '+972', country: 'Israël', flag: '🇮🇱' },
    { code: '+973', country: 'Bahreïn', flag: '🇧🇭' },
    { code: '+974', country: 'Qatar', flag: '🇶🇦' },
    { code: '+975', country: 'Bhoutan', flag: '🇧🇹' },
    { code: '+976', country: 'Mongolie', flag: '🇲🇳' },
    { code: '+977', country: 'Népal', flag: '🇳🇵' },
    { code: '+98', country: 'Iran', flag: '🇮🇷' },
    { code: '+992', country: 'Tadjikistan', flag: '🇹🇯' },
    { code: '+993', country: 'Turkménistan', flag: '🇹🇲' },
    { code: '+994', country: 'Azerbaïdjan', flag: '🇦🇿' },
    { code: '+995', country: 'Géorgie', flag: '🇬🇪' },
    { code: '+996', country: 'Kirghizistan', flag: '🇰🇬' },
    { code: '+998', country: 'Ouzbékistan', flag: '🇺🇿' },
    { code: '+999', country: 'Service international', flag: '🌐' }
  ];
  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  const [parentDropdownOpen, setParentDropdownOpen] = useState(false);
  const [patientDropdownOpen, setPatientDropdownOpen] = useState(false);
  const [parentCurrentPageMui, setParentCurrentPageMui] = useState(1);
  const [patientCurrentPage, setPatientCurrentPage] = useState(1);
  const [parentsPerPage] = useState(9);
  const [patientsPerPage] = useState(9);

  // Material-UI Modal computed values
  const filteredParentsMui = parents.filter(parent => 
    parent.fullName.toLowerCase().includes(parentSearchTermMui.toLowerCase()) ||
    parent.phoneNumber.includes(parentSearchTermMui)
  ).sort((a, b) => b._id.localeCompare(a._id)); // Newest first

  const filteredPatientsMui = patients.filter(patient => 
    `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
    patient.gender.toLowerCase().includes(patientSearchTerm.toLowerCase())
  );

  const parentIndexOfLast = parentCurrentPageMui * parentsPerPage;
  const parentIndexOfFirst = parentIndexOfLast - parentsPerPage;
  const currentParentsMui = filteredParentsMui.slice(parentIndexOfFirst, parentIndexOfLast);
  const totalParentPagesMui = Math.ceil(filteredParentsMui.length / parentsPerPage);

  const patientIndexOfLast = patientCurrentPage * patientsPerPage;
  const patientIndexOfFirst = patientIndexOfLast - patientsPerPage;
  const currentPatientsMui = filteredPatientsMui.slice(patientIndexOfFirst, patientIndexOfLast);
  const totalPatientPages = Math.ceil(filteredPatientsMui.length / patientsPerPage);

  // Material-UI Modal style
  const modalStyle = {
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

  // Material-UI Modal handlers
  const handleMuiModalOpen = () => {
    setMuiModalOpen(true);
    setMuiActiveStep(0);
    setMuiFlowType(null);
    setMuiParentSelection(null);
    setMuiPatientSelection(null);
    // Don't reset date and time - preserve them from calendar click
    setMuiFormData(prev => ({
      ...prev,
      parentId: '',
      patientId: '',
      type: 'consultation',
      status: 'confirmed',
      notes: ''
    }));
    setParentSearchTermMui('');
    setPatientSearchTerm('');
    setParentDropdownOpen(false);
    setPatientDropdownOpen(false);
    setParentCurrentPageMui(1);
    setPatientCurrentPage(1);
  };

  const handleMuiModalClose = () => {
    setMuiModalOpen(false);
    setMuiActiveStep(0);
    setMuiFlowType(null);
    setMuiParentSelection(null);
    setMuiPatientSelection(null);
    setMuiFormData({
      parentId: '',
      patientId: '',
      date: '',
      time: '',
      type: 'consultation',
      status: 'confirmed',
      notes: ''
    });
    setParentSearchTermMui('');
    setPatientSearchTerm('');
    setParentDropdownOpen(false);
    setPatientDropdownOpen(false);
    setParentCurrentPageMui(1);
    setPatientCurrentPage(1);
    setParentCountryCode('+212'); // Reset to Morocco default
  };

  const handleMuiFlowTypeSelect = (flowType) => {
    setMuiFlowType(flowType);
    setMuiActiveStep(1);
  };

  const handleMuiParentSelect = (parent) => {
    setMuiParentSelection(parent);
    setMuiFormData(prev => ({ ...prev, parentId: parent._id }));
    // Don't automatically advance to next step - let user click "Suivant"
  };

  const handleMuiNext = () => {
    if (muiActiveStep === 0) {
      // After selecting flow type, go to parent selection or patient creation
      if (muiFlowType === 'new') {
        setMuiActiveStep(2); // Skip to patient creation form
      } else {
        setMuiActiveStep(1); // Go to parent selection
      }
    } else if (muiActiveStep === 1) {
      // After selecting existing parent, go to patient selection
      setMuiActiveStep(2);
    } else if (muiActiveStep === 2) {
      // After patient selection/creation, go to appointment details
      setMuiActiveStep(3);
    }
  };

  const handleMuiBack = () => {
    if (muiActiveStep > 0) {
      setMuiActiveStep(muiActiveStep - 1);
    }
  };

  const handleMuiFormChange = (field, value) => {
    setMuiFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleParentSearchChange = (value) => {
    setParentSearchTermMui(value);
    setParentCurrentPageMui(1);
  };

  const handlePatientSearchChange = (value) => {
    setPatientSearchTerm(value);
    setPatientCurrentPage(1);
  };

  const handleParentSelect = (parentId, parentName) => {
    handleMuiFormChange('parentId', parentId);
    setParentSearchTermMui(parentName);
    setParentDropdownOpen(false);
  };

  const handlePatientSelect = (patientId, patientName) => {
    handleMuiFormChange('patientId', patientId);
    setPatientSearchTerm(patientName);
    setPatientDropdownOpen(false);
  };

  const getSelectedParentDisplay = () => {
    if (muiFormData.parentId) {
      const selectedParent = parents.find(p => p._id === muiFormData.parentId);
      return selectedParent ? `${selectedParent.fullName} - ${selectedParent.phoneNumber}` : '';
    }
    return '';
  };

  const getSelectedPatientDisplay = () => {
    if (muiFormData.patientId) {
      const selectedPatient = patients.find(p => p._id === muiFormData.patientId);
      return selectedPatient ? `${selectedPatient.firstName} ${selectedPatient.lastName}` : '';
    }
    return '';
  };

  // Click outside handler for dropdowns
  const handleClickOutside = (event) => {
    if (parentSearchTermMui && !event.target.closest('.parent-dropdown-container')) {
      if (!muiFormData.parentId) {
        setParentSearchTermMui('');
      }
    }
    
    if (parentDropdownOpen && !event.target.closest('.parent-dropdown-container')) {
      setParentDropdownOpen(false);
    }

    if (patientSearchTerm && !event.target.closest('.patient-dropdown-container')) {
      if (!muiFormData.patientId) {
        setPatientSearchTerm('');
      }
    }
    
    if (patientDropdownOpen && !event.target.closest('.patient-dropdown-container')) {
      setPatientDropdownOpen(false);
    }
  };

  // Add click outside listener
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [parentSearchTermMui, parentDropdownOpen, patientSearchTerm, patientDropdownOpen]);

  // Material-UI appointment creation handler
  const handleMuiAppointmentSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Validate required fields - same logic as old modal
      if (!muiFormData.date || !muiFormData.time || !muiFormData.type) {
        toast.error('Veuillez remplir tous les champs obligatoires');
        return;
      }

      // For existing flow, check patientId. For new flow, check patient form fields
      if (muiFlowType === 'existing' && !muiFormData.patientId) {
        toast.error('Veuillez sélectionner un patient');
        return;
      }

      if (muiFlowType === 'new') {
        // Validate parent fields
        if (!muiFormData.parentName || !muiFormData.parentPhone) {
          toast.error('Veuillez remplir tous les champs obligatoires du parent');
          return;
        }
        
        // Validate phone number format - allow international numbers
        const phoneWithCountryCode = parentCountryCode + muiFormData.parentPhone;
        const phoneRegex = /^\+[\d\s\-\(\)]{7,}$/;
        if (!phoneRegex.test(phoneWithCountryCode.trim())) {
          toast.error('Veuillez saisir un numéro de téléphone valide (format international accepté)');
          return;
        }
        
        // Validate email if provided
        if (muiFormData.parentEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(muiFormData.parentEmail)) {
          toast.error('Veuillez saisir une adresse e-mail valide');
          return;
        }
        
        // Validate birth date if provided
        if (muiFormData.parentBirthDate) {
          const birthDate = new Date(muiFormData.parentBirthDate);
          const today = new Date();
          if (birthDate > today) {
            toast.error('La date de naissance ne peut pas être dans le futur');
            return;
          }
        }
        
        // Validate patient fields
        if (!muiFormData.patientFirstName || !muiFormData.patientLastName || !muiFormData.patientBirthDate || !muiFormData.patientGender) {
          toast.error('Veuillez remplir tous les champs du patient');
          return;
        }
      }

      // Check for time conflicts
      const conflicts = checkTimeConflicts(muiFormData.date, muiFormData.time, muiFormData.type);
      if (conflicts.length > 0) {
        toast.error('Il y a un conflit d\'horaire avec un autre rendez-vous');
        return;
      }

      let patientId = muiFormData.patientId;

      // If creating new parent and patient
      if (muiFlowType === 'new') {
        // Create parent first
        const parentData = {
          fullName: muiFormData.parentName,
          phoneNumber: parentCountryCode + muiFormData.parentPhone,
          email: muiFormData.parentEmail || '',
          address: muiFormData.parentAddress || '',
          gender: muiFormData.parentGender || 'other',
          birthDate: muiFormData.parentBirthDate ? new Date(muiFormData.parentBirthDate).toISOString() : new Date('1980-01-01T00:00:00.000Z').toISOString()
        };

        console.log('Parent data being sent to createParent:', parentData);
        console.log('muiFormData state:', muiFormData);

        const newParent = await createParent(parentData);
        if (!newParent) {
          throw new Error('Échec de la création du parent');
        }

        // Create patient
        const patientData = {
          firstName: muiFormData.patientFirstName,
          lastName: muiFormData.patientLastName,
          birthDate: muiFormData.patientBirthDate,
          gender: muiFormData.patientGender,
          weight: muiFormData.patientWeight || null,
          height: muiFormData.patientHeight || null,
          notes: muiFormData.patientNotes || '',
          parentId: newParent._id
        };

        const newPatient = await createPatient(patientData);
        if (!newPatient) {
          throw new Error('Échec de la création du patient');
        }
        patientId = newPatient._id;
      }

      // Create appointment data - same structure as old modal
      const appointmentData = {
        date: muiFormData.date,
        time: muiFormData.time,
        type: muiFormData.type,
        status: muiFormData.status,
        notes: muiFormData.notes || '',
        patientId: patientId
      };

      console.log('Sending appointment data:', appointmentData);
      console.log('Data types:', {
        date: typeof appointmentData.date,
        time: typeof appointmentData.time,
        type: typeof appointmentData.type,
        status: typeof appointmentData.status,
        notes: typeof appointmentData.notes,
        patientId: typeof appointmentData.patientId
      });

      const response = await createAppointment(appointmentData);

      if (!response) {
        throw new Error('Échec de la création du rendez-vous');
      }
      
      toast.success('Rendez-vous créé avec succès !', {
        position: "top-right",
        autoClose: 3000,
      });

      handleMuiModalClose();
      const updatedAppointments = await getAppointments();
      setAppointments(updatedAppointments);

    } catch (error) {
      console.error('Error creating appointment:', error);
      toast.error(`Erreur lors de la création du rendez-vous: ${error.message}`, {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [appts, pts, prnts] = await Promise.all([
          getAppointments(),
          getPatientTable(),
          getParents()
        ]);
        console.log('Existing appointments:', appts);
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
    } else if (!/^\+[\d\s\-\(\)]{7,}$/.test(newParentForm.phoneNumber.trim())) {
      errors.phoneNumber = 'Veuillez saisir un numéro de téléphone valide (format international accepté)';
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
      
      // Format the parent data to match API expectations
      const parentData = {
        ...newParentForm,
        birthDate: newParentForm.birthDate ? new Date(newParentForm.birthDate).toISOString() : new Date('1980-01-01T00:00:00.000Z').toISOString()
      };
      
      const parent = await createParent(parentData);
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
      
      console.log('Old modal sending appointment data:', appointmentData);
      
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
    // Pre-fill the Material-UI modal with the selected date and time
    setMuiFormData({
      ...muiFormData,
      date: date.format('YYYY-MM-DD'),
      time
    });
    // Open the Material-UI modal and start from step 0 (Parent Selection)
    setMuiModalOpen(true);
    setMuiActiveStep(0); // Start from Parent Selection step
    setMuiFlowType(null);
    setMuiParentSelection(null);
    setMuiPatientSelection(null);
    setParentSearchTermMui('');
    setPatientSearchTerm('');
    setParentDropdownOpen(false);
    setPatientDropdownOpen(false);
    setParentCurrentPageMui(1);
    setPatientCurrentPage(1);
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  type="date"
                  label="Date de naissance"
                  value={newParentForm.birthDate}
                  onChange={(e) => handleParentFormChange('birthDate', e.target.value)}
                  onBlur={() => handleFieldBlur('parent', 'birthDate')}
                  error={!!parentErrors.birthDate}
                />
                {parentErrors.birthDate && (
                  <Typography variant="small" color="red" className="mt-1">
                    {parentErrors.birthDate}
                  </Typography>
                )}
              </div>
              <div>
                <Select
                  label="Genre"
                  value={newParentForm.gender}
                  onChange={(value) => handleParentFormChange('gender', value)}
                  error={!!parentErrors.gender}
                >
                  <Option value="male">Homme</Option>
                  <Option value="female">Femme</Option>
                  <Option value="other">Autre</Option>
                </Select>
                {parentErrors.gender && (
                  <Typography variant="small" color="red" className="mt-1">
                    {parentErrors.gender}
                  </Typography>
                )}
              </div>
            </div>
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
        <div className="flex gap-2">
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
          <Button
            className="flex items-center gap-2"
            onClick={handleMuiModalOpen}
          >
            <UserPlus size={18} /> Nouveau Rendez-vous (MUI)
          </Button>
        </div>
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

      {/* Material-UI Appointment Creation Modal */}
      <Modal
        open={muiModalOpen}
        onClose={handleMuiModalClose}
        aria-labelledby="mui-modal-title"
        aria-describedby="mui-modal-description"
      >
        <Box sx={modalStyle}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, pb: 2, borderBottom: '1px solid #e5e7eb' }}>
            <MuiTypography variant="h5" component="h2" sx={{ fontWeight: 'bold', color: '#1f2937' }}>
              Nouveau Rendez-vous
            </MuiTypography>
            <MuiIconButton onClick={handleMuiModalClose} sx={{ color: '#6b7280' }}>
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </MuiIconButton>
          </Box>

          {/* Stepper */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
              {[
                { label: 'Parent', icon: '👤', active: muiActiveStep >= 0 },
                { label: 'Patient', icon: '👶', active: muiActiveStep >= 1 },
                { label: 'Rendez-vous', icon: '🕐', active: muiActiveStep >= 2 }
              ].map((step, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: step.active ? '#3b82f6' : '#e5e7eb',
                      color: step.active ? 'white' : '#6b7280',
                      fontWeight: 'bold',
                      fontSize: '14px'
                    }}
                  >
                    {step.icon}
                  </Box>
                  <MuiTypography
                    variant="body2"
                    sx={{
                      ml: 1,
                      color: step.active ? '#3b82f6' : '#6b7280',
                      fontWeight: step.active ? 'bold' : 'normal'
                    }}
                  >
                    {step.label}
                  </MuiTypography>
                  {index < 2 && (
                    <Box
                      sx={{
                        width: 40,
                        height: 2,
                        bgcolor: step.active ? '#3b82f6' : '#e5e7eb',
                        mx: 2
                      }}
                    />
                  )}
                </Box>
              ))}
            </Box>
          </Box>

          {/* Step Content */}
          {muiActiveStep === 0 && (
            <Box>
              <MuiTypography variant="h6" sx={{ mb: 3, textAlign: 'center', color: '#1f2937' }}>
                Sélection du Parent
              </MuiTypography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                <Box
                  onClick={() => handleMuiFlowTypeSelect('existing')}
                  sx={{
                    border: '1px solid #d1d5db',
                    borderRadius: 2,
                    p: 3,
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: '#3b82f6',
                      bgcolor: '#f8fafc'
                    }
                  }}
                >
                  <Box sx={{ fontSize: '2rem', mb: 2 }}>👤</Box>
                  <MuiTypography variant="h6" sx={{ fontWeight: 'bold', color: '#1f2937' }}>
                    PARENT EXISTANT
                  </MuiTypography>
                </Box>
                
                <Box
                  onClick={() => handleMuiFlowTypeSelect('new')}
                  sx={{
                    border: '1px solid #d1d5db',
                    borderRadius: 2,
                    p: 3,
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: '#3b82f6',
                      bgcolor: '#f8fafc'
                    }
                  }}
                >
                  <Box sx={{ fontSize: '2rem', mb: 2 }}>👤➕</Box>
                  <MuiTypography variant="h6" sx={{ fontWeight: 'bold', color: '#1f2937' }}>
                    NOUVEAU PARENT
                  </MuiTypography>
                </Box>
              </Box>
            </Box>
          )}

          {muiActiveStep === 1 && (
            <Box>
              <MuiTypography variant="h6" sx={{ mb: 3, color: '#1f2937' }}>
                {muiFlowType === 'existing' ? 'Sélectionner un Parent' : 'Créer un Nouveau Parent'}
              </MuiTypography>
              
              {muiFlowType === 'existing' ? (
                <Box>
                  {/* Parent Search */}
                  <Box sx={{ mb: 3 }}>
                    <TextField
                      label="Rechercher un parent..."
                      variant="outlined"
                      fullWidth
                      value={parentSearchTermMui}
                      onChange={(e) => setParentSearchTermMui(e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { borderColor: '#d1d5db' },
                          '&:hover fieldset': { borderColor: '#3b82f6' },
                          '&.Mui-focused fieldset': { borderColor: '#3b82f6' }
                        }
                      }}
                    />
                  </Box>
                  
                  {/* Parent Cards Grid */}
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, 
                    gap: 2,
                    mb: 3
                  }}>
                    {currentParentsMui.map((parent) => (
                      <Box
                        key={parent._id}
                        onClick={() => handleMuiParentSelect(parent)}
                        sx={{
                          border: '1px solid #d1d5db',
                          borderRadius: 2,
                          p: 2,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          '&:hover': {
                            borderColor: '#3b82f6',
                            bgcolor: '#f8fafc',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          },
                          ...(muiParentSelection?._id === parent._id && {
                            borderColor: '#3b82f6',
                            bgcolor: '#eff6ff',
                            boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.2)'
                          })
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Box sx={{ 
                            width: 32, 
                            height: 32, 
                            borderRadius: '50%', 
                            bgcolor: '#3b82f6', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: 'bold'
                          }}>
                            {parent.fullName.charAt(0).toUpperCase()}
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <MuiTypography variant="body1" sx={{ fontWeight: 'medium', color: '#1f2937' }}>
                              {parent.fullName}
                            </MuiTypography>
                            <MuiTypography variant="body2" sx={{ color: '#6b7280', fontSize: '12px' }}>
                              {parent.phoneNumber}
                            </MuiTypography>
                          </Box>
                          {muiParentSelection?._id === parent._id && (
                            <Box sx={{ 
                              width: 20, 
                              height: 20, 
                              borderRadius: '50%', 
                              bgcolor: '#22c55e', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              color: 'white',
                              fontSize: '12px'
                            }}>
                              ✓
                            </Box>
                          )}
                        </Box>
                        
                        {parent.email && (
                          <MuiTypography variant="body2" sx={{ color: '#6b7280', fontSize: '12px', mt: 1 }}>
                            📧 {parent.email}
                          </MuiTypography>
                        )}
                        
                        {parent.address && (
                          <MuiTypography variant="body2" sx={{ color: '#6b7280', fontSize: '12px', mt: 0.5 }}>
                            📍 {parent.address}
                          </MuiTypography>
                        )}
                      </Box>
                    ))}
                  </Box>
                  
                  {/* No results message */}
                  {currentParentsMui.length === 0 && (
                    <Box sx={{ 
                      textAlign: 'center', 
                      py: 4,
                      color: '#6b7280'
                    }}>
                      <Box sx={{ fontSize: '3rem', mb: 2 }}>🔍</Box>
                      <MuiTypography variant="h6" sx={{ mb: 1 }}>
                        Aucun parent trouvé
                      </MuiTypography>
                      <MuiTypography variant="body2">
                        Essayez de modifier vos critères de recherche
                      </MuiTypography>
                    </Box>
                  )}
                  
                  {/* Parent Pagination */}
                  {totalParentPagesMui > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, mt: 3 }}>
                      <MuiButton
                        variant="text"
                        size="small"
                        disabled={parentCurrentPageMui === 1}
                        onClick={() => setParentCurrentPageMui(parentCurrentPageMui - 1)}
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Précédent
                      </MuiButton>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {Array.from({ length: totalParentPagesMui }, (_, index) => index + 1).map(pageNumber => (
                          <MuiButton
                            key={pageNumber}
                            variant={parentCurrentPageMui === pageNumber ? "contained" : "text"}
                            size="small"
                            onClick={() => setParentCurrentPageMui(pageNumber)}
                            sx={{ 
                              minWidth: 32, 
                              height: 32, 
                              p: 0,
                              fontSize: '12px'
                            }}
                          >
                            {pageNumber}
                          </MuiButton>
                        ))}
                      </Box>
                      
                      <MuiButton
                        variant="text"
                        size="small"
                        disabled={parentCurrentPageMui === totalParentPagesMui}
                        onClick={() => setParentCurrentPageMui(parentCurrentPageMui + 1)}
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        Suivant
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </MuiButton>
                    </Box>
                  )}
                  
                  {/* Selected Parent Info */}
                  {muiParentSelection && (
                    <Box sx={{ 
                      mt: 3, 
                      p: 2, 
                      bgcolor: '#eff6ff', 
                      borderRadius: 2, 
                      border: '1px solid #dbeafe' 
                    }}>
                      <MuiTypography variant="body2" sx={{ color: '#1e40af', fontWeight: 'medium', mb: 1 }}>
                        Parent sélectionné :
                      </MuiTypography>
                      <MuiTypography variant="body1" sx={{ fontWeight: 'medium' }}>
                        {muiParentSelection.fullName} - {muiParentSelection.phoneNumber}
                      </MuiTypography>
                    </Box>
                  )}
                </Box>
              ) : (
                <Box>
                  {/* New Parent Form */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                    <TextField
                      label="Nom complet *"
                      variant="outlined"
                      fullWidth
                      value={muiFormData.parentName || ''}
                      onChange={(e) => setMuiFormData(prev => ({ ...prev, parentName: e.target.value }))}
                    />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <FormControl sx={{ minWidth: 120 }}>
                        <InputLabel>Pays</InputLabel>
                        <MuiSelect
                          value={parentCountryCode}
                          onChange={(e) => setParentCountryCode(e.target.value)}
                          label="Pays"
                          size="small"
                        >
                          {countryCodes.map((country) => (
                            <MenuItem key={country.code} value={country.code}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <span>{country.flag}</span>
                                <span>{country.code}</span>
                              </Box>
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                      <TextField
                        label="Numéro de téléphone *"
                        variant="outlined"
                        fullWidth
                        value={muiFormData.parentPhone || ''}
                        onChange={(e) => setMuiFormData(prev => ({ ...prev, parentPhone: e.target.value }))}
                        placeholder="6 12 34 56 78"
                      />
                    </Box>
                    <TextField
                      label="Email"
                      variant="outlined"
                      fullWidth
                      value={muiFormData.parentEmail || ''}
                      onChange={(e) => setMuiFormData(prev => ({ ...prev, parentEmail: e.target.value }))}
                    />
                    <TextField
                      label="Adresse"
                      variant="outlined"
                      fullWidth
                      value={muiFormData.parentAddress || ''}
                      onChange={(e) => setMuiFormData(prev => ({ ...prev, parentAddress: e.target.value }))}
                    />
                    <TextField
                      label="Date de naissance"
                      type="date"
                      variant="outlined"
                      fullWidth
                      value={muiFormData.parentBirthDate || ''}
                      onChange={(e) => setMuiFormData(prev => ({ ...prev, parentBirthDate: e.target.value }))}
                      inputProps={{
                        max: new Date().toISOString().split('T')[0]
                      }}
                    />
                    <FormControl fullWidth>
                      <InputLabel>Genre</InputLabel>
                      <MuiSelect
                        value={muiFormData.parentGender || 'other'}
                        onChange={(e) => setMuiFormData(prev => ({ ...prev, parentGender: e.target.value }))}
                        label="Genre"
                      >
                        <MenuItem value="male">Homme</MenuItem>
                        <MenuItem value="female">Femme</MenuItem>
                        <MenuItem value="other">Autre</MenuItem>
                      </MuiSelect>
                    </FormControl>
                  </Box>
                </Box>
              )}
            </Box>
          )}

          {muiActiveStep === 2 && (
            <Box>
              <MuiTypography variant="h6" sx={{ mb: 3, color: '#1f2937' }}>
                {muiFlowType === 'new' ? 'Créer un Nouveau Patient' : 'Sélectionner un Patient'}
              </MuiTypography>
              
              {muiFlowType === 'new' ? (
                // Patient Creation Form
                <Box>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                    <TextField
                      label="Prénom *"
                      variant="outlined"
                      fullWidth
                      value={muiFormData.patientFirstName || ''}
                      onChange={(e) => setMuiFormData(prev => ({ ...prev, patientFirstName: e.target.value }))}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { borderColor: '#d1d5db' },
                          '&:hover fieldset': { borderColor: '#3b82f6' },
                          '&.Mui-focused fieldset': { borderColor: '#3b82f6' }
                        }
                      }}
                    />
                    
                    <TextField
                      label="Nom de Famille *"
                      variant="outlined"
                      fullWidth
                      value={muiFormData.patientLastName || ''}
                      onChange={(e) => setMuiFormData(prev => ({ ...prev, patientLastName: e.target.value }))}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { borderColor: '#d1d5db' },
                          '&:hover fieldset': { borderColor: '#3b82f6' },
                          '&.Mui-focused fieldset': { borderColor: '#3b82f6' }
                        }
                      }}
                    />
                    
                    <TextField
                      label="Date de Naissance *"
                      type="date"
                      variant="outlined"
                      fullWidth
                      value={muiFormData.patientBirthDate || ''}
                      onChange={(e) => setMuiFormData(prev => ({ ...prev, patientBirthDate: e.target.value }))}
                      inputProps={{
                        max: new Date().toISOString().split('T')[0]
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { borderColor: '#d1d5db' },
                          '&:hover fieldset': { borderColor: '#3b82f6' },
                          '&.Mui-focused fieldset': { borderColor: '#3b82f6' }
                        }
                      }}
                    />
                    
                    <FormControl fullWidth>
                      <InputLabel>Sexe *</InputLabel>
                      <MuiSelect
                        value={muiFormData.patientGender || ''}
                        onChange={(e) => setMuiFormData(prev => ({ ...prev, patientGender: e.target.value }))}
                        label="Sexe *"
                      >
                        <MenuItem value="male">Masculin</MenuItem>
                        <MenuItem value="female">Féminin</MenuItem>
                      </MuiSelect>
                    </FormControl>
                  </Box>
                  
                  {/* Additional Patient Fields */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mt: 2 }}>
                    <TextField
                      label="Poids (kg)"
                      variant="outlined"
                      fullWidth
                      type="number"
                      value={muiFormData.patientWeight || ''}
                      onChange={(e) => setMuiFormData(prev => ({ ...prev, patientWeight: e.target.value }))}
                      inputProps={{
                        min: 0,
                        step: 0.1
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { borderColor: '#d1d5db' },
                          '&:hover fieldset': { borderColor: '#3b82f6' },
                          '&.Mui-focused fieldset': { borderColor: '#3b82f6' }
                        }
                      }}
                    />
                    
                    <TextField
                      label="Taille (cm)"
                      variant="outlined"
                      fullWidth
                      type="number"
                      value={muiFormData.patientHeight || ''}
                      onChange={(e) => setMuiFormData(prev => ({ ...prev, patientHeight: e.target.value }))}
                      inputProps={{
                        min: 0,
                        step: 0.1
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
                  
                  <TextField
                    label="Notes"
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={3}
                    value={muiFormData.patientNotes || ''}
                    onChange={(e) => setMuiFormData(prev => ({ ...prev, patientNotes: e.target.value }))}
                    placeholder="Notes additionnelles sur le patient..."
                    sx={{
                      mt: 2,
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: '#d1d5db' },
                        '&:hover fieldset': { borderColor: '#3b82f6' },
                        '&.Mui-focused fieldset': { borderColor: '#3b82f6' }
                      }
                    }}
                  />
                </Box>
              ) : (
                // Patient Selection with Cards
                <Box>
                  {/* Patient Search */}
                  <Box sx={{ mb: 3 }}>
                    <TextField
                      label="Rechercher un patient..."
                      variant="outlined"
                      fullWidth
                      value={patientSearchTerm}
                      onChange={(e) => setPatientSearchTerm(e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { borderColor: '#d1d5db' },
                          '&:hover fieldset': { borderColor: '#3b82f6' },
                          '&.Mui-focused fieldset': { borderColor: '#3b82f6' }
                        }
                      }}
                    />
                  </Box>
                  
                  {/* Patient Cards Grid */}
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, 
                    gap: 2,
                    mb: 3
                  }}>
                    {currentPatientsMui.map((patient) => (
                      <Box
                        key={patient._id}
                        onClick={() => {
                          setMuiPatientSelection(patient);
                          handleMuiFormChange('patientId', patient._id);
                        }}
                        sx={{
                          border: '1px solid #d1d5db',
                          borderRadius: 2,
                          p: 2,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          '&:hover': {
                            borderColor: '#3b82f6',
                            bgcolor: '#f8fafc',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          },
                          ...(muiPatientSelection?._id === patient._id && {
                            borderColor: '#3b82f6',
                            bgcolor: '#eff6ff',
                            boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.2)'
                          })
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Box sx={{ 
                            width: 32, 
                            height: 32, 
                            borderRadius: '50%', 
                            bgcolor: patient.gender === 'male' ? '#3b82f6' : '#ec4899', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: 'bold'
                          }}>
                            {patient.firstName.charAt(0).toUpperCase()}
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <MuiTypography variant="body1" sx={{ fontWeight: 'medium', color: '#1f2937' }}>
                              {patient.firstName} {patient.lastName}
                            </MuiTypography>
                            <MuiTypography variant="body2" sx={{ color: '#6b7280', fontSize: '12px' }}>
                              {patient.gender === 'male' ? 'Masculin' : 'Féminin'} • {dayjs(patient.birthDate).format('DD/MM/YYYY')}
                            </MuiTypography>
                          </Box>
                          {muiPatientSelection?._id === patient._id && (
                            <Box sx={{ 
                              width: 20, 
                              height: 20, 
                              borderRadius: '50%', 
                              bgcolor: '#22c55e', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              color: 'white',
                              fontSize: '12px'
                            }}>
                              ✓
                            </Box>
                          )}
                        </Box>
                        
                        {patient.birthDate && (
                          <MuiTypography variant="body2" sx={{ color: '#6b7280', fontSize: '12px', mt: 1 }}>
                            🎂 {dayjs(patient.birthDate).fromNow()}
                          </MuiTypography>
                        )}
                        
                        {patient.weight && (
                          <MuiTypography variant="body2" sx={{ color: '#6b7280', fontSize: '12px', mt: 0.5 }}>
                            ⚖️ {patient.weight} kg
                          </MuiTypography>
                        )}
                        
                        {patient.height && (
                          <MuiTypography variant="body2" sx={{ color: '#6b7280', fontSize: '12px', mt: 0.5 }}>
                            📏 {patient.height} cm
                          </MuiTypography>
                        )}
                      </Box>
                    ))}
                  </Box>
                  
                  {/* No results message */}
                  {currentPatientsMui.length === 0 && (
                    <Box sx={{ 
                      textAlign: 'center', 
                      py: 4,
                      color: '#6b7280'
                    }}>
                      <Box sx={{ fontSize: '3rem', mb: 2 }}>🔍</Box>
                      <MuiTypography variant="h6" sx={{ mb: 1 }}>
                        Aucun patient trouvé
                      </MuiTypography>
                      <MuiTypography variant="body2">
                        Essayez de modifier vos critères de recherche
                      </MuiTypography>
                    </Box>
                  )}
                  
                  {/* Patient Pagination */}
                  {totalPatientPages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, mt: 3 }}>
                      <MuiButton
                        variant="text"
                        size="small"
                        disabled={patientCurrentPage === 1}
                        onClick={() => setPatientCurrentPage(patientCurrentPage - 1)}
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Précédent
                      </MuiButton>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {Array.from({ length: totalPatientPages }, (_, index) => index + 1).map(pageNumber => (
                          <MuiButton
                            key={pageNumber}
                            variant={patientCurrentPage === pageNumber ? "contained" : "text"}
                            size="small"
                            onClick={() => setPatientCurrentPage(pageNumber)}
                            sx={{ 
                              minWidth: 32, 
                              height: 32, 
                              p: 0,
                              fontSize: '12px'
                            }}
                          >
                            {pageNumber}
                          </MuiButton>
                        ))}
                      </Box>
                      
                      <MuiButton
                        variant="text"
                        size="small"
                        disabled={patientCurrentPage === totalPatientPages}
                        onClick={() => setPatientCurrentPage(patientCurrentPage + 1)}
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        Suivant
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </MuiButton>
                    </Box>
                  )}
                  
                  {/* Selected Patient Info */}
                  {muiPatientSelection && (
                    <Box sx={{ 
                      mt: 3, 
                      p: 2, 
                      bgcolor: '#f0fdf4', 
                      borderRadius: 2, 
                      border: '1px solid #bbf7d0' 
                    }}>
                      <MuiTypography variant="body2" sx={{ color: '#166534', fontWeight: 'medium', mb: 1 }}>
                        Patient sélectionné :
                      </MuiTypography>
                      <MuiTypography variant="body1" sx={{ fontWeight: 'medium' }}>
                        {muiPatientSelection.firstName} {muiPatientSelection.lastName} - {muiPatientSelection.gender === 'male' ? 'Masculin' : 'Féminin'}
                      </MuiTypography>
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          )}

          {muiActiveStep === 3 && (
            <Box>
              <MuiTypography variant="h6" sx={{ mb: 3, color: '#1f2937' }}>
                Détails du Rendez-vous
              </MuiTypography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                <TextField
                  label="Date *"
                  type="date"
                  variant="outlined"
                  fullWidth
                  value={muiFormData.date}
                  onChange={(e) => handleMuiFormChange('date', e.target.value)}
                  inputProps={{
                    min: new Date().toISOString().split('T')[0]
                  }}
                />
                
                <TextField
                  label="Heure *"
                  type="time"
                  variant="outlined"
                  fullWidth
                  value={muiFormData.time}
                  onChange={(e) => handleMuiFormChange('time', e.target.value)}
                />
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mt: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Type de Rendez-vous</InputLabel>
                  <MuiSelect
                    value={muiFormData.type}
                    onChange={(e) => handleMuiFormChange('type', e.target.value)}
                    label="Type de Rendez-vous"
                  >
                    <MenuItem value="consultation">Consultation</MenuItem>
                    <MenuItem value="vaccination">Vaccination</MenuItem>
                    <MenuItem value="follow-up">Contrôle</MenuItem>
                  </MuiSelect>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Statut</InputLabel>
                  <MuiSelect
                    value={muiFormData.status}
                    onChange={(e) => handleMuiFormChange('status', e.target.value)}
                    label="Statut"
                  >
                    <MenuItem value="confirmed">Confirmé</MenuItem>
                    <MenuItem value="pending">En Attente</MenuItem>
                    <MenuItem value="cancelled">Annulé</MenuItem>
                    <MenuItem value="completed">Terminé</MenuItem>
                  </MuiSelect>
                </FormControl>
              </Box>

              <TextField
                label="Notes"
                variant="outlined"
                fullWidth
                multiline
                rows={3}
                value={muiFormData.notes}
                onChange={(e) => handleMuiFormChange('notes', e.target.value)}
                placeholder="Notes additionnelles..."
                sx={{ mt: 2 }}
              />
            </Box>
          )}

          {/* Footer Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4, pt: 2, borderTop: '1px solid #e5e7eb' }}>
            <MuiButton
              variant="outlined"
              onClick={muiActiveStep === 0 ? handleMuiModalClose : handleMuiBack}
              sx={{
                borderColor: '#dc2626',
                color: '#dc2626',
                '&:hover': {
                  borderColor: '#b91c1c',
                  backgroundColor: '#fef2f2'
                }
              }}
            >
              {muiActiveStep === 0 ? 'Annuler' : 'Retour'}
            </MuiButton>
            
            {muiActiveStep < 3 ? (
              <MuiButton
                variant="contained"
                onClick={handleMuiNext}
                disabled={
                  (muiActiveStep === 0 && !muiFlowType) ||
                  (muiActiveStep === 1 && muiFlowType === 'existing' && !muiParentSelection) ||
                  (muiActiveStep === 2 && muiFlowType === 'existing' && !muiPatientSelection) ||
                  (muiActiveStep === 2 && muiFlowType === 'new' && (!muiFormData.patientFirstName || !muiFormData.patientLastName || !muiFormData.patientBirthDate || !muiFormData.patientGender))
                }
                sx={{
                  bgcolor: '#3b82f6',
                  '&:hover': { bgcolor: '#2563eb' },
                  '&:disabled': { bgcolor: '#9ca3af' }
                }}
              >
                                 Suivant &gt;
              </MuiButton>
            ) : (
              <MuiButton
                variant="contained"
                onClick={handleMuiAppointmentSubmit}
                disabled={
                  isSubmitting || 
                  !muiFormData.date || 
                  !muiFormData.time || 
                  !muiFormData.type ||
                  (muiFlowType === 'existing' && !muiFormData.patientId) ||
                  (muiFlowType === 'new' && (!muiFormData.patientFirstName || !muiFormData.patientLastName || !muiFormData.patientBirthDate || !muiFormData.patientGender))
                }
                sx={{
                  bgcolor: '#22c55e',
                  '&:hover': { bgcolor: '#16a34a' },
                  '&:disabled': { bgcolor: '#9ca3af' }
                }}
              >
                {isSubmitting ? 'Création...' : 'Créer le Rendez-vous'}
              </MuiButton>
            )}
          </Box>
        </Box>
      </Modal>
    </div>
  );
};

export default AppointmentsPage;


