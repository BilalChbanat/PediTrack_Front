// WHOGrowthCharts.jsx - With Papier Millimétré Styling
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceArea
} from 'recharts';

const calculateAgeInMonths = (birthDateString, measurementDateString) => {
  const birthDate = new Date(birthDateString);
  const measurementDate = new Date(measurementDateString);

  let months = (measurementDate.getFullYear() - birthDate.getFullYear()) * 12;
  months -= birthDate.getMonth();
  months += measurementDate.getMonth();

  if (measurementDate.getDate() < birthDate.getDate()) {
    months--;
  }

  return months <= 0 ? 0 : months;
};

// Girls 0-24 months - Weight for Age
const WHO_GIRLS_WEIGHT_FOR_AGE = [
  { age: 0, p3: 2.1, p15: 2.5, p50: 2.9, p85: 3.3, p97: 3.7 },
  { age: 1, p3: 2.9, p15: 3.3, p50: 3.9, p85: 4.5, p97: 5.1 },
  { age: 2, p3: 3.8, p15: 4.2, p50: 4.8, p85: 5.5, p97: 6.1 },
  { age: 3, p3: 4.4, p15: 4.9, p50: 5.5, p85: 6.3, p97: 7.0 },
  { age: 4, p3: 4.9, p15: 5.5, p50: 6.1, p85: 7.0, p97: 7.7 },
  { age: 5, p3: 5.3, p15: 6.0, p50: 6.7, p85: 7.6, p97: 8.4 },
  { age: 6, p3: 5.7, p15: 6.4, p50: 7.2, p85: 8.2, p97: 9.0 },
  { age: 7, p3: 6.0, p15: 6.7, p50: 7.6, p85: 8.6, p97: 9.5 },
  { age: 8, p3: 6.3, p15: 7.0, p50: 8.0, p85: 9.0, p97: 10.0 },
  { age: 9, p3: 6.5, p15: 7.3, p50: 8.3, p85: 9.4, p97: 10.4 },
  { age: 10, p3: 6.7, p15: 7.5, p50: 8.5, p85: 9.7, p97: 10.8 },
  { age: 11, p3: 6.9, p15: 7.7, p50: 8.8, p85: 10.0, p97: 11.1 },
  { age: 12, p3: 7.0, p15: 7.9, p50: 9.0, p85: 10.2, p97: 11.4 },
  { age: 13, p3: 7.2, p15: 8.1, p50: 9.2, p85: 10.5, p97: 11.7 },
  { age: 14, p3: 7.3, p15: 8.3, p50: 9.4, p85: 10.7, p97: 12.0 },
  { age: 15, p3: 7.5, p15: 8.5, p50: 9.6, p85: 11.0, p97: 12.3 },
  { age: 16, p3: 7.6, p15: 8.6, p50: 9.8, p85: 11.2, p97: 12.6 },
  { age: 17, p3: 7.8, p15: 8.8, p50: 10.0, p85: 11.4, p97: 12.8 },
  { age: 18, p3: 7.9, p15: 9.0, p50: 10.2, p85: 11.6, p97: 13.1 },
  { age: 19, p3: 8.1, p15: 9.1, p50: 10.4, p85: 11.8, p97: 13.4 },
  { age: 20, p3: 8.2, p15: 9.3, p50: 10.6, p85: 12.0, p97: 13.7 },
  { age: 21, p3: 8.4, p15: 9.5, p50: 10.8, p85: 12.2, p97: 14.0 },
  { age: 22, p3: 8.5, p15: 9.6, p50: 10.9, p85: 12.4, p97: 14.3 },
  { age: 23, p3: 8.6, p15: 9.8, p50: 11.1, p85: 12.6, p97: 14.6 },
  { age: 24, p3: 8.8, p15: 9.9, p50: 11.3, p85: 12.8, p97: 14.9 }
];

// Boys 0-24 months - Weight for Age
const WHO_BOYS_WEIGHT_FOR_AGE = [
  { age: 0, p3: 2.2, p15: 2.6, p50: 3.0, p85: 3.5, p97: 3.9 },
  { age: 1, p3: 3.0, p15: 3.5, p50: 4.1, p85: 4.8, p97: 5.4 },
  { age: 2, p3: 3.9, p15: 4.4, p50: 5.1, p85: 5.8, p97: 6.5 },
  { age: 3, p3: 4.5, p15: 5.1, p50: 5.8, p85: 6.6, p97: 7.4 },
  { age: 4, p3: 5.1, p15: 5.6, p50: 6.4, p85: 7.3, p97: 8.2 },
  { age: 5, p3: 5.5, p15: 6.1, p50: 7.0, p85: 8.0, p97: 8.9 },
  { age: 6, p3: 5.9, p15: 6.6, p50: 7.5, p85: 8.6, p97: 9.6 },
  { age: 7, p3: 6.3, p15: 7.0, p50: 8.0, p85: 9.1, p97: 10.2 },
  { age: 8, p3: 6.6, p15: 7.4, p50: 8.4, p85: 9.6, p97: 10.8 },
  { age: 9, p3: 6.9, p15: 7.7, p50: 8.8, p85: 10.0, p97: 11.3 },
  { age: 10, p3: 7.1, p15: 8.0, p50: 9.1, p85: 10.4, p97: 11.7 },
  { age: 11, p3: 7.4, p15: 8.3, p50: 9.4, p85: 10.8, p97: 12.1 },
  { age: 12, p3: 7.6, p15: 8.6, p50: 9.7, p85: 11.1, p97: 12.5 },
  { age: 13, p3: 7.8, p15: 8.8, p50: 10.0, p85: 11.4, p97: 12.9 },
  { age: 14, p3: 8.0, p15: 9.1, p50: 10.3, p85: 11.7, p97: 13.3 },
  { age: 15, p3: 8.2, p15: 9.3, p50: 10.5, p85: 12.0, p97: 13.6 },
  { age: 16, p3: 8.4, p15: 9.5, p50: 10.8, p85: 12.3, p97: 14.0 },
  { age: 17, p3: 8.6, p15: 9.7, p50: 11.0, p85: 12.6, p97: 14.3 },
  { age: 18, p3: 8.8, p15: 9.9, p50: 11.3, p85: 12.8, p97: 14.7 },
  { age: 19, p3: 8.9, p15: 10.1, p50: 11.5, p85: 13.1, p97: 15.0 },
  { age: 20, p3: 9.1, p15: 10.3, p50: 11.7, p85: 13.4, p97: 15.3 },
  { age: 21, p3: 9.3, p15: 10.5, p50: 12.0, p85: 13.6, p97: 15.7 },
  { age: 22, p3: 9.4, p15: 10.7, p50: 12.2, p85: 13.9, p97: 16.0 },
  { age: 23, p3: 9.6, p15: 10.8, p50: 12.4, p85: 14.1, p97: 16.3 },
  { age: 24, p3: 9.7, p15: 10.9, p50: 12.5, p85: 14.3, p97: 16.6 }
];

// Girls 0-24 months - Height for Age
const WHO_GIRLS_HEIGHT_FOR_AGE = [
  { age: 0, p3: 45.6, p15: 47.3, p50: 49.1, p85: 51.0, p97: 52.7 },
  { age: 1, p3: 50.0, p15: 51.7, p50: 53.7, p85: 55.6, p97: 57.3 },
  { age: 2, p3: 53.2, p15: 55.0, p50: 57.1, p85: 59.1, p97: 60.9 },
  { age: 3, p3: 55.8, p15: 57.6, p50: 59.8, p85: 62.0, p97: 63.9 },
  { age: 4, p3: 58.0, p15: 59.9, p50: 62.1, p85: 64.3, p97: 66.3 },
  { age: 5, p3: 59.9, p15: 61.8, p50: 64.0, p85: 66.3, p97: 68.3 },
  { age: 6, p3: 61.5, p15: 63.5, p50: 65.7, p85: 68.1, p97: 70.3 },
  { age: 7, p3: 62.9, p15: 64.9, p50: 67.3, p85: 69.8, p97: 72.0 },
  { age: 8, p3: 64.3, p15: 66.4, p50: 68.7, p85: 71.3, p97: 73.7 },
  { age: 9, p3: 65.6, p15: 67.7, p50: 70.1, p85: 72.8, p97: 75.3 },
  { age: 10, p3: 66.8, p15: 69.0, p50: 71.5, p85: 74.2, p97: 76.9 },
  { age: 11, p3: 68.0, p15: 70.3, p50: 72.8, p85: 75.6, p97: 78.5 },
  { age: 12, p3: 69.2, p15: 71.4, p50: 74.0, p85: 76.9, p97: 80.0 },
  { age: 13, p3: 70.3, p15: 72.6, p50: 75.2, p85: 78.1, p97: 81.5 },
  { age: 14, p3: 71.3, p15: 73.7, p50: 76.4, p85: 79.4, p97: 82.9 },
  { age: 15, p3: 72.4, p15: 74.8, p50: 77.5, p85: 80.6, p97: 84.4 },
  { age: 16, p3: 73.4, p15: 75.8, p50: 78.6, p85: 81.7, p97: 85.8 },
  { age: 17, p3: 74.4, p15: 76.8, p50: 79.7, p85: 82.9, p97: 87.1 },
  { age: 18, p3: 75.4, p15: 77.8, p50: 80.7, p85: 84.0, p97: 88.5 },
  { age: 19, p3: 76.3, p15: 78.8, p50: 81.7, p85: 85.1, p97: 89.8 },
  { age: 20, p3: 77.2, p15: 79.7, p50: 82.7, p85: 86.1, p97: 91.1 },
  { age: 21, p3: 78.1, p15: 80.6, p50: 83.7, p85: 87.2, p97: 92.4 },
  { age: 22, p3: 79.0, p15: 81.5, p50: 84.6, p85: 88.2, p97: 93.7 },
  { age: 23, p3: 79.9, p15: 82.4, p50: 85.5, p85: 89.2, p97: 94.9 },
  { age: 24, p3: 80.7, p15: 83.3, p50: 86.4, p85: 90.2, p97: 96.1 }
];

// Boys 0-24 months - Height for Age
const WHO_BOYS_HEIGHT_FOR_AGE = [
  { age: 0, p3: 46.1, p15: 47.9, p50: 49.9, p85: 51.8, p97: 53.5 },
  { age: 1, p3: 51.1, p15: 52.7, p50: 54.7, p85: 56.7, p97: 58.4 },
  { age: 2, p3: 54.7, p15: 56.4, p50: 58.4, p85: 60.5, p97: 62.4 },
  { age: 3, p3: 57.6, p15: 59.4, p50: 61.4, p85: 63.5, p97: 65.5 },
  { age: 4, p3: 60.0, p15: 61.8, p50: 63.9, p85: 66.1, p97: 68.3 },
  { age: 5, p3: 62.1, p15: 63.8, p50: 66.0, p85: 68.3, p97: 70.7 },
  { age: 6, p3: 63.9, p15: 65.7, p50: 67.8, p85: 70.2, p97: 72.7 },
  { age: 7, p3: 65.5, p15: 67.3, p50: 69.5, p85: 71.9, p97: 74.5 },
  { age: 8, p3: 67.0, p15: 68.8, p50: 71.0, p85: 73.5, p97: 76.2 },
  { age: 9, p3: 68.4, p15: 70.2, p50: 72.5, p85: 75.0, p97: 77.8 },
  { age: 10, p3: 69.7, p15: 71.5, p50: 73.8, p85: 76.4, p97: 79.3 },
  { age: 11, p3: 71.0, p15: 72.8, p50: 75.1, p85: 77.8, p97: 80.8 },
  { age: 12, p3: 72.2, p15: 74.0, p50: 76.3, p85: 79.1, p97: 82.3 },
  { age: 13, p3: 73.4, p15: 75.2, p50: 77.5, p85: 80.4, p97: 83.7 },
  { age: 14, p3: 74.5, p15: 76.4, p50: 78.7, p85: 81.6, p97: 85.0 },
  { age: 15, p3: 75.6, p15: 77.5, p50: 79.8, p85: 82.8, p97: 86.4 },
  { age: 16, p3: 76.7, p15: 78.6, p50: 80.9, p85: 84.0, p97: 87.7 },
  { age: 17, p3: 77.7, p15: 79.6, p50: 81.9, p85: 85.1, p97: 89.0 },
  { age: 18, p3: 78.7, p15: 80.6, p50: 82.9, p85: 86.2, p97: 90.2 },
  { age: 19, p3: 79.7, p15: 81.6, p50: 83.9, p85: 87.3, p97: 91.5 },
  { age: 20, p3: 80.6, p15: 82.6, p50: 84.9, p85: 88.4, p97: 92.7 },
  { age: 21, p3: 81.5, p15: 83.5, p50: 85.8, p85: 89.4, p97: 93.9 },
  { age: 22, p3: 82.4, p15: 84.4, p50: 86.7, p85: 90.4, p97: 95.0 },
  { age: 23, p3: 83.3, p15: 85.3, p50: 87.6, p85: 91.4, p97: 96.2 },
  { age: 24, p3: 84.1, p15: 86.1, p50: 88.5, p85: 92.4, p97: 97.3 }
];

// Girls 45-110 cm - Weight for Height
const WHO_GIRLS_WEIGHT_FOR_HEIGHT = [
  { height: 45, p3: 1.9, p15: 2.1, p50: 2.4, p85: 2.7, p97: 3.0 },
  { height: 50, p3: 2.4, p15: 2.7, p50: 3.0, p85: 3.4, p97: 3.8 },
  { height: 55, p3: 3.0, p15: 3.4, p50: 3.8, p85: 4.3, p97: 4.8 },
  { height: 60, p3: 3.8, p15: 4.2, p50: 4.7, p85: 5.3, p97: 5.9 },
  { height: 65, p3: 4.7, p15: 5.2, p50: 5.8, p85: 6.5, p97: 7.2 },
  { height: 70, p3: 5.7, p15: 6.3, p50: 7.0, p85: 7.8, p97: 8.6 },
  { height: 75, p3: 6.8, p15: 7.5, p50: 8.3, p85: 9.2, p97: 10.1 },
  { height: 80, p3: 8.0, p15: 8.8, p50: 9.7, p85: 10.7, p97: 11.7 },
  { height: 85, p3: 9.2, p15: 10.1, p50: 11.1, p85: 12.2, p97: 13.3 },
  { height: 90, p3: 10.4, p15: 11.4, p50: 12.5, p85: 13.7, p97: 15.0 },
  { height: 95, p3: 11.6, p15: 12.7, p50: 14.0, p85: 15.3, p97: 16.7 },
  { height: 100, p3: 12.8, p15: 14.0, p50: 15.4, p85: 16.9, p97: 18.4 },
  { height: 105, p3: 14.0, p15: 15.3, p50: 16.8, p85: 18.5, p97: 20.1 },
  { height: 110, p3: 15.2, p15: 16.6, p50: 18.2, p85: 20.0, p97: 21.8 }
];

// Boys 45-110 cm - Weight for Height
const WHO_BOYS_WEIGHT_FOR_HEIGHT = [
  { height: 45, p3: 2.0, p15: 2.2, p50: 2.5, p85: 2.9, p97: 3.2 },
  { height: 50, p3: 2.6, p15: 2.9, p50: 3.3, p85: 3.7, p97: 4.1 },
  { height: 55, p3: 3.3, p15: 3.7, p50: 4.2, p85: 4.8, p97: 5.3 },
  { height: 60, p3: 4.1, p15: 4.6, p50: 5.2, p85: 5.9, p97: 6.6 },
  { height: 65, p3: 5.1, p15: 5.7, p50: 6.4, p85: 7.2, p97: 8.0 },
  { height: 70, p3: 6.2, p15: 6.8, p50: 7.6, p85: 8.6, p97: 9.5 },
  { height: 75, p3: 7.4, p15: 8.1, p50: 9.0, p85: 10.0, p97: 11.1 },
  { height: 80, p3: 8.7, p15: 9.5, p50: 10.5, p85: 11.6, p97: 12.8 },
  { height: 85, p3: 10.0, p15: 10.9, p50: 12.0, p85: 13.2, p97: 14.5 },
  { height: 90, p3: 11.3, p15: 12.3, p50: 13.5, p85: 14.8, p97: 16.2 },
  { height: 95, p3: 12.6, p15: 13.7, p50: 15.0, p85: 16.4, p97: 17.9 },
  { height: 100, p3: 13.9, p15: 15.1, p50: 16.5, p85: 18.0, p97: 19.6 },
  { height: 105, p3: 15.2, p15: 16.5, p50: 18.0, p85: 19.6, p97: 21.3 },
  { height: 110, p3: 16.5, p15: 17.9, p50: 19.5, p85: 21.2, p97: 23.0 }
];

const WHO_GIRLS_HEAD_CIRCUMFERENCE_FOR_AGE = [
  { age: 0, p3: 31.7, p15: 32.7, p50: 34.2, p85: 35.7, p97: 36.8 },
  { age: 1, p3: 34.8, p15: 35.7, p50: 37.1, p85: 38.5, p97: 39.6 },
  { age: 2, p3: 36.9, p15: 37.8, p50: 39.1, p85: 40.5, p97: 41.5 },
  { age: 3, p3: 38.3, p15: 39.2, p50: 40.5, p85: 41.8, p97: 42.8 },
  { age: 4, p3: 39.4, p15: 40.3, p50: 41.6, p85: 42.9, p97: 43.9 },
  { age: 5, p3: 40.3, p15: 41.2, p50: 42.5, p85: 43.8, p97: 44.8 },
  { age: 6, p3: 41.0, p15: 41.9, p50: 43.2, p85: 44.5, p97: 45.5 },
  { age: 7, p3: 41.7, p15: 42.6, p50: 43.9, p85: 45.2, p97: 46.2 },
  { age: 8, p3: 42.2, p15: 43.1, p50: 44.4, p85: 45.7, p97: 46.7 },
  { age: 9, p3: 42.7, p15: 43.6, p50: 44.9, p85: 46.2, p97: 47.2 },
  { age: 10, p3: 43.1, p15: 44.0, p50: 45.3, p85: 46.6, p97: 47.6 },
  { age: 11, p3: 43.5, p15: 44.4, p50: 45.7, p85: 47.0, p97: 48.0 },
  { age: 12, p3: 43.8, p15: 44.7, p50: 46.0, p85: 47.3, p97: 48.3 },
  { age: 13, p3: 44.1, p15: 45.0, p50: 46.3, p85: 47.6, p97: 48.6 },
  { age: 14, p3: 44.3, p15: 45.2, p50: 46.5, p85: 47.8, p97: 48.8 },
  { age: 15, p3: 44.5, p15: 45.4, p50: 46.7, p85: 48.0, p97: 49.0 },
  { age: 16, p3: 44.7, p15: 45.6, p50: 46.9, p85: 48.2, p97: 49.2 },
  { age: 17, p3: 44.9, p15: 45.8, p50: 47.1, p85: 48.4, p97: 49.4 },
  { age: 18, p3: 45.0, p15: 45.9, p50: 47.2, p85: 48.5, p97: 49.5 },
  { age: 19, p3: 45.2, p15: 46.1, p50: 47.4, p85: 48.7, p97: 49.7 },
  { age: 20, p3: 45.3, p15: 46.2, p50: 47.5, p85: 48.8, p97: 49.8 },
  { age: 21, p3: 45.4, p15: 46.3, p50: 47.6, p85: 48.9, p97: 49.9 },
  { age: 22, p3: 45.5, p15: 46.4, p50: 47.7, p85: 49.0, p97: 50.0 },
  { age: 23, p3: 45.6, p15: 46.5, p50: 47.8, p85: 49.1, p97: 50.1 },
  { age: 24, p3: 44.5, p15: 45.5, p50: 47.2, p85: 48.9, p97: 50.1 }
];

const WHO_BOYS_HEAD_CIRCUMFERENCE_FOR_AGE = [
  { age: 0, p3: 32.1, p15: 33.1, p50: 34.5, p85: 36.0, p97: 37.1 },
  { age: 1, p3: 35.1, p15: 36.1, p50: 37.5, p85: 39.0, p97: 40.1 },
  { age: 2, p3: 37.3, p15: 38.2, p50: 39.6, p85: 41.0, p97: 42.1 },
  { age: 3, p3: 38.8, p15: 39.7, p50: 41.0, p85: 42.4, p97: 43.4 },
  { age: 4, p3: 39.9, p15: 40.8, p50: 42.1, p85: 43.5, p97: 44.5 },
  { age: 5, p3: 40.8, p15: 41.7, p50: 43.0, p85: 44.4, p97: 45.5 },
  { age: 6, p3: 41.5, p15: 42.4, p50: 43.7, p85: 45.1, p97: 46.2 },
  { age: 7, p3: 42.1, p15: 43.0, p50: 44.3, p85: 45.7, p97: 46.8 },
  { age: 8, p3: 42.6, p15: 43.5, p50: 44.8, p85: 46.2, p97: 47.3 },
  { age: 9, p3: 43.0, p15: 43.9, p50: 45.2, p85: 46.6, p97: 47.7 },
  { age: 10, p3: 43.4, p15: 44.3, p50: 45.6, p85: 47.0, p97: 48.1 },
  { age: 11, p3: 43.7, p15: 44.6, p50: 45.9, p85: 47.3, p97: 48.4 },
  { age: 12, p3: 44.0, p15: 44.9, p50: 46.2, p85: 47.6, p97: 48.7 },
  { age: 13, p3: 44.2, p15: 45.1, p50: 46.4, p85: 47.8, p97: 48.9 },
  { age: 14, p3: 44.4, p15: 45.3, p50: 46.6, p85: 48.0, p97: 49.1 },
  { age: 15, p3: 44.6, p15: 45.5, p50: 46.8, p85: 48.2, p97: 49.3 },
  { age: 16, p3: 44.8, p15: 45.7, p50: 47.0, p85: 48.4, p97: 49.5 },
  { age: 17, p3: 44.9, p15: 45.8, p50: 47.1, p85: 48.5, p97: 49.6 },
  { age: 18, p3: 45.1, p15: 46.0, p50: 47.3, p85: 48.7, p97: 49.8 },
  { age: 19, p3: 45.2, p15: 46.1, p50: 47.4, p85: 48.8, p97: 49.9 },
  { age: 20, p3: 45.3, p15: 46.2, p50: 47.5, p85: 48.9, p97: 50.0 },
  { age: 21, p3: 45.4, p15: 46.3, p50: 47.6, p85: 49.0, p97: 50.1 },
  { age: 22, p3: 45.5, p15: 46.4, p50: 47.7, p85: 49.1, p97: 50.2 },
  { age: 23, p3: 45.6, p15: 46.5, p50: 47.8, p85: 49.2, p97: 50.3 },
  { age: 24, p3: 45.5, p15: 46.5, p50: 48.2, p85: 50.0, p97: 51.2 }
];

const GrowthChart = ({ data, xKey, yKey, title, xLabel, yLabel, patientData, colorScheme }) => {
  // Define color schemes
  const schemes = {
    pink: {
      bgFrom: 'from-pink-50',
      bgTo: 'to-rose-50',
      border: 'border-pink-200',
      shadow: 'rgba(236, 72, 153, 0.1)',
      text: 'text-pink-900',
      accent: '#db2777',
      lightAccent: '#f9a8d4',
      grid: '#ec4899'
    },
    blue: {
      bgFrom: 'from-blue-50',
      bgTo: 'to-sky-50',
      border: 'border-blue-200',
      shadow: 'rgba(59, 130, 246, 0.1)',
      text: 'text-blue-900',
      accent: '#2563eb',
      lightAccent: '#93c5fd',
      grid: '#3b82f6'
    },
    amber: {
      bgFrom: 'from-amber-50',
      bgTo: 'to-yellow-50',
      border: 'border-amber-200',
      shadow: 'rgba(217, 119, 6, 0.1)',
      text: 'text-amber-900',
      accent: '#d97706',
      lightAccent: '#fcd34d',
      grid: '#d4af37'
    },
    purple: {
      bgFrom: 'from-purple-50',
      bgTo: 'to-violet-50',
      border: 'border-purple-200',
      shadow: 'rgba(124, 58, 237, 0.1)',
      text: 'text-purple-900',
      accent: '#7c3aed',
      lightAccent: '#c4b5fd',
      grid: '#8b5cf6'
    }
  };

  const colors = schemes[colorScheme] || schemes.amber;

  return (
    <div className={`bg-gradient-to-br ${colors.bgFrom} ${colors.bgTo} p-6 rounded-xl border-2 ${colors.border} shadow-lg mb-6`} 
         style={{
           boxShadow: `0 4px 20px ${colors.shadow}`
         }}>
      <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg border border-amber-100">
        <h3 className={`text-xl font-bold ${colors.text} mb-4 text-center border-b-2 ${colors.border} pb-2`}>
          {title}
        </h3>
        <div className="h-80 relative">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              {/* Millimeter paper grid pattern */}
              <defs>
                <pattern id={`millimeterGrid-${colorScheme}`} patternUnits="userSpaceOnUse" width="10" height="10">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke={colors.grid} strokeWidth="0.3" opacity="0.4"/>
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke={colors.grid} strokeWidth="0.8" opacity="0.7" 
                        strokeDasharray="0" transform="scale(5,5)"/>
                </pattern>
              </defs>
              
              {/* Paper texture background */}
              <rect width="100%" height="100%" fill={`url(#millimeterGrid-${colorScheme})`} opacity="0.6"/>
              
              <XAxis 
                dataKey={xKey}
                tick={{ fontSize: 11, fill: colors.text }}
                tickLine={{ stroke: colors.accent, strokeWidth: 1 }}
                axisLine={{ stroke: colors.accent, strokeWidth: 2 }}
                label={{ 
                  value: xLabel, 
                  position: "insideBottom", 
                  offset: -10,
                  style: { textAnchor: 'middle', fontSize: '12px', fontWeight: 'bold', fill: colors.text }
                }}
              />
              <YAxis 
                tick={{ fontSize: 11, fill: colors.text }}
                tickLine={{ stroke: colors.accent, strokeWidth: 1 }}
                axisLine={{ stroke: colors.accent, strokeWidth: 2 }}
                label={{ 
                  value: yLabel, 
                  angle: -90, 
                  position: "insideLeft",
                  style: { textAnchor: 'middle', fontSize: '12px', fontWeight: 'bold', fill: colors.text }
                }}
              />
              
              {/* Reference Areas */}
              <ReferenceArea 
                x1={data[0][xKey]} 
                x2={data[data.length-1][xKey]} 
                y1={0} 
                y2="p3" 
                fill="#fca5a5" 
                fillOpacity="0.15"
                stroke="none" 
              />
              <ReferenceArea 
                x1={data[0][xKey]} 
                x2={data[data.length-1][xKey]} 
                y1="p3" 
                y2="p15" 
                fill="#fed7aa" 
                fillOpacity="0.15"
                stroke="none" 
              />
              <ReferenceArea 
                x1={data[0][xKey]} 
                x2={data[data.length-1][xKey]} 
                y1="p15" 
                y2="p85" 
                fill="#bbf7d0" 
                fillOpacity="0.2"
                stroke="none" 
              />
              <ReferenceArea 
                x1={data[0][xKey]} 
                x2={data[data.length-1][xKey]} 
                y1="p85" 
                y2="p97" 
                fill="#fed7aa" 
                fillOpacity="0.15"
                stroke="none" 
              />
              <ReferenceArea 
                x1={data[0][xKey]} 
                x2={data[data.length-1][xKey]} 
                y1="p97" 
                y2={yKey === 'weight' ? 25 : 120} 
                fill="#fca5a5" 
                fillOpacity="0.15"
                stroke="none" 
              />
              
              {/* Percentile Lines */}
              <Line 
                type="monotone" 
                dataKey="p3" 
                stroke="#dc2626" 
                strokeWidth={2}
                strokeDasharray="5,3"
                dot={false} 
                name="3e percentile"
              />
              <Line 
                type="monotone" 
                dataKey="p15" 
                stroke="#ea580c" 
                strokeWidth={1.5}
                strokeDasharray="3,2"
                dot={false} 
                name="15e percentile"
              />
              <Line 
                type="monotone" 
                dataKey="p50" 
                stroke="#16a34a" 
                strokeWidth={3}
                dot={false} 
                name="50e percentile"
              />
              <Line 
                type="monotone" 
                dataKey="p85" 
                stroke="#ea580c" 
                strokeWidth={1.5}
                strokeDasharray="3,2"
                dot={false} 
                name="85e percentile"
              />
              <Line 
                type="monotone" 
                dataKey="p97" 
                stroke="#dc2626" 
                strokeWidth={2}
                strokeDasharray="5,3"
                dot={false} 
                name="97e percentile"
              />
              
              {/* Patient Data */}
              {patientData && patientData.length > 0 && (
                <Line
                  type="monotone"
                  data={patientData}
                  dataKey={yKey}
                  stroke={colors.accent}
                  name={`${yLabel} patient`}
                  strokeWidth={4}
                  dot={{ r: 6, fill: colors.accent, stroke: '#ffffff', strokeWidth: 2 }}
                  activeDot={{ r: 8, fill: colors.accent, stroke: '#ffffff', strokeWidth: 3 }}
                  connectNulls={true}
                />
              )}
              
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#fefce8',
                  border: `2px solid ${colors.accent}`,
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '500'
                }}
                formatter={(value, name) => {
                  if (name === `${yLabel} patient`) return [`${value} ${yLabel.split('(')[1]?.replace(')','') || ''}`, name];
                  return [`${value} ${yLabel.split('(')[1]?.replace(')','') || ''}`, name];
                }}
                labelFormatter={(label) => `${xLabel}: ${label} ${xLabel.includes('Âge') ? 'mois' : 'cm'}`}
              />
              <Legend 
                wrapperStyle={{
                  fontSize: '11px',
                  fontWeight: '500',
                  color: colors.text
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className={`mt-3 text-xs ${colors.text} text-center border-t ${colors.border} pt-2`}>
          <strong>Source:</strong> Normes de croissance de l'OMS - {title.includes('Filles') ? 'Filles' : 'Garçons'} 0-24 mois
        </div>
      </div>
    </div>
  );
};
const WHOGrowthCharts = ({ records, patientGender, patientBirthDate }) => {
  const isGirl = patientGender === 'female';
  const standards = {
    weightForAge: isGirl ? WHO_GIRLS_WEIGHT_FOR_AGE : WHO_BOYS_WEIGHT_FOR_AGE,
    heightForAge: isGirl ? WHO_GIRLS_HEIGHT_FOR_AGE : WHO_BOYS_HEIGHT_FOR_AGE,
    weightForHeight: isGirl ? WHO_GIRLS_WEIGHT_FOR_HEIGHT : WHO_BOYS_WEIGHT_FOR_HEIGHT,
    headCircumferenceForAge: isGirl ? WHO_GIRLS_HEAD_CIRCUMFERENCE_FOR_AGE : WHO_BOYS_HEAD_CIRCUMFERENCE_FOR_AGE
  };

  // Prepare patient data for each chart type
  const weightForAgeData = records.map(record => ({
    age: calculateAgeInMonths(patientBirthDate, record.date),
    weight: record.weightKg,
    date: new Date(record.date).toLocaleDateString('fr-FR')
  }));

  const heightForAgeData = records.map(record => ({
    age: calculateAgeInMonths(patientBirthDate, record.date),
    height: record.heightCm,
    date: new Date(record.date).toLocaleDateString('fr-FR')
  }));

  const weightForHeightData = records
    .filter(record => record.heightCm && record.weightKg)
    .map(record => ({
      height: record.heightCm,
      weight: record.weightKg,
      date: new Date(record.date).toLocaleDateString('fr-FR')
    }));

  const headCircumferenceForAgeData = records
    .filter(record => record.headCircumferenceCm)
    .map(record => ({
      age: calculateAgeInMonths(patientBirthDate, record.date),
      headCircumference: record.headCircumferenceCm,
      date: new Date(record.date).toLocaleDateString('fr-FR')
    }));

  return (
    <div className="grid grid-cols-1 gap-8">
      {/* Poids-Âge */}
      <GrowthChart
        data={standards.weightForAge}
        xKey="age"
        yKey="weight"
        title={`Courbe poids-âge (OMS) - ${isGirl ? 'Filles' : 'Garçons'} 0-24 mois`}
        xLabel="Âge (mois)"
        yLabel="Poids (kg)"
        patientData={weightForAgeData}
        colorScheme="pink"
      />

      {/* Taille-Âge */}
      <GrowthChart
        data={standards.heightForAge}
        xKey="age"
        yKey="height"
        title={`Courbe taille-âge (OMS) - ${isGirl ? 'Filles' : 'Garçons'} 0-24 mois`}
        xLabel="Âge (mois)"
        yLabel="Taille (cm)"
        patientData={heightForAgeData}
        colorScheme="blue"
      />

      {/* Poids-Taille */}
      <GrowthChart
        data={standards.weightForHeight}
        xKey="height"
        yKey="weight"
        title={`Courbe poids-taille (OMS) - ${isGirl ? 'Filles' : 'Garçons'} 45-110 cm`}
        xLabel="Taille (cm)"
        yLabel="Poids (kg)"
        patientData={weightForHeightData}
        colorScheme="amber"
      />

      {/* Périmètre Crânien-Âge */}
      <GrowthChart
        data={standards.headCircumferenceForAge}
        xKey="age"
        yKey="headCircumference"
        title={`Courbe périmètre crânien (OMS) - ${isGirl ? 'Filles' : 'Garçons'} 0-24 mois`}
        xLabel="Âge (mois)"
        yLabel="Périmètre crânien (cm)"
        patientData={headCircumferenceForAgeData}
        colorScheme="purple"
      />
    </div>
  );
};

export default WHOGrowthCharts;


// // WHOGrowthCharts.jsx - With Papier Millimétré Styling
// import React from 'react';
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
//   ReferenceArea
// } from 'recharts';

// const calculateAgeInMonths = (birthDateString, measurementDateString) => {
//   const birthDate = new Date(birthDateString);
//   const measurementDate = new Date(measurementDateString);

//   let months = (measurementDate.getFullYear() - birthDate.getFullYear()) * 12;
//   months -= birthDate.getMonth();
//   months += measurementDate.getMonth();

//   if (measurementDate.getDate() < birthDate.getDate()) {
//     months--;
//   }

//   return months <= 0 ? 0 : months;
// };

// // Girls 0-24 months - Weight for Age
// const WHO_GIRLS_WEIGHT_FOR_AGE = [
//   { age: 0, p3: 2.1, p15: 2.5, p50: 2.9, p85: 3.3, p97: 3.7, sd: [-3, -2, 0, 1, 2] },
//   { age: 1, p3: 2.9, p15: 3.3, p50: 3.9, p85: 4.5, p97: 5.1, sd: [-3, -2, 0, 1, 2] },
//   // ... complete monthly data up to 24 months
//   { age: 24, p3: 9.0, p15: 9.9, p50: 11.2, p85: 12.8, p97: 14.1, sd: [-3, -2, 0, 1, 2] }
// ];

// // Boys 0-24 months - Weight for Age
// const WHO_BOYS_WEIGHT_FOR_AGE = [
//   { age: 0, p3: 2.2, p15: 2.6, p50: 3.0, p85: 3.5, p97: 3.9, sd: [-3, -2, 0, 1, 2] },
//   { age: 1, p3: 3.0, p15: 3.5, p50: 4.1, p85: 4.8, p97: 5.4, sd: [-3, -2, 0, 1, 2] },
//   // ... complete monthly data up to 24 months
//   { age: 24, p3: 9.5, p15: 10.4, p50: 11.8, p85: 13.5, p97: 14.8, sd: [-3, -2, 0, 1, 2] }
// ];

// // Girls 0-24 months - Height for Age
// const WHO_GIRLS_HEIGHT_FOR_AGE = [
//   { age: 0, p3: 45.6, p15: 47.3, p50: 49.1, p85: 51.0, p97: 52.7, sd: [-3, -2, 0, 1, 2] },
//   { age: 1, p3: 50.0, p15: 51.7, p50: 53.7, p85: 55.6, p97: 57.3, sd: [-3, -2, 0, 1, 2] },
//   // ... complete monthly data up to 24 months
//   { age: 24, p3: 80.0, p15: 82.9, p50: 86.4, p85: 89.9, p97: 93.0, sd: [-3, -2, 0, 1, 2] }
// ];

// // Boys 0-24 months - Height for Age
// const WHO_BOYS_HEIGHT_FOR_AGE = [
//   { age: 0, p3: 46.1, p15: 47.9, p50: 49.9, p85: 51.8, p97: 53.5, sd: [-3, -2, 0, 1, 2] },
//   { age: 1, p3: 51.1, p15: 52.7, p50: 54.7, p85: 56.7, p97: 58.4, sd: [-3, -2, 0, 1, 2] },
//   // ... complete monthly data up to 24 months
//   { age: 24, p3: 81.3, p15: 84.2, p50: 87.8, p85: 91.3, p97: 94.4, sd: [-3, -2, 0, 1, 2] }
// ];

// // Girls 45-110 cm - Weight for Height
// const WHO_GIRLS_WEIGHT_FOR_HEIGHT = [
//   { height: 45, p3: 1.9, p15: 2.1, p50: 2.4, p85: 2.7, p97: 3.0, sd: [-3, -2, 0, 1, 2] },
//   { height: 50, p3: 2.4, p15: 2.7, p50: 3.0, p85: 3.4, p97: 3.8, sd: [-3, -2, 0, 1, 2] },
//   // ... complete data up to 110 cm
//   { height: 110, p3: 14.2, p15: 15.5, p50: 17.3, p85: 19.5, p97: 21.6, sd: [-3, -2, 0, 1, 2] }
// ];

// // Boys 45-110 cm - Weight for Height
// const WHO_BOYS_WEIGHT_FOR_HEIGHT = [
//   { height: 45, p3: 2.0, p15: 2.2, p50: 2.5, p85: 2.9, p97: 3.2, sd: [-3, -2, 0, 1, 2] },
//   { height: 50, p3: 2.6, p15: 2.9, p50: 3.3, p85: 3.7, p97: 4.1, sd: [-3, -2, 0, 1, 2] },
//   // ... complete data up to 110 cm
//   { height: 110, p3: 14.8, p15: 16.1, p50: 18.1, p85: 20.5, p97: 22.7, sd: [-3, -2, 0, 1, 2] }
// ];


// // const GrowthChart = ({ data, xKey, yKey, title, xLabel, yLabel, patientData }) => {
// //   return (
// //     <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-6 rounded-xl border-2 border-amber-200 shadow-lg mb-6" 
// //          style={{
// //            background: 'linear-gradient(45deg, #fefce8 0%, #fef3c7 100%)',
// //            boxShadow: '0 4px 20px rgba(217, 119, 6, 0.1)'
// //          }}>
// //       <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg border border-amber-100">
// //         <h3 className="text-xl font-bold text-amber-900 mb-4 text-center border-b-2 border-amber-200 pb-2">
// //           {title}
// //         </h3>
// //         <div className="h-80 relative">
// //           <ResponsiveContainer width="100%" height="100%">
// //             <LineChart
// //               data={data}
// //               margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
// //             >
// //               {/* Millimeter paper grid pattern */}
// //               <defs>
// //                 <pattern id="millimeterGrid" patternUnits="userSpaceOnUse" width="10" height="10">
// //                   <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#d4af37" strokeWidth="0.3" opacity="0.4"/>
// //                   <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#d4af37" strokeWidth="0.8" opacity="0.7" 
// //                         strokeDasharray="0" transform="scale(5,5)"/>
// //                 </pattern>
// //               </defs>
              
// //               {/* Paper texture background */}
// //               <rect width="100%" height="100%" fill="url(#millimeterGrid)" opacity="0.6"/>
              
// //               <XAxis 
// //                 dataKey={xKey}
// //                 tick={{ fontSize: 11, fill: '#92400e' }}
// //                 tickLine={{ stroke: '#d97706', strokeWidth: 1 }}
// //                 axisLine={{ stroke: '#d97706', strokeWidth: 2 }}
// //                 label={{ 
// //                   value: xLabel, 
// //                   position: "insideBottom", 
// //                   offset: -10,
// //                   style: { textAnchor: 'middle', fontSize: '12px', fontWeight: 'bold', fill: '#92400e' }
// //                 }}
// //               />
// //               <YAxis 
// //                 tick={{ fontSize: 11, fill: '#92400e' }}
// //                 tickLine={{ stroke: '#d97706', strokeWidth: 1 }}
// //                 axisLine={{ stroke: '#d97706', strokeWidth: 2 }}
// //                 label={{ 
// //                   value: yLabel, 
// //                   angle: -90, 
// //                   position: "insideLeft",
// //                   style: { textAnchor: 'middle', fontSize: '12px', fontWeight: 'bold', fill: '#92400e' }
// //                 }}
// //               />
              
// //               {/* Reference Areas */}
// //               <ReferenceArea 
// //                 x1={data[0][xKey]} 
// //                 x2={data[data.length-1][xKey]} 
// //                 y1={0} 
// //                 y2="p3" 
// //                 fill="#fca5a5" 
// //                 fillOpacity="0.15"
// //                 stroke="none" 
// //               />
// //               <ReferenceArea 
// //                 x1={data[0][xKey]} 
// //                 x2={data[data.length-1][xKey]} 
// //                 y1="p3" 
// //                 y2="p15" 
// //                 fill="#fed7aa" 
// //                 fillOpacity="0.15"
// //                 stroke="none" 
// //               />
// //               <ReferenceArea 
// //                 x1={data[0][xKey]} 
// //                 x2={data[data.length-1][xKey]} 
// //                 y1="p15" 
// //                 y2="p85" 
// //                 fill="#bbf7d0" 
// //                 fillOpacity="0.2"
// //                 stroke="none" 
// //               />
// //               <ReferenceArea 
// //                 x1={data[0][xKey]} 
// //                 x2={data[data.length-1][xKey]} 
// //                 y1="p85" 
// //                 y2="p97" 
// //                 fill="#fed7aa" 
// //                 fillOpacity="0.15"
// //                 stroke="none" 
// //               />
// //               <ReferenceArea 
// //                 x1={data[0][xKey]} 
// //                 x2={data[data.length-1][xKey]} 
// //                 y1="p97" 
// //                 y2={yKey === 'weight' ? 25 : 120} 
// //                 fill="#fca5a5" 
// //                 fillOpacity="0.15"
// //                 stroke="none" 
// //               />
              
// //               {/* Percentile Lines */}
// //               <Line 
// //                 type="monotone" 
// //                 dataKey="p3" 
// //                 stroke="#dc2626" 
// //                 strokeWidth={2}
// //                 strokeDasharray="5,3"
// //                 dot={false} 
// //                 name="3e percentile"
// //               />
// //               <Line 
// //                 type="monotone" 
// //                 dataKey="p15" 
// //                 stroke="#ea580c" 
// //                 strokeWidth={1.5}
// //                 strokeDasharray="3,2"
// //                 dot={false} 
// //                 name="15e percentile"
// //               />
// //               <Line 
// //                 type="monotone" 
// //                 dataKey="p50" 
// //                 stroke="#16a34a" 
// //                 strokeWidth={3}
// //                 dot={false} 
// //                 name="50e percentile"
// //               />
// //               <Line 
// //                 type="monotone" 
// //                 dataKey="p85" 
// //                 stroke="#ea580c" 
// //                 strokeWidth={1.5}
// //                 strokeDasharray="3,2"
// //                 dot={false} 
// //                 name="85e percentile"
// //               />
// //               <Line 
// //                 type="monotone" 
// //                 dataKey="p97" 
// //                 stroke="#dc2626" 
// //                 strokeWidth={2}
// //                 strokeDasharray="5,3"
// //                 dot={false} 
// //                 name="97e percentile"
// //               />
              
// //               {/* Patient Data - Now properly connected */}
// //               {patientData && patientData.length > 0 && (
// //                 <Line
// //                   type="monotone"
// //                   data={patientData}
// //                   dataKey={yKey}
// //                   stroke="#1d4ed8"
// //                   name={`${yLabel} patient`}
// //                   strokeWidth={4}
// //                   dot={{ r: 6, fill: '#1d4ed8', stroke: '#ffffff', strokeWidth: 2 }}
// //                   activeDot={{ r: 8, fill: '#1d4ed8', stroke: '#ffffff', strokeWidth: 3 }}
// //                   connectNulls={true}
// //                 />
// //               )}
              
// //               <Tooltip 
// //                 contentStyle={{
// //                   backgroundColor: '#fefce8',
// //                   border: '2px solid #d97706',
// //                   borderRadius: '8px',
// //                   fontSize: '12px',
// //                   fontWeight: '500'
// //                 }}
// //                 formatter={(value, name) => {
// //                   if (name === `${yLabel} patient`) return [`${value} ${yLabel.split('(')[1]?.replace(')','') || ''}`, name];
// //                   return [`${value} ${yLabel.split('(')[1]?.replace(')','') || ''}`, name];
// //                 }}
// //                 labelFormatter={(label) => `${xLabel}: ${label} ${xLabel.includes('Âge') ? 'mois' : 'cm'}`}
// //               />
// //               <Legend 
// //                 wrapperStyle={{
// //                   fontSize: '11px',
// //                   fontWeight: '500',
// //                   color: '#92400e'
// //                 }}
// //               />
// //             </LineChart>
// //           </ResponsiveContainer>
// //         </div>
// //         <div className="mt-3 text-xs text-amber-800 text-center border-t border-amber-200 pt-2">
// //           <strong>Source:</strong> Normes de croissance de l'OMS - {title.includes('Filles') ? 'Filles' : 'Garçons'} 0-24 mois
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // const WHOGrowthCharts = ({ records, patientGender, patientBirthDate }) => {
// //   const isGirl = patientGender === 'female';
// //   const standards = {
// //     weightForAge: isGirl ? WHO_GIRLS_WEIGHT_FOR_AGE : WHO_BOYS_WEIGHT_FOR_AGE,
// //     heightForAge: isGirl ? WHO_GIRLS_HEIGHT_FOR_AGE : WHO_BOYS_HEIGHT_FOR_AGE,
// //     weightForHeight: isGirl ? WHO_GIRLS_WEIGHT_FOR_HEIGHT : WHO_BOYS_WEIGHT_FOR_HEIGHT
// //   };

// //   const weightForAgeData = records.map(record => {
// //     const ageInMonths = calculateAgeInMonths(patientBirthDate, record.date);
// //     return {
// //       age: ageInMonths,
// //       weight: record.weightKg,
// //       date: new Date(record.date).toLocaleDateString('fr-FR')
// //     };
// //   });

// //   const heightForAgeData = records.map(record => {
// //     const ageInMonths = calculateAgeInMonths(patientBirthDate, record.date);
// //     return {
// //       age: ageInMonths,
// //       height: record.heightCm,
// //       date: new Date(record.date).toLocaleDateString('fr-FR')
// //     };
// //   });

// //   const weightForHeightData = records.map(record => ({
// //     height: record.heightCm,
// //     weight: record.weightKg,
// //     date: new Date(record.date).toLocaleDateString('fr-FR')
// //   }));
  
// //   return (
// //     <div className="grid grid-cols-1 gap-8">
// //       <GrowthChart
// //         data={standards.weightForAge}
// //         xKey="age"
// //         yKey="weight"
// //         title={`Courbe poids-âge (OMS) - ${isGirl ? 'Filles' : 'Garçons'} 0-24 mois`}
// //         xLabel="Âge (mois)"
// //         yLabel="Poids (kg)"
// //         patientData={weightForAgeData}
// //       />
      
// //       <GrowthChart
// //         data={standards.heightForAge}
// //         xKey="age"
// //         yKey="height"
// //         title={`Courbe taille-âge (OMS) - ${isGirl ? 'Filles' : 'Garçons'} 0-24 mois`}
// //         xLabel="Âge (mois)"
// //         yLabel="Taille (cm)"
// //         patientData={heightForAgeData}
// //       />
      
// //       <GrowthChart
// //         data={standards.weightForHeight}
// //         xKey="height"
// //         yKey="weight"
// //         title={`Courbe poids-taille (OMS) - ${isGirl ? 'Filles' : 'Garçons'} 45-110 cm`}
// //         xLabel="Taille (cm)"
// //         yLabel="Poids (kg)"
// //         patientData={weightForHeightData}
// //       />
// //     </div>
// //   );
// // };
// const GrowthChart = ({ data, xKey, yKey, title, xLabel, yLabel, patientData, colorScheme }) => {
//   // Define color schemes
//   const schemes = {
//     pink: {
//       bgFrom: 'from-pink-50',
//       bgTo: 'to-rose-50',
//       border: 'border-pink-200',
//       shadow: 'rgba(236, 72, 153, 0.1)',
//       text: 'text-pink-900',
//       accent: '#db2777',
//       lightAccent: '#f9a8d4',
//       grid: '#ec4899'
//     },
//     blue: {
//       bgFrom: 'from-blue-50',
//       bgTo: 'to-sky-50',
//       border: 'border-blue-200',
//       shadow: 'rgba(59, 130, 246, 0.1)',
//       text: 'text-blue-900',
//       accent: '#2563eb',
//       lightAccent: '#93c5fd',
//       grid: '#3b82f6'
//     },
//     amber: {
//       bgFrom: 'from-amber-50',
//       bgTo: 'to-yellow-50',
//       border: 'border-amber-200',
//       shadow: 'rgba(217, 119, 6, 0.1)',
//       text: 'text-amber-900',
//       accent: '#d97706',
//       lightAccent: '#fcd34d',
//       grid: '#d4af37'
//     }
//   };

//   const colors = schemes[colorScheme] || schemes.amber;

//   return (
//     <div className={`bg-gradient-to-br ${colors.bgFrom} ${colors.bgTo} p-6 rounded-xl border-2 ${colors.border} shadow-lg mb-6`} 
//          style={{
//            boxShadow: `0 4px 20px ${colors.shadow}`
//          }}>
//       <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg border border-amber-100">
//         <h3 className={`text-xl font-bold ${colors.text} mb-4 text-center border-b-2 ${colors.border} pb-2`}>
//           {title}
//         </h3>
//         <div className="h-80 relative">
//           <ResponsiveContainer width="100%" height="100%">
//             <LineChart
//               data={data}
//               margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
//             >
//               {/* Millimeter paper grid pattern */}
//               <defs>
//                 <pattern id={`millimeterGrid-${colorScheme}`} patternUnits="userSpaceOnUse" width="10" height="10">
//                   <path d="M 10 0 L 0 0 0 10" fill="none" stroke={colors.grid} strokeWidth="0.3" opacity="0.4"/>
//                   <path d="M 10 0 L 0 0 0 10" fill="none" stroke={colors.grid} strokeWidth="0.8" opacity="0.7" 
//                         strokeDasharray="0" transform="scale(5,5)"/>
//                 </pattern>
//               </defs>
              
//               {/* Paper texture background */}
//               <rect width="100%" height="100%" fill={`url(#millimeterGrid-${colorScheme})`} opacity="0.6"/>
              
//               <XAxis 
//                 dataKey={xKey}
//                 tick={{ fontSize: 11, fill: colors.text }}
//                 tickLine={{ stroke: colors.accent, strokeWidth: 1 }}
//                 axisLine={{ stroke: colors.accent, strokeWidth: 2 }}
//                 label={{ 
//                   value: xLabel, 
//                   position: "insideBottom", 
//                   offset: -10,
//                   style: { textAnchor: 'middle', fontSize: '12px', fontWeight: 'bold', fill: colors.text }
//                 }}
//               />
//               <YAxis 
//                 tick={{ fontSize: 11, fill: colors.text }}
//                 tickLine={{ stroke: colors.accent, strokeWidth: 1 }}
//                 axisLine={{ stroke: colors.accent, strokeWidth: 2 }}
//                 label={{ 
//                   value: yLabel, 
//                   angle: -90, 
//                   position: "insideLeft",
//                   style: { textAnchor: 'middle', fontSize: '12px', fontWeight: 'bold', fill: colors.text }
//                 }}
//               />
              
//               {/* Reference Areas */}
//               <ReferenceArea 
//                 x1={data[0][xKey]} 
//                 x2={data[data.length-1][xKey]} 
//                 y1={0} 
//                 y2="p3" 
//                 fill="#fca5a5" 
//                 fillOpacity="0.15"
//                 stroke="none" 
//               />
//               <ReferenceArea 
//                 x1={data[0][xKey]} 
//                 x2={data[data.length-1][xKey]} 
//                 y1="p3" 
//                 y2="p15" 
//                 fill="#fed7aa" 
//                 fillOpacity="0.15"
//                 stroke="none" 
//               />
//               <ReferenceArea 
//                 x1={data[0][xKey]} 
//                 x2={data[data.length-1][xKey]} 
//                 y1="p15" 
//                 y2="p85" 
//                 fill="#bbf7d0" 
//                 fillOpacity="0.2"
//                 stroke="none" 
//               />
//               <ReferenceArea 
//                 x1={data[0][xKey]} 
//                 x2={data[data.length-1][xKey]} 
//                 y1="p85" 
//                 y2="p97" 
//                 fill="#fed7aa" 
//                 fillOpacity="0.15"
//                 stroke="none" 
//               />
//               <ReferenceArea 
//                 x1={data[0][xKey]} 
//                 x2={data[data.length-1][xKey]} 
//                 y1="p97" 
//                 y2={yKey === 'weight' ? 25 : 120} 
//                 fill="#fca5a5" 
//                 fillOpacity="0.15"
//                 stroke="none" 
//               />
              
//               {/* Percentile Lines */}
//               <Line 
//                 type="monotone" 
//                 dataKey="p3" 
//                 stroke="#dc2626" 
//                 strokeWidth={2}
//                 strokeDasharray="5,3"
//                 dot={false} 
//                 name="3e percentile"
//               />
//               <Line 
//                 type="monotone" 
//                 dataKey="p15" 
//                 stroke="#ea580c" 
//                 strokeWidth={1.5}
//                 strokeDasharray="3,2"
//                 dot={false} 
//                 name="15e percentile"
//               />
//               <Line 
//                 type="monotone" 
//                 dataKey="p50" 
//                 stroke="#16a34a" 
//                 strokeWidth={3}
//                 dot={false} 
//                 name="50e percentile"
//               />
//               <Line 
//                 type="monotone" 
//                 dataKey="p85" 
//                 stroke="#ea580c" 
//                 strokeWidth={1.5}
//                 strokeDasharray="3,2"
//                 dot={false} 
//                 name="85e percentile"
//               />
//               <Line 
//                 type="monotone" 
//                 dataKey="p97" 
//                 stroke="#dc2626" 
//                 strokeWidth={2}
//                 strokeDasharray="5,3"
//                 dot={false} 
//                 name="97e percentile"
//               />
              
//               {/* Patient Data */}
//               {patientData && patientData.length > 0 && (
//                 <Line
//                   type="monotone"
//                   data={patientData}
//                   dataKey={yKey}
//                   stroke={colorScheme === 'pink' ? '#1d4ed8' : colorScheme === 'blue' ? '#db2777' : '#1d4ed8'}
//                   name={`${yLabel} patient`}
//                   strokeWidth={4}
//                   dot={{ r: 6, fill: colorScheme === 'pink' ? '#1d4ed8' : colorScheme === 'blue' ? '#db2777' : '#1d4ed8', stroke: '#ffffff', strokeWidth: 2 }}
//                   activeDot={{ r: 8, fill: colorScheme === 'pink' ? '#1d4ed8' : colorScheme === 'blue' ? '#db2777' : '#1d4ed8', stroke: '#ffffff', strokeWidth: 3 }}
//                   connectNulls={true}
//                 />
//               )}
              
//               <Tooltip 
//                 contentStyle={{
//                   backgroundColor: '#fefce8',
//                   border: `2px solid ${colors.accent}`,
//                   borderRadius: '8px',
//                   fontSize: '12px',
//                   fontWeight: '500'
//                 }}
//                 formatter={(value, name) => {
//                   if (name === `${yLabel} patient`) return [`${value} ${yLabel.split('(')[1]?.replace(')','') || ''}`, name];
//                   return [`${value} ${yLabel.split('(')[1]?.replace(')','') || ''}`, name];
//                 }}
//                 labelFormatter={(label) => `${xLabel}: ${label} ${xLabel.includes('Âge') ? 'mois' : 'cm'}`}
//               />
//               <Legend 
//                 wrapperStyle={{
//                   fontSize: '11px',
//                   fontWeight: '500',
//                   color: colors.text
//                 }}
//               />
//             </LineChart>
//           </ResponsiveContainer>
//         </div>
//         <div className={`mt-3 text-xs ${colors.text} text-center border-t ${colors.border} pt-2`}>
//           <strong>Source:</strong> Normes de croissance de l'OMS - {title.includes('Filles') ? 'Filles' : 'Garçons'} 0-24 mois
//         </div>
//       </div>
//     </div>
//   );
// };

// const WHOGrowthCharts = ({ records, patientGender, patientBirthDate }) => {
//   const isGirl = patientGender === 'female';
//   const standards = {
//     weightForAge: isGirl ? WHO_GIRLS_WEIGHT_FOR_AGE : WHO_BOYS_WEIGHT_FOR_AGE,
//     heightForAge: isGirl ? WHO_GIRLS_HEIGHT_FOR_AGE : WHO_BOYS_HEIGHT_FOR_AGE,
//     weightForHeight: isGirl ? WHO_GIRLS_WEIGHT_FOR_HEIGHT : WHO_BOYS_WEIGHT_FOR_HEIGHT
//   };

//   const weightForAgeData = records.map(record => {
//     const ageInMonths = calculateAgeInMonths(patientBirthDate, record.date);
//     return {
//       age: ageInMonths,
//       weight: record.weightKg,
//       date: new Date(record.date).toLocaleDateString('fr-FR')
//     };
//   });

//   const heightForAgeData = records.map(record => {
//     const ageInMonths = calculateAgeInMonths(patientBirthDate, record.date);
//     return {
//       age: ageInMonths,
//       height: record.heightCm,
//       date: new Date(record.date).toLocaleDateString('fr-FR')
//     };
//   });

//   const weightForHeightData = records.map(record => ({
//     height: record.heightCm,
//     weight: record.weightKg,
//     date: new Date(record.date).toLocaleDateString('fr-FR')
//   }));
  
//   return (
//     <div className="grid grid-cols-1 gap-8">
//       <GrowthChart
//         data={standards.weightForAge}
//         xKey="age"
//         yKey="weight"
//         title={`Courbe poids-âge (OMS) - ${isGirl ? 'Filles' : 'Garçons'} 0-24 mois`}
//         xLabel="Âge (mois)"
//         yLabel="Poids (kg)"
//         patientData={weightForAgeData}
//         colorScheme="pink"
//       />
      
//       <GrowthChart
//         data={standards.heightForAge}
//         xKey="age"
//         yKey="height"
//         title={`Courbe taille-âge (OMS) - ${isGirl ? 'Filles' : 'Garçons'} 0-24 mois`}
//         xLabel="Âge (mois)"
//         yLabel="Taille (cm)"
//         patientData={heightForAgeData}
//         colorScheme="blue"
//       />
      
//       <GrowthChart
//         data={standards.weightForHeight}
//         xKey="height"
//         yKey="weight"
//         title={`Courbe poids-taille (OMS) - ${isGirl ? 'Filles' : 'Garçons'} 45-110 cm`}
//         xLabel="Taille (cm)"
//         yLabel="Poids (kg)"
//         patientData={weightForHeightData}
//         colorScheme="amber"
//       />
//     </div>
//   );
// };
// export default WHOGrowthCharts;



// // WHOGrowthCharts.jsx
// import { Typography } from '@material-tailwind/react';
// import React from 'react';
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
//   ReferenceArea,
//   Label,
//   ReferenceLine
// } from 'recharts';

// // WHO Growth Standards Data
// // Source: WHO Child Growth Standards (https://www.who.int/tools/child-growth-standards)




// const calculateAgeInMonths = (birthDateString, measurementDateString) => {
//   const birthDate = new Date(birthDateString);
//   const measurementDate = new Date(measurementDateString);

//   let months = (measurementDate.getFullYear() - birthDate.getFullYear()) * 12;
//   months -= birthDate.getMonth();
//   months += measurementDate.getMonth();

//   if (measurementDate.getDate() < birthDate.getDate()) {
//     months--;
//   }

//   return months <= 0 ? 0 : months;
// };

// // Girls 0-24 months - Weight for Age
// const WHO_GIRLS_WEIGHT_FOR_AGE = [
//   { age: 0, p3: 2.1, p15: 2.5, p50: 2.9, p85: 3.3, p97: 3.7, sd: [-3, -2, 0, 1, 2] },
//   { age: 1, p3: 2.9, p15: 3.3, p50: 3.9, p85: 4.5, p97: 5.1, sd: [-3, -2, 0, 1, 2] },
//   // ... complete monthly data up to 24 months
//   { age: 24, p3: 9.0, p15: 9.9, p50: 11.2, p85: 12.8, p97: 14.1, sd: [-3, -2, 0, 1, 2] }
// ];

// // Boys 0-24 months - Weight for Age
// const WHO_BOYS_WEIGHT_FOR_AGE = [
//   { age: 0, p3: 2.2, p15: 2.6, p50: 3.0, p85: 3.5, p97: 3.9, sd: [-3, -2, 0, 1, 2] },
//   { age: 1, p3: 3.0, p15: 3.5, p50: 4.1, p85: 4.8, p97: 5.4, sd: [-3, -2, 0, 1, 2] },
//   // ... complete monthly data up to 24 months
//   { age: 24, p3: 9.5, p15: 10.4, p50: 11.8, p85: 13.5, p97: 14.8, sd: [-3, -2, 0, 1, 2] }
// ];

// // Girls 0-24 months - Height for Age
// const WHO_GIRLS_HEIGHT_FOR_AGE = [
//   { age: 0, p3: 45.6, p15: 47.3, p50: 49.1, p85: 51.0, p97: 52.7, sd: [-3, -2, 0, 1, 2] },
//   { age: 1, p3: 50.0, p15: 51.7, p50: 53.7, p85: 55.6, p97: 57.3, sd: [-3, -2, 0, 1, 2] },
//   // ... complete monthly data up to 24 months
//   { age: 24, p3: 80.0, p15: 82.9, p50: 86.4, p85: 89.9, p97: 93.0, sd: [-3, -2, 0, 1, 2] }
// ];

// // Boys 0-24 months - Height for Age
// const WHO_BOYS_HEIGHT_FOR_AGE = [
//   { age: 0, p3: 46.1, p15: 47.9, p50: 49.9, p85: 51.8, p97: 53.5, sd: [-3, -2, 0, 1, 2] },
//   { age: 1, p3: 51.1, p15: 52.7, p50: 54.7, p85: 56.7, p97: 58.4, sd: [-3, -2, 0, 1, 2] },
//   // ... complete monthly data up to 24 months
//   { age: 24, p3: 81.3, p15: 84.2, p50: 87.8, p85: 91.3, p97: 94.4, sd: [-3, -2, 0, 1, 2] }
// ];

// // Girls 45-110 cm - Weight for Height
// const WHO_GIRLS_WEIGHT_FOR_HEIGHT = [
//   { height: 45, p3: 1.9, p15: 2.1, p50: 2.4, p85: 2.7, p97: 3.0, sd: [-3, -2, 0, 1, 2] },
//   { height: 50, p3: 2.4, p15: 2.7, p50: 3.0, p85: 3.4, p97: 3.8, sd: [-3, -2, 0, 1, 2] },
//   // ... complete data up to 110 cm
//   { height: 110, p3: 14.2, p15: 15.5, p50: 17.3, p85: 19.5, p97: 21.6, sd: [-3, -2, 0, 1, 2] }
// ];

// // Boys 45-110 cm - Weight for Height
// const WHO_BOYS_WEIGHT_FOR_HEIGHT = [
//   { height: 45, p3: 2.0, p15: 2.2, p50: 2.5, p85: 2.9, p97: 3.2, sd: [-3, -2, 0, 1, 2] },
//   { height: 50, p3: 2.6, p15: 2.9, p50: 3.3, p85: 3.7, p97: 4.1, sd: [-3, -2, 0, 1, 2] },
//   // ... complete data up to 110 cm
//   { height: 110, p3: 14.8, p15: 16.1, p50: 18.1, p85: 20.5, p97: 22.7, sd: [-3, -2, 0, 1, 2] }
// ];

// // Interpolation function
// const interpolateData = (value, data, key) => {
//   if (value <= data[0][key]) return data[0];
//   if (value >= data[data.length - 1][key]) return data[data.length - 1];
  
//   const lower = data.findLast(item => item[key] <= value);
//   const upper = data.find(item => item[key] >= value);
  
//   if (!lower || !upper || lower[key] === upper[key]) return lower || upper;
  
//   const ratio = (value - lower[key]) / (upper[key] - lower[key]);
  
//   return {
//     [key]: value,
//     p3: lower.p3 + (upper.p3 - lower.p3) * ratio,
//     p15: lower.p15 + (upper.p15 - lower.p15) * ratio,
//     p50: lower.p50 + (upper.p50 - lower.p50) * ratio,
//     p85: lower.p85 + (upper.p85 - lower.p85) * ratio,
//     p97: lower.p97 + (upper.p97 - lower.p97) * ratio,
//     sd: lower.sd
//   };
// };

// const GrowthChart = ({ data, xKey, yKey, title, xLabel, yLabel, patientData }) => {
//   return (
//     <div className="bg-white p-4 rounded-xl border border-blue-gray-50 mb-6">
//       <Typography variant="h5" color="blue-gray" className="mb-4">
//         {title}
//       </Typography>
//       <div className="h-80">
//         <ResponsiveContainer width="100%" height="100%">
//           <LineChart
//             data={data}
//             margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
//           >
//             <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
//             <XAxis 
//               dataKey={xKey} 
//               label={{ 
//                 value: xLabel, 
//                 position: "insideBottomRight", 
//                 offset: -10,
//                 fontSize: 12
//               }}
//             />
//             <YAxis 
//               label={{ 
//                 value: yLabel, 
//                 angle: -90, 
//                 position: "insideLeft",
//                 fontSize: 12
//               }}
//             />
            
//             {/* Reference Areas */}
//             <ReferenceArea x1={data[0][xKey]} x2={data[data.length-1][xKey]} y1={0} y2="p3" fill="#ffcccc" stroke="none" />
//             <ReferenceArea x1={data[0][xKey]} x2={data[data.length-1][xKey]} y1="p3" y2="p15" fill="#ffe6cc" stroke="none" />
//             <ReferenceArea x1={data[0][xKey]} x2={data[data.length-1][xKey]} y1="p15" y2="p85" fill="#e6ffe6" stroke="none" />
//             <ReferenceArea x1={data[0][xKey]} x2={data[data.length-1][xKey]} y1="p85" y2="p97" fill="#ffe6cc" stroke="none" />
//             <ReferenceArea x1={data[0][xKey]} x2={data[data.length-1][xKey]} y1="p97" y2={yKey === 'weight' ? 25 : 120} fill="#ffcccc" stroke="none" />
            
//             {/* Percentile Lines */}
//             <Line type="monotone" dataKey="p3" stroke="#ff0000" strokeWidth={1.5} dot={false} name="3e percentile" />
//             <Line type="monotone" dataKey="p15" stroke="#ff9900" strokeWidth={1.5} dot={false} name="15e percentile" />
//             <Line type="monotone" dataKey="p50" stroke="#00cc00" strokeWidth={1.5} dot={false} name="50e percentile" />
//             <Line type="monotone" dataKey="p85" stroke="#ff9900" strokeWidth={1.5} dot={false} name="85e percentile" />
//             <Line type="monotone" dataKey="p97" stroke="#ff0000" strokeWidth={1.5} dot={false} name="97e percentile" />
            
//             {/* Patient Data */}
//             {patientData && (
//               <Line
//                 type="monotone"
//                 dataKey={yKey}
//                 stroke="#8884d8"
//                 name={`${yLabel} patient`}
//                 strokeWidth={3}
//                 dot={{ r: 5 }}
//                 activeDot={{ r: 8 }}
//               />
//             )}
            
//             <Tooltip 
//               formatter={(value, name) => {
//                 if (name === yKey) return [`${value} ${yLabel.split('(')[1]?.replace(')','') || ''}`, `${yLabel.split('(')[0]} patient`];
//                 return [`${value} ${yLabel.split('(')[1]?.replace(')','') || ''}`, name];
//               }}
//               labelFormatter={(label) => `${xLabel}: ${label} ${xLabel.includes('Âge') ? 'mois' : 'cm'}`}
//             />
//             <Legend />
//           </LineChart>
//         </ResponsiveContainer>
//       </div>
//       <Typography variant="small" className="text-gray-600 mt-2">
//         Source: Normes de croissance de l'OMS - {title.includes('Filles') ? 'Filles' : 'Garçons'} 0-24 mois
//       </Typography>
//     </div>
//   );
// };



// const WHOGrowthCharts = ({ records, patientGender, patientBirthDate }) => {

//  console.log('gender of patien ', patientGender )
     
//   // Le reste du code est correct
//   const isGirl = patientGender === 'female';
//   const standards = {
//     weightForAge: isGirl ? WHO_GIRLS_WEIGHT_FOR_AGE : WHO_BOYS_WEIGHT_FOR_AGE,
//     heightForAge: isGirl ? WHO_GIRLS_HEIGHT_FOR_AGE : WHO_BOYS_HEIGHT_FOR_AGE,
//     weightForHeight: isGirl ? WHO_GIRLS_WEIGHT_FOR_HEIGHT : WHO_BOYS_WEIGHT_FOR_HEIGHT
//   };

//   const weightForAgeData = records.map(record => {
//     const ageInMonths = calculateAgeInMonths(patientBirthDate, record.date);
//     return {
//       ...interpolateData(ageInMonths, standards.weightForAge, 'age'),
//       age: ageInMonths,
//       weight: record.weightKg,
//       date: new Date(record.date).toLocaleDateString('fr-FR')
//     };
//   });

//   const heightForAgeData = records.map(record => {
//     const ageInMonths = calculateAgeInMonths(patientBirthDate, record.date);
//     return {
//       ...interpolateData(ageInMonths, standards.heightForAge, 'age'),
//       age: ageInMonths,
//       height: record.heightCm,
//       date: new Date(record.date).toLocaleDateString('fr-FR')
//     };
//   });

//   const weightForHeightData = records.map(record => ({
//     ...interpolateData(record.heightCm, standards.weightForHeight, 'height'),
//     height: record.heightCm,
//     weight: record.weightKg,
//     date: new Date(record.date).toLocaleDateString('fr-FR')
//   }));
  
//   return (
//     <div className="grid grid-cols-1 gap-8">
//       <GrowthChart
//         data={[...standards.weightForAge, ...weightForAgeData].sort((a,b) => a.age - b.age)}
//         xKey="age"
//         yKey="weight"
//         title={`Courbe poids-âge (OMS) - ${isGirl ? 'Filles' : 'Garçons'} 0-24 mois`}
//         xLabel="Âge (mois)"
//         yLabel="Poids (kg)"
//         patientData={weightForAgeData}
//       />
      
//       <GrowthChart
//         data={[...standards.heightForAge, ...heightForAgeData].sort((a,b) => a.age - b.age)}
//         xKey="age"
//         yKey="height"
//         title={`Courbe taille-âge (OMS) - ${isGirl ? 'Filles' : 'Garçons'} 0-24 mois`}
//         xLabel="Âge (mois)"
//         yLabel="Taille (cm)"
//         patientData={heightForAgeData}
//       />
      
//       <GrowthChart
//         data={[...standards.weightForHeight, ...weightForHeightData].sort((a,b) => a.height - b.height)}
//         xKey="height"
//         yKey="weight"
//         title={`Courbe poids-taille (OMS) - ${isGirl ? 'Filles' : 'Garçons'} 45-110 cm`}
//         xLabel="Taille (cm)"
//         yLabel="Poids (kg)"
//         patientData={weightForHeightData}
//       />
//     </div>
//   );
// };

// export default WHOGrowthCharts;
