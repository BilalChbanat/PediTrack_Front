import WHOGrowthChart from './WHOGrowthChart';

const WeightForHeightChart = ({ patientData, gender = 'girls' }) => {
    // Use patientData if provided, otherwise fallback to an empty array
    const chartData = patientData && patientData.length > 0 ? patientData : [];

    return (
        <WHOGrowthChart
            data={chartData}
            title="POIDS-POUR-TAILLE"
            xLabel="Taille (cm)"
            yLabel="Poids (kg)"
            gender={gender}
            xDomain={[45, 110]}
            yDomain={[2, 20]}
            xTicks={[45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110]}
            yTicks={[2, 4, 6, 8, 10, 12, 14, 16, 18, 20]}
        />
    );
};

export default WeightForHeightChart;
