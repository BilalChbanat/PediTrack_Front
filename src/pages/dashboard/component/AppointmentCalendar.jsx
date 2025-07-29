import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Filter } from 'lucide-react';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import {
  Button,
  Typography,
  Card,
  CardHeader,
  CardBody,
  Chip,
  IconButton,
  Avatar,
  Select,
  Option
} from "@material-tailwind/react";

dayjs.locale('fr');

const AppointmentCalendar = ({ 
  appointments = [], 
  patients = [],
  currentDate,
  onDateChange,
  onTimeSelect,
  onEditAppointment
}) => {
  const [filter, setFilter] = useState('all'); // 'all', 'free', or 'booked'
  const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8h à 19h

  const getWeekDays = () => {
    const startOfWeek = dayjs(currentDate).startOf('week');
    return Array.from({ length: 7 }).map((_, i) => startOfWeek.add(i, 'day'));
  };

  const getAppointmentsForDate = (date) => {
    const dateStr = date.format('YYYY-MM-DD');
    return appointments.filter(apt => 
      dayjs(apt.date).format('YYYY-MM-DD') === dateStr
    );
  };

  const getPatientInfo = (patientId) => {
    return patients.find(p => p.patientId === patientId) || {
      firstName: 'Patient',
      lastName: 'Inconnu',
      img: '/img/team-2.jpeg'
    };
  };

  const getAppointmentStyle = (type) => {
    const styles = {
      consultation: 'bg-blue-100 border-blue-300 text-blue-800',
      vaccination: 'bg-green-100 border-green-300 text-green-800',
      surgery: 'bg-red-100 border-red-300 text-red-800',
      checkup: 'bg-yellow-100 border-yellow-300 text-yellow-800'
    };
    return styles[type] || 'bg-gray-100 border-gray-300 text-gray-800';
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

  const calculateAppointmentPosition = (appointment) => {
    const [hours, minutes] = appointment.time.split(':').map(Number);
    const top = ((hours - 8) * 64) + (minutes / 60 * 64);
    const duration = appointment.duration || 60;
    
    return {
      top: `${top}px`,
      height: `${duration / 60 * 64}px`
    };
  };

  const isTimeSlotFree = (day, hour) => {
    const dateStr = day.format('YYYY-MM-DD');
    const timeStr = `${hour}:00`;
    
    return !appointments.some(apt => 
      dayjs(apt.date).format('YYYY-MM-DD') === dateStr && 
      apt.time.startsWith(timeStr)
    );
  };

  return (
 <Card className="shadow-md border rounded-xl bg-white">
  <CardHeader floated={false} shadow={false} className="p-4 border-b bg-gradient-to-r from-blue-50 to-white rounded-t-xl">
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div className="flex items-center gap-4">
        <Typography variant="h5" className="font-semibold text-blue-900">
          {dayjs(currentDate).format('MMMM YYYY')}
        </Typography>
        <div className="flex items-center gap-2">
          <IconButton
            variant="text"
            size="sm"
            onClick={() => onDateChange(dayjs(currentDate).subtract(1, 'week'))}
            className="hover:bg-blue-100"
          >
            <ChevronLeft className="h-5 w-5" />
          </IconButton>
          <Button
            variant="outlined"
            size="sm"
            className="px-3 py-1 text-sm border-blue-500 text-blue-700 hover:bg-blue-50"
            onClick={() => onDateChange(dayjs())}
          >
            Aujourd'hui
          </Button>
          <IconButton
            variant="text"
            size="sm"
            onClick={() => onDateChange(dayjs(currentDate).add(1, 'week'))}
            className="hover:bg-blue-100"
          >
            <ChevronRight className="h-5 w-5" />
          </IconButton>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Filter className="h-5 w-5 text-blue-500" />
        <div className="relative">
          <Select
            label="Filtrer"
            value={filter}
            onChange={(value) => setFilter(value)}
            className="w-32"
            menuProps={{
              className: "z-[9999] !fixed",
              style: { zIndex: 9999 }
            }}
            containerProps={{
              className: "min-w-[120px]"
            }}
          >
            <Option value="free">Libres</Option>
            <Option value="all">Tous</Option>
            <Option value="booked">Réservés</Option>
          </Select>
        </div>
      </div>
    </div>
  </CardHeader>
  <CardBody className="p-0 relative">
    <div className="overflow-auto">
      <div className="flex min-w-max">
        {/* Colonne des heures */}
        <div className="w-16 border-r bg-gray-50">
          <div className="h-16 border-b"></div>
          {hours.map(hour => (
            <div key={hour} className="h-16 border-b relative flex items-center justify-end pr-2">
              <Typography 
                variant="small" 
                color="gray" 
                className="text-xs text-gray-500"
              >
                {hour === 12 ? '12h' : `${hour}h`}
              </Typography>
            </div>
          ))}
        </div>
        {/* Colonnes des jours */}
        {getWeekDays().map(day => {
          const isToday = day.isSame(dayjs(), 'day');
          const dayAppointments = getAppointmentsForDate(day);
          return (
            <div 
              key={day.format('DD-MM-YYYY')} 
              className={`flex-1 min-w-[180px] border-r bg-white transition-colors ${
                isToday ? 'bg-blue-50/70 border-blue-200' : 'hover:bg-gray-50/60'
              }`}
            >
              {/* En-tête du jour */}
              <div className={`h-16 border-b flex flex-col items-center justify-center ${
                isToday ? 'bg-blue-500 text-white rounded-t' : ''
              }`}>
                <Typography variant="small" className={`font-medium ${isToday ? 'text-white' : 'text-gray-700'}`}>
                  {day.format('ddd')}
                </Typography>
                <Typography 
                  variant="h6" 
                  className={`font-bold ${
                    isToday ? 'text-white' : day.day() === 0 ? 'text-red-500' : 'text-blue-900'
                  }`}
                >
                  {day.format('D')}
                </Typography>
              </div>
              {/* Créneaux horaires et rendez-vous */}
              <div className="relative" style={{ height: `${hours.length * 64}px` }}>
                {/* Créneaux horaires */}
                {hours.map(hour => {
                  const isFree = isTimeSlotFree(day, hour);
                  if (filter === 'free' && !isFree) return null;
                  if (filter === 'booked' && isFree) return null;
                  return (
                    <div 
                      key={hour} 
                      className={`h-16 border-b cursor-pointer group transition-colors ${
                        isFree ? 'hover:bg-green-50' : 'hover:bg-gray-100'
                      }`}
                      onClick={() => onTimeSelect(day, `${hour}:00`)}
                    >
                      {isFree && filter !== 'booked' && (
                        <div className="h-full flex items-center justify-center">
                          <div className="flex items-center gap-1 text-green-600 group-hover:text-green-800">
                            <Plus className="h-4 w-4" />
                            <Typography variant="small" className="text-xs font-medium">
                              Libre
                            </Typography>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                {/* Rendez-vous (only show if not filtering for free slots) */}
                {filter !== 'free' && dayAppointments.map(appointment => {
                  const patient = getPatientInfo(appointment.patientId);
                  const position = calculateAppointmentPosition(appointment);
                  return (
                    <div
                      key={appointment._id}
                      className={`absolute left-2 right-2 p-2 rounded-lg border cursor-pointer shadow-md hover:shadow-lg transition-all ${getAppointmentStyle(appointment.type)} flex items-center gap-2`}
                      style={position}
                      onClick={() => onEditAppointment(appointment)}
                    >
                      <Avatar 
                        src={patient.img} 
                        alt={patient.name} 
                        size="sm"
                        className="mt-1 border border-white shadow"
                      />
                      <div className="flex-1 overflow-hidden">
                        <Typography variant="small" className="font-semibold truncate text-blue-900">
                          {patient.firstName} {patient.lastName}
                        </Typography>
                        <Typography variant="small" className="text-xs truncate text-gray-600">
                          {appointment.time} • {getTypeText(appointment.type)}
                        </Typography>
                        {appointment.status && (
                          <Chip
                            value={getStatusText(appointment.status)}
                            color={
                              appointment.status === 'confirmed' ? 'green' :
                              appointment.status === 'pending' ? 'amber' : 'red'
                            }
                            size="sm"
                            className="mt-1"
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </CardBody>
</Card>
  );
};

export default AppointmentCalendar;

// import React from 'react';
// import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
// import dayjs from 'dayjs';
// import 'dayjs/locale/fr'; // Import français pour dayjs
// import {
//   Button,
//   Typography, 
//   Card,
//   CardHeader,
//   CardBody,
//   Chip,
//   IconButton,
//   Avatar
// } from "@material-tailwind/react";

// // Configuration de dayjs en français
// dayjs.locale('fr');

// const AppointmentCalendar = ({ 
//   appointments = [], 
//   patients = [],
//   currentDate,
//   onDateChange,
//   onTimeSelect,
//   onEditAppointment
// }) => {

//   console.log("data passed to child component", appointments, );

//   const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8h à 19h

//   const getWeekDays = () => {
//     const startOfWeek = dayjs(currentDate).startOf('week');
//     return Array.from({ length: 7 }).map((_, i) => startOfWeek.add(i, 'day'));
//   };

//   const getAppointmentsForDate = (date) => {
//     const dateStr = date.format('YYYY-MM-DD');
//     return appointments.filter(apt => 
//       dayjs(apt.date).format('YYYY-MM-DD') === dateStr
//     );
//   };

//   const getPatientInfo = (patientId) => {
//     return patients.find(p => p.patientId === patientId) || {
//       firstName: 'Patient',
//       lastName: 'Inconnu',
//       img: '/img/team-2.jpeg'
//     };
//   };

//   const getAppointmentStyle = (type) => {
//     const styles = {
//       consultation: 'bg-blue-100 border-blue-300 text-blue-800',
//       vaccination: 'bg-green-100 border-green-300 text-green-800',
//       surgery: 'bg-red-100 border-red-300 text-red-800',
//       checkup: 'bg-yellow-100 border-yellow-300 text-yellow-800'
//     };
//     return styles[type] || 'bg-gray-100 border-gray-300 text-gray-800';
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

//   const calculateAppointmentPosition = (appointment) => {
//     const [hours, minutes] = appointment.time.split(':').map(Number);
//     const top = ((hours - 8) * 64) + (minutes / 60 * 64);
//     const duration = appointment.duration || 60; // Par défaut 60 minutes
    
//     return {
//       top: `${top}px`,
//       height: `${duration / 60 * 64}px`
//     };
//   };

//   return (
//     <Card className="shadow-none border rounded-lg">
//       <CardHeader floated={false} shadow={false} className="p-4 border-b">
//         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
//           <div className="flex items-center gap-4">
//             <Typography variant="h5" className="font-medium">
//               {dayjs(currentDate).format('MMMM YYYY')}
//             </Typography>
            
//             <div className="flex items-center gap-2">
//               <IconButton
//                 variant="text"
//                 size="sm"
//                 onClick={() => onDateChange(dayjs(currentDate).subtract(1, 'week'))}
//               >
//                 <ChevronLeft className="h-5 w-5" />
//               </IconButton>
              
//               <Button
//                 variant="text"
//                 size="sm"
//                 className="px-3 py-1 text-sm"
//                 onClick={() => onDateChange(dayjs())}
//               >
//                 Aujourd'hui
//               </Button>
              
//               <IconButton
//                 variant="text"
//                 size="sm"
//                 onClick={() => onDateChange(dayjs(currentDate).add(1, 'week'))}
//               >
//                 <ChevronRight className="h-5 w-5" />
//               </IconButton>
//             </div>
//           </div>
//         </div>
//       </CardHeader>
      
//       <CardBody className="p-0 overflow-auto">
//         <div className="flex min-w-max">
//           {/* Colonne des heures */}
//           <div className="w-16 border-r">
//             <div className="h-16 border-b"></div>
//             {hours.map(hour => (
//               <div key={hour} className="h-16 border-b relative">
//                 <Typography 
//                   variant="small" 
//                   color="gray" 
//                   className="absolute -top-2.5 right-2 text-xs"
//                 >
//                   {hour === 12 ? '12h' : `${hour}h`}
//                 </Typography>
//               </div>
//             ))}
//           </div>
          
//           {/* Colonnes des jours */}
//           {getWeekDays().map(day => {
//             const isToday = day.isSame(dayjs(), 'day');
//             const dayAppointments = getAppointmentsForDate(day);
            
//             return (
//               <div 
//                 key={day.format('DD-MM-YYYY')} 
//                 className={`flex-1 min-w-[180px] border-r ${isToday ? 'bg-blue-50' : ''}`}
//               >
//                 {/* En-tête du jour */}
//                 <div className={`h-16 border-b flex flex-col items-center justify-center ${
//                   isToday ? 'bg-blue-500 text-white' : ''
//                 }`}>
//                   <Typography variant="small" className="font-medium">
//                     {day.format('ddd')}
//                   </Typography>
//                   <Typography 
//                     variant="h6" 
//                     className={`font-medium ${
//                       isToday ? 'text-white' : day.day() === 0 ? 'text-red-500' : ''
//                     }`}
//                   >
//                     {day.format('D')}
//                   </Typography>
//                 </div>
                
//                 {/* Créneaux horaires et rendez-vous */}
//                 <div className="relative" style={{ height: `${hours.length * 64}px` }}>
//                   {/* Créneaux horaires cliquables */}
//                   {hours.map(hour => (
//                     <div 
//                       key={hour} 
//                       className="h-16 border-b hover:bg-gray-50 cursor-pointer"
//                       onClick={() => onTimeSelect(day, `${hour}:00`)}
//                     />
//                   ))}
                  
//                   {/* Rendez-vous */}
//                   {dayAppointments.map(appointment => {
//                     const patient = getPatientInfo(appointment.patientId);
//                     const position = calculateAppointmentPosition(appointment);
                    
//                     return (
//                       <div
//                         key={appointment._id}
//                         className={`absolute left-1 right-1 p-2 rounded border cursor-pointer shadow-sm hover:shadow-md transition-shadow ${getAppointmentStyle(appointment.type)}`}
//                         style={position}
//                         onClick={() => onEditAppointment(appointment)}
//                       >
//                         <div className="flex items-start gap-2 h-full">
//                           <Avatar 
//                             src={patient.img} 
//                             alt={patient.name} 
//                             size="sm"
//                             className="mt-1"
//                           />
//                           <div className="flex-1 overflow-hidden">
//                             <Typography variant="small" className="font-semibold truncate">
//                               {patient.firstName} {patient.lastName}
//                             </Typography>
//                             <Typography variant="small" className="text-xs truncate">
//                               {appointment.time} • {getTypeText(appointment.type)}
//                             </Typography>
//                             {appointment.status && (
//                               <Chip
//                                 value={getStatusText(appointment.status)}
//                                 color={
//                                   appointment.status === 'confirmed' ? 'green' :
//                                   appointment.status === 'pending' ? 'amber' : 'red'
//                                 }
//                                 size="sm"
//                                 className="mt-1"
//                               />
//                             )}
//                           </div>
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       </CardBody>
//     </Card>
//   );
// };

// export default AppointmentCalendar;
