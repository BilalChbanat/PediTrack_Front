import { prepareChartData } from "@/utils/growthCalculations";
import WHOGrowthChart from "./WHOGrowthChart";

const WeightForAgeChart = ({
    patientData,
    records,
    xDomain = [0, 24],
    yDomain = [2, 14],
    xTicks = [0, 3, 6, 9, 12, 15, 18, 21, 24],
    yTicks = [2, 4, 6, 8, 10, 12, 14],
}) => {
    const chartData = prepareChartData(
        records,
        patientData.birthDate,
        patientData.gender === 'female' ? 'girls' : 'boys',
        'weightForAge'
    );

    return (
        <WHOGrowthChart
            data={chartData}
            title="POIDS-POUR-L'ÂGE"
            xLabel="Âge (mois)"
            yLabel="Poids (kg)"
            gender={patientData.gender === 'female' ? 'girls' : 'boys'}
            xDomain={xDomain}
            yDomain={yDomain}
            xTicks={xTicks}
            yTicks={yTicks}
        />
    );
};

export default WeightForAgeChart;