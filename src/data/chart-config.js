// // src/data/chart-config.js

// export const chartConfigurations = {
//   wfa_0_2: {
//     imageUrl: (gender) => `/img/charts/wfa_${gender}_0_2.png`,
//     xDomain: [0, 24], // Âge en mois
//     yDomain: [2, 18], // Poids en kg
//     xKey: "ageInMonths",
//     yKey: "weightKg",
//     title: "Poids pour l'âge (0-2 ans)",
//   },
//   tfa_0_2: {
//     imageUrl: (gender) => `/img/charts/tfa_${gender}_0_2.png`,
//     xDomain: [0, 24], // Âge en mois
//     yDomain: [45, 110], // Taille en cm
//     xKey: "ageInMonths",
//     yKey: "heightCm",
//     title: "Taille pour l'âge (0-2 ans)",
//   },
//   imc_0_2: {
//     imageUrl: (gender) => `/img/charts/imc_${gender}_0_2.png`,
//     xDomain: [0, 24], // Âge en mois
//     yDomain: [10, 23], // IMC
//     xKey: "ageInMonths",
//     yKey: "bmi",
//     title: "IMC pour l'âge (0-2 ans)",
//   },
//   // Vous pouvez ajouter ici les configurations pour 2-5 ans plus tard
// };



export const chartConfigurations = {
  wfa_0_2: {
    title: "Poids pour l'âge (0-2 ans)",
    xKey: "ageInMonths",
    yKey: "weightKg",
    xDomain: [0, 24],
    yDomain: [2, 16],
    unit: "kg",
    imageUrl: (gender) => {
      const genderCode = gender === 'Garçon' || gender === 'boys' ? 'garcons' : 'filles';
      return `/img/who-charts/wfa_${genderCode}_0_2.png`;
    }
  },
  tfa_0_2: {
    title: "Taille pour l'âge (0-2 ans)",
    xKey: "ageInMonths",
    yKey: "heightCm",
    xDomain: [0, 24],
    yDomain: [45, 100],
    unit: "cm",
    imageUrl: (gender) => {
      const genderCode = gender === 'Garçon' || gender === 'boys' ? 'garcons' : 'filles';
      return `/img/who-charts/tfa_${genderCode}_0_2.png`;
    }
  },
  wfa_2_5: {
    title: "Poids pour l'âge (2-5 ans)",
    xKey: "ageInMonths",
    yKey: "weightKg",
    xDomain: [24, 60],
    yDomain: [8, 25],
    unit: "kg",
    imageUrl: (gender) => {
      // Using 0-2 chart as fallback until you get the 2-5 chart files
      const genderCode = gender === 'Garçon' || gender === 'boys' ? 'garcons' : 'filles';
      return `/img/who-charts/wfa_${genderCode}_0_2.png`;
    }
  },
  tfa_2_5: {
    title: "Taille pour l'âge (2-5 ans)",
    xKey: "ageInMonths",
    yKey: "heightCm",
    xDomain: [24, 60],
    yDomain: [75, 120],
    unit: "cm",
    imageUrl: (gender) => {
      // Using 0-2 chart as fallback until you get the 2-5 chart files
      const genderCode = gender === 'Garçon' || gender === 'boys' ? 'garcons' : 'filles';
      return `/img/who-charts/tfa_${genderCode}_0_2.png`;
    }
  },
  imc_0_5: {
    title: "IMC pour l'âge (0-2 ans)",
    xKey: "ageInMonths",
    yKey: "bmi",
    xDomain: [0, 24],
    yDomain: [10, 25],
    unit: "kg/m²",
    imageUrl: (gender) => {
      const genderCode = gender === 'Garçon' || gender === 'boys' ? 'garcons' : 'filles';
      return `/img/who-charts/imc_${genderCode}_0_2.png`;
    }
  }
};