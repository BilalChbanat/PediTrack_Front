// PatientDetail.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Avatar,
  Typography,
  Tabs, 
  TabsHeader,
  Tab,
  Button,
  Chip,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Select,
  Option,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Alert,
  Textarea
} from "@material-tailwind/react";

import {
  HomeIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  PencilIcon,
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  EllipsisVerticalIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  DocumentArrowDownIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  ClockIcon
} from "@heroicons/react/24/solid";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axiosInstance from '@/api/axiosInstance';
import DocumentService from '@/api/documentService';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  ReferenceLine,
  Label
} from 'recharts';
import Calendar from 'react-calendar';
import { getLogo } from '@/data/sitting';
import BMICategoryEditor from './component/BMICategoryEditor';
import ConsultationHistory from './component/ConsultationHistory';
import WordTemplateModal from './component/WordTemplateModal';

// Import BMI_CATEGORIES_DEFAULT from BMICategoryEditor
const BMI_CATEGORIES_DEFAULT = [
  { name: "Insuffisance pondérale", range: "< 18.5", color: "red" },
  { name: "Poids normal", range: "18.5 - 24.9", color: "green" },
  { name: "Surpoids", range: "25 - 29.9", color: "orange" },
  { name: "Obésité", range: "≥ 30", color: "red" }
];

import { getMedicationsWithCache, getLocalMedications, searchMedications } from '../../api/medicationService';
// import WHOGrowthCharts from './component/WHOGrowthChart';
import WHOGrowthCharts from './component/WHOGrowthChart'; // <-- CORRECTED
import WHOGrowthChartsMillimeter from './component/WHOGrowthChart';
import StaticGrowthCharts from './component/StaticGrowthCharts';





const calculateCurrentAgeInYears = (birthDateString) => {
  if (!birthDateString) return 0;
  const birthDate = new Date(birthDateString);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const convertImageToBase64 = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL('image/png');
        resolve(dataURL);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = reject;
    img.src = url;
  });
};

// Constantes traduites
const STATUS_COLORS = {
  done: "green",
  pending: "orange",
  overdue: "red",
  default: "blue-gray"
};

const VACCINE_SCHEDULES = {
  "hepatitis b": { interval: 1, unit: "mois" },
  "dtap": { interval: 2, unit: "mois" },
  "mmr": { interval: 1, unit: "années" },
  default: { interval: 6, unit: "mois" }
};

const BMI_CATEGORIES = [
  { name: "Insuffisance pondérale", range: "< 18.5", color: "red" },
  { name: "Poids normal", range: "18.5 - 24.9", color: "green" },
  { name: "Surpoids", range: "25 - 29.9", color: "orange" },
  { name: "Obésité", range: "≥ 30", color: "red" }
];

const PRESCRIPTION_STATUS = {
  active: "Active",
  completed: "Terminé",
  cancelled: "Annulé"
};

const COMMON_MEDICATIONS = [
  "Amoxicilline",
  "Azithromycine",
  "Ibuprofène",
  "Paracétamol",
  "Salbutamol",
  "Cétirizine",
  "Loratadine",
  "Oméprazole",
  "Prednisone",
  "Dextrométhorphane"
];

const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"
];

// Fonctions utilitaires
const getStatusColor = (status) => STATUS_COLORS[status] || STATUS_COLORS.default;

const formatDate = (dateString) => {
  if (!dateString) return "Non administré";
  return new Date(dateString).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const calculateDuration = (startDate, endDate) => {
  if (!startDate || !endDate) return null;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const calculateNextDueDate = (vaccination) => {
  if (!vaccination.dateAdministered) return null;
  
  const administeredDate = new Date(vaccination.dateAdministered);
  const nextDueDate = new Date(administeredDate);
  const schedule = VACCINE_SCHEDULES[vaccination.vaccine.toLowerCase()] || VACCINE_SCHEDULES.default;
  
  if (schedule.unit === "années") {
    nextDueDate.setFullYear(nextDueDate.getFullYear() + schedule.interval);
  } else {
    nextDueDate.setMonth(nextDueDate.getMonth() + schedule.interval);
  }
  
  return nextDueDate.toISOString().split('T')[0];
};
const calculateBMI = (weight, height) => {
  if (!weight || !height || weight <= 0 || height <= 0) return 0;
  const heightInMeters = height / 100;
  return (weight / (heightInMeters * heightInMeters)).toFixed(1);
};

const getBMICategory = (bmi, age) => {
  // For children under 2 years, BMI categories are not applicable
  if (age !== undefined && age < 2) return "N/A";
  
  // Retrieve categories from localStorage, fallback to defaults if not set
  const savedCategories = localStorage.getItem('bmiCategories');
  let categories;
  
  try {
    categories = savedCategories ? JSON.parse(savedCategories) : BMI_CATEGORIES_DEFAULT;
  } catch (e) {
    categories = BMI_CATEGORIES_DEFAULT;
  }

  // Convert the range strings to numeric values
  const parsedCategories = categories.map(category => {
    const range = category.range;
    let min, max;
    
    if (range.includes("<")) {
      max = parseFloat(range.replace("<", "").trim());
      min = 0;
    } else if (range.includes("≥")) {
      min = parseFloat(range.replace("≥", "").trim());
      max = Infinity;
    } else if (range.includes("-")) {
      const parts = range.split("-").map(part => parseFloat(part.trim()));
      min = parts[0];
      max = parts[1];
    }
    
    return {
      ...category,
      min,
      max
    };
  });

  // Sort categories by their range values
  parsedCategories.sort((a, b) => a.min - b.min);

  // Find the matching category
  const matchingCategory = parsedCategories.find(cat => {
    return bmi >= cat.min && (isNaN(cat.max) || bmi < cat.max);
  });

  return matchingCategory ? matchingCategory.name : "N/A";
};

const getBMICategoryColor = (categoryName) => {
  // Retrieve categories from localStorage, fallback to defaults if not set
  const savedCategories = localStorage.getItem('bmiCategories');
  let categories;
  
  try {
    categories = savedCategories ? JSON.parse(savedCategories) : BMI_CATEGORIES_DEFAULT;
  } catch (e) {
    categories = BMI_CATEGORIES_DEFAULT;
  }

  // Find the category by name
  const category = categories.find(cat => cat.name === categoryName);
  
  if (!category) return "#9e9e9e"; // Default gray color
  
  // Map color names to hex values
  const colorMap = {
    red: "#f44336",
    orange: "#ff9800",
    amber: "#ffc107",
    yellow: "#ffeb3b",
    lime: "#cddc39",
    green: "#4caf50",
    emerald: "#009688",
    teal: "#009688",
    cyan: "#00bcd4",
    sky: "#03a9f4",
    blue: "#2196f3",
    indigo: "#3f51b5",
    violet: "#673ab7",
    purple: "#9c27b0",
    fuchsia: "#e91e63",
    pink: "#e91e63",
    rose: "#e91e63"
  };
  
  return colorMap[category.color] || "#9e9e9e";
};
// Composants d'aide traduits
const VaccinationStatusCard = ({ 
  filteredVaccinations, 
  filters, 
  updateFilter, 
  toggleSortDirection, 
  handleOpenCreate,
  handleOpenView,
  handleOpenEdit,
  handleOpenDelete,
  handleScheduleNext,
  exportVaccinationPDF 
}) => (
  <div>
    <div className="flex items-center justify-between mb-3">
      <Typography variant="h6" color="blue-gray">
        État des vaccinations
      </Typography>
      <Button variant="gradient" size="sm" onClick={handleOpenCreate}>
        <PlusIcon className="h-4 w-4 mr-1" />
        Ajouter une vaccination
      </Button>
    </div>
    
    <FilterControls
      filters={filters}
      updateFilter={updateFilter}
      toggleSortDirection={toggleSortDirection}
    />
    
    <div className="flex flex-col gap-12">
      {filteredVaccinations.map((vaccination, index) => (
        <VaccinationListItem
          key={vaccination._id || index}
          vaccination={vaccination}
          onView={handleOpenView}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
          onScheduleNext={handleScheduleNext}
          onExportPDF={exportVaccinationPDF}
        />
      ))}
    </div>
  </div>
);

// In your PatientDetail.jsx file, replace the GrowthCharts component with:

// AFTER THE FIX (Replace the old component with this one)
const GrowthCharts = ({ records, patientGender, patientBirthDate }) => {
  // 1. Calculate the patient's current age in years
  const currentPatientAgeInYears = calculateCurrentAgeInYears(patientBirthDate);

  const chartData = useMemo(() => {
    return records
      .map(record => ({
        date: new Date(record.date).toLocaleDateString('fr-FR', {
          month: 'short',
          day: 'numeric'
        }),
        height: record.heightCm,
        weight: record.weightKg,
        bmi: parseFloat(record.bmi),
        dateValue: new Date(record.date).getTime()
      }))
      .sort((a, b) => a.dateValue - b.dateValue);
  }, [records]);

  // 2. Use the new age variable for the BMI category
  const bmiCategory = getBMICategory(
    chartData[chartData.length - 1]?.bmi || 0,
    currentPatientAgeInYears
  );
  const bmiColor = getBMICategoryColor(bmiCategory);

  return (
    <>
{/* 
    <WHOGrowthChartsMillimeter
  records={records}
  patientGender={patientGender}
  patientBirthDate={patientBirthDate}
/> */}
    <StaticGrowthCharts
    records={records}
    patientGender={patientGender}
    patientBirthDate={patientBirthDate} // Seule la date de naissance est passée
/>
      
      <div className="bg-white p-4 rounded-xl border border-blue-gray-50">
        <Typography variant="h5" color="blue-gray" className="mb-4">
          Évolution IMC
        </Typography>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="bmiColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={bmiColor} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={bmiColor} stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" />
              <YAxis domain={['auto', 'auto']} />
              <Tooltip formatter={(value) => [`${value}`, 'IMC']} />
              <Area
                type="monotone"
                dataKey="bmi"
                stroke={bmiColor}
                fillOpacity={1}
                fill="url(#bmiColor)"
                name="IMC"
                strokeWidth={2}
              />
              {/* 3. Use the new age variable for the reference lines */}
              {currentPatientAgeInYears >= 2 && (
                <>
                  <ReferenceLine y={18.5} stroke="#f57c00" strokeDasharray="3 3">
                    <Label value="Insuffisance" position="insideTopRight" />
                  </ReferenceLine>
                  <ReferenceLine y={25} stroke="#388e3c" strokeDasharray="3 3">
                    <Label value="Normal" position="insideTopRight" />
                  </ReferenceLine>
                  <ReferenceLine y={30} stroke="#d32f2f" strokeDasharray="3 3">
                    <Label value="Surpoids" position="insideTopRight" />
                  </ReferenceLine>
                </>
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
};

const FilterControls = ({ filters, updateFilter, toggleSortDirection }) => (
  <div className="flex gap-2 mb-4">
    <Select
      label="Filtrer par statut"
      value={filters.status}
      onChange={(val) => updateFilter('status', val)}
      size="sm"
    >
      <Option value="all">Tous</Option>
      <Option value="pending">En attente</Option>
      <Option value="done">Complété</Option>
      <Option value="overdue">En retard</Option>
    </Select>
    
    <div className="flex items-center">
      <Select
        label="Trier par"
        value={filters.sortField}
        onChange={(val) => updateFilter('sortField', val)}
        size="sm"
      >
        <Option value="dueDate">Date d'échéance</Option>
        <Option value="vaccine">Nom du vaccin</Option>
        <Option value="status">Statut</Option>
      </Select>
      <Button 
        variant="text" 
        size="sm"
        onClick={toggleSortDirection}
        className="ml-2"
      >
        {filters.sortDirection === "asc" ? (
          <ArrowUpIcon className="h-4 w-4" />
        ) : (
          <ArrowDownIcon className="h-4 w-4" />
        )}
      </Button>
    </div>
  </div>
);

const VaccinationListItem = ({ 
  vaccination, 
  onView, 
  onEdit, 
  onDelete, 
  onScheduleNext, 
  onExportPDF 
}) => (
  <div>
    <div className="flex justify-between items-center mb-4">
      <Typography className="block text-xs font-semibold uppercase text-blue-gray-500">
        {vaccination.vaccine}
      </Typography>
      <Menu>
        <MenuHandler>
          <Button variant="text" size="sm">
            <EllipsisVerticalIcon className="h-5 w-5" />
          </Button>
        </MenuHandler>
        <MenuList>
          <MenuItem onClick={() => onView(vaccination)}>
            Voir les détails
          </MenuItem>
          <MenuItem onClick={() => onEdit(vaccination)}>
            Modifier
          </MenuItem>
          <MenuItem onClick={() => onScheduleNext(vaccination)}>
            Planifier la prochaine
          </MenuItem>
          <MenuItem onClick={() => onExportPDF(vaccination)}>
            <div className="flex items-center">
              <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
              Exporter PDF
            </div>
          </MenuItem>
          <MenuItem 
            onClick={() => onDelete(vaccination)}
            className="text-red-500"
          >
            Supprimer
          </MenuItem>
        </MenuList>
      </Menu>
    </div>
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <Typography className="text-sm font-normal text-blue-gray-500">
            Date d'échéance: {formatDate(vaccination.dueDate)}
          </Typography>
          <Typography className="text-sm font-normal text-blue-gray-500">
            {vaccination.dateAdministered 
              ? `Administré: ${formatDate(vaccination.dateAdministered)}`
              : "En attente d'administration"
            }
          </Typography>
        </div>
        <Chip
          value={vaccination.status === "done" ? "Complété" : vaccination.status === "pending" ? "En attente" : "En retard"}
          color={getStatusColor(vaccination.status)}
          size="sm"
        />
      </div>
    </div>
  </div>
);

const PatientInfoCard = ({ patientData }) => (
  <div>
    <div className="mb-4 flex items-center justify-between">
      <Typography variant="h6" color="blue-gray">
        Informations du patient
      </Typography>
    </div>
    <Typography variant="small" className="mb-4 font-normal text-blue-gray-500">
      Dossiers médicaux et informations de contact pour {patientData.name}. Profil complet avec contacts d'urgence et antécédents médicaux.
    </Typography>
    
    <div className="space-y-4">
      {Object.entries({
        "nom complet": patientData.name,
        mobile: patientData.phoneNumber,
        email: patientData.email,
        adresse: patientData.address,
        "contact d'urgence": patientData.emergencyContact,
        allergies: patientData.allergies,
        "conditions chroniques": patientData.chronicConditions,
      }).map(([key, value]) => (
        <div key={key} className="flex items-center gap-4">
          <Typography variant="small" className="w-48 font-semibold text-blue-gray-500">
            {key}:
          </Typography>
          <Typography variant="small" className="font-normal text-blue-gray-500">
            {value}
          </Typography>
        </div>
      ))}
    </div>
  </div>
);

const RecentActivitiesCard = ({ processedAppointments }) => (
  <div>
    <Typography variant="h6" color="blue-gray" className="mb-3">
      Activités récentes
    </Typography>
    <ul className="flex flex-col gap-4">
      {processedAppointments.length > 0 ? (
        processedAppointments.map((props, index) => (
          <Card key={index} className="border border-blue-gray-50">
            <CardBody className="p-4">
              <div className="flex items-center gap-4">
                <div className="bg-blue-50 p-2 rounded-full">
                  <CalendarDaysIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <Typography variant="small" color="blue-gray" className="font-bold">
                    {props.name}
                  </Typography>
                  <Typography variant="small" className="text-blue-gray-500">
                    {props.message}
                  </Typography>
                </div>
                <div className="ml-auto text-right">
                  <Typography variant="small" className="text-blue-gray-500">
                    {props.time}
                  </Typography>
                  <Typography variant="small" className="text-blue-gray-500">
                    {props.hour}
                  </Typography>
                </div>
              </div>
            </CardBody>
          </Card>
        ))
      ) : (
        <Typography variant="small" className="text-blue-gray-500">
          Aucune activité récente
        </Typography>
      )}
    </ul>
  </div>
);

const VaccinationRecordsGrid = ({ filteredVaccinations, handleOpenCreate, handleOpenView }) => (
  <div className="px-4 pb-4">
    <div className="flex items-center justify-between mb-2">
      <Typography variant="h6" color="blue-gray">
        Carnet de vaccination
      </Typography>
      <Button variant="text" size="sm" onClick={handleOpenCreate}>
        <PlusIcon className="h-4 w-4 mr-1" />
        Ajouter un enregistrement
      </Button>
    </div>
    <Typography variant="small" className="font-normal text-blue-gray-500">
      Historique complet des vaccinations et calendrier à venir
    </Typography>
    <div className="mt-6 grid grid-cols-1 gap-12 md:grid-cols-2 xl:grid-cols-4">
      {filteredVaccinations.map((vaccination, index) => (
        <Card key={vaccination._id || index} color="transparent" shadow={false}>
          <CardHeader
            floated={false}
            color="gray"
            className="mx-0 mt-0 mb-4 h-64 xl:h-40 flex items-center justify-center bg-blue-50"
          >
            <ShieldCheckIcon className="h-16 w-16 text-blue-600" />
          </CardHeader>
          <CardBody className="py-0 px-1">
            <Typography variant="small" className="font-normal text-blue-gray-500">
              {vaccination.status === "done" ? "Complété" : "En attente"}
            </Typography>
            <Typography variant="h5" color="blue-gray" className="mt-1 mb-2">
              {vaccination.vaccine}
            </Typography>
            <Typography variant="small" className="font-normal text-blue-gray-500">
              Échéance: {formatDate(vaccination.dueDate)}
            </Typography>
          </CardBody>
          <CardFooter className="mt-6 flex items-center justify-between py-0 px-1">
            <Button 
              variant="outlined" 
              size="sm"
              onClick={() => handleOpenView(vaccination)}
            >
              Voir détails
            </Button>
            <div className="flex items-center">
              <Chip
                value={vaccination.status === "done" ? "Complété" : vaccination.status === "pending" ? "En attente" : "En retard"}
                color={getStatusColor(vaccination.status)}
                size="sm"
              />
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  </div>
);

const VaccinationGrid = ({ vaccinations, onView, onEdit, onDelete }) => (
  <div className="mt-8">
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {vaccinations.map((vaccination, index) => (
        <Card key={vaccination._id || index} className="border border-blue-gray-50">
          <CardHeader className="bg-blue-50 p-4 flex justify-between items-center">
            <Typography variant="h5" color="blue-gray">
              {vaccination.vaccine}
            </Typography>
            <Chip
              value={vaccination.status === "done" ? "Complété" : vaccination.status === "pending" ? "En attente" : "En retard"}
              color={getStatusColor(vaccination.status)}
              size="sm"
            />
          </CardHeader>
          <CardBody className="p-4">
            <div className="space-y-3">
              <div>
                <Typography variant="small" className="font-semibold text-blue-gray-500">
                  Date d'échéance
                </Typography>
                <Typography>{formatDate(vaccination.dueDate)}</Typography>
              </div>
              
              {vaccination.dateAdministered && (
                <div>
                  <Typography variant="small" className="font-semibold text-blue-gray-500">
                    Administré
                  </Typography>
                  <Typography>{formatDate(vaccination.dateAdministered)}</Typography>
                </div>
              )}
              
              <div>
                <Typography variant="small" className="font-semibold text-blue-gray-500">
                  Statut
                </Typography>
                <Typography className="capitalize">
                  {vaccination.status === "done" ? "Complété" : vaccination.status === "pending" ? "En attente" : "En retard"}
                </Typography>
              </div>
            </div>
          </CardBody>
          <CardFooter className="flex justify-between p-4">
            <Button variant="outlined" onClick={() => onView(vaccination)}>
              Voir détails
            </Button>
            <div className="flex gap-2">
              <Button 
                variant="text" 
                color="blue"
                onClick={() => onEdit(vaccination)}
              >
                Modifier
              </Button>
              <Button 
                variant="text" 
                color="red"
                onClick={() => onDelete(vaccination)}
              >
                Supprimer
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  </div>
);

const GrowthRecordsTable = ({ records, patientAge, onDelete, loading }) => (
  <>
    <Card>
      <CardBody>
        <div className="overflow-x-auto">
          <table className="w-full min-w-max">
            <thead>
              <tr>
                <th className="border-b border-blue-gray-100 bg-blue-gray-50/50 p-4">
                  <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">Date</Typography>
                </th>
                <th className="border-b border-blue-gray-100 bg-blue-gray-50/50 p-4">
                  <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">Taille (cm)</Typography>
                </th>
                <th className="border-b border-blue-gray-100 bg-blue-gray-50/50 p-4">
                  <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">Poids (kg)</Typography>
                </th>
                <th className="border-b border-blue-gray-100 bg-blue-gray-50/50 p-4">
                  <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">IMC</Typography>
                </th>
                <th className="border-b border-blue-gray-100 bg-blue-gray-50/50 p-4">
                  <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">Périmètre crânien (cm)</Typography>
                </th>
                <th className="border-b border-blue-gray-100 bg-blue-gray-50/50 p-4">
                  <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">Catégorie</Typography>
                </th>
                <th className="border-b border-blue-gray-100 bg-blue-gray-50/50 p-4">
                  <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">Actions</Typography>
                </th>
              </tr>
            </thead>
            <tbody>
              {records.map((record, index) => (
                <tr key={record._id || index}>
                  <td className="p-4 border-b border-blue-gray-50">
                    <Typography variant="small" color="blue-gray" className="font-normal">
                      {formatDate(record.date)}
                    </Typography>
                  </td>
                  <td className="p-4 border-b border-blue-gray-50">
                    <Typography variant="small" color="blue-gray" className="font-normal">
                      {record.heightCm}
                    </Typography>
                  </td>
                  <td className="p-4 border-b border-blue-gray-50">
                    <Typography variant="small" color="blue-gray" className="font-normal">
                      {record.weightKg}
                    </Typography>
                  </td>
                  <td className="p-4 border-b border-blue-gray-50">
                    <Typography variant="small" color="blue-gray" className="font-normal">
                      {record.bmi}
                    </Typography>
                  </td>
                  <td className="p-4 border-b border-blue-gray-50">
                    <Typography variant="small" color="blue-gray" className="font-normal">
                      {record.headCircumferenceCm || 'N/A'}
                    </Typography>
                  </td>
                  <td className="p-4 border-b border-blue-gray-50">
                    <Chip
                      value={getBMICategory(record.bmi)}
                      color={getBMICategoryColor(getBMICategory(record.bmi, patientAge))}
                      size="sm"
                    />
                  </td>
                  <td className="p-4 border-b border-blue-gray-50">
                    <Button 
                      variant="text" 
                      color="red"
                      onClick={() => onDelete(record._id)}
                      disabled={loading}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardBody>
    </Card>
  </>
);

const EmptyGrowthState = ({ patientName, onAddRecord }) => (
  <div className="text-center py-12">
    <ChartBarIcon className="h-16 w-16 mx-auto text-blue-gray-300 mb-4" />
    <Typography variant="h5" color="blue-gray" className="mb-2">
      Aucun enregistrement de croissance
    </Typography>
    <Typography variant="small" className="text-blue-gray-500 mb-6">
      Commencez à suivre la croissance de {patientName} en ajoutant un nouvel enregistrement
    </Typography>
    <Button variant="gradient" onClick={onAddRecord}>
      Ajouter le premier enregistrement
    </Button>
  </div>
);

const PrescriptionCard = ({ prescription, onEdit, onDelete, onView, onExportPDF }) => {
  const status = prescription.status || 
    (prescription.endDate && new Date(prescription.endDate) < new Date()
      ? PRESCRIPTION_STATUS.completed
      : PRESCRIPTION_STATUS.active);

  const statusColor = status === PRESCRIPTION_STATUS.active
    ? "green"
    : status === PRESCRIPTION_STATUS.completed
      ? "blue"
      : "red";

  const duration = calculateDuration(prescription.startDate, prescription.endDate);

  return (
    <Card className="border border-blue-gray-50 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] bg-gradient-to-br from-white to-blue-50/30">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-800 p-4 flex justify-between items-center rounded-t-xl mt-[1rem]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <DocumentTextIcon className="h-5 w-5 text-white" />
          </div>
          <Typography variant="h5" className="text-white font-semibold">
            {prescription.medication}
          </Typography>
        </div>
        <Chip value={status} color={statusColor} size="sm" className="bg-white/20 text-white border-white/30" />
      </CardHeader>
      <CardBody className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <Typography variant="small" className="font-semibold text-blue-gray-700">
                Posologie:
              </Typography>
              <Typography className="font-medium text-blue-gray-900">{prescription.dosage}</Typography>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <Typography variant="small" className="font-semibold text-green-700">
                Fréquence:
              </Typography>
              <Typography className="font-medium text-green-900">{prescription.frequency}</Typography>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <Typography variant="small" className="font-semibold text-purple-700">
                Date de début:
              </Typography>
              <Typography className="font-medium text-purple-900">{formatDate(prescription.startDate)}</Typography>
            </div>
          </div>
          
          <div className="space-y-4">
            {prescription.endDate && (
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <Typography variant="small" className="font-semibold text-orange-700">
                  Date de fin:
                </Typography>
                <Typography className="font-medium text-orange-900">{formatDate(prescription.endDate)}</Typography>
              </div>
            )}
            
            {duration && (
              <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg">
                <Typography variant="small" className="font-semibold text-indigo-700">
                  Durée:
                </Typography>
                <div className="flex items-center gap-2">
                  <ClockIcon className="h-4 w-4 text-indigo-600" />
                  <Typography className="font-medium text-indigo-900">
                    {duration} jour{duration > 1 ? 's' : ''}
                  </Typography>
                </div>
              </div>
            )}
            
            {prescription.notes && (
              <div className="col-span-2">
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <Typography variant="small" className="font-semibold text-yellow-700 mb-2">
                    Notes:
                  </Typography>
                  <Typography className="text-sm text-yellow-900">{prescription.notes}</Typography>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardBody>
      <CardFooter className="flex justify-end gap-2 p-4 pt-0 bg-gradient-to-r from-gray-50 to-blue-50/30">
        <Button variant="text" size="sm" onClick={onView} className="hover:bg-blue-500 hover:text-white transition-colors">
          Voir
        </Button>
        <Button 
          variant="text" 
          color="green" 
          size="sm" 
          onClick={() => onExportPDF(prescription)}
          className="flex items-center gap-1 hover:bg-green-500 hover:text-white transition-colors"
        >
          <DocumentArrowDownIcon className="h-4 w-4" />
          Exporter PDF
        </Button>
        <Button variant="text" color="blue" size="sm" onClick={onEdit} className="hover:bg-blue-500 hover:text-white transition-colors">
          Modifier
        </Button>
        <Button variant="text" color="red" size="sm" onClick={onDelete} className="hover:bg-red-500 hover:text-white transition-colors">
          Supprimer
        </Button>
      </CardFooter>
    </Card>
  );
};

const EmptyPrescriptionsState = ({ patientName, onAddPrescription }) => (
  <div className="text-center py-16 bg-blue-gray-50/30 rounded-xl">
    <DocumentTextIcon className="h-16 w-16 mx-auto text-blue-gray-300 mb-4" />
    <Typography variant="h5" color="blue-gray" className="mb-2">
      Aucune prescription trouvée
    </Typography>
    <Typography variant="small" className="text-blue-gray-500 mb-6 max-w-md mx-auto">
      {patientName} n'a encore aucune prescription. Ajoutez la première pour commencer.
    </Typography>
    <Button variant="gradient" onClick={onAddPrescription}>
      Ajouter la première prescription
    </Button>
  </div>
);

const DocumentUploadModal = ({ 
  open, 
  onClose, 
  formData, 
  setFormData, 
  onSubmit, 
  loading 
}) => (
  <Dialog open={open} handler={onClose}>
    <DialogHeader>Uploader un document</DialogHeader>
    <DialogBody>
      <div className="space-y-4">
        <Input
          label="Titre du document"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          required
        />
        <div>
          <Typography variant="small" className="mb-2">
            Sélectionner un fichier
          </Typography>
          <input
            type="file"
            onChange={(e) => setFormData(prev => ({ ...prev, file: e.target.files[0] }))}
            className="w-full p-2 border rounded"
            required
          />
        </div>
      </div>  
    </DialogBody>
    <DialogFooter>
      <Button variant="text" onClick={onClose} className="mr-2">
        Annuler
      </Button>
      <Button 
        variant="gradient" 
        color="blue" 
        onClick={onSubmit}
        disabled={loading || !formData.title || !formData.file}
      >
        {loading ? "Téléchargement..." : "Uploader le document"}
      </Button>
    </DialogFooter>
  </Dialog>
);

const DeleteDocumentModal = ({ 
  open, 
  onClose, 
  document, 
  onConfirm, 
  loading 
}) => (
  <Dialog open={open} handler={onClose}>
    <DialogHeader>Supprimer un document</DialogHeader>
    <DialogBody>
      <Typography variant="small" className="text-red-500">
        Êtes-vous sûr de vouloir supprimer le document "{document?.title}" ? 
        Cette action est irréversible.
      </Typography>
    </DialogBody>
    <DialogFooter>
      <Button variant="text" onClick={onClose} className="mr-2">
        Annuler
      </Button>
      <Button 
        variant="gradient" 
        color="red" 
        onClick={onConfirm}
        disabled={loading}
      >
        {loading ? "Suppression..." : "Supprimer le document"}
      </Button>
    </DialogFooter>
  </Dialog>
);

const PrescriptionModal = ({
  open,
  onClose,
  formData,
  setFormData,
  onSubmit,
  isValid,
  loading,
  isEdit,
  medicationData = [], // Changed from commonMedications to medicationData
  medicationLoading = false,
  medicationError = null,
}) => {
  const [searchTerms, setSearchTerms] = useState([""]);

  // Initialize searchTerms when formData changes
  useEffect(() => {
    setSearchTerms(formData.map(() => ""));
  }, [formData.length]);
  const [filteredMedications, setFilteredMedications] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSearchIndex, setActiveSearchIndex] = useState(0);
  const [selectedMedicationIndex, setSelectedMedicationIndex] = useState(null);

  // Filter medications based on search term
  useEffect(() => {
    if (searchTerms[activeSearchIndex] && searchTerms[activeSearchIndex].length > 1) {
      const filtered = searchMedications(searchTerms[activeSearchIndex], medicationData);
      setFilteredMedications(filtered);
      setShowSuggestions(true);
    } else {
      setFilteredMedications([]);
      setShowSuggestions(false);
    }
  }, [searchTerms, medicationData, activeSearchIndex]);

  // Add keyboard navigation support
  const handleKeyDown = (index, e) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleInputChange = (index, field, value) => {
    setFormData((prev) => {
      const newFormData = [...prev];
      newFormData[index] = { ...newFormData[index], [field]: value };
      return newFormData;
    });
  };

  const handleMedicationSearch = (index, value) => {
    setSearchTerms((prev) => {
      const newSearchTerms = [...prev];
      newSearchTerms[index] = value;
      return newSearchTerms;
    });
    setActiveSearchIndex(index);
    setSelectedMedicationIndex(null); // Reset when user starts typing
    handleInputChange(index, 'medication', value);
  };

  const handleMedicationSelect = (index, selectedMed) => {
    // Immediately hide suggestions when medication is selected
    setShowSuggestions(false);
    setFilteredMedications([]);
    setSelectedMedicationIndex(index);
    
    // Update form data immediately
    setFormData((prev) => {
      const newFormData = [...prev];
      newFormData[index] = {
        ...newFormData[index],
        medication: selectedMed.SPECIALITE,
        dosage: selectedMed.DOSAGE || "",
        // Auto-fill additional fields based on selected medication
        notes: selectedMed.INDICATION_S_ ? 
          `Indications: ${selectedMed.INDICATION_S_}\n` : "",
        // Add therapeutic class info if available
        therapeuticClass: selectedMed.CLASSE_THÉRAPEUTIQUE || selectedMed.CLASSE_THERAPEUTIQUE || "",
        // Add manufacturer info
        manufacturer: selectedMed.DISTRIBUTEUR_OU_FABRIQUANT || "",
        // Add form information
        form: selectedMed.FORME || "",
        // Add presentation info
        presentation: selectedMed.PRESENTATION || "",
        // Add price info if available
        price: selectedMed.PPV ? `PPV: ${selectedMed.PPV} dhs` : "",
      };
      return newFormData;
    });
    setSearchTerms((prev) => {
      const newSearchTerms = [...prev];
      newSearchTerms[index] = selectedMed.SPECIALITE;
      return newSearchTerms;
    });
  };

  const handleClickOutside = () => {
    setShowSuggestions(false);
  };

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSuggestions && !event.target.closest('.medication-search-container')) {
        setShowSuggestions(false);
        setFilteredMedications([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSuggestions]);

  const addMedication = () => {
    setFormData((prev) => [
      ...prev,
      {
        medication: "",
        dosage: "",
        frequency: "",
        startDate: new Date().toISOString().split('T')[0],
        duration: "",
        notes: ""
      }
    ]);
    setSearchTerms((prev) => [...prev, ""]);
  };

  const removeMedication = (index) => {
    if (formData.length > 1) {
      setFormData((prev) => prev.filter((_, i) => i !== index));
      setSearchTerms((prev) => prev.filter((_, i) => i !== index));
    }
  };

  return (
    <Dialog open={open} handler={onClose} size="md">
      <DialogHeader className="flex justify-between items-center">
        <Typography variant="h4">
          {isEdit ? "Modifier la prescription" : "Ajouter une nouvelle prescription"}
        </Typography>
        {!isEdit && (
          <Button
            variant="gradient"
            color="green"
            size="sm"
            onClick={addMedication}
            className="flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Ajouter médicament
          </Button>
        )}
      </DialogHeader>
      <DialogBody divider className="max-h-[70vh] overflow-y-auto">
        <div className="space-y-8">
          {formData.map((medicationForm, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
              <div className="flex justify-between items-center mb-4">
                <Typography variant="h6" className="text-blue-gray-700">
                  Médicament {index + 1}
                </Typography>
                {!isEdit && formData.length > 1 && (
                  <Button
                    variant="text"
                    color="red"
                    size="sm"
                    onClick={() => removeMedication(index)}
                    className="flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Supprimer
                  </Button>
                )}
              </div>
              
              <div className="grid gap-6">
                {/* Medication Selection with Search */}
                <div className="relative medication-search-container">
                  <div className="flex items-center justify-between mb-2">
                    <Typography variant="small" className="font-semibold text-blue-gray-500">
                      Médicament *
                    </Typography>
                    {medicationLoading && (
                      <Typography variant="small" className="text-blue-500">
                        Chargement...
                      </Typography>
                    )}
                    {medicationError && (
                      <Typography variant="small" className="text-orange-500">
                        Données locales
                      </Typography>
                    )}
                    {!medicationLoading && !medicationError && medicationData.length > 0 && (
                      <Typography variant="small" className="text-green-500">
                        {medicationData.length} médicaments disponibles
                      </Typography>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      label="Rechercher un médicament"
                      value={medicationForm.medication}
                      onChange={(e) => handleMedicationSearch(index, e.target.value)}
                      onFocus={() => {
                        setActiveSearchIndex(index);
                        if (medicationForm.medication.length > 1) setShowSuggestions(true);
                      }}
                      onBlur={() => {
                        // Small delay to allow click on suggestion to register
                        setTimeout(() => {
                          setShowSuggestions(false);
                        }, 200);
                      }}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      placeholder={medicationLoading ? "Chargement..." : "Tapez pour rechercher..."}
                      disabled={medicationLoading}
                    />
                  
                  {/* Suggestions Dropdown */}
                  {showSuggestions && activeSearchIndex === index && filteredMedications.length > 0 && selectedMedicationIndex !== index && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {filteredMedications.map((med, medIndex) => (
                        <div
                          key={medIndex}
                          className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleMedicationSelect(index, med);
                          }}
                          onMouseDown={(e) => {
                            e.preventDefault(); // Prevent input blur
                          }}
                        >
                          <div className="font-semibold text-blue-gray-800 mb-1">
                            {med.SPECIALITE}
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {med.DOSAGE && (
                              <div className="text-blue-gray-600">
                                <span className="font-medium">Dosage:</span> {med.DOSAGE}
                              </div>
                            )}
                            {med.FORME && (
                              <div className="text-blue-gray-600">
                                <span className="font-medium">Forme:</span> {med.FORME}
                              </div>
                            )}
                            {med.PRESENTATION && (
                              <div className="text-blue-gray-500">
                                <span className="font-medium">Présentation:</span> {med.PRESENTATION}
                              </div>
                            )}
                            {med.PPV && (
                              <div className="text-green-600">
                                <span className="font-medium">Prix:</span> {med.PPV} dhs
                              </div>
                            )}
                          </div>
                          {med.SUBSTANCE_ACTIVE && (
                            <div className="text-xs text-blue-gray-500 mt-1">
                              <span className="font-medium">Substance active:</span> {med.SUBSTANCE_ACTIVE}
                            </div>
                          )}
                          {med.CLASSE_THÉRAPEUTIQUE && (
                            <div className="text-xs text-purple-600 mt-1">
                              <span className="font-medium">Classe:</span> {med.CLASSE_THÉRAPEUTIQUE}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Show search results count */}
                {searchTerms[index] && searchTerms[index].length > 1 && activeSearchIndex === index && (
                  <Typography variant="small" className="mt-1 text-blue-gray-500">
                    {filteredMedications.length} médicament(s) trouvé(s)
                  </Typography>
                )}
              </div>

                {/* Dosage and Frequency */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Typography variant="small" className="mb-2 font-semibold text-blue-gray-500">
                      Posologie *
                    </Typography>
                    <Input
                      value={medicationForm.dosage}
                      onChange={(e) => handleInputChange(index, "dosage", e.target.value)}
                      label="ex: 500mg"
                      placeholder="Entrez la posologie"
                    />
                  </div>
                  <div>
                    <Typography variant="small" className="mb-2 font-semibold text-blue-gray-500">
                      Fréquence *
                    </Typography>
                    <Select
                      value={medicationForm.frequency}
                      onChange={(val) => handleInputChange(index, "frequency", val)}
                      label="Sélectionner la fréquence"
                    >
                      <Option value="Une fois par jour">Une fois par jour</Option>
                      <Option value="Deux fois par jour">Deux fois par jour</Option>
                      <Option value="Trois fois par jour">Trois fois par jour</Option>
                      <Option value="Quatre fois par jour">Quatre fois par jour</Option>
                      <Option value="Toutes les 4 heures">Toutes les 4 heures</Option>
                      <Option value="Toutes les 6 heures">Toutes les 6 heures</Option>
                      <Option value="Toutes les 8 heures">Toutes les 8 heures</Option>
                      <Option value="Toutes les 12 heures">Toutes les 12 heures</Option>
                      <Option value="Au besoin">Au besoin</Option>
                      <Option value="Avant les repas">Avant les repas</Option>
                      <Option value="Après les repas">Après les repas</Option>
                      <Option value="Au coucher">Au coucher</Option>
                      <Option value="Autre">Autre</Option>
                    </Select>
                  </div>
                </div>

                {/* Start Date and Duration */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Typography variant="small" className="mb-2 font-semibold text-blue-gray-500">
                      Date de début *
                    </Typography>
                    <Input
                      type="date"
                      value={medicationForm.startDate}
                      onChange={(e) => handleInputChange(index, "startDate", e.target.value)}
                      label="Date de début"
                    />
                  </div>
                  <div>
                    <Typography variant="small" className="mb-2 font-semibold text-blue-gray-500">
                      Durée (jours) *
                    </Typography>
                    <Input
                      type="number"
                      value={medicationForm.duration}
                      onChange={(e) => handleInputChange(index, "duration", e.target.value)}
                      label="Nombre de jours"
                      placeholder="ex: 7"
                      min="1"
                    />
                  </div>
                </div>

                {/* Duration Helper */}
                {medicationForm.startDate && medicationForm.duration && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <Typography variant="small" className="text-blue-gray-700">
                      <strong>Fin du traitement:</strong> {
                        (() => {
                          const startDate = new Date(medicationForm.startDate);
                          const endDate = new Date(startDate);
                          endDate.setDate(startDate.getDate() + parseInt(medicationForm.duration));
                          return endDate.toLocaleDateString('fr-FR');
                        })()
                      } ({medicationForm.duration} jour(s))
                    </Typography>
                  </div>
                )}

                {/* Notes */}
                <div>
                  <Typography variant="small" className="mb-2 font-semibold text-blue-gray-500">
                    Instructions supplémentaires (Optionnel)
                  </Typography>
                  <Textarea
                    value={medicationForm.notes}
                    onChange={(e) => handleInputChange(index, "notes", e.target.value)}
                    label="Instructions pour le patient..."
                    rows={3}
                    placeholder="Exemple: Prendre avec de la nourriture, éviter l'alcool, etc."
                  />
                </div>

                {/* Selected Medication Summary */}
                {medicationForm.medication && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <Typography variant="small" className="font-semibold text-green-800 mb-2">
                      Résumé de la prescription:
                    </Typography>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div>
                        <Typography variant="small" className="text-green-700">
                          <strong>Médicament:</strong> {medicationForm.medication}<br />
                          <strong>Posologie:</strong> {medicationForm.dosage || "Non spécifiée"}<br />
                          <strong>Fréquence:</strong> {medicationForm.frequency || "Non spécifiée"}<br />
                          <strong>Période:</strong> {medicationForm.startDate || "Non spécifiée"} 
                          {medicationForm.duration && (() => {
                            const startDate = new Date(medicationForm.startDate);
                            const endDate = new Date(startDate);
                            endDate.setDate(startDate.getDate() + parseInt(medicationForm.duration));
                            return ` au ${endDate.toLocaleDateString('fr-FR')} (${medicationForm.duration} jours)`;
                          })()}
                        </Typography>
                      </div>
                      <div>
                        {medicationForm.therapeuticClass && (
                          <Typography variant="small" className="text-green-700">
                            <strong>Classe thérapeutique:</strong> {medicationForm.therapeuticClass}<br />
                          </Typography>
                        )}
                        {medicationForm.manufacturer && (
                          <Typography variant="small" className="text-green-700">
                            <strong>Fabricant:</strong> {medicationForm.manufacturer}<br />
                          </Typography>
                        )}
                        {medicationForm.form && (
                          <Typography variant="small" className="text-green-700">
                            <strong>Forme:</strong> {medicationForm.form}<br />
                          </Typography>
                        )}
                        {medicationForm.presentation && (
                          <Typography variant="small" className="text-green-700">
                            <strong>Présentation:</strong> {medicationForm.presentation}<br />
                          </Typography>
                        )}
                        {medicationForm.price && (
                          <Typography variant="small" className="text-green-700">
                            <strong>Prix:</strong> {medicationForm.price}
                          </Typography>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </DialogBody>
      <DialogFooter>
        <Button
          variant="text"
          color="red"
          onClick={onClose}
          className="mr-1"
          disabled={loading}
        >
          Annuler
        </Button>
        <Button
          variant="gradient"
          color="green"
          onClick={onSubmit}
          disabled={!isValid || loading}
        >
          {loading ? "Enregistrement..." : isEdit ? "Mettre à jour" : "Ajouter prescription"}
        </Button>
      </DialogFooter>
      
      {/* Click outside handler */}
      {showSuggestions && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={handleClickOutside}
        />
      )}
    </Dialog>
  );
};
const ViewPrescriptionModal = ({ open, onClose, prescription, onExportPDF }) => {
  if (!prescription) return null;
  
  const status = prescription.status || 
    (prescription.endDate && new Date(prescription.endDate) < new Date()
      ? PRESCRIPTION_STATUS.completed
      : PRESCRIPTION_STATUS.active);

  const statusColor = status === PRESCRIPTION_STATUS.active 
    ? "green" 
    : status === PRESCRIPTION_STATUS.completed 
      ? "blue" 
      : "red";

  const duration = calculateDuration(prescription.startDate, prescription.endDate);

  return (
    <Dialog open={open} handler={onClose} size="lg" className="bg-gradient-to-br from-blue-50/50 to-white">
      <DialogHeader className="flex justify-between items-center bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <DocumentTextIcon className="h-6 w-6 text-white" />
          </div>
          <Typography variant="h4" className="text-white font-semibold">
            Détails de la prescription
          </Typography>
        </div>
        <Button 
          variant="gradient" 
          color="white" 
          size="sm"
          onClick={() => onExportPDF(prescription)}
          className="flex items-center gap-1 bg-white/20 hover:bg-white/30"
        >
          <DocumentArrowDownIcon className="h-4 w-4" />
          Exporter PDF
        </Button>
      </DialogHeader>
      <DialogBody divider className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 ">
          <div className="space-y-6 ">
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl text-white ">
              <Typography variant="h4" className="text-white font-semibold">
                {prescription.medication}
              </Typography>
              <Chip value={status} color={statusColor} size="md" className="bg-white/20 text-white border-white/30" />
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-xl">
                <Typography variant="small" className="font-semibold text-blue-gray-700">
                  Posologie:
                </Typography>
                <Typography className="font-medium text-blue-gray-900">{prescription.dosage}</Typography>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-green-50 rounded-xl">
                <Typography variant="small" className="font-semibold text-green-700">
                  Fréquence:
                </Typography>
                <Typography className="font-medium text-green-900">{prescription.frequency}</Typography>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-purple-50 rounded-xl">
                <Typography variant="small" className="font-semibold text-purple-700">
                  Date de début:
                </Typography>
                <Typography className="font-medium text-purple-900">{formatDate(prescription.startDate)}</Typography>
              </div>
              
              {prescription.endDate && (
                <div className="flex justify-between items-center p-4 bg-orange-50 rounded-xl">
                  <Typography variant="small" className="font-semibold text-orange-700">
                    Date de fin:
                  </Typography>
                  <Typography className="font-medium text-orange-900">{formatDate(prescription.endDate)}</Typography>
                </div>
              )}
              
              {duration && (
                <div className="flex justify-between items-center p-4 bg-indigo-50 rounded-xl">
                  <Typography variant="small" className="font-semibold text-indigo-700">
                    Durée:
                  </Typography>
                  <div className="flex items-center gap-2">
                    <ClockIcon className="h-5 w-5 text-indigo-600" />
                    <Typography className="font-medium text-indigo-900">
                      {duration} jour{duration > 1 ? 's' : ''}
                    </Typography>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {prescription.notes && (
            <div className="border-l-2 border-blue-200 pl-6">
              <Typography variant="h6" color="blue-gray" className="mb-4 flex items-center gap-2">
                <DocumentTextIcon className="h-5 w-5 text-blue-500" />
                Notes supplémentaires
              </Typography>
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-xl border border-yellow-200">
                <Typography className="whitespace-pre-line text-yellow-900 leading-relaxed">
                  {prescription.notes}
                </Typography>
              </div>
            </div>
          )}
        </div>
      </DialogBody>
      <DialogFooter className="bg-gradient-to-r from-gray-50 to-blue-50/30 p-4">
        <Button variant="gradient" onClick={onClose} className="bg-gradient-to-r from-blue-500 to-blue-600">
          Fermer
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

const DeletePrescriptionModal = ({ 
  open, 
  onClose, 
  prescription, 
  onConfirm, 
  loading 
}) => (
  <Dialog open={open} handler={onClose}>
    <DialogHeader>Supprimer la prescription</DialogHeader>
    <DialogBody divider>
      <Typography variant="small" className="text-red-500">
        Êtes-vous sûr de vouloir supprimer la prescription pour {prescription?.medication} ? 
        Cette action est irréversible.
      </Typography>
    </DialogBody>
    <DialogFooter>
      <Button
        variant="text"
        color="red"
        onClick={onClose}
        className="mr-1"
        disabled={loading}
      >
        Annuler
      </Button>
      <Button 
        variant="gradient" 
        color="red" 
        onClick={onConfirm}
        disabled={loading}
      >
        {loading ? "Suppression..." : "Supprimer la prescription"}
      </Button>
    </DialogFooter>
  </Dialog>
);

const VaccinationModal = ({ 
  open, 
  onClose, 
  title, 
  formData, 
  updateField, 
  onSubmit, 
  isValid, 
  loading, 
  isEdit = false 
}) => (
  <Dialog open={open} handler={onClose}>
    <DialogHeader>{title}</DialogHeader>
    <DialogBody divider>
      <div className="grid gap-6">
        <Input
          label="Nom du vaccin"
          value={formData.vaccine}
          onChange={(e) => updateField('vaccine', e.target.value)}
          required
        />
        
        <Input
          label="Date d'échéance"
          type="date"
          value={formData.dueDate}
          onChange={(e) => updateField('dueDate', e.target.value)}
          required
        />
        
        <Select
          label="Statut"
          value={formData.status}
          onChange={(val) => updateField('status', val)}
        >
          <Option value="pending">En attente</Option>
          <Option value="done">Administré</Option>
        </Select>
        
        {formData.status === "done" && (
          <Input
            label="Date d'administration"
            type="date"
            value={formData.dateAdministered}
            onChange={(e) => updateField('dateAdministered', e.target.value)}
            required={formData.status === "done"}
          />
        )}
      </div>
    </DialogBody>
    <DialogFooter>
      <Button
        variant="text"
        color="red"
        onClick={onClose}
        className="mr-1"
        disabled={loading}
      >
        Annuler
      </Button>
      <Button 
        variant="gradient" 
        color="green" 
        onClick={onSubmit}
        disabled={!isValid || loading}
      >
        {loading ? "Traitement..." : (isEdit ? "Mettre à jour" : "Créer")}
      </Button>
    </DialogFooter>
  </Dialog>
);

const GrowthModal = ({ 
  open, 
  onClose, 
  formData, 
  updateField, 
  onSubmit, 
  isValid, 
  loading, 
  patientAge 
}) => {
  const calculatedBMI = useMemo(() => 
    calculateBMI(formData.weight, formData.height), 
    [formData.weight, formData.height]
  );
  
  const bmiCategory = useMemo(() => 
    getBMICategory(calculatedBMI, patientAge), 
    [calculatedBMI, patientAge]
  );

  return (
    <Dialog open={open} handler={onClose}>
      <DialogHeader>Ajouter un enregistrement de croissance</DialogHeader>
      <DialogBody divider>
        <div className="grid gap-6">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Taille (cm)"
              type="number"
              value={formData.height}
              onChange={(e) => updateField('height', e.target.value)}
              required
              min="0"
              step="0.1"
            />
            
            <Input
              label="Poids (kg)"
              type="number"
              value={formData.weight}
              onChange={(e) => updateField('weight', e.target.value)}
              required
              min="0"
              step="0.1"
            />
          </div>

          <Input
            label="Périmètre crânien (cm)"
            type="number"
            value={formData.headCircumference}
            onChange={(e) => updateField('headCircumference', e.target.value)}
            min="0"
            step="0.1"
          />
          
          <Input
            label="Date"
            type="date"
            value={formData.growthDate}
            onChange={(e) => updateField('growthDate', e.target.value)}
            required
          />
          
          {formData.height && formData.weight && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <Typography variant="h6" color="blue-gray">
                Calcul IMC
              </Typography>
              <div className="mt-2 grid grid-cols-2 gap-4">
                <div>
                  <Typography variant="small" className="font-semibold text-blue-gray-500">
                    Valeur IMC:
                  </Typography>
                  <Typography variant="lead">
                    {calculatedBMI}
                  </Typography>
                </div>
                <div>
                  <Typography variant="small" className="font-semibold text-blue-gray-500">
                    Catégorie:
                  </Typography>
                  <Chip
                    value={bmiCategory}
                    color={getBMICategoryColor(bmiCategory)}
                    size="md"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogBody>
      <DialogFooter>
        <Button
          variant="text"
          color="red"
          onClick={onClose}
          className="mr-1"
          disabled={loading}
        >
          Annuler
        </Button>
        <Button 
          variant="gradient" 
          color="green" 
          onClick={onSubmit}
          disabled={!isValid || loading}
        >
          {loading ? "Ajout..." : "Ajouter l'enregistrement"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};
const ViewVaccinationModal = ({ 
  open, 
  onClose, 
  vaccination, 
  onScheduleNext, 
  onExportPDF 
}) => (
  <Dialog open={open} handler={onClose}>
    <DialogHeader>Détails de la vaccination</DialogHeader>
    <DialogBody divider>
      {vaccination && (
        <div className="space-y-4">
          <div className="flex justify-between">
            <Typography variant="h6" color="blue-gray">
              {vaccination.vaccine}
            </Typography>
            <Chip
              value={vaccination.status === "done" ? "Complété" : vaccination.status === "pending" ? "En attente" : "En retard"}
              color={getStatusColor(vaccination.status)}
              size="md"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Typography variant="small" className="font-semibold text-blue-gray-500">
                Date d'échéance:
              </Typography>
              <Typography>
                {formatDate(vaccination.dueDate)}
              </Typography>
            </div>
            
            {vaccination.dateAdministered && (
              <div>
                <Typography variant="small" className="font-semibold text-blue-gray-500">
                  Administré:
                </Typography>
                <Typography>
                  {formatDate(vaccination.dateAdministered)}
                </Typography>
              </div>
            )}
            
            <div>
              <Typography variant="small" className="font-semibold text-blue-gray-500">
                Statut:
              </Typography>
              <Typography>
                {vaccination.status === "done" ? "Complété" : vaccination.status === "pending" ? "En attente" : "En retard"}
              </Typography>
            </div>
            
            {vaccination.notes && (
              <div className="col-span-2">
                <Typography variant="small" className="font-semibold text-blue-gray-500">
                  Notes:
                </Typography>
                <Typography>
                  {vaccination.notes}
                </Typography>
              </div>
            )}
          </div>
          
          {vaccination.status === "done" && (
            <div className="mt-4">
              <Button 
                variant="gradient" 
                fullWidth
                onClick={() => onScheduleNext(vaccination)}
              >
                Planifier la prochaine dose
              </Button>
            </div>
          )}
        </div>
      )}
    </DialogBody>
    <DialogFooter>
      <Button 
        variant="text" 
        color="green" 
        size="sm" 
        onClick={() => onExportPDF(vaccination)}
        className="flex items-center gap-1"
      >
        <DocumentArrowDownIcon className="h-4 w-4" />
        Exporter PDF
      </Button>
      <Button 
        variant="outlined" 
        onClick={onClose}
      >
        Fermer
      </Button>
    </DialogFooter>
  </Dialog>
);

const DeleteConfirmationModal = ({ 
  open, 
  onClose, 
  vaccination, 
  onConfirm, 
  loading 
}) => (
  <Dialog open={open} handler={onClose}>
    <DialogHeader>Supprimer l'enregistrement de vaccination</DialogHeader>
    <DialogBody divider>
      <Typography variant="small" className="text-red-500">
        Êtes-vous sûr de vouloir supprimer l'enregistrement pour {vaccination?.vaccine} ? 
        Cette action est irréversible.
      </Typography>
    </DialogBody>
    <DialogFooter>
      <Button
        variant="text"
        color="red"
        onClick={onClose}
        className="mr-1"
        disabled={loading}
      >
        Annuler
      </Button>
      <Button 
        variant="gradient" 
        color="red" 
        onClick={onConfirm}
        disabled={loading}
      >
        {loading ? "Suppression..." : "Supprimer"}
      </Button>
    </DialogFooter>
  </Dialog>
);

// Composant principal
export function PatientDetail() {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  // Gestion des états
  const [activeTab, setActiveTab] = useState("consultations");
  const [selectedVaccination, setSelectedVaccination] = useState(null);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [vaccinations, setVaccinations] = useState(state?.vaccinations || []);
  const [growthRecords, setGrowthRecords] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [clinicLogo, setClinicLogo] = useState('/img/default-logo.png');

  const [medicationData, setMedicationData] = useState([]);
  const [medicationLoading, setMedicationLoading] = useState(false);
  const [medicationError, setMedicationError] = useState(null); 

  const doctorLogo = async () => {
    try {
      const response = await getLogo();
      setClinicLogo(`${import.meta.env.VITE_API_BASE_URL}/${response.logo}`);
    } catch (error) {
      console.error('Erreur lors de la récupération du logo:', error);
      setClinicLogo('/img/default-logo.png');
    }
  };


const loadMedicationData = async () => {
  try {
    setMedicationLoading(true);
    setMedicationError(null);
    console.log("Loading medication data...");
    
    // Try to get cached data first, then fallback to local data
    let medications;
    try {
      medications = await getMedicationsWithCache();
      console.log("Medication Data loaded from cache/API:", medications.length, "medications");
    } catch (error) {
      console.log("Falling back to local medication data...");
      medications = await getLocalMedications();
      console.log("Local medication data loaded:", medications.length, "medications");
    }
    
    // If still no data, try direct import
    if (!medications || medications.length === 0) {
      console.log("No data from service, trying direct import...");
      try {
        const medicationModule = await import('../../data/detailed_medications_data.json');
        medications = medicationModule.default;
        console.log("Direct import successful:", medications.length, "medications");
      } catch (importError) {
        console.error("Direct import failed:", importError);
        // Add some sample data as fallback
        medications = [
          {
            SPECIALITE: "ACFOL",
            DOSAGE: "5 MG",
            FORME: "Comprimé",
            PRESENTATION: "Boite de 28",
            PPV: "24.50",
            SUBSTANCE_ACTIVE: "Acide folique",
            CLASSE_THÉRAPEUTIQUE: "Antianémique",
            DISTRIBUTEUR_OU_FABRIQUANT: "VERSALYA SA",
            INDICATION_S_: "Prévention et traitement de carence en acide folique"
          },
          {
            SPECIALITE: "PARACETAMOL",
            DOSAGE: "500 MG",
            FORME: "Comprimé",
            PRESENTATION: "Boite de 20",
            PPV: "15.00",
            SUBSTANCE_ACTIVE: "Paracétamol",
            CLASSE_THÉRAPEUTIQUE: "Analgésique",
            DISTRIBUTEUR_OU_FABRIQUANT: "PHARMA 5",
            INDICATION_S_: "Traitement de la douleur et de la fièvre"
          }
        ];
        console.log("Using fallback sample data:", medications.length, "medications");
      }
    }
    
    setMedicationData(medications);
  } catch (error) {
    console.error('Erreur lors de la récupération des données de médication:', error);
    setMedicationError('Failed to load medication data.');
    setMedicationData([]);
  } finally {
    setMedicationLoading(false);
  }
};


  useEffect(() => {
    loadMedicationData();

    doctorLogo();
  }, [
  ]);

  console.log("medicationData length:", medicationData.length);
  console.log("medicationData sample:", medicationData.slice(0, 2));

  // Gestion des états des formulaires
  const [vaccinationForm, setVaccinationForm] = useState({
    vaccine: "",
    dueDate: "",
    status: "pending",
    dateAdministered: ""
  });

 const [growthForm, setGrowthForm] = useState({
  height: "",
  weight: "",
  headCircumference: "",
  growthDate: ""
}); 

  const [prescriptionForm, setPrescriptionForm] = useState([
    {
      medication: "",
      dosage: "",
      frequency: "",
      startDate: new Date().toISOString().split('T')[0],
      duration: "",
      notes: ""
    }
  ]);

  const [documentForm, setDocumentForm] = useState({
    title: "",
    file: null,
  });

  // États des rendez-vous
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [appointmentForm, setAppointmentForm] = useState({
    doctor: "",
    type: "",
    date: "",
    time: "",
    notes: "",
    reason: ""
  });
  const [appointments, setAppointments] = useState([]);
  
  // États de gestion des rendez-vous
  const [appointmentMode, setAppointmentMode] = useState('create');
  const [selectedAppointmentToEdit, setSelectedAppointmentToEdit] = useState(null);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  
  // Filtres et tris
  const [filters, setFilters] = useState({
    status: "all",
    sortField: "dueDate",
    sortDirection: "asc"
  });
  
  // États des modales
  const [modals, setModals] = useState({
    create: false,
    edit: false,
    delete: false,
    view: false,
    growth: false,
    prescription: false,
    viewPrescription: false,
    deletePrescription: false,
    appointment: false,
    uploadDocument: false,
    deleteDocument: false,
    wordTemplate: false
  });

  // Validation
  const isGrowthFormValid = useMemo(() => {
    const { height, weight, growthDate } = growthForm;
    return (
      height && weight && growthDate &&
      !isNaN(parseFloat(height)) &&
      !isNaN(parseFloat(weight)) &&
      parseFloat(height) > 0 &&
      parseFloat(weight) > 0
    );
  }, [growthForm]);

  const isPrescriptionFormValid = useMemo(() => {
    return prescriptionForm.every(medication => {
      const { medication: med, dosage, frequency, startDate, duration } = medication;
      return (
        med.trim() !== "" &&
        dosage.trim() !== "" &&
        frequency.trim() !== "" &&
        startDate.trim() !== "" &&
        duration && parseInt(duration) > 0
      );
    });
  }, [prescriptionForm]);

  const isVaccinationFormValid = useMemo(() => {
    const { vaccine, dueDate, status, dateAdministered } = vaccinationForm;
    return (
      vaccine.trim() !== "" &&
      dueDate.trim() !== "" &&
      (status !== "done" || dateAdministered.trim() !== "")
    );
  }, [vaccinationForm]);

  // Gestion des cas d'erreur
  if (!state?.patient) {
    return (
      <div className="p-4 text-center">
        <Alert color="red" icon={<ExclamationTriangleIcon className="h-6 w-6" />}>
          Informations patient introuvables. Veuillez naviguer depuis la liste des patients.
        </Alert>
        <Button onClick={() => navigate('/patients')} className="mt-4">
          Retour à la liste des patients
        </Button>
      </div>
    );
  }
  
  // Traitement des données du patient
  const { patient, age, tarifOfThisPatient } = state;


  console.log("tariiiiiiiiiifffff", tarifOfThisPatient);

  const patientAge = age ? parseInt(age) : 0;

  const patientData = useMemo(() => ({
    id: patient._id,
    name: `${patient.firstName} ${patient.lastName}`,
    avatar: patient.img || "/img/default-avatar.jpg",
    age: `${age} ans` || "Non spécifié",
    tarif: tarifOfThisPatient || "Non spécifié",
    gender: patient.gender || "Non spécifié",
    bloodType: patient.bloodType || "Non spécifié",
    phoneNumber: patient.parent?.phoneNumber || "Non spécifié",
    email: patient.parent?.email || "Non spécifié",
    address: patient.parent?.address || "Non spécifié",
    emergencyContact: patient.parent?.fullName || "Non spécifié",
    allergies: patient.allergies || "Aucune spécifiée",
    chronicConditions: patient.chronicConditions || "Aucune spécifiée",
  }), [patient]);
  
  // Traitement des rendez-vous
  const processedAppointments = useMemo(() =>
    (patient.appointments || []).map(appointment => ({
      _id: appointment._id,
      name: appointment.doctor || "Personnel médical",
      message: `Rendez-vous pour ${appointment.type || "consultation"}`,
      time: appointment.date ? formatDate(appointment.date) : "Date non spécifiée",
      hour: appointment.time ? appointment.time : "Heure non spécifiée",
      date: appointment.date,
      doctor: appointment.doctor,
      type: appointment.type,
      notes: appointment.notes,
      reason: appointment.reason || appointment.notes
    })),
    [patient.appointments]
  );

  // Filtrage et tri des vaccinations
  const filteredVaccinations = useMemo(() => {
    let result = [...vaccinations];

    if (filters.status !== "all") {
      result = result.filter(v => v.status === filters.status);
    }

    result.sort((a, b) => {
      let comparison = 0;
      switch (filters.sortField) {
        case "vaccine":
          comparison = a.vaccine.localeCompare(b.vaccine);
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
        case "dueDate":
        default:
          comparison = new Date(a.dueDate) - new Date(b.dueDate);
          break;
      }
      return filters.sortDirection === "asc" ? comparison : -comparison;
    });

    return result;
  }, [vaccinations, filters]);

  // Fonctions API
  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const documents = await DocumentService.getDocuments(id);
      setDocuments(documents);
    } catch (error) {
      console.error('Erreur lors de la récupération des documents:', error);
      toast.error('Échec du chargement des documents');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const uploadDocument = useCallback(async () => {
    if (!documentForm.title || !documentForm.file) return;
    
    try {
      setLoading(true);
      
      const response = await DocumentService.uploadDocument(
        documentForm.file,
        id,
        documentForm.title,
        'document'
      );
      
      setDocuments(prev => [...prev, response]);
      setModals(prev => ({ ...prev, uploadDocument: false }));
      setDocumentForm({ title: "", file: null });
      const fileName = response.fileName || 'document.txt';
      const isLocal = response.isLocal;
      const message = isLocal 
        ? `Document sauvegardé localement ! Fichier: ${fileName}`
        : `Document téléchargé avec succès ! Fichier: ${fileName}`;
      toast.success(message);
    } catch (error) {
      console.error('Erreur lors du téléchargement du document:', error);
      const errorMessage = error.response?.data?.message || 'Échec du téléchargement du document';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [documentForm, id]);

  const deleteDocument = useCallback(async () => {
    if (!selectedDocument) return;
    
    try {
      setLoading(true);
      await DocumentService.deleteDocument(selectedDocument._id);
      setDocuments(prev => prev.filter(doc => doc._id !== selectedDocument._id));
      setModals(prev => ({ ...prev, deleteDocument: false }));
      toast.success('Document supprimé avec succès !');
    } catch (error) {
      console.error('Erreur lors de la suppression du document:', error);
      const errorMessage = error.response?.data?.message || 'Échec de la suppression du document';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [selectedDocument]);

  const downloadDocument = useCallback(async (doc) => {
    try {
      setLoading(true);
      
      // Get document content using DocumentService
      const content = await DocumentService.downloadDocument(doc._id);
      
      // Create blob and download
      let blob;
      let mimeType = 'text/plain;charset=utf-8';
      let fileName = doc.fileName || doc.title || 'document.txt';
      
      // Determine MIME type based on file extension
      const extension = fileName.split('.').pop().toLowerCase();
      switch (extension) {
        case 'pdf':
          mimeType = 'application/pdf';
          break;
        case 'docx':
          mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          break;
        case 'jpg':
        case 'jpeg':
          mimeType = 'image/jpeg';
          break;
        case 'png':
          mimeType = 'image/png';
          break;
        case 'gif':
          mimeType = 'image/gif';
          break;
        default:
          mimeType = 'text/plain;charset=utf-8';
      }
      
      // Handle base64 content (for binary files)
      if (typeof content === 'string' && content.startsWith('data:')) {
        // Convert base64 to blob
        const response = await fetch(content);
        blob = await response.blob();
      } else {
        // Handle text content
        blob = new Blob([content], { type: mimeType });
      }
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success(`Document téléchargé: ${fileName}`);
    } catch (error) {
      console.error('Erreur lors du téléchargement du document:', error);
      toast.error('Échec du téléchargement du document');
    } finally {
      setLoading(false);
    }
  }, []);

  const saveWordTemplateToHistory = useCallback(async (documentData) => {
    try {
      setLoading(true);
      
      const response = await DocumentService.uploadWordTemplate(
        documentData.content,
        id,
        documentData.title,
        documentData.type
      );
      
      setDocuments(prev => [...prev, response]);
      const fileName = response.fileName || 'document.txt';
      const isLocal = response.isLocal;
      const message = isLocal 
        ? `Document sauvegardé localement ! Fichier: ${fileName}`
        : `Document téléchargé avec succès ! Fichier: ${fileName}`;
      toast.success(message);
      
      // Return the document ID for the modal to use
      return response._id || response.id;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du document Word:', error);
      const errorMessage = error.response?.data?.message || 'Échec de la sauvegarde du document Word';
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchGrowthRecords = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/growth-records/${id}`);
      setGrowthRecords(response.data);
      setError(null);
    } catch (error) {
      console.error('Erreur lors de la récupération des enregistrements de croissance:', error);
      setError('Échec du chargement des enregistrements de croissance');
      toast.error('Échec du chargement des enregistrements de croissance');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchPrescriptions = useCallback(async () => {
    try {
      setLoading(true);
      const patientId = id || state?.patient?._id;
      const response = await axiosInstance.get(`/prescriptions/${patientId}`);
      setPrescriptions(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des prescriptions:', error);
      toast.error('Échec du chargement des prescriptions');
    } finally {
      setLoading(false);
    }
  }, [id, state?.patient?._id]);

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/appointments`);
      setAppointments(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des rendez-vous:', error);
      toast.error('Échec du chargement des rendez-vous');
    } finally {
      setLoading(false);
    }
  }, [id]);
  
  // Fonctions API pour les vaccinations
  const createVaccination = useCallback(async () => {
    if (!isVaccinationFormValid) return;
    
    try {
      setLoading(true);
      const response = await axiosInstance.post('/vaccinations', {
        patientId: id,
        ...vaccinationForm,
        dueDate: new Date(vaccinationForm.dueDate).toISOString(),
        dateAdministered: vaccinationForm.status === 'done' 
          ? new Date(vaccinationForm.dateAdministered).toISOString() 
          : null
      });
      
      setVaccinations(prev => [...prev, response.data]);
      setModals(prev => ({ ...prev, create: false }));
      setVaccinationForm({
        vaccine: "",
        dueDate: "",
        status: "pending",
        dateAdministered: ""
      });
      toast.success('Vaccination créée avec succès !');
    } catch (error) {
      console.error('Erreur lors de la création de la vaccination:', error);
      toast.error('Échec de la création de la vaccination');
    } finally {
      setLoading(false);
    }
  }, [vaccinationForm, isVaccinationFormValid, id]);
  
  const updateVaccination = useCallback(async () => {
    if (!selectedVaccination || !isVaccinationFormValid) return;
    
    try {
      setLoading(true);
      const response = await axiosInstance.put(`/vaccinations/${selectedVaccination._id}`, {
        ...vaccinationForm,
        dueDate: new Date(vaccinationForm.dueDate).toISOString(),
        dateAdministered: vaccinationForm.status === 'done' 
          ? new Date(vaccinationForm.dateAdministered).toISOString() 
          : null
      });
      
      setVaccinations(prev =>
        prev.map(v => v._id === selectedVaccination._id ? response.data : v)
      );
      setModals(prev => ({ ...prev, edit: false }));
      toast.success('Vaccination mise à jour avec succès !');
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la vaccination:', error);
      toast.error('Échec de la mise à jour de la vaccination');
    } finally {
      setLoading(false);
    }
  }, [selectedVaccination, vaccinationForm, isVaccinationFormValid]);
  
  const deleteVaccination = useCallback(async () => {
    if (!selectedVaccination) return;
    
    try {
      setLoading(true);
      await axiosInstance.delete(`/vaccinations/${selectedVaccination._id}`);
      setVaccinations(prev => prev.filter(v => v._id !== selectedVaccination._id));
      setModals(prev => ({ ...prev, delete: false }));
      toast.success('Vaccination supprimée avec succès !');
    } catch (error) {
      console.error('Erreur lors de la suppression de la vaccination:', error);
      toast.error('Échec de la suppression de la vaccination');
    } finally {
      setLoading(false);
    }
  }, [selectedVaccination]);
  
const addGrowthRecord = useCallback(async () => {
  if (!isGrowthFormValid) return;
  
  try {
    setLoading(true);
    const bmi = calculateBMI(growthForm.weight, growthForm.height);
    const response = await axiosInstance.post('/growth-records', {
      patientId: id,
      heightCm: parseFloat(growthForm.height),
      weightKg: parseFloat(growthForm.weight),
      headCircumferenceCm: growthForm.headCircumference ? parseFloat(growthForm.headCircumference) : undefined,
      date: new Date(growthForm.growthDate).toISOString()
    });
    
    setGrowthRecords(prev => [...prev, response.data]);
    setModals(prev => ({ ...prev, growth: false }));
    setGrowthForm({
      height: "",
      weight: "",
      headCircumference: "",
      growthDate: ""
    });
    toast.success('Enregistrement de croissance ajouté avec succès !');
  } catch (error) {
    console.error('Erreur lors de l\'ajout de l\'enregistrement de croissance:', error);
    toast.error('Échec de l\'ajout de l\'enregistrement de croissance');
  } finally {
    setLoading(false);
  }
}, [growthForm, isGrowthFormValid, id]);
  
  const deleteGrowthRecord = useCallback(async (recordId) => {
    try {
      setLoading(true);
      await axiosInstance.delete(`/growth-records/${recordId}`);
      setGrowthRecords(prev => prev.filter(record => record._id !== recordId));
      toast.success('Enregistrement de croissance supprimé avec succès !');
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'enregistrement de croissance:', error);
      toast.error('Échec de la suppression de l\'enregistrement de croissance');
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Fonctions API pour les prescriptions
  const addPrescription = useCallback(async () => {
    if (!isPrescriptionFormValid) return;
    
    try {
      setLoading(true);
      
      // Create prescriptions for each medication
      const prescriptionPromises = prescriptionForm.map(async (medicationForm) => {
        // Calculate end date from start date and duration
        const startDate = new Date(medicationForm.startDate);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + parseInt(medicationForm.duration));
        
        const payload = {
          patientId: id,
          medication: medicationForm.medication,
          dosage: medicationForm.dosage,
          frequency: medicationForm.frequency,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          notes: medicationForm.notes || "",
          status: endDate < new Date() 
            ? PRESCRIPTION_STATUS.completed 
            : PRESCRIPTION_STATUS.active
        };
        
        console.log('Sending prescription payload:', payload);
        return await axiosInstance.post('/prescriptions', payload);
      });
      
      const responses = await Promise.all(prescriptionPromises);
      const newPrescriptions = responses.map(response => response.data);
      setPrescriptions(prev => [...prev, ...newPrescriptions]);
      setModals(prev => ({ ...prev, prescription: false }));
      setPrescriptionForm([
        {
          medication: "",
          dosage: "",
          frequency: "",
          startDate: new Date().toISOString().split('T')[0],
          duration: "",
          notes: ""
        }
      ]);
      toast.success(`${newPrescriptions.length} prescription(s) ajoutée(s) avec succès !`);
    } catch (error) {
      console.error('Erreur lors de l\'ajout des prescriptions:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      toast.error('Échec de l\'ajout des prescriptions');
    } finally {
      setLoading(false);
    }
  }, [prescriptionForm, isPrescriptionFormValid, id]);

  const updatePrescription = useCallback(async () => {
    if (!selectedPrescription || !isPrescriptionFormValid) return;
    
    try {
      setLoading(true);
      
      // For editing, we only work with the first medication in the array
      const medicationForm = prescriptionForm[0];
      
      // Calculate end date from start date and duration
      const startDate = new Date(medicationForm.startDate);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + parseInt(medicationForm.duration));
      
      const payload = {
        medication: medicationForm.medication,
        dosage: medicationForm.dosage,
        frequency: medicationForm.frequency,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        notes: medicationForm.notes || "",
        status: endDate < new Date() 
          ? PRESCRIPTION_STATUS.completed 
          : PRESCRIPTION_STATUS.active
      };
      
      const response = await axiosInstance.patch(`/prescriptions/${selectedPrescription._id}`, payload);
      setPrescriptions(prev => 
        prev.map(p => p._id === selectedPrescription._id ? response.data : p)
      );
      setModals(prev => ({ ...prev, prescription: false }));
      toast.success('Prescription mise à jour avec succès !');
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la prescription:', error);
      toast.error('Échec de la mise à jour de la prescription');
    } finally {
      setLoading(false);
    }
  }, [selectedPrescription, prescriptionForm, isPrescriptionFormValid]);

  const deletePrescription = useCallback(async () => {
    if (!selectedPrescription) return;
    
    try {
      setLoading(true);
      await axiosInstance.delete(`/prescriptions/${selectedPrescription._id}`);
      setPrescriptions(prev => prev.filter(p => p._id !== selectedPrescription._id));
      setModals(prev => ({ ...prev, deletePrescription: false }));
      toast.success('Prescription supprimée avec succès !');
    } catch (error) {
      console.error('Erreur lors de la suppression de la prescription:', error);
      toast.error('Échec de la suppression de la prescription');
    } finally {
      setLoading(false);
    }
  }, [selectedPrescription]);

  // Gestion des rendez-vous
  const handleOpen = async (patientData) => {
    setSelectedPatient(patientData);
    setModals(prev => ({ ...prev, appointment: true }));
    setAppointmentMode('create');
    setSelectedAppointmentToEdit(null);
    setSelectedDate(null);
    setSelectedTime(null);

    setAppointmentForm({
      doctor: "",
      type: "",
      date: "",
      time: "",
      notes: "",
      reason: ""
    });

    try {
      await fetchAppointments();
      setSelectedPatient(patientData);
      setModals(prev => ({ ...prev, appointment: true }));
      setAppointmentMode('create');
      setSelectedAppointmentToEdit(null);
      setSelectedDate(null);
      setSelectedTime(null);
    } catch (error) {
      console.error('Erreur lors de la récupération des rendez-vous:', error);
      toast.error('Échec du chargement des données de rendez-vous');
    }
  };

  const handleEditAppointment = (appointmentToEdit) => {
    setAppointmentMode('update');
    setSelectedAppointmentToEdit(appointmentToEdit);
    
    const appointmentDate = new Date(appointmentToEdit.date);
    setSelectedDate(appointmentDate);
    setSelectedTime(appointmentToEdit.hour);
    
    setAppointmentForm({
      doctor: appointmentToEdit.doctor || "",
      type: appointmentToEdit.type || "",
      date: appointmentToEdit.date,
      time: appointmentToEdit.hour,
      notes: appointmentToEdit.notes || "",
      reason: appointmentToEdit.reason || appointmentToEdit.notes || ""
    });
    
    setModals(prev => ({ ...prev, appointment: true }));
  };

  const handleDeleteAppointment = (appointmentToDelete) => {
    setAppointmentToDelete(appointmentToDelete);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteAppointment = async () => {
    try {
      setLoading(true);
      
      await axiosInstance.delete(`/appointments/${appointmentToDelete._id}`);
      
      toast.success('Rendez-vous supprimé avec succès !');
      
      await fetchAppointments();
      
      window.location.reload();
    } catch (error) {
      console.error('Erreur lors de la suppression du rendez-vous:', error);
      toast.error('Échec de la suppression du rendez-vous');
    } finally {
      setLoading(false);
      setDeleteConfirmOpen(false);
      setAppointmentToDelete(null);
    }
  };

  const handleAppointmentSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const appointmentData = {
        patientId: selectedPatient?._id || patient._id,
        date: selectedDate ? selectedDate.toISOString().split('T')[0] : appointmentForm.date,
        time: selectedTime || appointmentForm.time,
        reason: appointmentForm.reason,
        type: appointmentForm.type || 'consultation',
        doctor: appointmentForm.doctor || 'Dr. Default',
        notes: appointmentForm.notes || appointmentForm.reason
      };

      let response;
      if (appointmentMode === 'create') {
        response = await axiosInstance.post('/appointments', appointmentData);
        toast.success('Rendez-vous créé avec succès !');
      } else if (appointmentMode === 'update' && selectedAppointmentToEdit) {
        response = await axiosInstance.put(`/appointments/${selectedAppointmentToEdit._id}`, appointmentData);
        toast.success('Rendez-vous mis à jour avec succès !');
      }

      if (response.status === 200 || response.status === 201) {
        setModals(prev => ({ ...prev, appointment: false }));
        await fetchAppointments();
        window.location.reload();
      }
      
    } catch (error) {
      console.error('Erreur lors du traitement du rendez-vous:', error);
      toast.error('Échec du traitement du rendez-vous');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isTimeSlotBooked = (time) => {
    if (!selectedDate) return false;
    
    const selectedDateStr = selectedDate.toISOString().split('T')[0];
    
    const conflictingAppointment = appointments.find(appt => {
      const apptDate = new Date(appt.date).toISOString().split('T')[0];
      const isConflict = apptDate === selectedDateStr && appt.time === time;
      
      if (appointmentMode === 'update' && selectedAppointmentToEdit) {
        return isConflict && appt._id !== selectedAppointmentToEdit._id;
      }
      
      return isConflict;
    });

    return !!conflictingAppointment;
  };



const exportVaccinationPDF = useCallback(async (vaccination) => {
  try {
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Define colors - using prescription's teal theme
    const tealPrimary = [45, 150, 150];
    const tealSecondary = [70, 180, 180];
    const darkBlue = [25, 35, 85];
    const mediumGray = [150, 150, 150];
    const white = [255, 255, 255];
    const vaccineAccent = [34, 139, 34]; // Green for vaccination theme
    
    // Page dimensions
    const pageWidth = 210;
    const pageHeight = 297;
    
    // === HEADER SECTION (similar to prescription) ===
    doc.setFillColor(...tealPrimary);
    doc.rect(0, 0, pageWidth, 45, 'F');
    doc.setFillColor(...tealSecondary);
    
    // Decorative ellipses like prescription
    for (let i = 0; i < 3; i++) {
      doc.ellipse(pageWidth - 20, 20 + (i * 5), 25 + (i * 3), 15 + (i * 2), 'F');
    }

    // === LOGO SECTION ===
    let logoAdded = false;
    
    console.log('Vaccination PDF - Clinic logo URL:', clinicLogo);
    console.log('Vaccination PDF - Logo type:', typeof clinicLogo);
    
    if (clinicLogo && clinicLogo !== '/img/default-logo.png') {
      try {
        console.log('Attempting to load clinic logo for vaccination:', clinicLogo);
        let logoBase64;
        
        if (clinicLogo.startsWith('data:')) {
          logoBase64 = clinicLogo;
          console.log('Using base64 logo directly for vaccination');
        } else {
          console.log('Converting URL to base64 for vaccination:', clinicLogo);
          logoBase64 = await convertImageToBase64(clinicLogo);
          console.log('Vaccination logo conversion successful, base64 length:', logoBase64.length);
        }
        
        doc.addImage(logoBase64, 'PNG', 8, 8, 20, 20);
        logoAdded = true;
        console.log('Logo successfully added to vaccination PDF');
        
      } catch (logoError) {
        console.error('Could not load clinic logo for vaccination PDF:', logoError);
        console.error('Vaccination logo error details:', {
          message: logoError.message,
          stack: logoError.stack,
          logoUrl: clinicLogo
        });
      }
    } else {
      console.log('No valid clinic logo provided for vaccination, using fallback');
    }
    
    // Fallback logo placeholder if logo fails to load
    if (!logoAdded) {
      console.log('Using fallback medical cross for vaccination PDF');
      
      doc.setDrawColor(...tealPrimary);
      doc.setFillColor(...white);
      doc.rect(8, 8, 20, 20, 'FD');
      
      // Medical cross symbol as fallback
      doc.setLineWidth(1.5);
      doc.setDrawColor(...tealPrimary);
      doc.line(18, 11, 18, 25); // Vertical line
      doc.line(11, 18, 25, 18); // Horizontal line
      
      // Add vaccination symbol
      doc.setFontSize(6);
      doc.setTextColor(...tealPrimary);
      doc.text("VAX", 18, 23, null, null, "center");
    }

    // Header text (similar to prescription)
    doc.setTextColor(...white);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('CENTRE MÉDICAL', 35, 18);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('SERVICES DE VACCINATION', 35, 25);

    // === DOCTOR INFO SECTION (like prescription) ===
    const doctorSectionY = 55;
    doc.setTextColor(...darkBlue);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    const doctorName = localStorage.getItem('doctorName') || 'Médecin';
    doc.text(`Dr ${doctorName}`, pageWidth / 2, doctorSectionY, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text('Médecin Vaccinateur', pageWidth / 2, doctorSectionY + 8, { align: 'center' });
    doc.setFontSize(10);
    // Generate random ID like prescription
    const randomId = Math.floor(100000000 + Math.random() * 900000000);
    doc.text(`ID N° ${randomId}`, pageWidth / 2, doctorSectionY + 15, { align: 'center' });

    // === PATIENT INFO SECTION (form fields like prescription) ===
    let currentY = doctorSectionY + 35;
    const createFormField = (label, value, x, y, width = 60) => {
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(label, x, y);
      const labelWidth = doc.getTextWidth(label);
      doc.setLineWidth(0.3);
      doc.setDrawColor(...mediumGray);
      doc.line(x + labelWidth + 2, y + 1, x + labelWidth + width, y + 1);
      if (value) {
        doc.setFontSize(9);
        doc.text(value, x + labelWidth + 4, y - 1);
      }
    };
    
    createFormField('N°', vaccination._id?.slice(-6) || '', 20, currentY, 50);
    createFormField('Date', new Date().toLocaleDateString('fr-FR'), 120, currentY, 50);
    currentY += 12;
    createFormField("Nom du patient", patientData.name || '', 20, currentY, 150);
    currentY += 12;
    createFormField('Date de naissance', patientData.age ? patientData.age.toString() : '', 20, currentY, 40);
    createFormField('Âge', patientData.age?.toString() || '', 80, currentY, 25);
    createFormField('ID Patient', patient._id?.slice(-6) || '', 130, currentY, 40);
    currentY += 25;

    // === VACCINATION SECTION (like Rx section) ===
    doc.setFont('times', 'bold');
    doc.setFontSize(48);
    doc.setTextColor(...darkBlue);
    doc.text('VAX :', 20, currentY);
    doc.setLineWidth(2);
    doc.setDrawColor(...tealPrimary);
    doc.line(20, currentY + 3, 60, currentY + 3);
    currentY += 25;

    // Vaccination details (like medication details)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(...vaccineAccent);
    doc.text(vaccination.vaccine || 'Nom du vaccin', 20, currentY);
    currentY += 12;

    // Status with color coding
    const statusColor = vaccination.status === 'done' ? [0, 150, 0] : 
                       vaccination.status === 'pending' ? [255, 165, 0] : [255, 0, 0];
    doc.setTextColor(...statusColor);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    const statusText = vaccination.status === 'done' ? 'COMPLÉTÉ' : 
                      vaccination.status === 'pending' ? 'EN ATTENTE' : 'EN RETARD';
    doc.text(`Statut: ${statusText}`, 20, currentY);
    currentY += 20;

    // === VACCINATION SCHEDULE (like dosage instructions) ===
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text('Date d\'échéance', 20, currentY);
    doc.setLineWidth(0.3);
    doc.setDrawColor(...mediumGray);
    doc.line(65, currentY + 1, 145, currentY + 1);
    if (vaccination.dueDate) {
      doc.setFontSize(10);
      doc.text(formatDate(vaccination.dueDate), 70, currentY - 1);
    }
    currentY += 15;

    if (vaccination.dateAdministered) {
      doc.text('Date d\'administration', 20, currentY);
      doc.line(85, currentY + 1, 165, currentY + 1);
      doc.setFontSize(10);
      doc.text(formatDate(vaccination.dateAdministered), 90, currentY - 1);
      currentY += 15;
    }

    if (vaccination.batchNumber) {
      doc.setFontSize(11);
      doc.text('Numéro de lot', 20, currentY);
      doc.line(65, currentY + 1, 145, currentY + 1);
      doc.setFontSize(10);
      doc.text(vaccination.batchNumber, 70, currentY - 1);
      currentY += 15;
    }

    // === PROVIDER LOCATION (like prescription timing) ===
    currentY += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text('Lieu d\'administration', 20, currentY);
    const location = vaccination.location || 'Centre Médical';
    doc.setLineWidth(0.3);
    doc.line(85, currentY + 1, 180, currentY + 1);
    doc.setFontSize(10);
    doc.text(location, 90, currentY - 1);
    currentY += 20;

    // === SPECIAL INSTRUCTIONS (like prescription notes) ===
    if (vaccination.notes && vaccination.notes.trim()) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('Instructions spéciales :', 20, currentY);
      currentY += 8;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const noteLines = doc.splitTextToSize(vaccination.notes, 170);
      doc.text(noteLines, 20, currentY);
      currentY += noteLines.length * 5 + 5;
    }

    // === VALIDITY SECTION ===
    currentY += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...mediumGray);
    const nextDueDate = calculateNextDueDate(vaccination);
    if (nextDueDate && vaccination.status === 'done') {
      doc.text(`Validité : Valide jusqu'à ${formatDate(nextDueDate)}`, 20, currentY);
    } else {
      doc.text(`Statut actuel : ${statusText}`, 20, currentY);
    }

    // === QR CODE SECTION ===
    const qrX = 150;
    const qrY = Math.max(currentY - 40, 180);
    doc.setDrawColor(...mediumGray);
    doc.rect(qrX, qrY, 30, 30);
    doc.setFontSize(8);
    doc.setTextColor(...mediumGray);
    doc.text("QR CODE", qrX + 15, qrY + 17, null, null, "center");
    doc.text("VERIFICATION", qrX + 15, qrY + 22, null, null, "center");

    // === SIGNATURE SECTION (like prescription) ===
    currentY = Math.max(currentY + 20, 220);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text("Signature du médecin", 20, currentY);
    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 0, 0);
    doc.line(20, currentY + 8, 80, currentY + 8);
    doc.text('Date', 120, currentY);
    doc.line(120, currentY + 8, 160, currentY + 8);
    doc.setFontSize(9);
    doc.text(new Date().toLocaleDateString('fr-FR'), 125, currentY + 6);

    // === FOOTER SECTION (like prescription) ===
    const footerY = pageHeight - 20;
    doc.setFillColor(...tealPrimary);
    doc.rect(0, footerY - 8, pageWidth, 20, 'F');
    doc.setTextColor(...white);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('123, Rue Exemple', 20, footerY);
    doc.text('CENTRE DE VACCINATION MÉDICAL', pageWidth / 2, footerY, { align: 'center' });
    doc.text('+00 123 456 789', pageWidth - 20, footerY, { align: 'right' });

    // === WATERMARK (like prescription Rx) ===
    doc.setTextColor(250, 250, 250);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(60);
    doc.text('VAX', pageWidth / 2, pageHeight / 2, { align: 'center', angle: 45 });

    // === VERIFICATION CODE ===
    const verificationCode = `VAX-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    doc.setTextColor(...mediumGray);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`Code de vérification: ${verificationCode}`, pageWidth / 2, footerY - 12, { align: 'center' });

    // === GENERATE FILENAME AND SAVE ===
    const safeName = (patientData.name || 'patient').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const safeVaccine = (vaccination.vaccine || 'vaccine').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const timestamp = new Date().toISOString().split('T')[0];
    
    doc.save(`certificat_vaccination_${safeName}_${safeVaccine}_${timestamp}.pdf`);
    
    // Success notification
    toast.success('Certificat de vaccination généré avec succès !');
    
  } catch (error) {
    console.error('Erreur lors de la génération du PDF de vaccination :', error);
    toast.error('Échec de la génération du PDF de vaccination. Veuillez réessayer.');
  }
}, [patientData, patient, formatDate, clinicLogo, calculateNextDueDate]);
// Updated exportPrescriptionPDF function
const exportPrescriptionPDF = useCallback(async (prescription) => {
  try {
    const doc = new jsPDF('p', 'mm', 'a4');
    const tealPrimary = [45, 150, 150];
    const tealSecondary = [70, 180, 180];
    const darkBlue = [25, 35, 85];
    const mediumGray = [150, 150, 150];
    const white = [255, 255, 255];
    const pageWidth = 210;
    const pageHeight = 297;

    // En-tête
    doc.setFillColor(...tealPrimary);
    doc.rect(0, 0, pageWidth, 45, 'F');
    doc.setFillColor(...tealSecondary);
    for (let i = 0; i < 3; i++) {
      doc.ellipse(pageWidth - 20, 20 + (i * 5), 25 + (i * 3), 15 + (i * 2), 'F');
    }

    // === LOGO SECTION ===
    let logoAdded = false;
    
    // Debug logging
    console.log('Prescription PDF - Clinic logo URL:', clinicLogo);
    console.log('Prescription PDF - Logo type:', typeof clinicLogo);
    
    if (clinicLogo && clinicLogo !== '/img/default-logo.png') {
      try {
        console.log('Attempting to load clinic logo for prescription:', clinicLogo);
        let logoBase64;
        
        // If it's already a data URL (base64), use it directly
        if (clinicLogo.startsWith('data:')) {
          logoBase64 = clinicLogo;
          console.log('Using base64 logo directly for prescription');
        } 
        // If it's a URL (like your localhost URL), convert it to base64
        else {
          console.log('Converting URL to base64 for prescription:', clinicLogo);
          logoBase64 = await convertImageToBase64(clinicLogo);
          console.log('Prescription logo conversion successful, base64 length:', logoBase64.length);
        }
        
        // Add the logo to PDF with proper sizing
        doc.addImage(logoBase64, 'PNG', 8, 8, 20, 20);
        logoAdded = true;
        console.log('Logo successfully added to prescription PDF');
        
      } catch (logoError) {
        console.error('Could not load clinic logo for prescription PDF:', logoError);
        console.error('Prescription logo error details:', {
          message: logoError.message,
          stack: logoError.stack,
          logoUrl: clinicLogo
        });
        // Will fall back to placeholder below
      }
    } else {
      console.log('No valid clinic logo provided for prescription, using fallback');
    }
    
    // Fallback logo placeholder if logo fails to load
    if (!logoAdded) {
      console.log('Using fallback medical cross for prescription PDF');
      
      // Create a more sophisticated medical cross
      doc.setDrawColor(...tealPrimary);
      doc.setFillColor(...white);
      doc.rect(8, 8, 20, 20, 'FD');
      
      // Medical cross symbol as fallback
      doc.setLineWidth(1.5);
      doc.setDrawColor(...tealPrimary);
      // Vertical line of cross
      doc.line(18, 11, 18, 25);
      // Horizontal line of cross
      doc.line(11, 18, 25, 18);
      
      // Add small medical symbol
      doc.setFontSize(6);
      doc.setTextColor(...tealPrimary);
      doc.text("Rx", 18, 23, null, null, "center");
    }

    // Texte en-tête
    doc.setTextColor(...white);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('CENTRE MÉDICAL', 35, 18);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('SERVICES DE SANTÉ', 35, 25);

    // Infos médecin
    const doctorSectionY = 55;
    doc.setTextColor(...darkBlue);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    const doctorName = localStorage.getItem('doctorName') || 'Médecin';
    doc.text(`Dr ${doctorName}`, pageWidth / 2, doctorSectionY, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text('Pédiatre', pageWidth / 2, doctorSectionY + 8, { align: 'center' });
    doc.setFontSize(10);
    // Générer un numéro d'identification aléatoire à 9 chiffres
    const randomId = Math.floor(100000000 + Math.random() * 900000000);
    doc.text(`ID N° ${randomId}`, pageWidth / 2, doctorSectionY + 15, { align: 'center' });

    // Infos patient
    let currentY = doctorSectionY + 35;
    const createFormField = (label, value, x, y, width = 60) => {
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(label, x, y);
      const labelWidth = doc.getTextWidth(label);
      doc.setLineWidth(0.3);
      doc.setDrawColor(...mediumGray);
      doc.line(x + labelWidth + 2, y + 1, x + labelWidth + width, y + 1);
      if (value) {
        doc.setFontSize(9);
        doc.text(value, x + labelWidth + 4, y - 1);
      }
    };
    
    createFormField('N°', '', 20, currentY, 50);
    createFormField('Date', new Date().toLocaleDateString('fr-FR'), 120, currentY, 50);
    currentY += 12;
    createFormField("Nom du patient", patientData.name || '', 20, currentY, 150);
    currentY += 12;
    createFormField('Date de naissance', patientData.age ? patientData.age.toString() : '', 20, currentY, 40);
    createFormField('Âge', patientData.age?.toString() || '', 80, currentY, 25);
    createFormField('Sexe', patientData.gender || '', 130, currentY, 40);
    currentY += 25;

    // Section Rx
    doc.setFont('times', 'bold');
    doc.setFontSize(48);
    doc.setTextColor(...darkBlue);
    doc.text('Rx :', 20, currentY);
    doc.setLineWidth(2);
    doc.setDrawColor(...tealPrimary);
    doc.line(20, currentY + 3, 55, currentY + 3);
    currentY += 25;

    // Détails prescription
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(220, 38, 127);
    doc.text(prescription.medication || 'Nom du médicament', 20, currentY);
    currentY += 12;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`${prescription.dosage || ''} - ${prescription.frequency || ''}`, 20, currentY);
    currentY += 20;

    // Instructions
    doc.setFontSize(11);
    doc.text('Prendre', 20, currentY);
    doc.setLineWidth(0.3);
    doc.setDrawColor(...mediumGray);
    doc.line(40, currentY + 1, 120, currentY + 1);
    if (prescription.dosage) {
      doc.setFontSize(10);
      doc.text(prescription.dosage, 45, currentY - 1);
    }
    doc.setFontSize(11);
    doc.text('fois par', 125, currentY);
    const checkboxSize = 3.5;
    const checkboxY = currentY - 3;
    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 0, 0);
    doc.rect(155, checkboxY, checkboxSize, checkboxSize);
    doc.text('Jour', 162, currentY);
    doc.rect(180, checkboxY, checkboxSize, checkboxSize);
    doc.text('Semaine', 187, currentY);
    if (prescription.frequency?.toLowerCase().includes('jour')) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('✓', 156, currentY - 0.5);
    }
    currentY += 15;

    // Jours de la semaine
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text('Jours de la semaine', 20, currentY);
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    let dayX = 65;
    days.forEach((day) => {
      doc.rect(dayX, currentY - 3, checkboxSize, checkboxSize);
      doc.setFontSize(9);
      doc.text(day, dayX + 5, currentY);
      dayX += 22;
    });
    currentY += 15;

    // Fréquence (matin, midi, soir)
    doc.setFontSize(11);
    doc.text('Fréquence', 20, currentY);
    [
      { label: 'Matin', x: 60 },
      { label: 'Midi', x: 95 },
      { label: 'Soir', x: 125 }
    ].forEach(timing => {
      doc.rect(timing.x, currentY - 3, checkboxSize, checkboxSize);
      doc.setFontSize(9);
      doc.text(timing.label, timing.x + 5, currentY);
    });
    doc.setFontSize(11);
    doc.text('Heure de la prise', 155, currentY);
    doc.setLineWidth(0.3);
    doc.line(155, currentY + 1, 190, currentY + 1);
    currentY += 20;

    // Notes
    if (prescription.notes && prescription.notes.trim()) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('Instructions spéciales :', 20, currentY);
      currentY += 8;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const noteLines = doc.splitTextToSize(prescription.notes, 170);
      doc.text(noteLines, 20, currentY);
      currentY += noteLines.length * 5 + 5;
    }

    // Période de prescription
    currentY += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...mediumGray);
    const startDate = prescription.startDate ? formatDate(prescription.startDate) : 'N/A';
    const endDate = prescription.endDate ? formatDate(prescription.endDate) : 'En cours';
    doc.text(`Période de prescription : ${startDate} - ${endDate}`, 20, currentY);

    // Signature
    currentY = Math.max(currentY + 20, 220);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text("Signature du médecin", 20, currentY);
    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 0, 0);
    doc.line(20, currentY + 8, 80, currentY + 8);
    doc.text('Date', 120, currentY);
    doc.line(120, currentY + 8, 160, currentY + 8);
    doc.setFontSize(9);
    doc.text(new Date().toLocaleDateString('fr-FR'), 125, currentY + 6);

    // Pied de page
    const footerY = pageHeight - 20;
    doc.setFillColor(...tealPrimary);
    doc.rect(0, footerY - 8, pageWidth, 20, 'F');
    doc.setTextColor(...white);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('123, Rue Exemple', 20, footerY);
    doc.text('NOM DE LA CLINIQUE MÉDICALE', pageWidth / 2, footerY, { align: 'center' });
    doc.text('+00 123 456 789', pageWidth - 20, footerY, { align: 'right' });

    // Filigrane
    doc.setTextColor(250, 250, 250);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(60);
    doc.text('Rx', pageWidth / 2, pageHeight / 2, { align: 'center', angle: 45 });

    // Enregistrer
    const safeName = (patientData.name || 'patient').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const safeMed = (prescription.medication || 'prescription').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const timestamp = new Date().toISOString().split('T')[0];
    doc.save(`prescription_${safeName}_${safeMed}_${timestamp}.pdf`);
    toast.success('PDF de prescription généré avec succès !');
    
  } catch (error) {
    console.error('Erreur lors de la génération du PDF de prescription :', error);
    toast.error('Échec de la génération du PDF de prescription. Veuillez réessayer.');
  }
}, [patientData, formatDate, clinicLogo]);

  const updateFilter = useCallback((field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  }, []);
  
  const toggleSortDirection = useCallback(() => {
    setFilters(prev => ({ 
      ...prev, 
      sortDirection: prev.sortDirection === "asc" ? "desc" : "asc" 
    }));
  }, []);

  const handleClose = () => {
    setModals(prev => ({ ...prev, appointment: false }));
    setSelectedPatient(null);
    setAppointmentMode('create');
    setSelectedAppointmentToEdit(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setAppointmentForm({
      doctor: "",
      type: "",
      date: "",
      time: "",
      notes: "",
      reason: ""
    });
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };

  const tileDisabled = ({ date, view }) => {
    return date < new Date().setHours(0, 0, 0, 0);
  };




  // Effets
  useEffect(() => {
    fetchGrowthRecords();
    fetchPrescriptions();
    fetchAppointments();

  }, [fetchGrowthRecords, fetchPrescriptions, fetchAppointments,
    
  ]);

  useEffect(() => {
    if (activeTab === "documents") {
      fetchDocuments();
    }
  }, [activeTab, fetchDocuments]);

  // Gestion des erreurs
  if (error) {
    return (
      <div className="p-4">
        <Alert color="red" icon={<ExclamationTriangleIcon className="h-6 w-6" />}>
          {error}
        </Alert>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <>
      <Button 
        variant="text" 
        className="flex items-center gap-2 mt-4 ml-4"
        onClick={() => navigate(-1)}
      >
        <ArrowLeftIcon className="h-5 w-5" />
        Retour
      </Button>

      <div className="relative mt-4 h-72 w-full overflow-hidden rounded-xl bg-[url('/img/background-image.png')] bg-cover bg-center">
        <div className="absolute inset-0 h-full w-full bg-gray-900/75" />
      </div>

      <Card className="mx-3 -mt-16 mb-6 lg:mx-4 border border-blue-gray-100">
        <CardBody className="p-4">
          <div className="mb-10 flex items-center justify-between flex-wrap gap-6">
            <div className="flex items-center gap-6">
              <Avatar
                src={patientData.avatar}
                alt={patientData.name}
                size="xl"
                variant="rounded"
                className="rounded-lg shadow-lg shadow-blue-gray-500/40"
              />
              <div>
                <Typography variant="h5" color="blue-gray" className="mb-1">
                  {patientData.name}
                </Typography>
                <Typography variant="small" className="font-normal text-blue-gray-600">
                  {patientData.age} • {patientData.gender} • Groupe sanguin: {patientData.bloodType}
                  • Tarif: {tarifOfThisPatient ? `${tarifOfThisPatient} MAD` : "Non renseigné"}
                </Typography>
              </div>
            </div>
        <div className="w-full lg:w-auto" style={{ maxWidth: '600px' }}> 
          <div className="flex flex-wrap gap-2 overflow-x-auto">
            <Button
              variant={activeTab === "overview" ? "filled" : "text"}
              size="sm"
              onClick={() => setActiveTab("overview")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                activeTab === "overview" 
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg" 
                  : "text-gray-600 hover:bg-blue-50 hover:text-blue-700"
              }`}
            >
              <HomeIcon className="h-4 w-4" />
              Aperçu
            </Button>
            <Button
              variant={activeTab === "documents" ? "filled" : "text"}
              size="sm"
              onClick={() => setActiveTab("documents")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                activeTab === "documents" 
                  ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg" 
                  : "text-gray-600 hover:bg-green-50 hover:text-green-700"
              }`}
            >
              <DocumentTextIcon className="h-4 w-4" />
              Documents
            </Button>
            <Button
              variant={activeTab === "vaccinations" ? "filled" : "text"}
              size="sm"
              onClick={() => setActiveTab("vaccinations")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                activeTab === "vaccinations" 
                  ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg" 
                  : "text-gray-600 hover:bg-purple-50 hover:text-purple-700"
              }`}
            >
              <ShieldCheckIcon className="h-4 w-4" />
              Vaccinations
            </Button>
            <Button
              variant={activeTab === "growth" ? "filled" : "text"}
              size="sm"
              onClick={() => setActiveTab("growth")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                activeTab === "growth" 
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg" 
                  : "text-gray-600 hover:bg-orange-50 hover:text-orange-700"
              }`}
            >
              <ChartBarIcon className="h-4 w-4" />
              Croissance
            </Button>
            <Button
              variant={activeTab === "consultations" ? "filled" : "text"}
              size="sm"
              onClick={() => setActiveTab("consultations")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                activeTab === "consultations" 
                  ? "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg" 
                  : "text-gray-600 bg-indigo-700 text-indigo-50 hover:bg-indigo-50 hover:text-indigo-700"
              }`}
            >
              <CalendarDaysIcon className="h-4 w-4" />
              Consultations
            </Button>
            <Button
              variant={activeTab === "prescriptions" ? "filled" : "text"}
              size="sm"
              onClick={() => setActiveTab("prescriptions")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                activeTab === "prescriptions" 
                  ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg" 
                  : "text-gray-600 hover:bg-red-50 hover:text-red-700"
              }`}
            >
              <DocumentTextIcon className="h-4 w-4" />
              Prescriptions
            </Button>
          </div>
        </div>
          </div>

          {/* Contenu des onglets */}
          {activeTab === "overview" && (
            <div>
              <div className="gird-cols-1 mb-12 grid gap-12 px-4 lg:grid-cols-2 xl:grid-cols-3">
                <VaccinationStatusCard
                  filteredVaccinations={filteredVaccinations}
                  filters={filters}
                  updateFilter={updateFilter}
                  toggleSortDirection={toggleSortDirection}
                  handleOpenCreate={() => {
                    setVaccinationForm({
                      vaccine: "",
                      dueDate: "",
                      status: "pending",
                      dateAdministered: ""
                    });
                    setModals(prev => ({ ...prev, create: true }));
                  }}
                  handleOpenView={(vaccination) => {
                    setSelectedVaccination(vaccination);
                    setModals(prev => ({ ...prev, view: true }));
                  }}
                  handleOpenEdit={(vaccination) => {
                    setSelectedVaccination(vaccination);
                    setVaccinationForm({
                      vaccine: vaccination.vaccine,
                      dueDate: vaccination.dueDate.split('T')[0],
                      status: vaccination.status,
                      dateAdministered: vaccination.dateAdministered?.split('T')[0] || ""
                    });
                    setModals(prev => ({ ...prev, edit: true }));
                  }}
                  handleOpenDelete={(vaccination) => {
                    setSelectedVaccination(vaccination);
                    setModals(prev => ({ ...prev, delete: true }));
                  }}
                  handleScheduleNext={(vaccination) => {
                    const nextDueDate = calculateNextDueDate(vaccination);
                    if (!nextDueDate) {
                      toast.warning('Impossible de planifier la prochaine dose sans date d\'administration');
                      return;
                    }
                    
                    setVaccinationForm({
                      vaccine: vaccination.vaccine,
                      dueDate: nextDueDate,
                      status: "pending",
                      dateAdministered: ""
                    });
                    setModals(prev => ({ ...prev, create: true }));
                  }}
                  exportVaccinationPDF={exportVaccinationPDF}
                />
                
                <PatientInfoCard patientData={patientData} />
                
                <RecentActivitiesCard processedAppointments={processedAppointments} />
              </div>
              
              <VaccinationRecordsGrid
                filteredVaccinations={filteredVaccinations}
                handleOpenCreate={() => {
                  setVaccinationForm({
                    vaccine: "",
                    dueDate: "",
                    status: "pending",
                    dateAdministered: ""
                  });
                  setModals(prev => ({ ...prev, create: true }));
                }}
                handleOpenView={(vaccination) => {
                  setSelectedVaccination(vaccination);
                  setModals(prev => ({ ...prev, view: true }));
                }}
              />
            </div>
          )}

          {activeTab === "vaccinations" && (
            <div className="px-4">
              <div className="flex items-center justify-between mb-6">
                <Typography variant="h4" color="blue-gray">
                  Gestion des vaccinations
                </Typography>
                <Button variant="gradient" onClick={() => {
                  setVaccinationForm({
                    vaccine: "",
                    dueDate: "",
                    status: "pending",
                    dateAdministered: ""
                  });
                  setModals(prev => ({ ...prev, create: true }));
                }}>
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Ajouter une nouvelle vaccination
                </Button>
              </div>
              
              <FilterControls
                filters={filters}
                updateFilter={updateFilter}
                toggleSortDirection={toggleSortDirection}
              />
              
              <VaccinationGrid
                vaccinations={filteredVaccinations}
                onView={(vaccination) => {
                  setSelectedVaccination(vaccination);
                  setModals(prev => ({ ...prev, view: true }));
                }}
                onEdit={(vaccination) => {
                  setSelectedVaccination(vaccination);
                  setVaccinationForm({
                    vaccine: vaccination.vaccine,
                    dueDate: vaccination.dueDate.split('T')[0],
                    status: vaccination.status,
                    dateAdministered: vaccination.dateAdministered?.split('T')[0] || ""
                  });
                  setModals(prev => ({ ...prev, edit: true }));
                }}
                onDelete={(vaccination) => {
                  setSelectedVaccination(vaccination);
                  setModals(prev => ({ ...prev, delete: true }));
                }}
              />
            </div>
          )}

          {activeTab === "growth" && (
            <div className="px-4">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <Typography variant="h4" color="blue-gray">
                    Suivi de croissance
                  </Typography>
                  <Typography variant="small" className="text-blue-gray-500">
                    Surveiller l'IMC et les modèles de croissance
                  </Typography>
                </div>
                <Button variant="gradient" onClick={() => setModals(prev => ({ ...prev, growth: true }))}>
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Ajouter un enregistrement
                </Button>
              </div>

              {growthRecords && growthRecords.length > 0 ? (
                <>
                      <GrowthCharts 
  records={growthRecords} 
  patientGender={patientData.gender}
  patientBirthDate={patient.birthDate} // CHANGE patientAge to patientBirthDate
/>    
                  
                  <GrowthRecordsTable
                    records={growthRecords}
                    patientAge={patientAge}
                    onDelete={deleteGrowthRecord}
                    loading={loading}
                  />
                </>
              ) : (
                <EmptyGrowthState
                  patientName={`${patient.firstName} ${patient.lastName}`}
                  onAddRecord={() => setModals(prev => ({ ...prev, growth: true }))}
                />
              )}
            </div>
          )}

{activeTab === "consultations" && (
  <ConsultationHistory patientData={patientData} />
)}
 

          {activeTab === "prescriptions" && (
            <div className="px-4">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <Typography variant="h4" color="blue-gray">
                    Gestion des prescriptions
                  </Typography>
                  <Typography variant="small" className="text-blue-gray-500">
                    Gérer et suivre les prescriptions médicamenteuses
                  </Typography>
                </div>
                <Button variant="gradient" onClick={() => {
                  setPrescriptionForm([
                    {
                      medication: "",
                      dosage: "",
                      frequency: "",
                      startDate: new Date().toISOString().split('T')[0],
                      duration: "",
                      notes: ""
                    }
                  ]);
                  setSelectedPrescription(null);
                  setModals(prev => ({ ...prev, prescription: true }));
                }}>
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Ajouter une prescription
                </Button>
              </div>

              {prescriptions.length === 0 ? (
                <EmptyPrescriptionsState 
                  patientName={patientData.name}
                  onAddPrescription={() => setModals(prev => ({ ...prev, prescription: true }))}
                />
              ) : (
                <div className="space-y-8">
                  {Object.entries(
                    prescriptions.reduce((groups, prescription) => {
                      const year = new Date(prescription.startDate).getFullYear();
                      if (!groups[year]) groups[year] = [];
                      groups[year].push(prescription);
                      return groups;
                    }, {})
                  ).map(([year, yearPrescriptions]) => (
                    <div key={year}>
                      <Typography variant="h5" color="blue-gray" className="mb-4">
                        {year}
                      </Typography>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {yearPrescriptions.map((prescription) => (
                          <PrescriptionCard
                            key={prescription._id}
                            prescription={prescription}
                            onEdit={() => {
                              setSelectedPrescription(prescription);
                              
                              // Calculate duration from start and end dates
                              let duration = "";
                              if (prescription.startDate && prescription.endDate) {
                                const startDate = new Date(prescription.startDate);
                                const endDate = new Date(prescription.endDate);
                                const diffTime = Math.abs(endDate - startDate);
                                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                duration = diffDays.toString();
                              }
                              
                              setPrescriptionForm([{
                                medication: prescription.medication,
                                dosage: prescription.dosage,
                                frequency: prescription.frequency,
                                startDate: prescription.startDate.split('T')[0],
                                duration: duration,
                                notes: prescription.notes || ""
                              }]);
                              setModals(prev => ({ ...prev, prescription: true }));
                            }}
                            onDelete={() => {
                              setSelectedPrescription(prescription);
                              setModals(prev => ({ ...prev, deletePrescription: true }));
                            }}
                            onView={() => {
                              setSelectedPrescription(prescription);
                              setModals(prev => ({ ...prev, viewPrescription: true }));
                            }}
                            onExportPDF={exportPrescriptionPDF}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "documents" && (
            <div className="px-4">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <Typography variant="h4" color="blue-gray">
                    Gestion des documents
                  </Typography>
                  <Typography variant="small" className="text-blue-gray-500">
                    Stocker et gérer les documents des patients
                  </Typography>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outlined" 
                    color="blue"
                    onClick={() => setModals(prev => ({ ...prev, wordTemplate: true }))}
                  >
                    <DocumentTextIcon className="h-4 w-6 mr-1" />
                    Créer un document Word
                  </Button>
                  <Button variant="gradient" onClick={() => setModals(prev => ({ ...prev, uploadDocument: true }))}>
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Uploader un document
                  </Button>
                </div>
              </div>

              {documents.length === 0 ? (
                <div className="text-center py-16 bg-blue-gray-50/30 rounded-xl">
                  <DocumentTextIcon className="h-16 w-16 mx-auto text-blue-gray-300 mb-4" />
                  <Typography variant="h5" color="blue-gray" className="mb-2">
                    Aucun document trouvé
                  </Typography>
                  <Typography variant="small" className="text-blue-gray-500 mb-6 max-w-md mx-auto">
                    {patientData.name} n'a encore aucun document. Uploader le premier document pour commencer.
                  </Typography>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {documents.map((document) => (
                    <Card key={document._id} className="border border-blue-gray-50">
                      <CardHeader className="bg-blue-50 p-4">
                        <div className="flex items-center justify-between">
                          <Typography variant="h6" color="blue-gray">
                            {document.title}
                          </Typography>
                          <Chip value="Document" color="blue" size="sm" />
                        </div>
                      </CardHeader>
                      <CardBody className="p-4">
                        <Typography variant="small" className="text-blue-gray-500">
                          Uploadé: {formatDate(document.createdAt)}
                        </Typography>
                      </CardBody>
                      <CardFooter className="flex justify-end gap-2 p-4 pt-0">
                        <Button 
                          variant="text" 
                          color="blue" 
                          size="sm"
                          onClick={() => downloadDocument(document)}
                        >
                          Télécharger
                        </Button>
                        <Button 
                          variant="text" 
                          color="red" 
                          size="sm"
                          onClick={() => {
                            setSelectedDocument(document);
                            setModals(prev => ({ ...prev, deleteDocument: true }));
                          }}
                        >
                          Supprimer
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Modales pour les documents */}
      <DocumentUploadModal
        open={modals.uploadDocument}
        onClose={() => setModals(prev => ({ ...prev, uploadDocument: false }))}
        formData={documentForm}
        setFormData={setDocumentForm}
        onSubmit={uploadDocument}
        loading={loading}
      />

      <DeleteDocumentModal
        open={modals.deleteDocument}
        onClose={() => setModals(prev => ({ ...prev, deleteDocument: false }))}
        document={selectedDocument}
        onConfirm={deleteDocument}
        loading={loading}
      />

      <WordTemplateModal
        open={modals.wordTemplate}
        onClose={() => setModals(prev => ({ ...prev, wordTemplate: false }))}
        patientData={patientData}
        onSaveToHistory={saveWordTemplateToHistory}
      />

      {/* Modales pour les vaccinations */}
      <VaccinationModal
        open={modals.create}
        onClose={() => setModals(prev => ({ ...prev, create: false }))}
        title="Ajouter une nouvelle vaccination"
        formData={vaccinationForm}
        updateField={(field, value) => setVaccinationForm(prev => ({ ...prev, [field]: value }))}
        onSubmit={createVaccination}
        isValid={isVaccinationFormValid}
        loading={loading}
      />

      <VaccinationModal
        open={modals.edit}
        onClose={() => setModals(prev => ({ ...prev, edit: false }))}
        title="Modifier l'enregistrement de vaccination"
        formData={vaccinationForm}
        updateField={(field, value) => setVaccinationForm(prev => ({ ...prev, [field]: value }))}
        onSubmit={updateVaccination}
        isValid={isVaccinationFormValid}
        loading={loading}
        isEdit
      />
    
      <ViewVaccinationModal
        open={modals.view}
        onClose={() => setModals(prev => ({ ...prev, view: false }))}
        vaccination={selectedVaccination}
        onScheduleNext={(vaccination) => {
          const nextDueDate = calculateNextDueDate(vaccination);
          if (!nextDueDate) {
            toast.warning('Impossible de planifier la prochaine dose sans date d\'administration');
            return;
          }
          
          setVaccinationForm({
            vaccine: vaccination.vaccine,
            dueDate: nextDueDate,
            status: "pending",
            dateAdministered: ""
          });
          setModals(prev => ({ ...prev, create: true }));
        }}
        onExportPDF={exportVaccinationPDF}
      />

      <DeleteConfirmationModal
        open={modals.delete}
        onClose={() => setModals(prev => ({ ...prev, delete: false }))}
        vaccination={selectedVaccination}
        onConfirm={deleteVaccination}
        loading={loading}
      />

      {/* Modales pour les prescriptions */}
     


<PrescriptionModal
  open={modals.prescription}
  onClose={() => setModals(prev => ({ ...prev, prescription: false }))}
  formData={prescriptionForm}
  setFormData={setPrescriptionForm}
  onSubmit={selectedPrescription ? updatePrescription : addPrescription}
  isValid={isPrescriptionFormValid}
  loading={loading}
  isEdit={!!selectedPrescription}
  medicationData={medicationData}
  medicationLoading={medicationLoading}
  medicationError={medicationError}
/>

      <ViewPrescriptionModal
        open={modals.viewPrescription}
        onClose={() => setModals(prev => ({ ...prev, viewPrescription: false }))}
        prescription={selectedPrescription}
        onExportPDF={exportPrescriptionPDF}
      />

      <DeletePrescriptionModal
        open={modals.deletePrescription}
        onClose={() => setModals(prev => ({ ...prev, deletePrescription: false }))}
        prescription={selectedPrescription}
        onConfirm={deletePrescription}
        loading={loading}
      />

      {/* Modale pour la croissance */}
      <GrowthModal
        open={modals.growth}
        onClose={() => setModals(prev => ({ ...prev, growth: false }))}
        formData={growthForm}
        updateField={(field, value) => setGrowthForm(prev => ({ ...prev, [field]: value }))}
        onSubmit={addGrowthRecord}
        isValid={isGrowthFormValid}
        loading={loading}
        patientAge={patientAge}
      />

      {/* Modale pour les rendez-vous */}
      <Dialog open={modals.appointment} handler={handleClose} size="xl" className="h-screen overflow-auto">
        <DialogHeader>
          {appointmentMode === 'create' ? 'Prendre un nouveau rendez-vous' : 'Modifier le rendez-vous'}
        </DialogHeader>
        <form onSubmit={handleAppointmentSubmit}>
          <DialogBody className="flex flex-col gap-4">
            <Typography variant="small" color="gray">
              Veuillez remplir les détails du rendez-vous.
            </Typography>
            {(selectedPatient || patientData) && (
              <>
                <Typography variant="h6">
                  Patient: {selectedPatient?.name || patientData.name}
                </Typography>

                {appointmentMode === 'update' && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <Typography variant="small" color="blue-gray" className="font-semibold">
                      Modification d'un rendez-vous existant
                    </Typography>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Typography variant="h6" className="mb-2">Sélectionner une date</Typography>
                    <Calendar
                      onChange={handleDateChange}
                      value={selectedDate}
                      minDate={new Date()}
                      tileDisabled={tileDisabled}
                      className="border rounded-lg p-2 w-full"
                    />
                  </div>

                  <div>
                    <Typography variant="h6" className="mb-2">Créneaux horaires disponibles</Typography>
                    {selectedDate || appointmentForm.date ? (
                      <div className="grid grid-cols-3 gap-2">
                        {TIME_SLOTS.map(time => {
                          const isBooked = isTimeSlotBooked(time);
                          const isCurrentSelected = selectedTime === time || appointmentForm.time === time;
                          
                          return (
                            <Button
                              key={time}
                              variant={isCurrentSelected ? "filled" : "outlined"}
                              color={isBooked ? "red" : isCurrentSelected ? "black" : "gray"}
                              onClick={() => !isBooked && handleTimeSelect(time)}
                              disabled={isBooked}
                              className="p-2 text-sm"
                              title={isBooked ? "Créneau déjà réservé" : "Disponible"}
                            >
                              {time}
                              {isBooked && (
                                <span className="ml-1 text-xs">(Réservé)</span>
                              )}
                            </Button>
                          );
                        })}
                      </div>
                    ) : (
                      <Typography variant="small" color="gray">
                        Veuillez d'abord sélectionner une date
                      </Typography>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Input
                      label="Type de rendez-vous"
                      value={appointmentForm.type}
                      onChange={(e) => setAppointmentForm(prev => ({ ...prev, type: e.target.value }))}
                      placeholder="ex: Consultation, Contrôle, Suivi"
                    />
                  </div>
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
              color="neutral"
              type="submit"
              disabled={isSubmitting || !(selectedDate || appointmentForm.date) || !(selectedTime || appointmentForm.time)}
            >
              {isSubmitting 
                ? (appointmentMode === 'create' ? 'Réservation...' : 'Mise à jour...') 
                : (appointmentMode === 'create' ? 'Prendre rendez-vous' : 'Mettre à jour')
              }
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* Modale de confirmation de suppression de rendez-vous */}
      <Dialog open={deleteConfirmOpen} handler={() => setDeleteConfirmOpen(false)}>
        <DialogHeader>Confirmation de suppression</DialogHeader>
        <DialogBody>
          <Typography variant="small" className="text-red-500">
            Êtes-vous sûr de vouloir supprimer ce rendez-vous ? Cette action est irréversible.
          </Typography>
          {appointmentToDelete && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <Typography variant="small" className="font-semibold">
                Détails du rendez-vous:
              </Typography>
              <Typography variant="small">
                Date: {appointmentToDelete.time}<br />
                Heure: {appointmentToDelete.hour}<br />
                Objectif: {appointmentToDelete.message}
              </Typography>
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="gray"
            onClick={() => setDeleteConfirmOpen(false)}
            className="mr-1"
          >
            Annuler
          </Button>
          <Button 
            variant="gradient" 
            color="red" 
            onClick={confirmDeleteAppointment}
            disabled={loading}
          >
            {loading ? "Suppression..." : "Supprimer le rendez-vous"}
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}

export default PatientDetail;





