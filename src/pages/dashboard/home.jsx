import React, { useState, useEffect } from "react";
import {
  Typography,
  Card,
  CardHeader,
  CardBody,
  IconButton,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Avatar,
  Tooltip,
  Progress,
  Spinner,
  Alert,
  Button,
} from "@material-tailwind/react";
import {
  EllipsisVerticalIcon,
  ArrowUpIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon, ClockIcon } from "@heroicons/react/24/solid";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import axiosInstance from "@/api/axiosInstance";
import { useAppointmentPricing } from './sitting/AppointmentPricing';

// ===== API SERVICE =====
class DashboardApi {
  async getDashboardStats() {
    try {
      const response = await axiosInstance.get('/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('Erreur API getDashboardStats:', error);
      throw new Error('Impossible de récupérer les statistiques du dashboard');
    }
  }

  async getPatientsList(page = 1, limit = 10) {
    try {
      const response = await axiosInstance.get(`/dashboard/patients?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Erreur API getPatientsList:', error);
      throw new Error('Impossible de récupérer la liste des patients');
    }
  }

  async getPatientDetails(patientId) {
    try {
      const response = await axiosInstance.get(`/dashboard/patients/${patientId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur API getPatientDetails:', error);
      throw new Error('Impossible de récupérer les détails du patient');
    }
  }

  // Méthode commentée car endpoint pas encore implémenté
  // async getMonthlyStats() {
  //   try {
  //     const response = await axiosInstance.get('/dashboard/monthly-stats');
  //     return response.data;
  //   } catch (error) {
  //     console.error('Erreur API getMonthlyStats:', error);
  //     throw new Error('Impossible de récupérer les statistiques mensuelles');
  //   }
  // }
}

const dashboardApi = new DashboardApi();

// ===== HOOK PERSONNALISÉ =====
const useDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const stats = await dashboardApi.getDashboardStats();
      setData(stats);
    } catch (err) {
      setError(err.message || 'Une erreur est survenue');
      console.error('Erreur dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const refresh = () => {
    fetchDashboardData();
  };

  return { data, loading, error, refresh };
};

// ===== COMPOSANTS =====
function StatisticsCard({ color, icon, title, value, footer }) {

    const { calculatePrice } = useAppointmentPricing();
 
  return (
    <Card className="border border-blue-gray-100 shadow-sm">
      <CardHeader
        variant="gradient"
        color={color}
        floated={false}
        shadow={false}
        className="absolute grid h-12 w-12 place-items-center"
      >
        <span className="text-2xl">{icon}</span>
      </CardHeader>
      <CardBody className="p-4 text-right">
        <Typography variant="small" className="font-normal text-blue-gray-600">
          {title}
        </Typography>
        <Typography variant="h4" color="blue-gray">
          {value}
        </Typography>
      </CardBody>
      <div className="border-t border-blue-gray-50 p-4">
        {footer}
      </div>
    </Card>
  );
}

function StatisticsChart({ color, title, description, footer, chart }) {
  return (
    <Card className="border border-blue-gray-100 shadow-sm">
      <CardHeader variant="gradient" color={color} floated={false} shadow={false}>
        <div className="relative h-48 p-4 bg-white">
          <ResponsiveContainer width="100%" height="100%">
            {chart.type === "line" ? (
              <LineChart data={chart.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#424242', fontSize: 11 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#424242', fontSize: 11 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke={chart.color} 
                  strokeWidth={3}
                  dot={{ fill: chart.color, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: chart.color }}
                />
              </LineChart>
            ) : (
              <BarChart data={chart.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#424242', fontSize: 11 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#424242', fontSize: 11 }}
                />
                <Bar 
                  dataKey="value" 
                  fill={chart.color} 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardHeader>
      <CardBody className="px-6 pt-6">
        <Typography variant="h6" color="blue-gray">
          {title}
        </Typography>
        <Typography variant="small" className="font-normal text-blue-gray-600">
          {description}
        </Typography>
      </CardBody>
      <div className="px-6 pb-6">
        {footer}
      </div>
    </Card>
  );
}

// ===== COMPOSANT PRINCIPAL =====
export function Home() {
  const { data, loading, error, refresh } = useDashboard();
  const [refreshing, setRefreshing] = useState(false);
  const { calculatePrice } = useAppointmentPricing();

  // Calculate revenue using localStorage pricing and backend data
  const calculateTotalRevenue = () => {
    if (!data || !data.revenue) return 0;
    
    // data.revenue[0] = estimated monthly consultations
    // data.revenue[1] = vaccinations this month
    const consultationRevenue = data.revenue[0] * calculatePrice('consultation');
    const vaccinationRevenue = data.revenue[1] * calculatePrice('vaccination');
    
    return consultationRevenue + vaccinationRevenue;
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Animation de refresh
    refresh();
    setRefreshing(false);
  };

  // État de chargement
  if (loading) {
    return (
      <div className="mt-12 flex justify-center items-center h-64">
        <div className="text-center">
          <Spinner className="h-8 w-8 mb-4" />
          <Typography variant="small" color="blue-gray">
            Chargement du dashboard...
          </Typography>
        </div>
      </div>
    );
  }

  // État d'erreur
  if (error) {
    return (
      <div className="mt-12">
        <Alert color="red" className="mb-6">
          <Typography variant="small" className="font-medium">
            Erreur de connexion: {error}
          </Typography>
        </Alert>
        <Button onClick={refresh} variant="outlined" size="sm">
          Réessayer
        </Button>
      </div>
    );
  }

  // Pas de données
  if (!data) {
    return (
      <div className="mt-12">
        <Typography variant="h6" color="blue-gray">
          Aucune donnée disponible
        </Typography>
      </div>
    );
  }

  // Formatage des données pour les cartes de statistiques
  // Dynamically build statistics cards based on available data
  const statisticsCardsData = [
    {
      color: "gray",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
          <path d="M12 12c2.7 0 4.5-2.1 4.5-4.5S14.7 3 12 3 7.5 5.1 7.5 7.5 9.3 12 12 12zm0 1.5c-3 0-9 1.5-9 4.5V21h18v-3c0-3-6-4.5-9-4.5z" fill="currentColor"/>
          <title>Total Patients</title>
        </svg>
      ),
      title: "Total Patients",
      value: data.totalPatients?.toString() ?? "0",
      footer: {
        color: "text-green-500",
        value: data.patientsGrowth ? `${data.patientsGrowth > 0 ? "+" : ""}${data.patientsGrowth}%` : "+0%",
        label: "ce mois"
      }
    },
    {
      color: "gray",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
          <rect x="3" y="4" width="18" height="18" rx="2" fill="currentColor" opacity="0.1"/>
          <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
          <rect x="7" y="8" width="2" height="2" rx="1" fill="currentColor"/>
          <rect x="11" y="8" width="2" height="2" rx="1" fill="currentColor"/>
          <rect x="15" y="8" width="2" height="2" rx="1" fill="currentColor"/>
        </svg>
      ),
      title: "RDV Aujourd'hui",
      value: data.appointmentsToday?.toString() ?? "0",
      footer: {
        color: "text-blue-500",
        value: data.upcomingAppointments ? data.upcomingAppointments.length.toString() : "0",
        label: "restants"
      }
    },
    {
      color: "gray",
      icon: (
        // Syringe icon for "Vaccins ce Mois"
        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
          <title>Vaccins ce Mois</title>
          <rect x="15.07" y="3.93" width="2" height="7" rx="1" transform="rotate(45 15.07 3.93)" fill="currentColor" />
          <rect x="13.66" y="7.05" width="2" height="10" rx="1" transform="rotate(45 13.66 7.05)" fill="currentColor" opacity="0.2" />
          <rect x="5" y="19" width="6" height="2" rx="1" fill="currentColor" />
          <rect x="17.07" y="2.93" width="2" height="4" rx="1" transform="rotate(45 17.07 2.93)" fill="currentColor" />
          <rect x="19.07" y="0.93" width="2" height="2" rx="1" transform="rotate(45 19.07 0.93)" fill="currentColor" />
          <rect x="7" y="17" width="2" height="2" rx="1" fill="currentColor" />
        </svg>
      ),
      title: "Vaccins ce Mois",
      value: data.vaccinesThisMonth?.toString() ?? "0",
      footer: {
        color: "text-green-500",
        value:
          typeof data.vaccinesLastMonth === "number"
            ? (() => {
                const diff = data.vaccinesThisMonth - data.vaccinesLastMonth;
                const percent = data.vaccinesLastMonth === 0
                  ? (data.vaccinesThisMonth > 0 ? "+100%" : "+0%")
                  : `${diff >= 0 ? "+" : ""}${Math.round((diff / data.vaccinesLastMonth) * 100)}%`;
                return percent;
              })()
            : "+0%",
        label: "vs mois dernier"
      }
    },
    {
      color: "gray",
      icon: (
        // Money icon (banknote/cash style)
        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
          <rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="2" fill="currentColor" opacity="0.08"/>
          <rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="2"/>
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
          <path d="M6 8v0.01M6 16v0.01M18 8v0.01M18 16v0.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      title: "Revenus",
      value: (
        <>
          {calculateTotalRevenue()} <span className="text-xs">MAD</span>
        </>
      ),
      footer: {
        color: "text-green-500",
        value: "+0%",
        label: "ce mois"
      }
    }
  ];

  // Formatage des données pour les graphiques
  const statisticsChartsData = [
    {
      color: "white",
      title: "Consultations Mensuelles",
      description: "Évolution des consultations",
      footer: "mis à jour maintenant",
      chart: {
        type: "line",
        data: data.monthlyStats.months.map((month, index) => ({
          name: month,
          value: data.monthlyStats.consultations[index] || 0
        })),
        color: "#2e7d32"
      },
    },
    {
      color: "white",
      title: "Vaccinations",
      description: "Vaccins administrés par mois",
      footer: "mis à jour maintenant",
      chart: {
        type: "bar",
        data: data.monthlyStats.months.map((month, index) => ({
          name: month,
          value: data.monthlyStats.vaccinations[index] || 0
        })),
        color: "#1976d2"
      },
    },
    {
      color: "white",
      title: "Nouveaux Patients",
      description: "Croissance de la patientèle",
      footer: "mis à jour maintenant",
      chart: {
        type: "line",
        data: data.monthlyStats.months.map((month, index) => ({
          name: month,
          value: Math.floor(Math.random() * 25) + 10 // Données simulées pour nouveaux patients
        })),
        color: "#388e3c"
      },
    },
  ];

  // Formatage des activités récentes
  const ordersOverviewData = [
    ...data.upcomingAppointments.slice(0, 3).map(apt => ({
      icon: apt.type === 'Vaccination' ? "💉" : "🩺",
      color: apt.urgent ? "text-red-500" : apt.type === 'Vaccination' ? "text-green-500" : "text-blue-500",
      title: `${apt.type} ${apt.patient}`,
      description: `Aujourd'hui à ${apt.time}`,
    })),
    ...data.vaccineAlerts.slice(0, 2).map(alert => ({
      icon: "⚠️",
      color: "text-orange-500",
      title: `Rappel ${alert.vaccine}`,
      description: `${alert.patient} - ${new Date(alert.dueDate).toLocaleDateString('fr-FR')}`,
    }))
  ];

  return (
    <div className="mt-12">
      {/* Header avec bouton refresh */}
      <div className="mb-6 flex justify-between items-center">
        <Typography variant="h4" color="blue-gray">
          Dashboard Médical
        </Typography>
        <Button 
          onClick={handleRefresh}
          variant="outlined"
          size="sm"
          disabled={refreshing}
          className="flex items-center gap-2"
        >
          <ArrowPathIcon className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {/* Cartes de statistiques */}
      <div className="mb-12 grid gap-y-10 gap-x-6 md:grid-cols-2 xl:grid-cols-4">
        {statisticsCardsData.map(({ icon, title, footer, ...rest }) => (
          <StatisticsCard
            key={title}
            {...rest}
            title={title}
            icon={icon}
            footer={
              <Typography className="font-normal text-blue-gray-600">
                <strong className={footer.color}>{footer.value}</strong>
                &nbsp;{footer.label}
              </Typography>
            }
          />
        ))}
      </div>

      {/* Graphiques */}
      <div className="mb-6 grid grid-cols-1 gap-y-12 gap-x-6 md:grid-cols-2 xl:grid-cols-3">
        {statisticsChartsData.map((props) => (
          <StatisticsChart
            key={props.title}
            {...props}
            footer={
              <Typography
                variant="small"
                className="flex items-center font-normal text-blue-gray-600"
              >
                <ClockIcon strokeWidth={2} className="h-4 w-4 text-blue-gray-400" />
                &nbsp;{props.footer}
              </Typography>
            }
          />
        ))}
      </div>

      {/* Section principale avec tableau et activités récentes */}
      <div className="mb-4 grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Tableau des patients récents */}
        <Card className="overflow-hidden xl:col-span-2 border border-blue-gray-100 shadow-sm">
          <CardHeader
            floated={false}
            shadow={false}
            color="transparent"
            className="m-0 flex items-center justify-between p-6"
          >
            <div>
              <Typography variant="h6" color="blue-gray" className="mb-1">
                Patients Récents
              </Typography>
              <Typography
                variant="small"
                className="flex items-center gap-1 font-normal text-blue-gray-600"
              >
                <CheckCircleIcon strokeWidth={3} className="h-4 w-4 text-blue-gray-200" />
                <strong>{data.totalPatients} patients</strong> au total
              </Typography>
            </div>
            <Menu placement="left-start">
              <MenuHandler>
                <IconButton size="sm" variant="text" color="blue-gray">
                  <EllipsisVerticalIcon
                    strokeWidth={3}
                    fill="currenColor"
                    className="h-6 w-6"
                  />
                </IconButton>
              </MenuHandler>
              <MenuList>
                <MenuItem>Voir tous les patients</MenuItem>
                <MenuItem>Ajouter un patient</MenuItem>
                <MenuItem>Exporter la liste</MenuItem>
              </MenuList>
            </Menu>
          </CardHeader>
          <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
            <table className="w-full min-w-[640px] table-auto">
              <thead>
                <tr>
                  {["patient", "âge", "dernière visite", "statut"].map((el) => (
                    <th
                      key={el}
                      className="border-b border-blue-gray-50 py-3 px-6 text-left"
                    >
                      <Typography
                        variant="small"
                        className="text-[11px] font-medium uppercase text-blue-gray-400"
                      >
                        {el}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.recentPatients.map((patient, key) => {
                  const className = `py-3 px-5 ${
                    key === data.recentPatients.length - 1
                      ? ""
                      : "border-b border-blue-gray-50"
                  }`;

                  return (
                    <tr key={patient.id}>
                      <td className={className}>
                        <div className="flex items-center gap-4">
                          <Avatar 
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(patient.name)}&background=random`}
                            alt={patient.name} 
                            size="sm" 
                          />
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-bold"
                          >
                            {patient.name}
                          </Typography>
                        </div>
                      </td>
                      <td className={className}>
                        <Typography
                          variant="small"
                          className="text-xs font-medium text-blue-gray-600"
                        >
                          {patient.age}
                        </Typography>
                      </td>
                      <td className={className}>
                        <Typography
                          variant="small"
                          className="text-xs font-medium text-blue-gray-600"
                        >
                          {new Date(patient.lastVisit).toLocaleDateString('fr-FR')}
                        </Typography>
                      </td>
                      <td className={className}>
                        <div className="w-10/12">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            patient.status === 'completed' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {patient.status === 'completed' ? 'Complété' : 'Manqué'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardBody>
        </Card>

        {/* Activités récentes */}
        <Card className="border border-blue-gray-100 shadow-sm">
          <CardHeader
            floated={false}
            shadow={false}
            color="transparent"
            className="m-0 p-6"
          >
            <Typography variant="h6" color="blue-gray" className="mb-2">
              Activités Récentes
            </Typography>
            <Typography
              variant="small"
              className="flex items-center gap-1 font-normal text-blue-gray-600"
            >
              <ArrowUpIcon
                strokeWidth={3}
                className="h-3.5 w-3.5 text-green-500"
              />
              <strong>Activité en temps réel</strong>
            </Typography>
          </CardHeader>
          <CardBody className="pt-0">
            {ordersOverviewData.map(({ icon, color, title, description }, key) => (
              <div key={`${title}-${key}`} className="flex items-start gap-4 py-3">
                <div
                  className={`relative p-1 after:absolute after:-bottom-6 after:left-2/4 after:w-0.5 after:-translate-x-2/4 after:bg-blue-gray-50 after:content-[''] ${
                    key === ordersOverviewData.length - 1
                      ? "after:h-0"
                      : "after:h-4/6"
                  }`}
                >
                  <span className={`text-xl ${color}`}>
                    {icon}
                  </span>
                </div>
                <div>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="block font-medium"
                  >
                    {title}
                  </Typography>
                  <Typography
                    as="span"
                    variant="small"
                    className="text-xs font-medium text-blue-gray-500"
                  >
                    {description}
                  </Typography>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export default Home;

