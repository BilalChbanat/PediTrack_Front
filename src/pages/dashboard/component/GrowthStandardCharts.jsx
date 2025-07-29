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
import { WHO_GROWTH_DATA } from './whoGrowthData';
import { formatDate } from '@/utils/prescriptionUtils';
import { Typography } from '@material-tailwind/react';
import { Button } from '@material-tailwind/react';
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import PropTypes from 'prop-types';




const calculateAgeInMonths = (date, birthDate) => {
    const diff = new Date(date) - new Date(birthDate);

    return Math.floor(diff / (1000 * 60 * 60 * 24 * 30)); // Approximate months
};

const GrowthStandardChart = ({ 
  patientData, 
  records, 
  chartType = 'weightForAge',
  gender = 'girls',
  ageRange = '0-24'
}) => {
  // Get the appropriate reference data
  const referenceData = WHO_GROWTH_DATA[gender][chartType];
  
  // Combine patient data with reference data
  const chartData = records.map(record => {
    const ageInMonths = calculateAgeInMonths(record.date, patientData.birthDate);
    const refPoint = referenceData.find(ref => ref.age === Math.floor(ageInMonths));
    
    return {
      date: formatDate(record.date),
      age: ageInMonths,
      patientValue: chartType.includes('weight') ? record.weightKg : 
                   chartType.includes('height') ? record.heightCm : 
                   calculateBMI(record.weightKg, record.heightCm),
      ...refPoint
    };
  });

  // Chart configuration based on type
  const chartConfig = {
    weightForAge: {
      title: "Courbe poids-âge",
      yLabel: "Poids (kg)",
      xLabel: "Âge (mois)"
    },
    heightForAge: {
      title: "Courbe taille-âge",
      yLabel: "Taille (cm)",
      xLabel: "Âge (mois)"
    },
    weightForHeight: {
      title: "Courbe poids-taille",
      yLabel: "Poids (kg)",
      xLabel: "Taille (cm)"
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <Typography  variant="h5" className="mb-4 text-center">
        {chartConfig[chartType].title} - {gender === 'girls' ? 'Fille' : 'Garçon'}
      </Typography>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey={chartConfig[chartType].xLabel === 'Âge (mois)' ? 'age' : 'height'} 
              label={{ value: chartConfig[chartType].xLabel, position: 'insideBottomRight', offset: -5 }}
            />
            <YAxis 
              label={{ value: chartConfig[chartType].yLabel, angle: -90, position: 'insideLeft' }}
            />
            <Tooltip />
            <Legend />
            
            {/* Reference areas for percentiles */}
            <ReferenceArea y1="p3" y2="p97" fill="#e0f7fa" stroke="#b2ebf2" strokeWidth={1} />
            <ReferenceArea y1="p15" y2="p85" fill="#b2ebf2" stroke="#80deea" strokeWidth={1} />
            
            {/* Reference lines */}
            <Line type="monotone" dataKey="p3" stroke="#26c6da" strokeWidth={2} dot={false} name="3e percentile" />
            <Line type="monotone" dataKey="p15" stroke="#00acc1" strokeWidth={2} dot={false} name="15e percentile" />
            <Line type="monotone" dataKey="p50" stroke="#00838f" strokeWidth={2} dot={false} name="50e percentile" />
            <Line type="monotone" dataKey="p85" stroke="#00acc1" strokeWidth={2} dot={false} name="85e percentile" />
            <Line type="monotone" dataKey="p97" stroke="#26c6da" strokeWidth={2} dot={false} name="97e percentile" />
            
            {/* Patient data */}
            <Line 
              type="monotone" 
              dataKey="patientValue" 
              stroke="#ff5722" 
              strokeWidth={3} 
              dot={{ r: 5, fill: "#ff5722" }}
              activeDot={{ r: 8 }}
              name="Patient"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 flex justify-center">
        <Button 
          variant="outlined" 
          color="blue"
          onClick={() => exportChartAsImage(chartConfig[chartType].title)}
        >
          <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
          Exporter le graphique
        </Button>
      </div>
    </div>
  );
};

export default GrowthStandardChart;