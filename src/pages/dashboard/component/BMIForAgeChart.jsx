import WHOGrowthChart from './WHOGrowthChart';

const BMIForAgeChart = ({ patientData, gender = 'girls' }) => {
    return (
        <WHOGrowthChart
            data={patientData}
            title="IMC-POUR-L'ÂGE"
            xLabel="Âge (mois)"
            yLabel="IMC (kg/m²)"
            gender={gender}
            xDomain={[0, 24]}
            yDomain={[10, 22]}
            xTicks={[0, 3, 6, 9, 12, 15, 18, 21, 24]}
            yTicks={[10, 12, 14, 16, 18, 20, 22]}
        />
    );
};

export default BMIForAgeChart;
