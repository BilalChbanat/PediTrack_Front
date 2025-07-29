// import React, { useState } from 'react';
// import {
//   Button,
//   Typography,
//   Input,
//   Card,
//   CardBody,
//   CardHeader,
//   Chip,
//   IconButton,
//   Dialog,
//   DialogHeader,
//   DialogBody,
//   DialogFooter,
//   Select,
//   Option,
//   Tooltip
// } from "@material-tailwind/react";
// import {
//   PlusIcon,
//   PencilIcon,
//   TrashIcon,
//   CalendarDaysIcon
// } from "@heroicons/react/24/outline";
// import { toast } from 'react-toastify';

// const AppointmentPricing = ({ 
//   appointments: initialAppointments = [
//     { id: 1, type: 'Consultation générale', duration: 30, price: 50, category: 'consultation' },
//     { id: 2, type: 'Consultation spécialisée', duration: 45, price: 80, category: 'consultation' },
//     { id: 3, type: 'Vaccination', duration: 15, price: 30, category: 'vaccination' },
//     { id: 4, type: 'Suivi médical', duration: 20, price: 40, category: 'suivi' },
//     { id: 5, type: 'Consultation urgente', duration: 30, price: 100, category: 'urgence' },
//     { id: 6, type: 'Bilan de santé', duration: 60, price: 120, category: 'bilan' }
//   ],
//   onAppointmentChange
// }) => {
//   const [appointments, setAppointments] = useState(initialAppointments);
//   const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
//   const [selectedAppointment, setSelectedAppointment] = useState(null);
//   const [appointmentForm, setAppointmentForm] = useState({
//     type: '',
//     duration: '',
//     price: '',
//     category: 'consultation'
//   });
//   const [errors, setErrors] = useState({});

//   const validateAppointmentForm = () => {
//     const newErrors = {};
    
//     if (!appointmentForm.type.trim()) {
//       newErrors.type = 'Le type de rendez-vous est requis';
//     }
    
//     if (!appointmentForm.duration || appointmentForm.duration <= 0) {
//       newErrors.duration = 'La durée doit être supérieure à 0';
//     }
    
//     if (!appointmentForm.price || appointmentForm.price <= 0) {
//       newErrors.price = 'Le prix doit être supérieur à 0';
//     }
    
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleAppointmentFormChange = (field, value) => {
//     const updatedForm = { ...appointmentForm, [field]: value };
//     setAppointmentForm(updatedForm);
    
//     if (errors[field]) {
//       setErrors({ ...errors, [field]: undefined });
//     }
//   };

//   const handleSubmitAppointment = () => {
//     if (!validateAppointmentForm()) {
//       toast.error('Veuillez corriger les erreurs de validation');
//       return;
//     }

//     const appointmentData = {
//       ...appointmentForm,
//       duration: parseInt(appointmentForm.duration),
//       price: parseFloat(appointmentForm.price)
//     };

//     let updatedAppointments;

//     if (selectedAppointment) {
//       // Modifier un rendez-vous existant
//       updatedAppointments = appointments.map(apt => 
//         apt.id === selectedAppointment.id 
//           ? { ...apt, ...appointmentData }
//           : apt
//       );
//       toast.success('Tarif de rendez-vous mis à jour avec succès');
//     } else {
//       // Ajouter un nouveau rendez-vous
//       const newAppointment = {
//         id: Date.now(),
//         ...appointmentData
//       };
//       updatedAppointments = [...appointments, newAppointment];
//       toast.success('Nouveau tarif de rendez-vous ajouté avec succès');
//     }

//     setAppointments(updatedAppointments);
    
//     // Notifier le parent si une fonction de callback est fournie
//     if (onAppointmentChange) {
//       onAppointmentChange(updatedAppointments);
//     }

//     closeAppointmentModal();
//   };

//   const handleDeleteAppointment = (appointmentId) => {
//     const updatedAppointments = appointments.filter(apt => apt.id !== appointmentId);
//     setAppointments(updatedAppointments);
    
//     // Notifier le parent si une fonction de callback est fournie
//     if (onAppointmentChange) {
//       onAppointmentChange(updatedAppointments);
//     }
    
//     toast.success('Tarif de rendez-vous supprimé avec succès');
//   };

//   const openCreateAppointmentModal = () => {
//     setSelectedAppointment(null);
//     setAppointmentForm({
//       type: '',
//       duration: '',
//       price: '',
//       category: 'consultation'
//     });
//     setErrors({});
//     setIsAppointmentModalOpen(true);
//   };

//   const openEditAppointmentModal = (appointment) => {
//     setSelectedAppointment(appointment);
//     setAppointmentForm({
//       type: appointment.type,
//       duration: appointment.duration.toString(),
//       price: appointment.price.toString(),
//       category: appointment.category
//     });
//     setErrors({});
//     setIsAppointmentModalOpen(true);
//   };

//   const closeAppointmentModal = () => {
//     setIsAppointmentModalOpen(false);
//     setSelectedAppointment(null);
//     setAppointmentForm({
//       type: '',
//       duration: '',
//       price: '',
//       category: 'consultation'
//     });
//     setErrors({});
//   };

//   const getCategoryColor = (category) => {
//     const colors = {
//       consultation: 'gray',
//       vaccination: 'blue-gray',
//       suivi: 'gray',
//       urgence: 'red',
//       bilan: 'gray'
//     };
//     return colors[category] || 'gray';
//   };

//   const getCategoryLabel = (category) => {
//     const labels = {
//       consultation: 'Consultation',
//       vaccination: 'Vaccination',
//       suivi: 'Suivi',
//       urgence: 'Urgence',
//       bilan: 'Bilan'
//     };
//     return labels[category] || category;
//   };

//   return (
//     <>
//       <Card>
//         <CardHeader variant="gradient" color="gray" className="mb-6 p-6">
//           <div className="flex items-center justify-between">
//             <Typography variant="h6" color="white">
//               Tarifs des Rendez-vous
//             </Typography>
//             <Button
//               color="white"
//               size="sm"
//               className="flex items-center gap-2"
//               onClick={openCreateAppointmentModal}
//             >
//               <PlusIcon className="h-4 w-4" />
//               Ajouter un Tarif
//             </Button>
//           </div>
//         </CardHeader>
//         <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
//           <table className="w-full min-w-[640px] table-auto">
//             <thead>
//               <tr>
//                 {["Type de Rendez-vous", "Catégorie", "Durée", "Prix", "Actions"].map(
//                   (el) => (
//                     <th
//                       key={el}
//                       className="border-b border-blue-gray-50 py-3 px-5 text-left"
//                     >
//                       <Typography
//                         variant="small"
//                         className="text-[11px] font-bold uppercase text-blue-gray-400"
//                       >
//                         {el}
//                       </Typography>
//                     </th>
//                   )
//                 )}
//               </tr>
//             </thead>
//             <tbody>
//               {appointments.map((appointment, key) => {
//                 const className = `py-3 px-5 ${key === appointments.length - 1 ? "" : "border-b border-blue-gray-50"}`;

//                 return (
//                   <tr key={appointment.id}>
//                     <td className={className}>
//                       <div className="flex items-center gap-3">
//                         <div className="flex items-center justify-center bg-gray-600 text-white rounded-full h-8 w-8">
//                           <CalendarDaysIcon className="h-4 w-4" />
//                         </div>
//                         <Typography
//                           variant="small"
//                           color="blue-gray"
//                           className="font-bold"
//                         >
//                           {appointment.type}
//                         </Typography>
//                       </div>
//                     </td>
//                     <td className={className}>
//                       <Chip
//                         size="sm"
//                         value={getCategoryLabel(appointment.category)}
//                         color={getCategoryColor(appointment.category)}
//                         className="text-xs"
//                       />
//                     </td>
//                     <td className={className}>
//                       <Typography variant="small" color="blue-gray">
//                         {appointment.duration} min
//                       </Typography>
//                     </td>
//                     <td className={className}>
//                       <Typography variant="small" color="gray" className="font-bold">
//                         {appointment.price}€
//                       </Typography>
//                     </td>
//                     <td className={className}>
//                       <div className="flex items-center gap-2">
//                         <Tooltip content="Modifier">
//                           <IconButton
//                             variant="text"
//                             size="sm"
//                             onClick={() => openEditAppointmentModal(appointment)}
//                           >
//                             <PencilIcon className="h-4 w-4 text-gray-600" />
//                           </IconButton>
//                         </Tooltip>
//                         <Tooltip content="Supprimer">
//                           <IconButton
//                             variant="text"
//                             size="sm"
//                             onClick={() => handleDeleteAppointment(appointment.id)}
//                           >
//                             <TrashIcon className="h-4 w-4 text-red-600" />
//                           </IconButton>
//                         </Tooltip>
//                       </div>
//                     </td>
//                   </tr>
//                 );
//               })}
//               {appointments.length === 0 && (
//                 <tr>
//                   <td colSpan={5} className="py-8 text-center">
//                     <Typography variant="small" color="gray">
//                       Aucun tarif de rendez-vous trouvé. Cliquez sur "Ajouter un Tarif" pour en créer un.
//                     </Typography>
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </CardBody>
//       </Card>

//       {/* Modal pour ajouter/modifier un tarif */}
//       <Dialog open={isAppointmentModalOpen} handler={closeAppointmentModal} size="md">
//         <DialogHeader>
//           <Typography variant="h5">
//             {selectedAppointment ? 'Modifier le Tarif' : 'Ajouter un Nouveau Tarif'}
//           </Typography>
//         </DialogHeader>
//         <DialogBody className="space-y-4">
//           <div>
//             <Typography variant="small" className="mb-2 font-semibold text-blue-gray-500">
//               Type de Rendez-vous *
//             </Typography>
//             <Input
//               value={appointmentForm.type}
//               onChange={(e) => handleAppointmentFormChange('type', e.target.value)}
//               label="Type de rendez-vous"
//               placeholder="ex: Consultation générale, Vaccination"
//               error={!!errors.type}
//             />
//             {errors.type && (
//               <Typography variant="small" color="red" className="mt-1">
//                 {errors.type}
//               </Typography>
//             )}
//           </div>

//           <div>
//             <Typography variant="small" className="mb-2 font-semibold text-blue-gray-500">
//               Catégorie *
//             </Typography>
//             <Select
//               value={appointmentForm.category}
//               onChange={(value) => handleAppointmentFormChange('category', value)}
//               label="Sélectionner une catégorie"
//             >
//               <Option value="consultation">Consultation</Option>
//               <Option value="vaccination">Vaccination</Option>
//               <Option value="suivi">Suivi</Option>
//               <Option value="urgence">Urgence</Option>
//               <Option value="bilan">Bilan</Option>
//             </Select>
//           </div>

//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <Typography variant="small" className="mb-2 font-semibold text-blue-gray-500">
//                 Durée (minutes) *
//               </Typography>
//               <Input
//                 type="number"
//                 value={appointmentForm.duration}
//                 onChange={(e) => handleAppointmentFormChange('duration', e.target.value)}
//                 label="Durée en minutes"
//                 placeholder="30"
//                 error={!!errors.duration}
//                 min="1"
//               />
//               {errors.duration && (
//                 <Typography variant="small" color="red" className="mt-1">
//                   {errors.duration}
//                 </Typography>
//               )}
//             </div>
//             <div>
//               <Typography variant="small" className="mb-2 font-semibold text-blue-gray-500">
//                 Prix (€) *
//               </Typography>
//               <Input
//                 type="number"
//                 value={appointmentForm.price}
//                 onChange={(e) => handleAppointmentFormChange('price', e.target.value)}
//                 label="Prix en euros"
//                 placeholder="50"
//                 error={!!errors.price}
//                 min="0"
//                 step="0.01"
//               />
//               {errors.price && (
//                 <Typography variant="small" color="red" className="mt-1">
//                   {errors.price}
//                 </Typography>
//               )}
//             </div>
//           </div>
//         </DialogBody>
//         <DialogFooter>
//           <div className="flex gap-2">
//             <Button variant="text" color="red" onClick={closeAppointmentModal}>
//               Annuler
//             </Button>
//             <Button color="gray" onClick={handleSubmitAppointment}>
//               {selectedAppointment ? 'Mettre à jour' : 'Ajouter'}
//             </Button>
//           </div>
//         </DialogFooter>
//       </Dialog>
//     </>
//   );
// };

// export default AppointmentPricing;



// AppointmentPricing.jsx
import React, { useState, useEffect } from 'react';
import {
  Button,
  Typography,
  Input,
  Card,
  CardBody,
  CardHeader,
  Chip,
  IconButton,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Tooltip
} from "@material-tailwind/react";
import {
  PencilIcon,
  CalendarDaysIcon
} from "@heroicons/react/24/outline";
import { toast } from 'react-toastify';

const AppointmentPricing = ({ onAppointmentChange }) => {
  // Tarifs par défaut basés sur les 3 types d'appointment du backend
  const defaultAppointments = [
    { type: 'consultation', duration: 30, price: 50 },
    { type: 'vaccination', duration: 15, price: 30 },
    { type: 'follow-up', duration: 20, price: 40 }
  ];

  // Clé localStorage pour persister les tarifs
  const STORAGE_KEY = 'appointment_pricing_config';

  // Fonction pour charger les tarifs depuis localStorage
  const loadAppointmentsFromStorage = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) && parsed.length === 3 ? parsed : defaultAppointments;
      }
    } catch (error) {
      console.error('Erreur lors du chargement des tarifs:', error);
    }
    return defaultAppointments;
  };

  // Fonction pour sauvegarder les tarifs dans localStorage
  const saveAppointmentsToStorage = (appointmentsData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appointmentsData));
      console.log('Tarifs sauvegardés dans localStorage:', appointmentsData);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des tarifs:', error);
      toast.error('Erreur lors de la sauvegarde des tarifs');
    }
  };

  const [appointments, setAppointments] = useState([]);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [appointmentForm, setAppointmentForm] = useState({
    type: '',
    duration: '',
    price: ''
  });
  const [errors, setErrors] = useState({});

  // Charger les tarifs au montage du composant
  useEffect(() => {
    const loadedAppointments = loadAppointmentsFromStorage();
    setAppointments(loadedAppointments);
    console.log('Tarifs chargés depuis localStorage:', loadedAppointments);
  }, []);

  const validateAppointmentForm = () => {
    const newErrors = {};
    
    if (!appointmentForm.duration || appointmentForm.duration <= 0) {
      newErrors.duration = 'La durée doit être supérieure à 0';
    }
    
    if (!appointmentForm.price || appointmentForm.price <= 0) {
      newErrors.price = 'Le prix doit être supérieur à 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAppointmentFormChange = (field, value) => {
    const updatedForm = { ...appointmentForm, [field]: value };
    setAppointmentForm(updatedForm);
    
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  const handleSubmitAppointment = () => {
    if (!validateAppointmentForm()) {
      toast.error('Veuillez corriger les erreurs de validation');
      return;
    }

    const appointmentData = {
      type: appointmentForm.type,
      duration: parseInt(appointmentForm.duration),
      price: parseFloat(appointmentForm.price)
    };

    // Modifier le tarif existant
    const updatedAppointments = appointments.map(apt => 
      apt.type === selectedAppointment.type 
        ? { ...apt, ...appointmentData }
        : apt
    );

    setAppointments(updatedAppointments);
    saveAppointmentsToStorage(updatedAppointments); // Sauvegarde dans localStorage
    
    // Notifier le parent si une fonction de callback est fournie
    if (onAppointmentChange) {
      onAppointmentChange(updatedAppointments);
    }

    toast.success('Tarif mis à jour avec succès');
    closeAppointmentModal();
  };

  const openEditAppointmentModal = (appointment) => {
    setSelectedAppointment(appointment);
    setAppointmentForm({
      type: appointment.type,
      duration: appointment.duration.toString(),
      price: appointment.price.toString()
    });
    setErrors({});
    setIsAppointmentModalOpen(true);
  };

  const closeAppointmentModal = () => {
    setIsAppointmentModalOpen(false);
    setSelectedAppointment(null);
    setAppointmentForm({
      type: '',
      duration: '',
      price: ''
    });
    setErrors({});
  };

  const getAppointmentTypeLabel = (type) => {
    const labels = {
      consultation: 'Consultation',
      vaccination: 'Vaccination',
      'follow-up': 'Suivi médical'
    };
    return labels[type] || type;
  };

  const getAppointmentTypeColor = (type) => {
    const colors = {
      consultation: 'blue',
      vaccination: 'green',
      'follow-up': 'orange'
    };
    return colors[type] || 'gray';
  };

  return (
    <>
      <Card>
        <CardHeader variant="gradient" color="gray" className="mb-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <Typography variant="h6" color="white">
                Configuration des Tarifs
              </Typography>
              <Typography variant="small" color="white" className="opacity-80">
                Configurez les tarifs pour les 3 types de rendez-vous (localStorage)
              </Typography>
            </div>
          </div>
        </CardHeader>
        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          <table className="w-full min-w-[640px] table-auto">
            <thead>
              <tr>
                {["Type de Rendez-vous", "Durée Fixe", "Prix", "Actions"].map(
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
              {appointments.map((appointment, key) => {
                const className = `py-3 px-5 ${key === appointments.length - 1 ? "" : "border-b border-blue-gray-50"}`;

                return (
                  <tr key={appointment.type}>
                    <td className={className}>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center bg-gray-600 text-white rounded-full h-8 w-8">
                          <CalendarDaysIcon className="h-4 w-4" />
                        </div>
                        <div>
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-bold"
                          >
                            {getAppointmentTypeLabel(appointment.type)}
                          </Typography>
                          <Chip
                            size="sm"
                            value={appointment.type}
                            color={getAppointmentTypeColor(appointment.type)}
                            className="text-xs mt-1"
                          />
                        </div>
                      </div>
                    </td>
                    <td className={className}>
                      <Typography variant="small" color="blue-gray" className="font-medium">
                        {appointment.duration} minutes
                      </Typography>
                    </td>
                    <td className={className}>
                      <Typography variant="small" color="gray" className="font-bold text-lg">
                        {appointment.price} <span className="text-xs">MAD</span>
                      </Typography>
                    </td>
                    <td className={className}>
                      <div className="flex items-center gap-2">
                        <Tooltip content="Modifier le tarif">
                          <IconButton
                            variant="text"
                            size="sm"
                            onClick={() => openEditAppointmentModal(appointment)}
                          >
                            <PencilIcon className="h-4 w-4 text-gray-600" />
                          </IconButton>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardBody>
      </Card>

      {/* Modal pour modifier un tarif */}
      <Dialog open={isAppointmentModalOpen} handler={closeAppointmentModal} size="md">
        <DialogHeader>
          <Typography variant="h5">
            Modifier le Tarif - {selectedAppointment && getAppointmentTypeLabel(selectedAppointment.type)}
          </Typography>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <Typography variant="small" color="blue-gray" className="font-medium">
              Type: {selectedAppointment && selectedAppointment.type}
            </Typography>
            <Typography variant="small" color="gray">
              Ce type correspond au schema backend et ne peut pas être modifié
            </Typography>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Typography variant="small" className="mb-2 font-semibold text-blue-gray-500">
                Durée (minutes) *
              </Typography>
              <Input
                type="number"
                value={appointmentForm.duration}
                onChange={(e) => handleAppointmentFormChange('duration', e.target.value)}
                label="Durée en minutes"
                placeholder="30"
                error={!!errors.duration}
                min="1"
              />
              {errors.duration && (
                <Typography variant="small" color="red" className="mt-1">
                  {errors.duration}
                </Typography>
              )}
            </div>
            <div>
              <Typography variant="small" className="mb-2 font-semibold text-blue-gray-500">
                Prix (MAD) *
              </Typography>
              <Input
                type="number"
                value={appointmentForm.price}
                onChange={(e) => handleAppointmentFormChange('price', e.target.value)}
                label="Prix en euros"
                placeholder="50"
                error={!!errors.price}
                min="0"
                step="0.01"
              />
              {errors.price && (
                <Typography variant="small" color="red" className="mt-1">
                  {errors.price}
                </Typography>
              )}
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <div className="flex gap-2">
            <Button variant="text" color="red" onClick={closeAppointmentModal}>
              Annuler
            </Button>
            <Button color="gray" onClick={handleSubmitAppointment}>
              Mettre à jour
            </Button>
          </div>
        </DialogFooter>
      </Dialog>
    </>
  );
};

// Hook personnalisé pour utiliser les tarifs dans d'autres composants
export const useAppointmentPricing = () => {
  const STORAGE_KEY = 'appointment_pricing_config';
  
  const getPricingConfig = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      // Retourner les valeurs par défaut si rien n'est stocké
      return [
        { type: 'consultation', duration: 30, price: 50 },
        { type: 'vaccination', duration: 15, price: 30 },
        { type: 'follow-up', duration: 20, price: 40 }
      ];
    } catch (error) {
      console.error('Erreur lors du chargement des tarifs:', error);
      return [];
    }
  };

  const calculatePrice = (appointmentType) => {
    const config = getPricingConfig();
    const pricing = config.find(apt => apt.type === appointmentType);
    return pricing ? pricing.price : 0;
  };

  const getDuration = (appointmentType) => {
    const config = getPricingConfig();
    const pricing = config.find(apt => apt.type === appointmentType);
    return pricing ? pricing.duration : 0;
  };

  const getPricing = (appointmentType) => {
    const config = getPricingConfig();
    return config.find(apt => apt.type === appointmentType);
  };

  return {
    getPricingConfig,
    calculatePrice,
    getDuration,
    getPricing
  };
};

export default AppointmentPricing;