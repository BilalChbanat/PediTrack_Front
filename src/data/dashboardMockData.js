// Mock data for dashboard when API is not available
export const mockDashboardData = {
  totalPatients: 12,
  patientsGrowth: 15,
  appointmentsToday: 3,
  upcomingAppointments: [
    {
      id: 1,
      type: 'Consultation',
      patient: 'Ahmed Benali',
      time: '09:00',
      urgent: false
    },
    {
      id: 2,
      type: 'Vaccination',
      patient: 'Fatima Zahra',
      time: '10:30',
      urgent: false
    },
    {
      id: 3,
      type: 'Consultation',
      patient: 'Youssef Alami',
      time: '14:00',
      urgent: true
    }
  ],
  vaccinesThisMonth: 8,
  vaccinesLastMonth: 6,
  revenue: [15, 8], // consultations, vaccinations
  monthlyStats: {
    months: ['Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août'],
    consultations: [12, 15, 18, 14, 20, 16],
    vaccinations: [8, 10, 12, 9, 15, 11]
  },
  recentPatients: [
    {
      id: 1,
      name: 'Ahmed Benali',
      age: 5,
      lastVisit: '2024-01-15',
      status: 'completed'
    },
    {
      id: 2,
      name: 'Fatima Zahra',
      age: 3,
      lastVisit: '2024-01-14',
      status: 'completed'
    },
    {
      id: 3,
      name: 'Youssef Alami',
      age: 7,
      lastVisit: '2024-01-13',
      status: 'completed'
    },
    {
      id: 4,
      name: 'Amina Tazi',
      age: 4,
      lastVisit: '2024-01-12',
      status: 'completed'
    },
    {
      id: 5,
      name: 'Omar Idrissi',
      age: 6,
      lastVisit: '2024-01-11',
      status: 'completed'
    }
  ],
  vaccineAlerts: [
    {
      vaccine: 'DTaP',
      patient: 'Ahmed Benali',
      dueDate: '2024-02-01'
    },
    {
      vaccine: 'MMR',
      patient: 'Fatima Zahra',
      dueDate: '2024-02-05'
    }
  ]
};

export const mockPatientsData = [
  {
    _id: 1,
    name: 'Ahmed Benali',
    firstName: 'Ahmed',
    lastName: 'Benali',
    birthDate: '2019-03-15',
    email: 'ahmed.benali@email.com',
    phoneNumber: '+212 6 12 34 56 78',
    gender: 'male',
    lastVisit: '2024-01-15'
  },
  {
    _id: 2,
    name: 'Fatima Zahra',
    firstName: 'Fatima',
    lastName: 'Zahra',
    birthDate: '2021-07-22',
    email: 'fatima.zahra@email.com',
    phoneNumber: '+212 6 23 45 67 89',
    gender: 'female',
    lastVisit: '2024-01-14'
  },
  {
    _id: 3,
    name: 'Youssef Alami',
    firstName: 'Youssef',
    lastName: 'Alami',
    birthDate: '2017-11-08',
    email: 'youssef.alami@email.com',
    phoneNumber: '+212 6 34 56 78 90',
    gender: 'male',
    lastVisit: '2024-01-13'
  },
  {
    _id: 4,
    name: 'Amina Tazi',
    firstName: 'Amina',
    lastName: 'Tazi',
    birthDate: '2020-05-12',
    email: 'amina.tazi@email.com',
    phoneNumber: '+212 6 45 67 89 01',
    gender: 'female',
    lastVisit: '2024-01-12'
  },
  {
    _id: 5,
    name: 'Omar Idrissi',
    firstName: 'Omar',
    lastName: 'Idrissi',
    birthDate: '2018-09-30',
    email: 'omar.idrissi@email.com',
    phoneNumber: '+212 6 56 78 90 12',
    gender: 'male',
    lastVisit: '2024-01-11'
  }
];

export const mockAppointmentsData = [
  {
    id: 1,
    type: 'Consultation',
    patient: 'Ahmed Benali',
    date: new Date().toISOString(),
    time: '09:00',
    urgent: false
  },
  {
    id: 2,
    type: 'Vaccination',
    patient: 'Fatima Zahra',
    date: new Date().toISOString(),
    time: '10:30',
    urgent: false
  },
  {
    id: 3,
    type: 'Consultation',
    patient: 'Youssef Alami',
    date: new Date().toISOString(),
    time: '14:00',
    urgent: true
  },
  {
    id: 4,
    type: 'Vaccination',
    patient: 'Amina Tazi',
    date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    time: '11:00',
    urgent: false
  },
  {
    id: 5,
    type: 'Consultation',
    patient: 'Omar Idrissi',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    time: '15:30',
    urgent: false
  }
]; 