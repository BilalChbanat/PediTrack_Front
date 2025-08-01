import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Chip,
  Avatar,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Select,
  Option,
  IconButton,
  Tooltip,
} from "@material-tailwind/react";
import {
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  TrashIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import { getAppointments, updateAppointment, deleteAppointment } from "@/data/appointmentsData";
import { getPatientTable } from "@/data/patientTable";
import dayjs from 'dayjs';
import 'dayjs/locale/fr';

dayjs.locale('fr');

const TodayAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  const today = dayjs().format('YYYY-MM-DD');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [appointmentsData, patientsData] = await Promise.all([
        getAppointments(),
        getPatientTable()
      ]);

      const todayAppointments = appointmentsData.filter(apt => 
        dayjs(apt.date).format('YYYY-MM-DD') === today
      );

      setAppointments(todayAppointments);
      setPatients(patientsData);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const getPatientInfo = (patientId) => {
    return patients.find(p => p.patientId === patientId) || {
      firstName: 'Patient',
      lastName: 'Inconnu',
      img: '/img/team-2.jpeg',
      phone: 'Non renseigné',
      email: 'Non renseigné',
      address: 'Non renseigné'
    };
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'amber',
      confirmed: 'blue',
      completed: 'green',
      cancelled: 'red',
      'no-show': 'red'
    };
    return colors[status] || 'gray';
  };

  const getStatusText = (status) => {
    const statusTexts = {
      pending: 'En attente',
      confirmed: 'Confirmé',
      completed: 'Terminé',
      cancelled: 'Annulé',
      'no-show': 'Absent'
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

  const getTypeColor = (type) => {
    const colors = {
      consultation: 'blue',
      vaccination: 'green',
      surgery: 'red',
      checkup: 'yellow'
    };
    return colors[type] || 'gray';
  };

  const handleStatusChange = async () => {
    if (!selectedAppointment || !newStatus) return;

    try {
      setUpdating(true);
      await updateAppointment(selectedAppointment._id, {
        ...selectedAppointment,
        status: newStatus
      });

      setAppointments(prev => prev.map(apt => 
        apt._id === selectedAppointment._id 
          ? { ...apt, status: newStatus }
          : apt
      ));

      toast.success('Statut mis à jour avec succès');
      setStatusModalOpen(false);
      setSelectedAppointment(null);
      setNewStatus('');
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise à jour du statut');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteAppointment = async () => {
    if (!selectedAppointment) return;

    try {
      setUpdating(true);
      await deleteAppointment(selectedAppointment._id);
      
      setAppointments(prev => prev.filter(apt => apt._id !== selectedAppointment._id));
      
      toast.success('Rendez-vous supprimé avec succès');
      setDeleteModalOpen(false);
      setSelectedAppointment(null);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression');
    } finally {
      setUpdating(false);
    }
  };

  const getAppointmentsByStatus = () => {
    const grouped = {
      pending: [],
      confirmed: [],
      completed: [],
      cancelled: [],
      'no-show': []
    };

    appointments.forEach(apt => {
      if (grouped[apt.status]) {
        grouped[apt.status].push(apt);
      } else {
        grouped.pending.push(apt);
      }
    });

    return grouped;
  };

  const groupedAppointments = getAppointmentsByStatus();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
            <CalendarDaysIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <Typography variant="h3" color="blue-gray">
              Rendez-vous d'aujourd'hui
            </Typography>
            <Typography variant="paragraph" color="gray" className="font-normal">
              {dayjs().format('dddd DD MMMM YYYY')}
            </Typography>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="bg-gradient-to-r from-amber-500 to-amber-600 text-white">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="h4">{groupedAppointments.pending.length}</Typography>
                  <Typography variant="small">En attente</Typography>
                </div>
                <ExclamationTriangleIcon className="h-8 w-8" />
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="h4">{groupedAppointments.confirmed.length}</Typography>
                  <Typography variant="small">Confirmés</Typography>
                </div>
                <CheckCircleIcon className="h-8 w-8" />
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="h4">{groupedAppointments.completed.length}</Typography>
                  <Typography variant="small">Terminés</Typography>
                </div>
                <CheckCircleIcon className="h-8 w-8" />
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="h4">{groupedAppointments.cancelled.length + groupedAppointments['no-show'].length}</Typography>
                  <Typography variant="small">Annulés/Absents</Typography>
                </div>
                <XCircleIcon className="h-8 w-8" />
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-r from-gray-500 to-gray-600 text-white">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="h4">{appointments.length}</Typography>
                  <Typography variant="small">Total</Typography>
                </div>
                <CalendarDaysIcon className="h-8 w-8" />
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Appointments List */}
      {appointments.length === 0 ? (
        <Card className="text-center py-12">
          <CardBody>
            <CalendarDaysIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <Typography variant="h5" color="gray" className="mb-2">
              Aucun rendez-vous aujourd'hui
            </Typography>
            <Typography variant="paragraph" color="gray">
              Il n'y a pas de rendez-vous programmés pour aujourd'hui.
            </Typography>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {appointments.map((appointment) => {
            const patient = getPatientInfo(appointment.patientId);
            return (
              <Card key={appointment._id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar src={patient.img} alt={patient.firstName} size="md" />
                      <div>
                        <Typography variant="h6" color="blue-gray">
                          {patient.firstName} {patient.lastName}
                        </Typography>
                        <Typography variant="small" color="gray" className="font-normal">
                          {appointment.time}
                        </Typography>
                      </div>
                    </div>
                    <Chip
                      value={getStatusText(appointment.status)}
                      color={getStatusColor(appointment.status)}
                      size="sm"
                    />
                  </div>
                </CardHeader>

                <CardBody className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <ClockIcon className="h-4 w-4 text-gray-500" />
                      <Typography variant="small" color="gray">
                        {dayjs(appointment.date).format('dddd DD MMMM YYYY')} à {appointment.time}
                      </Typography>
                    </div>

                    <div className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4 text-gray-500" />
                      <Typography variant="small" color="gray">
                        {getTypeText(appointment.type)}
                      </Typography>
                    </div>

                    {appointment.notes && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <Typography variant="small" color="gray">
                          <strong>Notes:</strong> {appointment.notes}
                        </Typography>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Chip
                        value={getTypeText(appointment.type)}
                        color={getTypeColor(appointment.type)}
                        size="sm"
                        variant="outlined"
                      />
                      {appointment.price && (
                        <Chip
                          value={`${appointment.price} MAD`}
                          color="green"
                          size="sm"
                          variant="outlined"
                        />
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <div className="flex gap-2">
                      <Tooltip content="Voir les détails">
                        <IconButton
                          size="sm"
                          variant="text"
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            setViewModalOpen(true);
                          }}
                        >
                          <EyeIcon className="h-4 w-4" />
                        </IconButton>
                      </Tooltip>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outlined"
                        color="blue"
                        onClick={() => {
                          setSelectedAppointment(appointment);
                          setNewStatus(appointment.status);
                          setStatusModalOpen(true);
                        }}
                      >
                        Changer statut
                      </Button>
                      
                      <Tooltip content="Supprimer">
                        <IconButton
                          size="sm"
                          variant="text"
                          color="red"
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            setDeleteModalOpen(true);
                          }}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      {/* Status Change Modal */}
      <Dialog open={statusModalOpen} handler={() => setStatusModalOpen(false)}>
        <DialogHeader>Changer le statut du rendez-vous</DialogHeader>
        <DialogBody>
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Avatar src={getPatientInfo(selectedAppointment.patientId).img} size="sm" />
                <div>
                  <Typography variant="h6">
                    {getPatientInfo(selectedAppointment.patientId).firstName} {getPatientInfo(selectedAppointment.patientId).lastName}
                  </Typography>
                  <Typography variant="small" color="gray">
                    {dayjs(selectedAppointment.date).format('DD/MM/YYYY')} à {selectedAppointment.time}
                  </Typography>
                </div>
              </div>

              <div>
                <Typography variant="small" color="blue-gray" className="mb-2 block">
                  Nouveau statut
                </Typography>
                <Select
                  value={newStatus}
                  onChange={(value) => setNewStatus(value)}
                  label="Sélectionner un statut"
                >
                  <Option value="pending">En attente</Option>
                  <Option value="confirmed">Confirmé</Option>
                  <Option value="completed">Terminé</Option>
                  <Option value="cancelled">Annulé</Option>
                </Select>
              </div>
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <Button variant="text" color="red" onClick={() => setStatusModalOpen(false)}>
            Annuler
          </Button>
          <Button 
            variant="gradient" 
            onClick={handleStatusChange}
            disabled={updating || !newStatus}
          >
            {updating ? 'Mise à jour...' : 'Confirmer'}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} handler={() => setDeleteModalOpen(false)}>
        <DialogHeader>Confirmer la suppression</DialogHeader>
        <DialogBody>
          {selectedAppointment && (
            <Typography>
              Êtes-vous sûr de vouloir supprimer le rendez-vous de{' '}
              <strong>{getPatientInfo(selectedAppointment.patientId).firstName} {getPatientInfo(selectedAppointment.patientId).lastName}</strong>{' '}
              prévu le {dayjs(selectedAppointment.date).format('DD/MM/YYYY')} à {selectedAppointment.time} ?
            </Typography>
          )}
        </DialogBody>
        <DialogFooter>
          <Button variant="text" color="red" onClick={() => setDeleteModalOpen(false)}>
            Annuler
          </Button>
          <Button 
            variant="gradient" 
            color="red"
            onClick={handleDeleteAppointment}
            disabled={updating}
          >
            {updating ? 'Suppression...' : 'Supprimer'}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* View Details Modal */}
      <Dialog open={viewModalOpen} handler={() => setViewModalOpen(false)} size="md">
        <DialogHeader>Détails du rendez-vous</DialogHeader>
        <DialogBody>
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <Avatar src={getPatientInfo(selectedAppointment.patientId).img} size="lg" />
                <div>
                  <Typography variant="h5">
                    {getPatientInfo(selectedAppointment.patientId).firstName} {getPatientInfo(selectedAppointment.patientId).lastName}
                  </Typography>
                  <Typography variant="small" color="gray">
                    Patient ID: {selectedAppointment.patientId}
                  </Typography>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CalendarDaysIcon className="h-4 w-4 text-gray-500" />
                    <Typography variant="small">
                      <strong>Date:</strong> {dayjs(selectedAppointment.date).format('dddd DD MMMM YYYY')}
                    </Typography>
                  </div>

                  <div className="flex items-center gap-2">
                    <ClockIcon className="h-4 w-4 text-gray-500" />
                    <Typography variant="small">
                      <strong>Heure:</strong> {selectedAppointment.time}
                    </Typography>
                  </div>

                  <div className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4 text-gray-500" />
                    <Typography variant="small">
                      <strong>Type:</strong> {getTypeText(selectedAppointment.type)}
                    </Typography>
                  </div>

                  <div className="flex items-center gap-2">
                    <Chip
                      value={getStatusText(selectedAppointment.status)}
                      color={getStatusColor(selectedAppointment.status)}
                      size="sm"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <PhoneIcon className="h-4 w-4 text-gray-500" />
                    <Typography variant="small">
                      <strong>Téléphone:</strong> {getPatientInfo(selectedAppointment.patientId).phone}
                    </Typography>
                  </div>

                  <div className="flex items-center gap-2">
                    <EnvelopeIcon className="h-4 w-4 text-gray-500" />
                    <Typography variant="small">
                      <strong>Email:</strong> {getPatientInfo(selectedAppointment.patientId).email}
                    </Typography>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPinIcon className="h-4 w-4 text-gray-500" />
                    <Typography variant="small">
                      <strong>Adresse:</strong> {getPatientInfo(selectedAppointment.patientId).address}
                    </Typography>
                  </div>

                  {selectedAppointment.price && (
                    <div className="flex items-center gap-2">
                      <Typography variant="small">
                        <strong>Prix:</strong> {selectedAppointment.price} MAD
                      </Typography>
                    </div>
                  )}
                </div>
              </div>

              {selectedAppointment.notes && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <Typography variant="small" color="gray">
                    <strong>Notes:</strong>
                  </Typography>
                  <Typography variant="small" color="gray" className="mt-1">
                    {selectedAppointment.notes}
                  </Typography>
                </div>
              )}
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <Button variant="text" onClick={() => setViewModalOpen(false)}>
            Fermer
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};

export default TodayAppointments; 