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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedParent, setSelectedParent] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeConflicts, setTimeConflicts] = useState([]); // Add conflict tracking

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
    setIsDeleteModalOpen(false);
    setSelectedPatient(null);
    setSelectedParent(null);
    setSelectedAppointment(null);
    setIsSubmitting(false);
    setTimeConflicts([]);
  };



  // Get current appointment pricing info
  const getCurrentAppointmentPrice = () => {
    if (!muiFormData.type) return null;
    const price = calculatePrice(muiFormData.type);
    const duration = getDuration(muiFormData.type);
    return { price, duration };
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
          {muiFormData.type === 'consultation' ? 'Consultation' :
           muiFormData.type === 'vaccination' ? 'Vaccination' :
           muiFormData.type === 'follow-up' ? 'Suivi' : muiFormData.type}
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
            onClick={handleMuiModalOpen}
          >
            <UserPlus size={18} /> Nouveau Rendez-vous
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


