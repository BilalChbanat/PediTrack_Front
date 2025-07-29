import WHOGrowthChart from './WHOGrowthChart';

const HeightForAgeChart = ({ patientData, gender = 'girls' }) => {
    // Use patientData if provided, otherwise fallback to empty array
    const chartData = patientData || [];

    return (
        <WHOGrowthChart
            data={chartData}
            title="TAILLE-POUR-L'ÂGE"
            xLabel="Âge (mois)"
            yLabel="Taille (cm)"
            gender={gender}
            xDomain={[0, 24]}
            yDomain={[45, 95]}
            xTicks={[0, 3, 6, 9, 12, 15, 18, 21, 24]}
            yTicks={[45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95]}
        />
    );
};

export default HeightForAgeChart;
