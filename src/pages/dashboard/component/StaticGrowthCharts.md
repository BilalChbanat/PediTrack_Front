# Static Growth Charts Component

## Overview

The `StaticGrowthCharts` component replaces the dynamic WHO growth charts with static images that display patient data points overlaid on the charts. This provides a more traditional medical chart appearance while still showing patient growth data.

## Features

- **Static WHO Growth Chart Images**: Uses pre-generated WHO growth standard charts for boys and girls
- **Data Point Overlay**: Plots patient measurements as red dots on the charts
- **Gender-Specific Charts**: Automatically selects the appropriate chart based on patient gender
- **Multiple Chart Types**: Supports weight-for-age, height-for-age, weight-for-height, and head circumference-for-age charts
- **Data Validation**: Filters out invalid or missing data points
- **Responsive Design**: Charts adapt to different screen sizes

## Chart Types

1. **Weight for Age**: Shows weight progression over time (0-24 months)
2. **Height for Age**: Shows height progression over time (0-24 months)  
3. **Weight for Height**: Shows weight relative to height (45-110 cm)
4. **Head Circumference for Age**: Shows head circumference progression (0-24 months)

## Data Point Positioning

The component calculates the position of data points on the static images using calibrated coordinates:

- **X-axis positioning**: Based on age (months) or height (cm)
- **Y-axis positioning**: Based on weight (kg), height (cm), or head circumference (cm)
- **Chart area**: Approximately 15% margins on all sides
- **Coordinate system**: Percentage-based positioning for responsive design

## Usage

```jsx
import StaticGrowthCharts from './component/StaticGrowthCharts';

// In your component
<StaticGrowthCharts
  records={patientGrowthRecords}
  patientGender={patientGender}
  patientBirthDate={patientBirthDate}
/>
```

## Props

- `records`: Array of patient growth records with measurements
- `patientGender`: Patient gender ('male' or 'female')
- `patientBirthDate`: Patient's birth date for age calculations

## Required Image Files

The component expects the following images in `/public/img/who-charts/`:

- `wfa_filles_0_2.jpg` - Weight for age chart (girls)
- `wfa_garcons_0_2.png` - Weight for age chart (boys)
- `tfa_filles_0_2.png` - Height for age chart (girls)
- `tfa_garcons_0_2.png` - Height for age chart (boys)
- `imc_filles_0_2.png` - Head circumference chart (girls)
- `imc_garcons_0_2.png` - Head circumference chart (boys)

## Data Requirements

Each record in the `records` array should contain:
- `date`: Measurement date
- `weightKg`: Weight in kilograms (for weight charts)
- `heightCm`: Height in centimeters (for height charts)
- `headCircumferenceCm`: Head circumference in centimeters (for head circumference charts)

## Validation

The component automatically filters out:
- Records with missing required data
- Data points outside the valid chart ranges
- Invalid measurements

## Styling

- Data points appear as red circles with white borders
- Charts are displayed in a responsive grid layout
- Each chart has a title, source attribution, and data point count 