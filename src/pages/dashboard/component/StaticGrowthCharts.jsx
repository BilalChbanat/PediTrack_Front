import React from 'react';
import { Typography } from '@material-tailwind/react';

const calculateAgeInMonths = (birthDateString, measurementDateString) => {
  const birthDate = new Date(birthDateString);
  const measurementDate = new Date(measurementDateString);

  // More accurate age calculation
  const yearDiff = measurementDate.getFullYear() - birthDate.getFullYear();
  const monthDiff = measurementDate.getMonth() - birthDate.getMonth();
  const dayDiff = measurementDate.getDate() - birthDate.getDate();
  
  let months = yearDiff * 12 + monthDiff;
  
  // Adjust for day difference
  if (dayDiff < 0) {
    months--;
  }
  
  // Debug the calculation
  console.log('Age calculation:', {
    birthDate: birthDateString,
    measurementDate: measurementDateString,
    birthDateObj: birthDate,
    measurementDateObj: measurementDate,
    yearDiff,
    monthDiff,
    dayDiff,
    calculatedMonths: months
  });
  
  return Math.max(0, months);
};

const StaticGrowthChart = ({ 
  title, 
  imageSrc, 
  patientData, 
  chartType, 
  gender,
  ageRange = "0-24"
}) => {
  // Calculate data points for the patient
  const dataPoints = patientData
    .filter(record => {
      // Filter out records with missing data
      if (chartType === 'weightForAge' && (!record.weightKg || !record.date)) return false;
      if (chartType === 'heightForAge' && (!record.heightCm || !record.date)) return false;
      if (chartType === 'weightForHeight' && (!record.weightKg || !record.heightCm)) return false;
      if (chartType === 'headCircumferenceForAge' && (!record.headCircumferenceCm || !record.date)) return false;
      return true;
    })
    .map(record => {
      // Debug: Log the record to see what data we're working with
      console.log('Processing record:', record);
      return record;
    })
         .map(record => {
       const ageInMonths = calculateAgeInMonths(record.birthDate, record.date);
       let x, y;
       
       if (chartType === 'weightForAge') {
         x = ageInMonths;
         y = record.weightKg;
       } else if (chartType === 'heightForAge') {
         x = ageInMonths;
         y = record.heightCm;
       } else if (chartType === 'weightForHeight') {
         x = record.heightCm;
         y = record.weightKg;
       } else if (chartType === 'headCircumferenceForAge') {
         x = ageInMonths;
         y = record.headCircumferenceCm;
       }
       
       // Debug: Log the calculated values
       console.log(`Chart: ${chartType}, Age: ${ageInMonths}mois, X: ${x}, Y: ${y}, Date: ${record.date}`);
       
       return { 
         x: parseFloat(x) || 0, 
         y: parseFloat(y) || 0, 
         date: record.date,
         ageInMonths: ageInMonths // Store the actual age for debugging
       };
     })
    .filter(point => {
      // Filter out invalid data points
      if (chartType === 'weightForAge') {
        return point.x >= 0 && point.x <= 24 && point.y > 0 && point.y <= 16;
      } else if (chartType === 'heightForAge') {
        return point.x >= 0 && point.x <= 24 && point.y >= 45 && point.y <= 90;
      } else if (chartType === 'weightForHeight') {
        return point.x >= 45 && point.x <= 110 && point.y >= 2 && point.y <= 20;
      } else if (chartType === 'headCircumferenceForAge') {
        return point.x >= 0 && point.x <= 24 && point.y >= 30 && point.y <= 50;
      }
      return true;
    });

  // Calculate position for data points on the image
  const getDataPointStyle = (dataPoint) => {
    // Precise chart grid positioning - these coordinates are calibrated for the actual chart area
    // The chart grid is the area with the grid lines, not the entire image
    let left, top;
    
    if (chartType === 'weightForAge') {
      // Weight for age chart positioning (0-24 months, 0-16 kg)
      const maxAge = 24; // 24 months
      const maxWeight = gender === 'girls' ? 15 : 16; // kg
      const minWeight = 0;
      
      // Chart grid area: 35% to 75% horizontally, 25% to 80% vertically
      left = 35 + (dataPoint.x / maxAge) * 40; // 35% to 75%
      top = 80 - (dataPoint.y - minWeight) / (maxWeight - minWeight) * 55; // Inverted Y axis, 25% to 80%
    } else      if (chartType === 'heightForAge') {
       // Height for age chart positioning (0-24 months, 45-90 cm)
       const maxAge = 24; // 24 months
       const maxHeight = 90; // cm
       const minHeight = 45; // cm
       
       // Chart grid area: 40% to 80% horizontally, 20% to 75% vertically
       left = 40 + (dataPoint.x / maxAge) * 40;
       top = 75 - (dataPoint.y - minHeight) / (maxHeight - minHeight) * 55;
     } else if (chartType === 'weightForHeight') {
      // Weight for height chart positioning (45-110 cm, 2-20 kg)
      const maxHeight = 110; // cm
      const minHeight = 45; // cm
      const maxWeight = 20; // kg
      const minWeight = 2; // kg
      
      left = 35 + (dataPoint.x - minHeight) / (maxHeight - minHeight) * 40;
      top = 80 - (dataPoint.y - minWeight) / (maxWeight - minWeight) * 55;
    } else if (chartType === 'headCircumferenceForAge') {
      // Head circumference for age chart positioning (0-24 months, 30-50 cm)
      const maxAge = 24; // 24 months
      const maxCircumference = 50; // cm
      const minCircumference = 30; // cm
      
      left = 35 + (dataPoint.x / maxAge) * 40;
      top = 80 - (dataPoint.y - minCircumference) / (maxCircumference - minCircumference) * 55;
    }
    
         return {
       position: 'absolute',
       left: `${Math.max(40, Math.min(80, left))}%`,
       top: `${Math.max(20, Math.min(75, top))}%`,
       width: '8px',
       height: '8px',
       backgroundColor: '#ff4444',
       borderRadius: '50%',
       border: '2px solid white',
       boxShadow: '0 2px 4px rgba(0,0,0,0.7)',
       zIndex: 10,
       transform: 'translate(-50%, -50%)' // Center the point on its position
     };
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-blue-gray-50 shadow-lg mb-6">
      <Typography variant="h5" color="blue-gray" className="mb-4 text-center">
        {title} - {gender === 'girls' ? 'Filles' : 'Garçons'} {ageRange} mois
      </Typography>
      
             <div className="relative w-full" style={{ aspectRatio: '1.4' }}>
         <img 
           src={imageSrc} 
           alt={title}
           className="w-full h-full rounded-lg"
           style={{ objectFit: 'contain', objectPosition: 'center' }}
         />
         
                   {/* Chart grid area indicator (for debugging) */}
          <div 
            style={{
              position: 'absolute',
              left: '40%',
              top: '20%',
              width: '40%',
              height: '55%',
              border: '1px dashed rgba(255, 0, 0, 0.3)',
              pointerEvents: 'none',
              zIndex: 5
            }}
            title="Chart grid area"
          />
          
          {/* Data points overlay */}
          {dataPoints.map((dataPoint, index) => (
            <div
              key={index}
              style={getDataPointStyle(dataPoint)}
              title={`${new Date(dataPoint.date).toLocaleDateString('fr-FR')}: ${dataPoint.y} ${chartType.includes('weight') ? 'kg' : chartType.includes('height') ? 'cm' : 'cm'}`}
            />
          ))}
       </div>
      
      <div className="mt-3 text-xs text-gray-600 text-center border-t border-gray-200 pt-2">
        <strong>Source:</strong> Normes de croissance de l'OMS - {gender === 'girls' ? 'Filles' : 'Garçons'} {ageRange} mois
                 {dataPoints.length > 0 && (
           <div className="mt-1 text-blue-600">
             {dataPoints.length} point{dataPoints.length > 1 ? 's' : ''} de données affiché{dataPoints.length > 1 ? 's' : ''}
                           {dataPoints.map((point, index) => {
                const style = getDataPointStyle(point);
                return (
                  <div key={index} className="text-xs text-gray-500">
                    Point {index + 1}: Age={point.ageInMonths}mois, {chartType.includes('weight') ? 'Poids' : 'Taille'}={point.y}{chartType.includes('weight') ? 'kg' : 'cm'} 
                    (X: {point.x}, Y: {point.y}, Pos: {style.left}, {style.top})
                  </div>
                );
              })}
           </div>
         )}
      </div>
    </div>
  );
};

const StaticGrowthCharts = ({ records, patientGender, patientBirthDate }) => {
  const isGirl = patientGender === 'female';
  const gender = isGirl ? 'girls' : 'boys';
  
  // Prepare patient data with birth date
  const patientData = records.map(record => ({
    ...record,
    birthDate: patientBirthDate
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Weight for Age Chart */}
      <StaticGrowthChart
        title="Courbe poids-âge (OMS)"
        imageSrc={isGirl ? "/img/who-charts/wfa_filles_0_2.jpg" : "/img/who-charts/wfa_garcons_0_2.png"}
        patientData={patientData}
        chartType="weightForAge"
        gender={gender}
        ageRange="0-24"
      />

      {/* Height for Age Chart */}
      <StaticGrowthChart
        title="Courbe taille-âge (OMS)"
        imageSrc={isGirl ? "/img/who-charts/tfa_filles_0_2.png" : "/img/who-charts/tfa_garcons_0_2.png"}
        patientData={patientData}
        chartType="heightForAge"
        gender={gender}
        ageRange="0-24"
      />

      {/* Weight for Height Chart */}
      <StaticGrowthChart
        title="Courbe poids-taille (OMS)"
        imageSrc={isGirl ? "/img/who-charts/wfa_filles_0_2.jpg" : "/img/who-charts/wfa_garcons_0_2.png"}
        patientData={patientData}
        chartType="weightForHeight"
        gender={gender}
        ageRange="0-24"
      />

      {/* Head Circumference for Age Chart */}
      <StaticGrowthChart
        title="Courbe périmètre crânien (OMS)"
        imageSrc={isGirl ? "/img/who-charts/imc_filles_0_2.png" : "/img/who-charts/imc_garcons_0_2.png"}
        patientData={patientData}
        chartType="headCircumferenceForAge"
        gender={gender}
        ageRange="0-24"
      />
    </div>
  );
};

export default StaticGrowthCharts; 