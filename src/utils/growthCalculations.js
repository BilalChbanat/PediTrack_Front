// Utility functions for growth calculations
export const calculateAgeInMonths = (birthDate, measurementDate) => {
  const birth = new Date(birthDate);
  const measure = new Date(measurementDate);
  return (measure.getFullYear() - birth.getFullYear()) * 12 + 
         (measure.getMonth() - birth.getMonth());
};

export const getWHOReferenceData = (gender, chartType) => {
  // This should be replaced with actual WHO data import
  // Example structure:
  const WHO_DATA = {
    girls: {
      weightForAge: [
        { age: 0, p3: 2.4, p15: 2.8, p50: 3.2, p85: 3.7, p97: 4.2 },
        // ... more data points
      ],
      heightForAge: [
        { age: 0, p3: 45.6, p15: 47.3, p50: 49.1, p85: 51.0, p97: 52.7 },
        // ... more data points
      ],
      weightForHeight: [
        { height: 45, p3: 2.0, p15: 2.3, p50: 2.7, p85: 3.1, p97: 3.5 },
        // ... more data points
      ]
    },
    boys: {
      // Similar structure for boys
    }
  };
  return WHO_DATA[gender][chartType] || [];
};

export const prepareChartData = (patientRecords, patientBirthDate, gender, chartType) => {
  const referenceData = getWHOReferenceData(gender, chartType);
  
  return patientRecords.map(record => {
    const ageMonths = calculateAgeInMonths(patientBirthDate, record.date);
    const heightCm = record.heightCm;
    const weightKg = record.weightKg;
    
    // Find closest reference point
    const refPoint = referenceData.find(ref => 
      chartType === 'weightForHeight' 
        ? Math.abs(ref.height - heightCm) <= 1
        : Math.abs(ref.age - ageMonths) <= 0.5
    ) || {};
    
    return {
      age: ageMonths,
      height: heightCm,
      weight: weightKg,
      bmi: (weightKg / ((heightCm/100) ** 2)).toFixed(1),
      patient: getPatientValue(chartType, record),
      ...refPoint
    };
  }).sort((a, b) => a.age - b.age);
};

const getPatientValue = (chartType, record) => {
  switch(chartType) {
    case 'weightForAge': return record.weightKg;
    case 'heightForAge': return record.heightCm;
    case 'weightForHeight': return record.weightKg;
    case 'bmiForAge': return (record.weightKg / ((record.heightCm/100) ** 2)).toFixed(1);
    default: return null;
  }
};