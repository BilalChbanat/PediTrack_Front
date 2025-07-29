// appointmentList.jsx

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Input,
  Select,
  Option,
  Button,
  Tooltip
} from "@material-tailwind/react";
import { 
  PencilIcon, 
  TrashIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  FunnelIcon,
  XMarkIcon
} from "@heroicons/react/24/solid";
import dayjs from 'dayjs';

const AppointmentList = ({ 
  appointments = [], 
  patients = [], 
  onEditAppointment, 
  onDeleteAppointment 
}) => {
  // State management
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all'
  });

  // Unique filter options
  const appointmentTypes = [...new Set(appointments.map(a => a.type))];
  const statusOptions = [...new Set(appointments.map(a => a.status || 'pending'))];

  // Filter and search logic
  useEffect(() => {
    let results = [...appointments];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(app => {
        const patient = getPatientInfo(app.patientId);
        const patientName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
        return patientName.includes(term);
      });
    }
    
    // Apply type filter
    if (filters.type !== 'all') {
      results = results.filter(app => app.type === filters.type);
    }
    
    // Apply status filter
    if (filters.status !== 'all') {
      results = results.filter(app => (app.status || 'pending') === filters.status);
    }
    
    // Sort results
    results.sort((a, b) => {
      const dateCompare = dayjs(a.date).diff(dayjs(b.date));
      if (dateCompare !== 0) return dateCompare;
      return a.time.localeCompare(b.time);
    });
    
    setFilteredAppointments(results);
    setCurrentPage(1); // Reset to first page when filters change
  }, [appointments, searchTerm, filters]);

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAppointments = filteredAppointments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);

  console.log('Filtered Appointments:', filteredAppointments);
  
  // Helper functions
  const getPatientInfo = (patientId) => {
    return patients.find(p => p.patientId === patientId) || {
      firstName: 'Inconnu',
      lastName: 'Patient',
      img: '/img/team-2.jpeg'
    };
  };

  const getAppointmentColor = (type) => {
    const colors = {
      consultation: 'blue',
      vaccination: 'green',
      surgery: 'red',
      checkup: 'yellow'
    };
    return colors[type] || 'gray';
  };

  const getStatusText = (status) => {
    const statusTexts = {
      pending: 'En attente',
      confirmed: 'Confirmé',
      cancelled: 'Annulé',
      completed: 'Terminé'
    };
    return statusTexts[status] || status;
  };

  const getTypeText = (type) => {
    const typeTexts = {
      consultation: 'Consultation',
      vaccination: 'Vaccination',
      surgery: 'Chirurgie',
      checkup: 'Contrôle'
    };
    return typeTexts[type] || type;
  };

  // Pagination controls
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
  const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setFilters({ type: 'all', status: 'all' });
  };

  return (
    <Card className="shadow-none border rounded-lg">
      <CardHeader floated={false} shadow={false} className="p-4 border-b">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Typography variant="h5" className="font-medium">
            Liste des Rendez-vous
          </Typography>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative">
              <Input
                label="Rechercher un patient"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="min-w-[200px]"
              />
              {searchTerm && (
                <Button
                  variant="text"
                  color="red"
                  size="sm"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 min-w-0"
                >
                  <XMarkIcon className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 mt-4">
          <Select
            label="Filtrer par Type"
            value={filters.type?.toString() || "all"}
            onChange={(value) => setFilters({ ...filters, type: value })}
            className="min-w-[150px]"
            menuProps={{ 
              className: "z-[9999] max-h-60",
              style: { zIndex: 9999 }
            }}
            containerProps={{
              className: "min-w-[150px]"
            }}
          >
            <Option value="all">Tous les Types</Option>
            {appointmentTypes.map((type) => (
              <Option key={type} value={type?.toString()}>
                {getTypeText(type)}
              </Option>
            ))}
          </Select>
          <Select
            label="Filtrer par Statut"
            value={filters.status}
            onChange={(value) => setFilters({ ...filters, status: value })}
            className="min-w-[150px]"
            menuProps={{ 
              className: "z-[9999] max-h-60",
              style: { zIndex: 9999 }
            }}
            containerProps={{
              className: "min-w-[150px]"
            }}
          >
            <Option value="all">Tous les Statuts</Option>
            {statusOptions.map((status) => (
              <Option key={status} value={status}>
                {getStatusText(status)}
              </Option>
            ))}
          </Select>
          {(filters.type !== "all" || filters.status !== "all" || searchTerm) && (
            <Button
              variant="outlined"
              color="red"
              className="flex items-center gap-2"
              onClick={resetFilters}
            >
              <XMarkIcon className="h-4 w-4" />
              Réinitialiser les Filtres
            </Button>
          )}
        </div>
      </CardHeader>
      <CardBody className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-max table-auto">
            <thead>
              <tr>
                <th className="border-b border-blue-gray-50 p-4">
                  <Typography variant="small" color="blue-gray" className="font-bold">
                    Patient
                  </Typography>
                </th>
                <th className="border-b border-blue-gray-50 p-4">
                  <Typography variant="small" color="blue-gray" className="font-bold">
                    Date et Heure
                  </Typography>
                </th>
                <th className="border-b border-blue-gray-50 p-4">
                  <Typography variant="small" color="blue-gray" className="font-bold">
                    Type
                  </Typography>
                </th>
                <th className="border-b border-blue-gray-50 p-4">
                  <Typography variant="small" color="blue-gray" className="font-bold">
                    Statut
                  </Typography>
                </th>
                <th className="border-b border-blue-gray-50 p-4">
                  <Typography variant="small" color="blue-gray" className="font-bold">
                    Actions
                  </Typography>
                </th>
              </tr>
            </thead>
            <tbody>
              {currentAppointments.map((appointment) => {
                const patient = getPatientInfo(appointment.patientId);
                const color = getAppointmentColor(appointment.type);
                const fullDate =
                  dayjs(appointment.date).format("DD MMM YYYY") +
                  " à " +
                  appointment.time;

                return (
                  <tr key={appointment._id} className="hover:bg-blue-gray-50">
                    <td className="p-4 border-b">
                      <div className="flex items-center gap-3">
                        <Avatar src={patient.img} alt={patient.name} size="sm" />
                        <div>
                          <Typography variant="small" color="blue-gray" className="font-normal">
                            {patient.firstName} {patient.lastName}
                          </Typography>
                          <Typography variant="small" color="blue-gray" className="font-normal text-xs text-gray-600">
                            ID: {appointment.patientId}
                          </Typography>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 border-b">
                      <Typography variant="small" color="blue-gray" className="font-normal">
                        {fullDate}
                      </Typography>
                    </td>
                    <td className="p-4 border-b">
                      <Chip
                        variant="outlined"
                        size="sm"
                        value={getTypeText(appointment.type)}
                        color={color}
                      />
                    </td>
                    <td className="p-4 border-b">
                      <Chip
                        size="sm"
                        value={getStatusText(appointment.status || "pending")}
                        color={
                          appointment.status === "confirmed"
                            ? "green"
                            : appointment.status === "pending"
                            ? "amber"
                            : "red"
                        }
                      />
                    </td>
                    <td className="p-4 border-b">
                      <div className="flex gap-2">
                        <Tooltip content="Modifier le rendez-vous">
                          <IconButton
                            variant="text"
                            size="sm"
                            color="blue-gray"
                            onClick={() => onEditAppointment(appointment)}
                          >
                            <PencilIcon className="h-4 w-4" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip content="Supprimer le rendez-vous">
                          <IconButton
                            variant="text"
                            size="sm"
                            color="red"
                            onClick={() => onDeleteAppointment(appointment._id)}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </IconButton>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredAppointments.length === 0 ? (
            <div className="p-8 text-center">
              <Typography color="gray" className="font-normal">
                {appointments.length === 0
                  ? "Aucun rendez-vous disponible"
                  : "Aucun rendez-vous ne correspond à vos filtres"}
              </Typography>
              {appointments.length > 0 && (
                <Button
                  variant="text"
                  color="blue"
                  className="mt-2"
                  onClick={resetFilters}
                >
                  Effacer tous les filtres
                </Button>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 border-t">
              <Typography variant="small" color="gray">
                Affichage de {indexOfFirstItem + 1} à{" "}
                {Math.min(indexOfLastItem, filteredAppointments.length)} sur{" "}
                {filteredAppointments.length} entrées
              </Typography>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Typography variant="small" color="gray">
                    Lignes par page :
                  </Typography>
                  <Select
                    value={itemsPerPage.toString()}
                    onChange={(value) => {
                      setItemsPerPage(Number(value));
                      setCurrentPage(1);
                    }}
                    className="!w-20"
                    menuProps={{ 
                      className: "z-[9999]",
                      style: { zIndex: 9999 }
                    }}
                  >
                    <Option value="5">5</Option>
                    <Option value="10">10</Option>
                    <Option value="20">20</Option>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <IconButton
                    variant="text"
                    size="sm"
                    onClick={prevPage}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeftIcon className="h-5 w-5" />
                  </IconButton>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <IconButton
                          key={pageNum}
                          variant={currentPage === pageNum ? "filled" : "text"}
                          size="sm"
                          onClick={() => paginate(pageNum)}
                          className={currentPage === pageNum ? "bg-blue-gray-900" : ""}
                        >
                          {pageNum}
                        </IconButton>
                      );
                    })}
                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <Typography className="mx-1">...</Typography>
                    )}
                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <IconButton
                        variant={currentPage === totalPages ? "filled" : "text"}
                        size="sm"
                        onClick={() => paginate(totalPages)}
                        className={currentPage === totalPages ? "bg-blue-gray-900" : ""}
                      >
                        {totalPages}
                      </IconButton>
                    )}
                  </div>
                  <IconButton
                    variant="text"
                    size="sm"
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRightIcon className="h-5 w-5" />
                  </IconButton>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

export default AppointmentList;



// // appointmentList.jsx

// import React, { useState, useEffect } from 'react';
// import {
//   Card,
//   CardHeader,
//   CardBody,
//   Typography,
//   Avatar,
//   Chip,
//   IconButton,
//   Input,
//   Select,
//   Option,
//   Button,
//   Tooltip
// } from "@material-tailwind/react";
// import { 
//   PencilIcon, 
//   TrashIcon, 
//   ChevronLeftIcon, 
//   ChevronRightIcon,
//   FunnelIcon,
//   XMarkIcon
// } from "@heroicons/react/24/solid";
// import dayjs from 'dayjs';

// const AppointmentList = ({ 
//   appointments = [], 
//   patients = [], 
//   onEditAppointment, 
//   onDeleteAppointment 
// }) => {
//   // State management
//   const [filteredAppointments, setFilteredAppointments] = useState([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage, setItemsPerPage] = useState(5);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filters, setFilters] = useState({
//     type: 'all',
//     status: 'all'
//   });

//   // Unique filter options
//   const appointmentTypes = [...new Set(appointments.map(a => a.type))];
//   const statusOptions = [...new Set(appointments.map(a => a.status || 'pending'))];

//   // Filter and search logic
//   useEffect(() => {
//     let results = [...appointments];
    
//     // Apply search filter
//     if (searchTerm) {
//       const term = searchTerm.toLowerCase();
//       results = results.filter(app => {
//         const patient = getPatientInfo(app.patientId);
//         const patientName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
//         return patientName.includes(term);
//       });
//     }
    
//     // Apply type filter
//     if (filters.type !== 'all') {
//       results = results.filter(app => app.type === filters.type);
//     }
    
//     // Apply status filter
//     if (filters.status !== 'all') {
//       results = results.filter(app => (app.status || 'pending') === filters.status);
//     }
    
//     // Sort results
//     results.sort((a, b) => {
//       const dateCompare = dayjs(a.date).diff(dayjs(b.date));
//       if (dateCompare !== 0) return dateCompare;
//       return a.time.localeCompare(b.time);
//     });
    
//     setFilteredAppointments(results);
//     setCurrentPage(1); // Reset to first page when filters change
//   }, [appointments, searchTerm, filters]);

//   // Pagination calculations
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentAppointments = filteredAppointments.slice(indexOfFirstItem, indexOfLastItem);
//   const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);

//   console.log('Filtered Appointments:', filteredAppointments);
//   // Helper functions
//   const getPatientInfo = (patientId) => {
//     return patients.find(p => p.patientId === patientId) || {
//       firstName: 'Inconnu',
//       lastName: 'Patient',
//       img: '/img/team-2.jpeg'
//     };
//   };

//   const getAppointmentColor = (type) => {
//     const colors = {
//       consultation: 'blue',
//       vaccination: 'green',
//       surgery: 'red',
//       checkup: 'yellow'
//     };
//     return colors[type] || 'gray';
//   };

//   const getStatusText = (status) => {
//     const statusTexts = {
//       pending: 'En attente',
//       confirmed: 'Confirmé',
//       cancelled: 'Annulé',
//       completed: 'Terminé'
//     };
//     return statusTexts[status] || status;
//   };

//   const getTypeText = (type) => {
//     const typeTexts = {
//       consultation: 'Consultation',
//       vaccination: 'Vaccination',
//       surgery: 'Chirurgie',
//       checkup: 'Contrôle'
//     };
//     return typeTexts[type] || type;
//   };

//   // Pagination controls
//   const paginate = (pageNumber) => setCurrentPage(pageNumber);
//   const nextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
//   const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);

//   // Reset filters
//   const resetFilters = () => {
//     setSearchTerm('');
//     setFilters({ type: 'all', status: 'all' });
//   };

//   return (
//     <Card className="shadow-none border rounded-lg">
//       <CardHeader floated={false} shadow={false} className="p-4 border-b">
//         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//           <Typography variant="h5" className="font-medium">
//             Liste des Rendez-vous
//           </Typography>
//           <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
//             <Select
//               label="Rechercher un patient"
//               value={searchTerm}
//               onChange={(value) => setSearchTerm(value)}
//               className="min-w-[200px]"
//               menuProps={{ className: "max-h-60 overflow-auto" }}
//               clearable
//             >
//               <Option value="">Tous les patients</Option>
//               {patients.map((patient) => (
//                 <Option
//                   key={patient.patientId}
//                   value={`${patient.firstName} ${patient.lastName}`}
//                 >
//                   {patient.firstName} {patient.lastName}
//                 </Option>
//               ))}
//             </Select>
//             {searchTerm && (
//               <Button
//                 variant="text"
//                 color="red"
//                 size="sm"
//                 onClick={() => setSearchTerm("")}
//                 className="ml-2"
//               >
//                 <XMarkIcon className="h-4 w-4" />
//               </Button>
//             )}
//           </div>
//         </div>
//         <div className="flex flex-wrap gap-3 mt-4">
//           <Select
//             label="Filtrer par Type"
//             value={filters.type?.toString() || "all"}
//             onChange={(value) => setFilters({ ...filters, type: value })}
//             className="min-w-[150px]"
//             menuProps={{ className: "max-h-60 overflow-auto" }}
//             clearable
//           >
//             <Option value="all">Tous les Types</Option>
//             {appointmentTypes.map((type) => (
//               <Option key={type} value={type?.toString()}>
//                 {getTypeText(type)}
//               </Option>
//             ))}
//           </Select>
//           <Select
//             label="Filtrer par Statut"
//             value={filters.status}
//             onChange={(value) => setFilters({ ...filters, status: value })}
//             className="min-w-[150px]"
//             menuProps={{ className: "max-h-60 overflow-auto" }}
//             clearable
//           >
//             <Option value="all">Tous les Statuts</Option>
//             {statusOptions.map((status) => (
//               <Option key={status} value={status}>
//                 {getStatusText(status)}
//               </Option>
//             ))}
//           </Select>
//           {(filters.type !== "all" || filters.status !== "all" || searchTerm) && (
//             <Button
//               variant="outlined"
//               color="red"
//               className="flex items-center gap-2"
//               onClick={resetFilters}
//             >
//               <XMarkIcon className="h-4 w-4" />
//               Réinitialiser les Filtres
//             </Button>
//           )}
//         </div>
//       </CardHeader>
//       <CardBody className="p-0">
//         <div className="overflow-x-auto">
//           <table className="w-full min-w-max table-auto">
//             <thead>
//               <tr>
//                 <th className="border-b border-blue-gray-50 p-4">
//                   <Typography variant="small" color="blue-gray" className="font-bold">
//                     Patient
//                   </Typography>
//                 </th>
//                 <th className="border-b border-blue-gray-50 p-4">
//                   <Typography variant="small" color="blue-gray" className="font-bold">
//                     Date et Heure
//                   </Typography>
//                 </th>
//                 <th className="border-b border-blue-gray-50 p-4">
//                   <Typography variant="small" color="blue-gray" className="font-bold">
//                     Type
//                   </Typography>
//                 </th>
//                 <th className="border-b border-blue-gray-50 p-4">
//                   <Typography variant="small" color="blue-gray" className="font-bold">
//                     Statut
//                   </Typography>
//                 </th>
//                 <th className="border-b border-blue-gray-50 p-4">
//                   <Typography variant="small" color="blue-gray" className="font-bold">
//                     Actions
//                   </Typography>
//                 </th>
//               </tr>
//             </thead>
//             <tbody>
//               {currentAppointments.map((appointment) => {
//                 const patient = getPatientInfo(appointment.patientId);
//                 const color = getAppointmentColor(appointment.type);
//                 const fullDate =
//                   dayjs(appointment.date).format("DD MMM YYYY") +
//                   " à " +
//                   appointment.time;

//                 return (
//                   <tr key={appointment._id} className="hover:bg-blue-gray-50">
//                     <td className="p-4 border-b">
//                       <div className="flex items-center gap-3">
//                         <Avatar src={patient.img} alt={patient.name} size="sm" />
//                         <div>
//                           <Typography variant="small" color="blue-gray" className="font-normal">
//                             {patient.firstName} {patient.lastName}
//                           </Typography>
//                           <Typography variant="small" color="blue-gray" className="font-normal text-xs text-gray-600">
//                             ID: {appointment.patientId}
//                           </Typography>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="p-4 border-b">
//                       <Typography variant="small" color="blue-gray" className="font-normal">
//                         {fullDate}
//                       </Typography>
//                     </td>
//                     <td className="p-4 border-b">
//                       <Chip
//                         variant="outlined"
//                         size="sm"
//                         value={getTypeText(appointment.type)}
//                         color={color}
//                       />
//                     </td>
//                     <td className="p-4 border-b">
//                       <Chip
//                         size="sm"
//                         value={getStatusText(appointment.status || "pending")}
//                         color={
//                           appointment.status === "confirmed"
//                             ? "green"
//                             : appointment.status === "pending"
//                             ? "amber"
//                             : "red"
//                         }
//                       />
//                     </td>
//                     <td className="p-4 border-b">
//                       <div className="flex gap-2">
//                         <Tooltip content="Modifier le rendez-vous">
//                           <IconButton
//                             variant="text"
//                             size="sm"
//                             color="blue-gray"
//                             onClick={() => onEditAppointment(appointment)}
//                           >
//                             <PencilIcon className="h-4 w-4" />
//                           </IconButton>
//                         </Tooltip>
//                         <Tooltip content="Supprimer le rendez-vous">
//                           <IconButton
//                             variant="text"
//                             size="sm"
//                             color="red"
//                             onClick={() => onDeleteAppointment(appointment._id)}
//                           >
//                             <TrashIcon className="h-4 w-4" />
//                           </IconButton>
//                         </Tooltip>
//                       </div>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//           {filteredAppointments.length === 0 ? (
//             <div className="p-8 text-center">
//               <Typography color="gray" className="font-normal">
//                 {appointments.length === 0
//                   ? "Aucun rendez-vous disponible"
//                   : "Aucun rendez-vous ne correspond à vos filtres"}
//               </Typography>
//               {appointments.length > 0 && (
//                 <Button
//                   variant="text"
//                   color="blue"
//                   className="mt-2"
//                   onClick={resetFilters}
//                 >
//                   Effacer tous les filtres
//                 </Button>
//               )}
//             </div>
//           ) : (
//             <div className="flex items-center justify-between p-4 border-t">
//               <Typography variant="small" color="gray">
//                 Affichage de {indexOfFirstItem + 1} à{" "}
//                 {Math.min(indexOfLastItem, filteredAppointments.length)} sur{" "}
//                 {filteredAppointments.length} entrées
//               </Typography>
//               <div className="flex items-center gap-4">
//                 <div className="flex items-center gap-2">
//                   <Typography variant="small" color="gray">
//                     Lignes par page :
//                   </Typography>
//                   <Select
//                     value={itemsPerPage.toString()}
//                     onChange={(value) => {
//                       setItemsPerPage(Number(value));
//                       setCurrentPage(1);
//                     }}
//                     className="!w-20"
//                   >
//                     <Option value="5">5</Option>
//                     <Option value="10">10</Option>
//                     <Option value="20">20</Option>
//                   </Select>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <IconButton
//                     variant="text"
//                     size="sm"
//                     onClick={prevPage}
//                     disabled={currentPage === 1}
//                   >
//                     <ChevronLeftIcon className="h-5 w-5" />
//                   </IconButton>
//                   <div className="flex items-center gap-1">
//                     {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
//                       let pageNum;
//                       if (totalPages <= 5) {
//                         pageNum = i + 1;
//                       } else if (currentPage <= 3) {
//                         pageNum = i + 1;
//                       } else if (currentPage >= totalPages - 2) {
//                         pageNum = totalPages - 4 + i;
//                       } else {
//                         pageNum = currentPage - 2 + i;
//                       }
//                       return (
//                         <IconButton
//                           key={pageNum}
//                           variant={currentPage === pageNum ? "filled" : "text"}
//                           size="sm"
//                           onClick={() => paginate(pageNum)}
//                           className={currentPage === pageNum ? "bg-blue-gray-900" : ""}
//                         >
//                           {pageNum}
//                         </IconButton>
//                       );
//                     })}
//                     {totalPages > 5 && currentPage < totalPages - 2 && (
//                       <Typography className="mx-1">...</Typography>
//                     )}
//                     {totalPages > 5 && currentPage < totalPages - 2 && (
//                       <IconButton
//                         variant={currentPage === totalPages ? "filled" : "text"}
//                         size="sm"
//                         onClick={() => paginate(totalPages)}
//                         className={currentPage === totalPages ? "bg-blue-gray-900" : ""}
//                       >
//                         {totalPages}
//                       </IconButton>
//                     )}
//                   </div>
//                   <IconButton
//                     variant="text"
//                     size="sm"
//                     onClick={nextPage}
//                     disabled={currentPage === totalPages}
//                   >
//                     <ChevronRightIcon className="h-5 w-5" />
//                   </IconButton>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </CardBody>
//     </Card>
//   );
// };

// export default AppointmentList;

